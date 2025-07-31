// User dashboard for Schedula
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Ticket, TrendingUp, Bell } from 'lucide-react';
import { eventStorage, rsvpStorage, notificationStorage } from '@/lib/storage';
import { format } from 'date-fns';

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Get user's RSVPs and related data
  const userRSVPs = rsvpStorage.getByUser(user.id);
  const confirmedRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'confirmed');
  const waitlistedRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'waitlisted');
  
  // Get upcoming events user is attending
  const upcomingEvents = confirmedRSVPs
    .map(rsvp => {
      const event = eventStorage.getById(rsvp.eventId);
      return event ? { event, rsvp } : null;
    })
    .filter(item => item !== null)
    .filter(item => new Date(item!.event.startDate) > new Date())
    .sort((a, b) => new Date(a!.event.startDate).getTime() - new Date(b!.event.startDate).getTime())
    .slice(0, 3);

  // Get recent notifications
  const recentNotifications = notificationStorage.getByUser(user.id).slice(0, 3);

  // Stats
  const stats = [
    {
      title: 'Events Registered',
      value: confirmedRSVPs.length,
      description: 'Total confirmed events',
      icon: <Ticket className="h-4 w-4" />,
      trend: '+2 this month'
    },
    {
      title: 'On Waitlist',
      value: waitlistedRSVPs.length,
      description: 'Awaiting confirmation',
      icon: <Clock className="h-4 w-4" />,
      trend: 'Auto-notify when available'
    },
    {
      title: 'This Month',
      value: upcomingEvents.length,
      description: 'Events coming up',
      icon: <Calendar className="h-4 w-4" />,
      trend: 'Stay organized'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="card-ultra p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover amazing events and manage your schedule
            </p>
          </div>
          <Button 
            onClick={() => navigate('/events')}
            className="btn-neon"
          >
            Browse Events
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="card-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <p className="text-xs text-success mt-1">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Your confirmed events coming up
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(({ event, rsvp }) => (
                <div 
                  key={event.id}
                  className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{event.title}</h3>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.startDate), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location.type === 'online' ? 'Online' : event.location.city}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => navigate('/events')}
                >
                  Browse Events
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Notifications */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Updates
            </CardTitle>
            <CardDescription>
              Latest notifications and updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read 
                      ? 'border-border/50 bg-muted/20' 
                      : 'border-primary/50 bg-primary/5'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recent notifications</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/events')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Browse Events
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/calendar')}
            >
              <Clock className="h-4 w-4 mr-2" />
              My Calendar
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/notifications')}
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/settings')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};