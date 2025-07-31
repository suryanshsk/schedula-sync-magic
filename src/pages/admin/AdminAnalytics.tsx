import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, TrendingUp, DollarSign, Activity, Building } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, rsvpStorage, userStorage } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';

export const AdminAnalytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  const allEvents = eventStorage.getAll();
  const allRSVPs = rsvpStorage.getAll();
  const allUsers = userStorage.getAll();
  
  // Calculate metrics
  const totalEvents = allEvents.length;
  const publishedEvents = allEvents.filter(e => e.status === 'published').length;
  const totalUsers = allUsers.length;
  const activeUsers = allUsers.filter(u => u.status === 'active').length;
  const totalRSVPs = allRSVPs.length;
  const confirmedRSVPs = allRSVPs.filter(r => r.status === 'confirmed').length;

  // Revenue calculation
  const totalRevenue = allEvents.reduce((sum, event) => {
    if (event.pricing.type === 'paid') {
      const eventRSVPs = allRSVPs.filter(r => r.eventId === event.id && r.status === 'confirmed');
      return sum + (eventRSVPs.length * (event.pricing.amount || 0));
    }
    return sum;
  }, 0);

  // Event performance data
  const eventPerformanceData = allEvents.slice(0, 10).map(event => {
    const eventRSVPs = allRSVPs.filter(rsvp => rsvp.eventId === event.id);
    return {
      name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
      rsvps: eventRSVPs.length,
      confirmed: eventRSVPs.filter(r => r.status === 'confirmed').length,
      capacity: event.capacity,
    };
  });

  // User role distribution
  const userRoleData = [
    { name: 'Users', value: allUsers.filter(u => u.role === 'user').length, color: 'hsl(var(--primary))' },
    { name: 'Organizers', value: allUsers.filter(u => u.role === 'organizer').length, color: 'hsl(var(--secondary))' },
    { name: 'Admins', value: allUsers.filter(u => u.role === 'admin').length, color: 'hsl(var(--accent))' },
  ];

  // Event type distribution
  const eventTypeData = allEvents.reduce((acc, event) => {
    const existing = acc.find(item => item.name === event.type);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: event.type, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d'];

  // Monthly trends (mock data for demo)
  const monthlyData = [
    { month: 'Jan', events: 12, users: 145, revenue: 2340 },
    { month: 'Feb', events: 18, users: 167, revenue: 3650 },
    { month: 'Mar', events: 15, users: 189, revenue: 2890 },
    { month: 'Apr', events: 22, users: 234, revenue: 4320 },
    { month: 'May', events: 19, users: 267, revenue: 3780 },
    { month: 'Jun', events: 25, users: 298, revenue: 5460 },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into platform performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{totalUsers}</p>
                <p className="text-xs text-success mt-1">
                  {activeUsers} active
                </p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-xs text-success mt-1">
                  {publishedEvents} published
                </p>
              </div>
              <CalendarDays className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Platform Revenue</p>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-success mt-1">
                  +15% from last month
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
                <p className="text-2xl font-bold">{totalRSVPs}</p>
                <p className="text-xs text-success mt-1">
                  {confirmedRSVPs} confirmed
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Monthly Trends */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Monthly Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" name="Users" />
                <Line type="monotone" dataKey="events" stroke="hsl(var(--secondary))" name="Events" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Role Distribution */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>User Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userRoleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userRoleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Performance */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Top Events by RSVPs</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="confirmed" fill="hsl(var(--primary))" name="Confirmed" />
                <Bar dataKey="rsvps" fill="hsl(var(--secondary))" name="Total RSVPs" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Type Distribution */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Event Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {eventTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
