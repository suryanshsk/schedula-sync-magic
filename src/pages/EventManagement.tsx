import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, QrCode, Calendar, BarChart3, Edit, Settings, Check, X, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, rsvpStorage, attendanceStorage, userStorage } from '@/lib/storage';
import { EventQRScanner } from '@/components/EventQRScanner';
import { UserProfileModal } from '@/components/UserProfileModal';
import { toast } from 'sonner';

export const EventManagement: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(eventId ? eventStorage.getById(eventId) : null);
  const [rsvps, setRSVPs] = useState([]);
  const [attendees, setAttendees] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Refresh data function for when new check-ins occur
  const refreshEventData = () => {
    if (!event) return;

    const eventRSVPs = rsvpStorage.getAll().filter(rsvp => rsvp.eventId === event.id);
    setRSVPs(eventRSVPs);

    const attendeeData = eventRSVPs.map(rsvp => {
      const attendeeUser = userStorage.getById(rsvp.userId);
      const attendance = attendanceStorage.getAll().find(a => a.eventId === event.id && a.userId === rsvp.userId);
      return {
        ...rsvp,
        user: attendeeUser,
        attendance
      };
    });
    setAttendees(attendeeData);
  };

  useEffect(() => {
    refreshEventData();
  }, [event]);

  // Handle new check-ins from QR scanner
  const handleNewCheckIn = (checkInData: any) => {
    console.log('New check-in:', checkInData);
    refreshEventData(); // Refresh the data to show new check-in
    toast.success(`${checkInData.user.name} checked in successfully!`);
  };

  // Handle RSVP approval
  const handleApproveRSVP = (rsvpId: string) => {
    try {
      const rsvp = rsvpStorage.getById(rsvpId);
      if (rsvp) {
        rsvpStorage.update(rsvpId, { ...rsvp, status: 'confirmed' });
        refreshEventData();
        toast.success('RSVP approved successfully!');
      }
    } catch (error) {
      toast.error('Failed to approve RSVP');
    }
  };

  // Handle RSVP rejection
  const handleRejectRSVP = (rsvpId: string) => {
    try {
      const rsvp = rsvpStorage.getById(rsvpId);
      if (rsvp) {
        rsvpStorage.update(rsvpId, { ...rsvp, status: 'cancelled' });
        refreshEventData();
        toast.success('RSVP rejected');
      }
    } catch (error) {
      toast.error('Failed to reject RSVP');
    }
  };

  // Handle opening user profile modal
  const handleViewUserProfile = (userId: string) => {
    const user = userStorage.getById(userId);
    if (user) {
      setSelectedUser(user);
      setIsProfileModalOpen(true);
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
                The event you're trying to manage doesn't exist.
              </p>
              <Button onClick={() => navigate('/my-events')} className="w-full">
                Back to My Events
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Check if user is authorized to manage this event
  if (!user || (user.role !== 'admin' && event.organizerId !== user.id)) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                You don't have permission to manage this event.
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

  const confirmedRSVPs = rsvps.filter(rsvp => rsvp.status === 'confirmed');
  const waitlistedRSVPs = rsvps.filter(rsvp => rsvp.status === 'waitlisted');
  const checkedInCount = attendees.filter(a => a.checkedIn).length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/my-events')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Events
      </Button>

      {/* Event Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 truncate">{event.title}</h1>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary" className="capitalize">
                {event.type}
              </Badge>
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                {event.status}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => navigate(`/event/${event.id}/edit`)} className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Edit Event</span>
              <span className="sm:hidden">Edit</span>
            </Button>
            <Button variant="outline" onClick={() => navigate(`/event/${event.id}/analytics`)} className="w-full sm:w-auto">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Horizontal scroll on mobile */}
      <div className="mb-8">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth-x pb-4 md:grid md:grid-cols-4 md:overflow-visible md:pb-0 md:scrollbar-custom">
          <Card className="card-glass flex-shrink-0 w-64 md:w-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{confirmedRSVPs.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total RSVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glass flex-shrink-0 w-64 md:w-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <QrCode className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{checkedInCount}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Checked In</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glass flex-shrink-0 w-64 md:w-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{event.capacity}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Capacity</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="card-glass flex-shrink-0 w-64 md:w-auto">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{waitlistedRSVPs.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs - Horizontal scroll on mobile */}
      <div className="w-full">
        <Tabs defaultValue="checkins" className="space-y-6">
          <div className="overflow-x-auto scrollbar-hide">
            <TabsList className="grid w-full grid-cols-4 min-w-max sm:min-w-0">
              <TabsTrigger value="checkins" className="text-xs sm:text-sm">QR Check-ins</TabsTrigger>
              <TabsTrigger value="pending" className="text-xs sm:text-sm">Pending RSVPs</TabsTrigger>
              <TabsTrigger value="attendees" className="text-xs sm:text-sm">Attendees</TabsTrigger>
              <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="checkins" className="space-y-6">
          <EventQRScanner 
            eventId={event.id} 
            onCheckIn={handleNewCheckIn}
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Pending RSVP Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {waitlistedRSVPs.length > 0 ? (
                <div className="space-y-4">
                  {waitlistedRSVPs.map((rsvp) => {
                    const rsvpUser = userStorage.getById(rsvp.userId);
                    return (
                      <div key={rsvp.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => handleViewUserProfile(rsvp.userId)}
                            className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer flex-shrink-0"
                          >
                            <span className="text-sm font-medium">
                              {rsvpUser?.name?.charAt(0) || 'U'}
                            </span>
                          </button>
                          <div className="flex-1 min-w-0">
                            <button
                              onClick={() => handleViewUserProfile(rsvp.userId)}
                              className="text-left hover:text-primary transition-colors cursor-pointer group w-full"
                            >
                              <div className="flex items-center gap-2">
                                <p className="font-medium truncate">{rsvpUser?.name || 'Unknown User'}</p>
                                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                                  (Click to view profile)
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground truncate">{rsvpUser?.email}</p>
                            </button>
                            <p className="text-xs text-muted-foreground">
                              RSVP: {new Date(rsvp.registrationDate).toLocaleDateString()}
                            </p>
                            {rsvpUser?.socialLinks && (
                              <div className="flex gap-2 mt-2 flex-wrap">
                                {rsvpUser.socialLinks.linkedin && (
                                  <a 
                                    href={rsvpUser.socialLinks.linkedin} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                                {rsvpUser.socialLinks.github && (
                                  <a 
                                    href={rsvpUser.socialLinks.github} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-gray-600 hover:underline"
                                  >
                                    GitHub
                                  </a>
                                )}
                                {rsvpUser.socialLinks.portfolio && (
                                  <a 
                                    href={rsvpUser.socialLinks.portfolio} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-xs text-purple-600 hover:underline"
                                  >
                                    Portfolio
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                          <Badge variant="secondary" className="text-orange-600 text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveRSVP(rsvp.id)}
                              className="text-green-600 hover:bg-green-50 px-2 touch-friendly"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectRSVP(rsvp.id)}
                              className="text-red-600 hover:bg-red-50 px-2 touch-friendly"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending RSVPs</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendees" className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Registered Attendees</CardTitle>
            </CardHeader>
            <CardContent>
              {attendees.length > 0 ? (
                <div className="space-y-4">
                  {attendees.map((attendee) => (
                    <div key={attendee.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-lg border">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <button
                          onClick={() => handleViewUserProfile(attendee.userId)}
                          className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors cursor-pointer flex-shrink-0"
                        >
                          <span className="text-sm font-medium">
                            {attendee.user?.name?.charAt(0) || 'U'}
                          </span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <button
                            onClick={() => handleViewUserProfile(attendee.userId)}
                            className="text-left hover:text-primary transition-colors cursor-pointer group w-full"
                          >
                            <div className="flex items-center gap-2">
                              <p className="font-medium truncate">{attendee.user?.name || 'Unknown User'}</p>
                              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                                (Click to view profile)
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{attendee.user?.email}</p>
                          </button>
                          {attendee.checkedIn && (
                            <p className="text-xs text-success">
                              Checked in: {attendee.checkedInAt ? new Date(attendee.checkedInAt).toLocaleString() : 'Recently'}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 flex-shrink-0">
                        <Badge variant={attendee.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                          {attendee.status}
                        </Badge>
                        {attendee.checkedIn && (
                          <Badge variant="outline" className="text-green-600 text-xs">
                            <QrCode className="h-3 w-3 mr-1" />
                            Checked In
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No attendees registered yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="card-glass">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start h-auto p-4 text-left">
                  <Edit className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Edit Event Details</p>
                    <p className="text-sm text-muted-foreground">Update title, description, and settings</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 text-left">
                  <Calendar className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Change Date & Time</p>
                    <p className="text-sm text-muted-foreground">Reschedule your event</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 text-left">
                  <Users className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Manage Capacity</p>
                    <p className="text-sm text-muted-foreground">Update attendee limits</p>
                  </div>
                </Button>
                
                <Button variant="outline" className="justify-start h-auto p-4 text-left">
                  <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium">Advanced Settings</p>
                    <p className="text-sm text-muted-foreground">Privacy, notifications, and more</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        </Tabs>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUser(null);
        }}
      />
    </div>
  );
};
