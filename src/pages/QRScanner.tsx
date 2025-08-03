import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { attendanceStorage, rsvpStorage, eventStorage } from '@/lib/storage';
import { toast } from 'sonner';
import jsQR from 'jsqr';

export const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isGeneratingDemo, setIsGeneratingDemo] = useState(false);
  const [permissions, setPermissions] = useState<{camera?: string}>({});
  const [barcodeDetector, setBarcodeDetector] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>('Initial state');

  // Check camera permissions and barcode detector support on component mount
  useEffect(() => {
    checkCameraPermissions();
    checkBarcodeDetectorSupport();
  }, []);

  // Ensure video element is ready when component mounts
  useEffect(() => {
    if (videoRef.current) {
      console.log('Video element is ready');
      setDebugInfo('Video element ready');
    }
  }, []);

  const checkBarcodeDetectorSupport = () => {
    // @ts-ignore - BarcodeDetector is experimental but widely supported
    if ('BarcodeDetector' in window) {
      // @ts-ignore
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      setBarcodeDetector(detector);
      console.log('Native BarcodeDetector available');
    } else {
      console.log('BarcodeDetector not supported, using fallback method');
    }
  };

  const checkCameraPermissions = async () => {
    try {
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissions(prev => ({ ...prev, camera: result.state }));
        console.log('Camera permission status:', result.state);
        
        result.addEventListener('change', () => {
          setPermissions(prev => ({ ...prev, camera: result.state }));
          console.log('Camera permission changed to:', result.state);
        });
      }
    } catch (error) {
      console.log('Permission API not supported');
    }
  };

  const handleStartCamera = async () => {
    // Small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 50));
    await startCamera();
  };

  const startCamera = async () => {
    try {
      setIsStartingCamera(true);
      setCameraError(null);
      setDebugInfo('Starting camera...');
      console.log('Starting camera...');
      
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported by this browser');
      }

      // Wait for video element to be available with retry mechanism
      let retryCount = 0;
      const maxRetries = 10;
      
      while (!videoRef.current && retryCount < maxRetries) {
        console.log(`Waiting for video element... attempt ${retryCount + 1}`);
        setDebugInfo(`Waiting for video element... attempt ${retryCount + 1}`);
        await new Promise(resolve => setTimeout(resolve, 100));
        retryCount++;
      }
      
      if (!videoRef.current) {
        throw new Error('Video element not found after waiting');
      }

      setDebugInfo('Video element ready, requesting camera stream...');
      console.log('Video element ready, requesting camera stream...');
      
      // Get camera stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Prefer back camera
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      console.log('Camera stream obtained:', stream);
      setDebugInfo('Camera stream obtained');
      streamRef.current = stream;
      
      if (videoRef.current) {
        console.log('Setting video source...');
        setDebugInfo('Setting video source...');
        videoRef.current.srcObject = stream;
        
        // Force set scanning state immediately
        setIsScanning(true);
        setDebugInfo('Set isScanning=true, video source set');
        console.log('Set isScanning to true');
        
        // Wait for video to be ready and then play
        videoRef.current.onloadedmetadata = async () => {
          try {
            console.log('Video metadata loaded');
            setDebugInfo('Video metadata loaded, attempting play...');
            
            if (videoRef.current) {
              await videoRef.current.play();
              console.log('Video started playing');
              console.log('Video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
              
              setDebugInfo(`Video playing: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
              toast.success('Camera started successfully! Position QR code in view.');
              
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
          console.log('Attempting immediate video play...');
          setDebugInfo('Attempting immediate play...');
          await videoRef.current.play();
          console.log('Immediate video play successful');
          setDebugInfo('Immediate play successful');
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
      
      if (error.name === 'NotAllowedError' || error.message?.includes('Permission denied')) {
        errorMessage = 'Camera permission denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError' || error.message?.includes('No camera found')) {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotSupportedError' || error.message?.includes('not supported')) {
        errorMessage = 'Camera not supported by this browser. Try Chrome, Firefox, or Safari.';
      } else {
        errorMessage = 'Camera access failed: ' + error.message;
      }
      
      setCameraError(errorMessage);
      toast.error(errorMessage);
      setIsScanning(false);
      setIsStartingCamera(false);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    try {
      // Stop scanning loop
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
      
      // Stop video stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsScanning(false);
      setCameraError(null);
      toast.info('Camera stopped');
    } catch (error) {
      console.error('Error stopping camera:', error);
      setIsScanning(false);
      setCameraError(null);
    }
  };

  const forceResetCamera = () => {
    stopCamera();
    toast.info('Camera reset completed. Try starting again.');
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
    
    console.log('Starting professional scanning loop...');
    setDebugInfo('Professional scanning active');
    
    // Use requestAnimationFrame for smoother, faster scanning
    const scanFrame = async () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        // Set canvas size to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Try to detect QR code
        await detectQRCode(canvas);
      }
      
      // Continue scanning if still active
      if (scanIntervalRef.current) {
        scanIntervalRef.current = requestAnimationFrame(scanFrame) as any;
      }
    };
    
    // Start the scanning loop
    scanIntervalRef.current = requestAnimationFrame(scanFrame) as any;
  };

  const detectQRCode = async (canvas: HTMLCanvasElement) => {
    try {
      let qrData = null;
      
      if (barcodeDetector) {
        // Use native BarcodeDetector if available (fastest)
        const codes = await barcodeDetector.detect(canvas);
        if (codes.length > 0) {
          qrData = codes[0].rawValue;
        }
      } else {
        // Fallback: Use jsQR library
        const context = canvas.getContext('2d');
        if (context) {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert", // Faster processing
          });
          
          if (code) {
            qrData = code.data;
          }
        }
      }
      
      if (qrData) {
        console.log('QR Code detected:', qrData);
        
        // Pause scanning immediately to prevent duplicates
        if (scanIntervalRef.current) {
          cancelAnimationFrame(scanIntervalRef.current);
          scanIntervalRef.current = null;
        }
        
        // Process the QR code with smart filtering
        await processQRCodeSmart(qrData);
      }
      
    } catch (error) {
      // Silently handle scanning errors - they're normal when no QR code is visible
      console.debug('QR detection error (normal):', error);
    }
  };

  const processQRCodeSmart = async (qrData: string) => {
    try {
      // First, try to parse as JSON (our event QR codes)
      let parsedData;
      try {
        parsedData = JSON.parse(qrData);
      } catch (e) {
        // Not JSON, handle as generic QR code
        handleGenericQRCode(qrData);
        return;
      }
      
      // Check if it's our event QR format
      if (parsedData.eventId && parsedData.userId && parsedData.rsvpId) {
        await processEventQRCode(parsedData);
      } else {
        // JSON but not our format
        toast.info('QR code detected but not a valid event ticket');
        setDebugInfo('Non-event QR detected');
        setTimeout(() => startScanningLoop(), 2000);
      }
      
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Error processing QR code');
      setTimeout(() => startScanningLoop(), 2000);
    }
  };

  const handleGenericQRCode = (qrData: string) => {
    // Handle URLs, text, etc.
    if (qrData.startsWith('http') || qrData.startsWith('https')) {
      toast.info(`🌐 Website QR detected: ${qrData.substring(0, 50)}...`);
    } else if (qrData.includes('@') && qrData.includes('.')) {
      toast.info(`📧 Email QR detected: ${qrData}`);
    } else if (/^\+?[\d\s\-\(\)]+$/.test(qrData)) {
      toast.info(`📞 Phone number QR detected: ${qrData}`);
    } else {
      toast.info(`📝 Text QR detected: ${qrData.substring(0, 50)}${qrData.length > 50 ? '...' : ''}`);
    }
    
    setDebugInfo(`Generic QR: ${qrData.substring(0, 30)}...`);
    
    // Resume scanning after 3 seconds
    setTimeout(() => {
      if (!scanIntervalRef.current) {
        startScanningLoop();
      }
    }, 3000);
  };

  const processEventQRCode = async (data: any) => {
    try {
      // Check if RSVP exists and is confirmed
      const rsvp = rsvpStorage.getById(data.rsvpId);
      if (!rsvp) {
        toast.error('🎫 Valid ticket format but RSVP not found in system');
        setDebugInfo('RSVP not found');
        setTimeout(() => startScanningLoop(), 3000);
        return;
      }

      if (rsvp.status !== 'confirmed') {
        toast.warning('🎫 Ticket found but RSVP is not confirmed');
        setDebugInfo('RSVP not confirmed');
        setTimeout(() => startScanningLoop(), 3000);
        return;
      }

      if (rsvp.checkedIn) {
        toast.warning('✅ User already checked in!');
        setDebugInfo('Already checked in');
        setTimeout(() => startScanningLoop(), 3000);
        return;
      }

      // Get event details
      const event = eventStorage.getById(data.eventId);
      if (!event) {
        toast.error('🎫 Valid ticket but event not found');
        setDebugInfo('Event not found');
        setTimeout(() => startScanningLoop(), 3000);
        return;
      }

      // Create attendance record
      const attendance = attendanceStorage.create({
        eventId: data.eventId,
        userId: data.userId,
        checkedInBy: user?.id || 'system',
        method: 'qr' as const,
        location: 'Event entrance',
        notes: 'Professional QR scan check-in'
      });

      // Update RSVP status
      rsvpStorage.update(data.rsvpId, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: user?.id || 'system',
        checkedInMethod: 'qr'
      });

      // Success feedback
      toast.success(`🎉 Successfully checked in to "${event.title}"!`);
      setDebugInfo(`✅ Checked in: ${event.title}`);
      
      setRecentScans(prev => [{
        id: attendance.id,
        eventTitle: event.title,
        timestamp: new Date().toISOString(),
        status: 'success'
      }, ...prev.slice(0, 9)]);

      // Resume scanning after 3 seconds
      setTimeout(() => {
        if (!scanIntervalRef.current) {
          startScanningLoop();
        }
      }, 3000);

    } catch (error) {
      console.error('Error processing event QR code:', error);
      toast.error('Error processing event ticket');
      setTimeout(() => startScanningLoop(), 2000);
    }
  };

  const processQRCode = (qrData: string) => {
    try {
      const data = JSON.parse(qrData);
      
      if (!data.eventId || !data.userId || !data.rsvpId) {
        toast.error('Invalid QR code format');
        return;
      }

      // Check if RSVP exists and is confirmed
      const rsvp = rsvpStorage.getById(data.rsvpId);
      if (!rsvp) {
        toast.error('RSVP not found');
        return;
      }

      if (rsvp.status !== 'confirmed') {
        toast.error('RSVP is not confirmed');
        return;
      }

      if (rsvp.checkedIn) {
        toast.warning('User already checked in');
        return;
      }

      // Create attendance record
      const attendance = attendanceStorage.create({
        eventId: data.eventId,
        userId: data.userId,
        checkedInBy: user?.id || 'system',
        method: 'qr' as const,
        location: 'Event entrance',
        notes: 'QR code scan check-in'
      });

      // Update RSVP status
      rsvpStorage.update(data.rsvpId, {
        checkedIn: true,
        checkedInAt: new Date().toISOString(),
        checkedInBy: user?.id || 'system',
        checkedInMethod: 'qr'
      });

      const event = eventStorage.getById(data.eventId);
      toast.success(`Successfully checked in to ${event?.title || 'event'}`);
      
      setRecentScans(prev => [{
        id: attendance.id,
        eventTitle: event?.title || 'Unknown Event',
        timestamp: new Date().toISOString(),
        status: 'success'
      }, ...prev.slice(0, 9)]);

    } catch (error) {
      console.error('Error processing QR code:', error);
      toast.error('Invalid QR code data');
    }
  };

  // Simulate QR scanning for demo purposes
  const simulateQRScan = async () => {
    setIsGeneratingDemo(true);
    try {
      // Get a real RSVP from storage for demonstration
      const allRSVPs = rsvpStorage.getAll();
      const confirmedRSVP = allRSVPs.find(rsvp => rsvp.status === 'confirmed' && !rsvp.checkedIn);
      
      if (confirmedRSVP) {
        const demoQRData = {
          eventId: confirmedRSVP.eventId,
          userId: confirmedRSVP.userId,
          rsvpId: confirmedRSVP.id,
          timestamp: Date.now()
        };
        
        // Simulate scanning delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        processQRCode(JSON.stringify(demoQRData));
        toast.success('Demo QR scan completed!');
      } else {
        toast.warning('No valid RSVPs found for demo. Please RSVP to an event first as a user.');
      }
    } catch (error) {
      toast.error('Demo scan failed');
    } finally {
      setIsGeneratingDemo(false);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">QR Code Scanner</h1>
        <p className="text-muted-foreground">Scan QR tickets for event check-ins</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner Section */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QR Scanner
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative min-h-[300px] bg-muted/20 rounded-lg overflow-hidden">
              {/* Debug Info */}
              <div className="absolute top-2 left-2 z-50 bg-black/80 text-white text-xs p-2 rounded">
                Debug: {debugInfo} | isScanning: {isScanning ? 'true' : 'false'} | isStarting: {isStartingCamera ? 'true' : 'false'} | hasStream: {streamRef.current ? 'yes' : 'no'}
              </div>
              
              {cameraError ? (
                <div className="w-full h-full flex items-center justify-center p-6">
                  <div className="text-center space-y-4">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
                    <div>
                      <p className="text-destructive font-medium mb-2">{cameraError}</p>
                      <div className="text-muted-foreground text-xs space-y-1">
                        <p><strong>Troubleshooting:</strong></p>
                        <p>• Allow camera permissions in browser</p>
                        <p>• Close other camera apps</p>
                        <p>• Refresh page and try again</p>
                        <p>• Use Chrome/Firefox for best support</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          setCameraError(null);
                          handleStartCamera();
                        }} 
                        variant="outline" 
                        size="sm"
                      >
                        Retry Camera
                      </Button>
                      <Button 
                        onClick={forceResetCamera} 
                        variant="destructive" 
                        size="sm"
                      >
                        Force Reset
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (streamRef.current || isScanning || isStartingCamera) ? (
                <div className="relative w-full h-full min-h-[300px]">
                  <video 
                    ref={videoRef} 
                    className="w-full h-full object-cover rounded-lg"
                    playsInline
                    muted
                    autoPlay
                    style={{ minHeight: '300px' }}
                  />
                  <canvas 
                    ref={canvasRef} 
                    className="hidden" 
                  />
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
                  {/* Instruction overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
                    🎯 Position QR code in the frame
                  </div>
                  {/* Scanning indicator */}
                  <div className="absolute top-4 right-4 bg-green-500/90 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    {isScanning ? 'Scanning...' : 'Camera Active'}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera not active</p>
                    <p className="text-muted-foreground text-sm mt-1">
                      Click "Start Camera" to begin scanning
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Debug Info */}
            {permissions.camera && (
              <div className="text-xs text-muted-foreground p-2 bg-muted/20 rounded border">
                Camera Permission: <span className={`font-mono ${
                  permissions.camera === 'granted' ? 'text-green-600' : 
                  permissions.camera === 'denied' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {permissions.camera}
                </span>
              </div>
            )}

            <div className="flex gap-4">
              {!isScanning ? (
                <Button 
                  onClick={handleStartCamera} 
                  className="flex-1" 
                  disabled={isGeneratingDemo || isStartingCamera}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {isStartingCamera ? 'Starting Camera...' : 'Start Camera'}
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              )}
              <Button 
                onClick={simulateQRScan} 
                variant="secondary"
                disabled={isScanning || isGeneratingDemo || isStartingCamera}
              >
                {isGeneratingDemo ? 'Scanning...' : 'Demo Scan'}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Position the QR code within the camera view to scan</p>
              <p className="mt-1">Make sure the code is well-lit and clearly visible</p>
              {barcodeDetector ? (
                <p className="mt-1 text-green-600 text-xs">✓ Native QR detection enabled</p>
              ) : (
                <p className="mt-1 text-blue-600 text-xs">Using jsQR fallback detection</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Scans */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            {recentScans.length > 0 ? (
              <div className="space-y-3">
                {recentScans.map((scan) => (
                  <div key={scan.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-3">
                      {scan.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium line-clamp-1">{scan.eventTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(scan.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={scan.status === 'success' ? 'default' : 'destructive'}>
                      {scan.status === 'success' ? 'Checked In' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No recent scans</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Scanned tickets will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test QR Code */}
        <Card className="card-glass lg:col-span-2">
          <CardHeader>
            <CardTitle>Test QR Code</CardTitle>
            <p className="text-sm text-muted-foreground">Use this QR code to test the scanner</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-4">
              <div className="inline-block p-4 bg-white rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('{"eventId":"test-event","userId":"test-user","rsvpId":"test-rsvp","timestamp":' + Date.now() + '}')}`}
                  alt="Test QR Code"
                  className="w-32 h-32"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Point your camera at this QR code to test scanning
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Contains test event data for demonstration
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="card-glass mt-8">
        <CardHeader>
          <CardTitle>How to use QR Scanner</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Start Camera</h3>
              <p className="text-sm text-muted-foreground">
                Click "Start Camera" to activate your device's camera
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Scan QR Code</h3>
              <p className="text-sm text-muted-foreground">
                Position the attendee's QR ticket within the scanning frame
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Confirm Check-in</h3>
              <p className="text-sm text-muted-foreground">
                The system will automatically process the check-in
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};