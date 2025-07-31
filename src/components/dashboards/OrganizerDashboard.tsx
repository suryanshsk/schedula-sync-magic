// Organizer dashboard for Schedula
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Plus, 
  Clock, 
  MapPin,
  Eye,
  CheckCircle,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { eventStorage, rsvpStorage } from '@/lib/storage';
import { format } from 'date-fns';

export const OrganizerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Get organizer's events and metrics
  const organizerEvents = eventStorage.getByOrganizer(user.id);
  const publishedEvents = organizerEvents.filter(event => event.status === 'published');
  const draftEvents = organizerEvents.filter(event => event.status === 'draft');
  
  // Calculate total metrics
  const totalRSVPs = organizerEvents.reduce((sum, event) => sum + (event.metrics?.totalRSVPs || 0), 0);
  const totalRevenue = organizerEvents.reduce((sum, event) => {
    if (event.pricing.type === 'paid') {
      const eventRSVPs = rsvpStorage.getByEvent(event.id).filter(r => r.status === 'confirmed');
      return sum + (eventRSVPs.length * (event.pricing.amount || 0));
    }
    return sum;
  }, 0);

  // Get upcoming events
  const upcomingEvents = publishedEvents
    .filter(event => new Date(event.startDate) > new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  // Stats
  const stats = [
    {
      title: 'Total Events',
      value: organizerEvents.length,
      description: `${publishedEvents.length} published, ${draftEvents.length} drafts`,
      icon: <Calendar className="h-4 w-4" />,
      trend: '+2 this month'
    },
    {
      title: 'Total RSVPs',
      value: totalRSVPs,
      description: 'Across all events',
      icon: <Users className="h-4 w-4" />,
      trend: '+12% from last month'
    },
    {
      title: 'Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'From paid events',
      icon: <DollarSign className="h-4 w-4" />,
      trend: '+8% from last month'
    },
    {
      title: 'Avg. Attendance',
      value: organizerEvents.length > 0 ? Math.round((totalRSVPs / organizerEvents.length) * 100) / 100 : 0,
      description: 'Per event',
      icon: <TrendingUp className="h-4 w-4" />,
      trend: 'Above average'
    },
  ];

  // Recent event performance
  const recentEvents = organizerEvents
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="card-ultra p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              Organizer Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your events and track performance
            </p>
          </div>
          <Button 
            onClick={() => navigate('/create-event')}
            className="btn-neon"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>
              Events happening soon
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => {
                const rsvpStats = rsvpStorage.getEventStats(event.id);
                const fillRate = event.capacity > 0 ? (rsvpStats.confirmed / event.capacity) * 100 : 0;
                
                return (
                  <div 
                    key={event.id}
                    className="p-4 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
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
                      <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>RSVPs: {rsvpStats.confirmed}/{event.capacity}</span>
                        <span>{Math.round(fillRate)}% full</span>
                      </div>
                      <Progress value={fillRate} className="h-1" />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming events</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => navigate('/create-event')}
                >
                  Create Your First Event
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Performance */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Event Performance
            </CardTitle>
            <CardDescription>
              Recent events overview
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => {
                const rsvpStats = rsvpStorage.getEventStats(event.id);
                const isUpcoming = new Date(event.startDate) > new Date();
                
                return (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-truncate-1">{event.title}</h4>
                        {isUpcoming ? (
                          <Clock className="h-3 w-3 text-warning" />
                        ) : (
                          <CheckCircle className="h-3 w-3 text-success" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {rsvpStats.confirmed} RSVPs
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {event.metrics?.viewCount || 0} views
                        </span>
                      </div>
                    </div>
                    <Badge 
                      variant={event.status === 'published' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {event.status}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No events created yet</p>
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => navigate('/create-event')}
                >
                  Create Your First Event
                </Button>
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
            Common organizer tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/create-event')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/my-events')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              My Events & QR Check-in
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/analytics')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};