import React from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/AuthProvider';
import { rsvpStorage, eventStorage } from '@/lib/storage';

export const MyCalendar: React.FC = () => {
  const { user } = useAuth();
  const userRSVPs = user ? rsvpStorage.getByUser(user.id) : [];
  
  const eventsWithDetails = userRSVPs.map(rsvp => ({
    rsvp,
    event: eventStorage.getById(rsvp.eventId)
  })).filter(item => item.event).sort((a, b) => 
    new Date(a.event!.startDate).getTime() - new Date(b.event!.startDate).getTime()
  );

  const upcomingEvents = eventsWithDetails.filter(item => 
    new Date(item.event!.startDate) > new Date()
  );

  const pastEvents = eventsWithDetails.filter(item => 
    new Date(item.event!.startDate) <= new Date()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="default" className="text-green-600 bg-green-50">Confirmed</Badge>;
      case 'waitlisted':
        return <Badge variant="secondary" className="text-orange-600 bg-orange-50">Pending Approval</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-600 bg-red-50">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Calendar</h1>
        <p className="text-muted-foreground">Your registered events and schedule</p>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Events</h2>
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map(({ rsvp, event }) => (
              <Card key={rsvp.id} className="card-glass hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {event!.type}
                    </Badge>
                    {getStatusBadge(rsvp.status)}
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event!.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event!.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event!.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">
                        {event!.location.type === 'online' ? 'Online Event' : 
                         event!.location.venue || `${event!.location.city}, ${event!.location.country}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">View Details</Button>
                    {rsvp.status === 'confirmed' && (
                      <Button size="sm" variant="outline">QR Ticket</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="card-glass">
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming events registered</p>
              <Button className="mt-4" variant="outline">Browse Events</Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pastEvents.map(({ rsvp, event }) => (
              <Card key={rsvp.id} className="card-glass opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {event!.type}
                    </Badge>
                    <Badge variant={rsvp.checkedIn ? "default" : "outline"}>
                      {rsvp.checkedIn ? 'Attended' : 'Registered'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{event!.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(event!.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="line-clamp-1">
                        {event!.location.type === 'online' ? 'Online Event' : 
                         event!.location.venue || `${event!.location.city}, ${event!.location.country}`}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" variant="outline" className="w-full">
                    View Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};