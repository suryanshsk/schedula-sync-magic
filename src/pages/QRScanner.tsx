import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, Camera, CameraOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { attendanceStorage, rsvpStorage, eventStorage } from '@/lib/storage';
import { toast } from 'sonner';

export const QRScanner: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setIsScanning(true);
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
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

  // Simulate QR scanning (in a real app, you'd use a QR code library)
  const simulateQRScan = () => {
    // Demo QR code data
    const demoQRData = {
      eventId: 'event-1',
      userId: 'user-1',
      rsvpId: 'rsvp-1',
      timestamp: Date.now()
    };
    processQRCode(JSON.stringify(demoQRData));
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
            <div className="relative aspect-square bg-muted/20 rounded-lg overflow-hidden">
              {isScanning ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Camera not active</p>
                  </div>
                </div>
              )}
              
              {/* Scanning overlay */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-4 border-2 border-primary rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              {!isScanning ? (
                <Button onClick={startCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              ) : (
                <Button onClick={stopCamera} variant="outline" className="flex-1">
                  <CameraOff className="h-4 w-4 mr-2" />
                  Stop Camera
                </Button>
              )}
              <Button onClick={simulateQRScan} variant="secondary">
                Demo Scan
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>Position the QR code within the frame to scan</p>
              <p className="mt-1">Make sure the code is well-lit and not blurry</p>
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