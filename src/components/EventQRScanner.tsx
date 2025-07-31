import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, QrCode, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { rsvpStorage, attendanceStorage, eventStorage, userStorage } from '@/lib/storage';
import { toast } from 'sonner';
import jsQR from 'jsqr';

interface EventQRScannerProps {
  eventId: string;
  onCheckIn?: (attendeeData: any) => void;
}

export const EventQRScanner: React.FC<EventQRScannerProps> = ({ eventId, onCheckIn }) => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [barcodeDetector, setBarcodeDetector] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Ready to scan');
  const [currentEvent, setCurrentEvent] = useState(eventStorage.getById(eventId));

  // Check barcode detector support on mount
  useEffect(() => {
    // @ts-ignore - BarcodeDetector is experimental but widely supported
    if ('BarcodeDetector' in window) {
      // @ts-ignore
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      setBarcodeDetector(detector);
      console.log('Native BarcodeDetector available for event scanning');
    } else {
      console.log('BarcodeDetector not supported, using jsQR fallback');
    }
  }, []);

  const startCamera = async () => {
    try {
      setCameraError(null);
      setDebugInfo('Starting camera for event check-in...');
      console.log('Starting camera for event check-in...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Camera stream obtained for event:', stream);
      setDebugInfo('Camera stream obtained');
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('Setting video source for event scanning...');
        videoRef.current.srcObject = stream;
        
        // Set scanning state immediately
        setIsScanning(true);
        setDebugInfo('Video source set, scanning enabled');
        console.log('Set isScanning to true for event scanner');
        
        // Wait for video to be ready and then play
        videoRef.current.onloadedmetadata = async () => {
          try {
            console.log('Video metadata loaded for event scanner');
            setDebugInfo('Video metadata loaded, attempting play...');
            
            if (videoRef.current) {
              await videoRef.current.play();
              console.log('Video started playing for event scanner');
              console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
              
              setDebugInfo(`Video playing: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
              toast.success('📱 Camera ready! Scan event QR tickets to check in attendees.');
              
              // Start scanning loop after video is playing
              setTimeout(() => {
                startScanningLoop();
              }, 1000);
            }
          } catch (playError: any) {
            console.error('Error playing video:', playError);
            setDebugInfo('Video play error: ' + playError.message);
            toast.error('Failed to start video playback: ' + playError.message);
          }
        };
        
        // Also try to play immediately
        try {
          console.log('Attempting immediate video play for event scanner...');
          setDebugInfo('Attempting immediate play...');
          await videoRef.current.play();
          console.log('Immediate video play successful');
          setDebugInfo('Immediate play successful');
          
          // Start scanning if video plays immediately
          setTimeout(() => {
            startScanningLoop();
          }, 1000);
        } catch (e: any) {
          console.log('Immediate play failed, waiting for metadata...', e.message);
          setDebugInfo('Immediate play failed: ' + e.message);
        }
      } else {
        console.error('Video ref is null!');
        setDebugInfo('ERROR: Video ref is null!');
        setIsScanning(false);
        throw new Error('Video element not found');
      }
      
    } catch (error: any) {
      console.error('Error starting camera:', error);
      setDebugInfo('ERROR: ' + error.message);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission denied. Please allow camera access for QR scanning.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else {
        errorMessage = 'Camera access failed: ' + error.message;
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    try {
      if (scanIntervalRef.current) {
        cancelAnimationFrame(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsScanning(false);
      setCameraError(null);
      setDebugInfo('Camera stopped');
      toast.info('Camera stopped');
    } catch (error) {
      console.error('Error stopping camera:', error);
      setIsScanning(false);
    }
  };

  const startScanningLoop = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas ref not available');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Canvas context not available');
      return;
    }
    
    setDebugInfo('Professional event scanning active');
    
    const scanFrame = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        await detectQRCode(canvas);
      }
      
      if (scanIntervalRef.current) {
        scanIntervalRef.current = requestAnimationFrame(scanFrame) as any;
      }
    };
    
    scanIntervalRef.current = requestAnimationFrame(scanFrame) as any;
  };

  const detectQRCode = async (canvas: HTMLCanvasElement) => {
    try {
      let qrData = null;
      
      if (barcodeDetector) {
        const codes = await barcodeDetector.detect(canvas);
        if (codes.length > 0) {
          qrData = codes[0].rawValue;
        }
      } else {
        const context = canvas.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            qrData = code.data;
          }
        }
      }
      
      if (qrData) {
        console.log('QR Code detected for event:', qrData);
        
        if (scanIntervalRef.current) {
          cancelAnimationFrame(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        
        await processEventQRCode(qrData);
      }
      
    } catch (error) {
      console.debug('QR detection error (normal):', error);
    }
  };

  const processEventQRCode = async (qrData: string) => {
    try {
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (e) {
        toast.warning('🎫 Not a valid event ticket QR code');
        setDebugInfo('Invalid QR format detected');
        setTimeout(startScanningLoop, 2000);
        return;
      }
      
      // Check if it's our event QR format
      if (!parsedData.eventId || !parsedData.userId || !parsedData.rsvpId) {
        toast.info('📱 QR code detected but not a valid event ticket');
        setDebugInfo('Non-ticket QR detected');
        setTimeout(startScanningLoop, 2000);
        return;
      }

      // Check if QR is for THIS specific event
      if (parsedData.eventId !== eventId) {
        const wrongEvent = eventStorage.getById(parsedData.eventId);
        toast.warning(`🎫 This ticket is for "${wrongEvent?.title || 'Another Event'}", not "${currentEvent?.title}"`);
        setDebugInfo('Wrong event ticket');
        setTimeout(startScanningLoop, 3000);
        return;
      }

      // Check RSVP validity
      const rsvp = rsvpStorage.getById(parsedData.rsvpId);
      if (!rsvp) {
        toast.error('🎫 Ticket not found in system');
        setDebugInfo('RSVP not found');
        setTimeout(startScanningLoop, 3000);
        return;
      }

      if (rsvp.status !== 'confirmed') {
        toast.warning('🎫 Ticket found but RSVP is not confirmed');
        setDebugInfo('RSVP not confirmed');
        setTimeout(startScanningLoop, 3000);
        return;
      }

      if (rsvp.checkedIn) {
        const attendeeUser = userStorage.getById(parsedData.userId);
        toast.warning(`✅ ${attendeeUser?.name || 'Attendee'} already checked in!`);
        setDebugInfo('Already checked in');
        setTimeout(startScanningLoop, 3000);
        return;
      }

      // Get attendee details
      const attendeeUser = userStorage.getById(parsedData.userId);
      if (!attendeeUser) {
        toast.error('🎫 Valid ticket but attendee not found');
        setDebugInfo('Attendee not found');
        setTimeout(startScanningLoop, 3000);
        return;
      }

      // Create attendance record
      const attendance = attendanceStorage.create({
        eventId: parsedData.eventId,
        userId: parsedData.userId,
        checkedInBy: user?.id || 'system',
        method: 'qr' as const,
        location: 'Event entrance',
        notes: `Check-in via event management scanner by ${user?.name || 'organizer'}`
      });

      // Update RSVP status
      rsvpStorage.update(parsedData.rsvpId, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: user?.id || 'system',
        checkedInMethod: 'qr'
      });

      // Success feedback
      toast.success(`🎉 ${attendeeUser.name} successfully checked in!`);
      setDebugInfo(`✅ Checked in: ${attendeeUser.name}`);
      
      const scanRecord = {
        id: attendance.id,
        attendeeName: attendeeUser.name,
        attendeeEmail: attendeeUser.email,
        timestamp: new Date().toISOString(),
        status: 'success'
      };

      setRecentScans(prev => [scanRecord, ...prev.slice(0, 9)]);

      // Notify parent component
      if (onCheckIn) {
        onCheckIn({
          attendance,
          rsvp,
          user: attendeeUser
        });
      }

      // Resume scanning after 2 seconds
      setTimeout(() => {
        if (!scanIntervalRef.current) {
          startScanningLoop();
        }
      }, 2000);

    } catch (error) {
      console.error('Error processing event QR code:', error);
      toast.error('Error processing ticket');
      setTimeout(startScanningLoop, 2000);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Scanner Section */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Event QR Scanner
            <Badge variant="outline" className="ml-2">
              {currentEvent?.title || 'Event'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative min-h-[300px] bg-muted/20 rounded-lg overflow-hidden">
            {/* Debug Info */}
            <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
              {debugInfo} | Event: {currentEvent?.title?.substring(0, 20)}... | 
              isScanning: {isScanning ? 'true' : 'false'} | 
              hasStream: {streamRef.current ? 'yes' : 'no'} |
              videoReady: {videoRef.current?.readyState || 'N/A'}
            </div>
            
            {cameraError ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                  <div>
                    <p className="text-destructive font-medium mb-2">{cameraError}</p>
                    <div className="text-muted-foreground text-xs space-y-1">
                      <p><strong>For QR scanning:</strong></p>
                      <p>• Allow camera permissions</p>
                      <p>• Use well-lit environment</p>
                      <p>• Hold QR code steady</p>
                    </div>
                  </div>
                  <Button onClick={startCamera} variant="outline" size="sm">
                    Retry Camera
                  </Button>
                </div>
              </div>
            ) : (streamRef.current || isScanning) ? (
              <div className="relative w-full h-full min-h-[300px]">
                <video 
                  ref={videoRef} 
                  className="w-full h-full object-cover rounded-lg"
                  playsInline
                  muted
                  autoPlay
                  style={{ minHeight: '300px' }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-64 h-64 border-2 border-white/50 rounded-lg">
                    {/* Corner guides */}
                    <div className="absolute top-0 left-0 w-8 h-8">
                      <div className="w-full h-1 bg-white"></div>
                      <div className="w-1 h-full bg-white"></div>
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8">
                      <div className="w-full h-1 bg-white"></div>
                      <div className="w-1 h-full bg-white absolute right-0"></div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-8 h-8">
                      <div className="w-full h-1 bg-white absolute bottom-0"></div>
                      <div className="w-1 h-full bg-white"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-8 h-8">
                      <div className="w-full h-1 bg-white absolute bottom-0"></div>
                      <div className="w-1 h-full bg-white absolute right-0"></div>
                    </div>
                  </div>
                </div>
                
                {/* Instructions */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                  🎫 Scan attendee QR tickets for {currentEvent?.title}
                </div>
                
                {/* Scanning indicator */}
                <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Event Scanning
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Camera not active</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Start camera to scan attendee tickets
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            {!isScanning ? (
              <Button onClick={startCamera} className="flex-1">
                <Camera className="h-4 w-4 mr-2" />
                Start QR Scanner
              </Button>
            ) : (
              <Button onClick={stopCamera} variant="outline" className="flex-1">
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Scanner
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>📱 Scan QR tickets to check in attendees for this event</p>
            <p className="mt-1">Only valid tickets for "{currentEvent?.title}" will be processed</p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Check-ins */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Check-ins
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <div>
                      <p className="font-medium">{scan.attendeeName}</p>
                      <p className="text-sm text-muted-foreground">{scan.attendeeEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(scan.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">
                    Checked In
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No check-ins yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Scanned attendees will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
