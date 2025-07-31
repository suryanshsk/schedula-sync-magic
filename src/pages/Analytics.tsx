import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, rsvpStorage } from '@/lib/storage';

export const Analytics: React.FC = () => {
  const { user } = useAuth();
  const events = user ? eventStorage.getByOrganizer(user.id) : [];
  const allRSVPs = rsvpStorage.getAll();
  
  // Calculate metrics
  const totalEvents = events.length;
  const publishedEvents = events.filter(e => e.status === 'published').length;
  const totalRSVPs = allRSVPs.filter(rsvp => 
    events.some(event => event.id === rsvp.eventId)
  ).length;
  const confirmedRSVPs = allRSVPs.filter(rsvp => 
    rsvp.status === 'confirmed' && events.some(event => event.id === rsvp.eventId)
  ).length;

  // Event performance data
  const eventPerformanceData = events.map(event => {
    const eventRSVPs = allRSVPs.filter(rsvp => rsvp.eventId === event.id);
    return {
      name: event.title.length > 15 ? event.title.substring(0, 15) + '...' : event.title,
      rsvps: eventRSVPs.length,
      confirmed: eventRSVPs.filter(r => r.status === 'confirmed').length,
      waitlisted: eventRSVPs.filter(r => r.status === 'waitlisted').length,
    };
  });

  // Event type distribution
  const eventTypeData = events.reduce((acc, event) => {
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
    { month: 'Jan', events: 2, rsvps: 45 },
    { month: 'Feb', events: 3, rsvps: 67 },
    { month: 'Mar', events: 1, rsvps: 23 },
    { month: 'Apr', events: 4, rsvps: 89 },
    { month: 'May', events: 2, rsvps: 56 },
    { month: 'Jun', events: 3, rsvps: 78 },
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Analytics</h1>
        <p className="text-muted-foreground">Track your event performance and audience engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{totalEvents}</p>
                <p className="text-xs text-muted-foreground mt-1">
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
                <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
                <p className="text-2xl font-bold">{totalRSVPs}</p>
                <p className="text-xs text-success mt-1">
                  {confirmedRSVPs} confirmed
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
                <p className="text-sm font-medium text-muted-foreground">Avg. Attendance</p>
                <p className="text-2xl font-bold">
                  {totalEvents > 0 ? Math.round((confirmedRSVPs / totalEvents) * 100) / 100 : 0}
                </p>
                <p className="text-xs text-success mt-1">
                  Per event
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                <p className="text-2xl font-bold">$0</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Free events only
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Event Performance */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Event Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eventPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="confirmed" stackId="a" fill="hsl(var(--primary))" />
                <Bar dataKey="waitlisted" stackId="a" fill="hsl(var(--secondary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Event Types Distribution */}
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

      {/* Monthly Trends */}
      <Card className="card-glass mb-8">
        <CardHeader>
          <CardTitle>Monthly Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={2} />
              <Line type="monotone" dataKey="rsvps" stroke="hsl(var(--secondary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Events */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.slice(0, 5).map((event) => {
              const eventRSVPs = allRSVPs.filter(rsvp => rsvp.eventId === event.id);
              return (
                <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/20">
                  <div className="flex-1">
                    <h4 className="font-medium line-clamp-1">{event.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="capitalize">
                      {event.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {eventRSVPs.length} RSVPs
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};