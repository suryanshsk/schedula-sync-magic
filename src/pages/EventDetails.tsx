import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, QrCode, ArrowLeft, Share2, Heart, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, rsvpStorage } from '@/lib/storage';
import { generateQRCode, generateQRData } from '@/lib/qr';
import { toast } from 'sonner';

export const EventDetails: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(eventId ? eventStorage.getById(eventId) : null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [userRSVP, setUserRSVP] = useState(null);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    if (!event) {
      return;
    }

    // Check if user has RSVP'd for this event
    if (user) {
      const rsvp = rsvpStorage.getAll().find(r => r.eventId === event.id && r.userId === user.id);
      setUserRSVP(rsvp);
    }
  }, [event, user]);

  const handleRSVP = async () => {
    if (!user || !event) return;

    if (user.role !== 'user') {
      toast.error(user.role === 'admin' ? 'Admins cannot RSVP to events' : 'Organizers cannot RSVP to events');
      return;
    }

    try {
      const existingRSVP = rsvpStorage.getAll().find(r => r.eventId === event.id && r.userId === user.id);
      
      if (existingRSVP) {
        toast.warning('You have already RSVP\'d for this event');
        return;
      }

      const rsvp = rsvpStorage.create({
        userId: user.id,
        eventId: event.id,
        status: 'waitlisted',
        notes: '',
        checkedIn: false,
      });

      setUserRSVP(rsvp);
      toast.success('Successfully RSVP\'d for the event! Your RSVP is pending organizer approval.');
    } catch (error) {
      toast.error('Failed to RSVP for the event');
    }
  };

  const generateUserQRCode = async () => {
    if (!user || !event || !userRSVP) return;

    setIsGeneratingQR(true);
    try {
      const qrData = generateQRData(event.id, user.id, userRSVP.id);
      const qrUrl = await generateQRCode(qrData);
      setQrCodeUrl(qrUrl);
      toast.success('QR ticket generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR ticket');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Event Not Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => navigate('/events')} className="w-full">
                Browse Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const confirmedRSVPs = rsvpStorage.getAll().filter(r => r.eventId === event.id && r.status === 'confirmed').length;
  const eventDate = new Date(event.startDate);
  const eventEndDate = new Date(event.endDate);

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <Badge variant="secondary" className="capitalize">
                    {event.type}
                  </Badge>
                  <h1 className="text-3xl font-bold">{event.title}</h1>
                </div>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {event.description}
              </p>

              {/* Event Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {eventEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {event.location.type === 'online' ? 'Online Event' : 
                         event.location.venue || `${event.location.city}, ${event.location.country}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Attendance</p>
                      <p className="text-sm text-muted-foreground">
                        {confirmedRSVPs}/{event.capacity} registered
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* RSVP Card */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Join This Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user?.role === 'user' ? (
                userRSVP ? (
                  <div className="space-y-4">
                    <Button disabled className="w-full" variant={userRSVP.status === 'confirmed' ? 'default' : 'secondary'}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {userRSVP.status === 'confirmed' ? 'RSVP Confirmed' : 
                       userRSVP.status === 'waitlisted' ? 'Pending Approval' : 'RSVP Cancelled'}
                    </Button>
                    
                    {userRSVP.status === 'waitlisted' && (
                      <p className="text-sm text-orange-600 text-center">
                        Your RSVP is waiting for organizer approval
                      </p>
                    )}
                    
                    {/* QR Code Generation - Only for confirmed RSVPs */}
                    {userRSVP.status === 'confirmed' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={generateUserQRCode}
                            disabled={isGeneratingQR}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            {isGeneratingQR ? 'Generating...' : 'Get QR Ticket'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Your QR Ticket</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {qrCodeUrl ? (
                              <div className="text-center">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="QR Ticket" 
                                  className="mx-auto border rounded-lg"
                                />
                                <p className="text-sm text-muted-foreground mt-4">
                                  Show this QR code at the event entrance for check-in
                                </p>
                              </div>
                            ) : (
                              <div className="text-center py-8">
                              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">QR code will appear here</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    )}
                  </div>
                ) : confirmedRSVPs >= event.capacity ? (
                  <Button disabled className="w-full">
                    Event Full
                  </Button>
                ) : (
                  <Button onClick={handleRSVP} className="w-full">
                    <Heart className="h-4 w-4 mr-2" />
                    RSVP Now
                  </Button>
                )
              ) : user?.role === 'admin' || user?.role === 'organizer' ? (
                <Button disabled className="w-full" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  {user.role === 'admin' ? 'Admin View' : 'Organizer View'}
                </Button>
              ) : (
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Sign In to RSVP
                </Button>
              )}
              
              <div className="text-center text-sm text-muted-foreground">
                <p>{confirmedRSVPs}/{event.capacity} people attending</p>
              </div>
            </CardContent>
          </Card>

          {/* Event Information */}
          <Card className="card-glass">
            <CardHeader>
              <CardTitle>Event Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">Organizer</p>
                <p className="text-sm text-muted-foreground">Event Organizer</p>
              </div>
              <div>
                <p className="font-medium text-sm">Category</p>
                <p className="text-sm text-muted-foreground capitalize">{event.type}</p>
              </div>
              <div>
                <p className="font-medium text-sm">Price</p>
                <p className="text-sm text-muted-foreground">
                  {event.pricing?.type === 'free' ? 'Free' : `$${event.pricing?.amount || 0}`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
