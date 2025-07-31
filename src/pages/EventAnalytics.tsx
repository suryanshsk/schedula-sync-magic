import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, QrCode, Calendar, BarChart3, TrendingUp, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, rsvpStorage, attendanceStorage, userStorage } from '@/lib/storage';

export const EventAnalytics: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(eventId ? eventStorage.getById(eventId) : null);
  const [analytics, setAnalytics] = useState({
    totalRSVPs: 0,
    confirmedRSVPs: 0,
    checkedIn: 0,
    noShows: 0,
    attendanceRate: 0,
    rsvpByDay: [],
    demographics: {}
  });

  useEffect(() => {
    if (!event) return;

    // Calculate analytics
    const eventRSVPs = rsvpStorage.getAll().filter(rsvp => rsvp.eventId === event.id);
    const confirmedRSVPs = eventRSVPs.filter(rsvp => rsvp.status === 'confirmed');
    const checkedInRSVPs = eventRSVPs.filter(rsvp => rsvp.checkedIn);
    const attendance = attendanceStorage.getAll().filter(a => a.eventId === event.id);

    // Calculate attendance rate
    const attendanceRate = confirmedRSVPs.length > 0 ? 
      Math.round((checkedInRSVPs.length / confirmedRSVPs.length) * 100) : 0;

    // RSVP timeline (simplified)
    const rsvpByDay = confirmedRSVPs.reduce((acc: Record<string, number>, rsvp) => {
      const date = new Date(rsvp.registrationDate).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Demographics (user roles)
    const demographics = confirmedRSVPs.reduce((acc: Record<string, number>, rsvp) => {
      const attendeeUser = userStorage.getById(rsvp.userId);
      const role = attendeeUser?.role || 'unknown';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    setAnalytics({
      totalRSVPs: eventRSVPs.length,
      confirmedRSVPs: confirmedRSVPs.length,
      checkedIn: checkedInRSVPs.length,
      noShows: confirmedRSVPs.length - checkedInRSVPs.length,
      attendanceRate,
      rsvpByDay: Object.entries(rsvpByDay).map(([date, count]) => ({ date, count })),
      demographics
    });
  }, [event]);

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
                The event you're looking for doesn't exist.
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

  // Check if user is authorized to view analytics
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
                You don't have permission to view analytics for this event.
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Event Analytics</h1>
            <p className="text-muted-foreground">{event.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="capitalize">
                {event.type}
              </Badge>
              <Badge variant={event.status === 'published' ? 'default' : 'secondary'} className="capitalize">
                {event.status}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/event/${event.id}/manage`)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Manage Event
            </Button>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.confirmedRSVPs}</p>
                <p className="text-sm text-muted-foreground">Confirmed RSVPs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <QrCode className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.checkedIn}</p>
                <p className="text-sm text-muted-foreground">Checked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{analytics.attendanceRate}%</p>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{event.capacity}</p>
                <p className="text-sm text-muted-foreground">Total Capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Registration Timeline */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Registration Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.rsvpByDay.length > 0 ? (
              <div className="space-y-4">
                {analytics.rsvpByDay.slice(0, 10).map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{item.date}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(item.count / Math.max(...analytics.rsvpByDay.map(d => d.count))) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No registration data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendee Demographics */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Attendee Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(analytics.demographics).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(analytics.demographics).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{role === 'user' ? 'Regular Users' : role}s</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${((count as number) / analytics.confirmedRSVPs) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8">{count as number}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No demographic data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-1">Event Date</p>
                <p className="text-muted-foreground">
                  {new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Duration</p>
                <p className="text-muted-foreground">
                  {Math.round((new Date(event.endDate).getTime() - new Date(event.startDate).getTime()) / (1000 * 60 * 60))} hours
                </p>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Capacity Utilization</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full" 
                      style={{ width: `${(analytics.confirmedRSVPs / event.capacity) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm">{Math.round((analytics.confirmedRSVPs / event.capacity) * 100)}%</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="font-medium text-sm mb-1">Location</p>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {event.location.type === 'online' ? 'Online Event' : 
                     event.location.venue || `${event.location.city}, ${event.location.country}`}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">Event Type</p>
                <Badge variant="secondary" className="capitalize">
                  {event.type}
                </Badge>
              </div>
              <div>
                <p className="font-medium text-sm mb-1">No-Show Rate</p>
                <p className="text-muted-foreground">
                  {analytics.confirmedRSVPs > 0 ? 
                    Math.round((analytics.noShows / analytics.confirmedRSVPs) * 100) : 0}% 
                  ({analytics.noShows} attendees)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
