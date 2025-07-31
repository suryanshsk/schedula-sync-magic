// Admin dashboard for Schedula
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Activity,
  DollarSign,
  Eye,
  Clock,
  Building
} from 'lucide-react';
import { userStorage, eventStorage, rsvpStorage } from '@/lib/storage';
import { format, subDays, isAfter } from 'date-fns';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Get all platform data
  const allUsers = userStorage.getAll();
  const allEvents = eventStorage.getAll();
  const allRSVPs = rsvpStorage.getAll();
  
  // Filter data for insights
  const activeUsers = allUsers.filter(u => u.status === 'active');
  const pendingOrganizers = allUsers.filter(u => u.role === 'organizer' && u.status === 'pending');
  const publishedEvents = allEvents.filter(e => e.status === 'published');
  const confirmedRSVPs = allRSVPs.filter(r => r.status === 'confirmed');
  
  // Calculate metrics
  const totalRevenue = allEvents.reduce((sum, event) => {
    if (event.pricing.type === 'paid') {
      const eventRSVPs = allRSVPs.filter(r => r.eventId === event.id && r.status === 'confirmed');
      return sum + (eventRSVPs.length * (event.pricing.amount || 0));
    }
    return sum;
  }, 0);

  // Recent growth (last 7 days)
  const sevenDaysAgo = subDays(new Date(), 7);
  const recentUsers = allUsers.filter(u => isAfter(new Date(u.createdAt), sevenDaysAgo));
  const recentEvents = allEvents.filter(e => isAfter(new Date(e.createdAt), sevenDaysAgo));
  const recentRSVPs = allRSVPs.filter(r => isAfter(new Date(r.registrationDate), sevenDaysAgo));

  // Stats
  const stats = [
    {
      title: 'Total Users',
      value: allUsers.length,
      description: `${activeUsers.length} active`,
      icon: <Users className="h-4 w-4" />,
      trend: `+${recentUsers.length} this week`,
      growth: recentUsers.length > 0
    },
    {
      title: 'Total Events',
      value: allEvents.length,
      description: `${publishedEvents.length} published`,
      icon: <Calendar className="h-4 w-4" />,
      trend: `+${recentEvents.length} this week`,
      growth: recentEvents.length > 0
    },
    {
      title: 'Platform Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      description: 'From paid events',
      icon: <DollarSign className="h-4 w-4" />,
      trend: '+15% from last month',
      growth: true
    },
    {
      title: 'Total RSVPs',
      value: allRSVPs.length,
      description: `${confirmedRSVPs.length} confirmed`,
      icon: <CheckCircle className="h-4 w-4" />,
      trend: `+${recentRSVPs.length} this week`,
      growth: recentRSVPs.length > 0
    },
  ];

  // User distribution
  const userRoles = {
    admin: allUsers.filter(u => u.role === 'admin').length,
    organizer: allUsers.filter(u => u.role === 'organizer').length,
    user: allUsers.filter(u => u.role === 'user').length,
  };

  // Top events by RSVPs
  const topEvents = allEvents
    .map(event => ({
      ...event,
      rsvpCount: allRSVPs.filter(r => r.eventId === event.id).length
    }))
    .sort((a, b) => b.rsvpCount - a.rsvpCount)
    .slice(0, 5);

  // Recent activity
  const recentActivity = [
    ...recentUsers.map(u => ({
      type: 'user_joined',
      title: 'New user registered',
      description: `${u.name} joined as ${u.role}`,
      timestamp: u.createdAt,
      icon: <Users className="h-4 w-4" />
    })),
    ...recentEvents.map(e => ({
      type: 'event_created',
      title: 'Event created',
      description: `"${e.title}" by organizer`,
      timestamp: e.createdAt,
      icon: <Calendar className="h-4 w-4" />
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <div className="card-ultra p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Platform overview and management tools
            </p>
          </div>
          <div className="flex gap-2">
            {pendingOrganizers.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => navigate('/admin/organizers')}
                className="btn-glass"
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {pendingOrganizers.length} Pending Approvals
              </Button>
            )}
            <Button 
              onClick={() => navigate('/admin/users')}
              className="btn-neon"
            >
              <Shield className="h-4 w-4 mr-2" />
              Manage Platform
            </Button>
          </div>
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
              <p className={`text-xs mt-1 ${stat.growth ? 'text-success' : 'text-muted-foreground'}`}>
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* User Distribution */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Distribution
            </CardTitle>
            <CardDescription>
              Platform user roles breakdown
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-sm">Users</span>
                </div>
                <span className="text-sm font-medium">{userRoles.user}</span>
              </div>
              <Progress value={(userRoles.user / allUsers.length) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  <span className="text-sm">Organizers</span>
                </div>
                <span className="text-sm font-medium">{userRoles.organizer}</span>
              </div>
              <Progress value={(userRoles.organizer / allUsers.length) * 100} className="h-2" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-accent rounded-full"></div>
                  <span className="text-sm">Admins</span>
                </div>
                <span className="text-sm font-medium">{userRoles.admin}</span>
              </div>
              <Progress value={(userRoles.admin / allUsers.length) * 100} className="h-2" />
            </div>

            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                className="w-full btn-glass"
                onClick={() => navigate('/admin/users')}
              >
                Manage Users
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Events */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Events
            </CardTitle>
            <CardDescription>
              Events with most RSVPs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEvents.map((event, index) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/events/${event.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                    <h4 className="text-sm font-medium text-truncate-1">{event.title}</h4>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {event.rsvpCount} RSVPs
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {event.metrics?.viewCount || 0} views
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {event.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Latest platform activity and user actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                <div className="flex-shrink-0 p-2 rounded-lg bg-muted/20">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium">{activity.title}</h4>
                  <p className="text-xs text-muted-foreground">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Admin Actions</CardTitle>
          <CardDescription>
            Platform management tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/admin/users')}
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/admin/organizers')}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Approve Organizers
              {pendingOrganizers.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingOrganizers.length}
                </Badge>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/admin/events')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              All Events
            </Button>
            <Button 
              variant="outline" 
              className="btn-glass justify-start"
              onClick={() => navigate('/admin/analytics')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Platform Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};