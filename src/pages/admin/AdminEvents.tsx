import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Eye,
  Shield,
  MoreHorizontal,
  Trash2,
  Edit,
  Download
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage, userStorage, rsvpStorage } from '@/lib/storage';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const AdminEvents: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [selectedType, setSelectedType] = React.useState<string>('all');

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
  
  // Add organizer info to events
  const eventsWithOrganizers = allEvents.map(event => {
    const organizer = allUsers.find(u => u.id === event.organizerId);
    const eventRSVPs = allRSVPs.filter(r => r.eventId === event.id);
    return {
      ...event,
      organizer,
      rsvpCount: eventRSVPs.length,
      confirmedRSVPs: eventRSVPs.filter(r => r.status === 'confirmed').length,
    };
  });
  
  const filteredEvents = eventsWithOrganizers.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleUpdateEventStatus = (eventId: string, newStatus: 'published' | 'cancelled' | 'draft') => {
    try {
      eventStorage.update(eventId, { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      });
      toast.success(`Event ${newStatus} successfully`);
    } catch (error) {
      toast.error('Failed to update event status');
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    try {
      // Note: In a real app, you'd want to handle cascading deletes for RSVPs
      eventStorage.delete(eventId);
      toast.success('Event deleted successfully');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleExportEventData = (eventId: string) => {
    try {
      const event = eventStorage.getById(eventId);
      if (!event) {
        toast.error('Event not found');
        return;
      }

      // Get all RSVPs for this event
      const eventRSVPs = allRSVPs.filter(rsvp => rsvp.eventId === eventId);
      
      if (eventRSVPs.length === 0) {
        toast.info('No RSVP data found for this event');
        return;
      }

      // Prepare CSV data with comprehensive information
      const csvHeaders = [
        'Name',
        'User ID',
        'Email',
        'RSVP Status',
        'Registration Date',
        'Confirmed At',
        'Attendance Status',
        'Check-in Time',
        'Check-in Method',
        'Bio',
        'Location',
        'LinkedIn',
        'GitHub',
        'Twitter',
        'Portfolio'
      ];

      const csvData = eventRSVPs.map(rsvp => {
        const userData = allUsers.find(u => u.id === rsvp.userId);
        const formatDate = (dateString?: string) => 
          dateString ? new Date(dateString).toLocaleString() : 'N/A';
        
        return [
          userData?.name || 'N/A',
          rsvp.userId,
          userData?.email || 'N/A',
          rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1),
          formatDate(rsvp.registrationDate),
          formatDate(rsvp.confirmedAt),
          rsvp.attendanceStatus ? 
            rsvp.attendanceStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
            (rsvp.checkedIn ? 'Checked In' : 'Not Checked In'),
          formatDate(rsvp.checkedInAt),
          rsvp.checkedInMethod ? 
            rsvp.checkedInMethod.charAt(0).toUpperCase() + rsvp.checkedInMethod.slice(1) : 'N/A',
          userData?.bio || 'N/A',
          userData?.location || 'N/A',
          userData?.socialLinks?.linkedin || 'N/A',
          userData?.socialLinks?.github || 'N/A',
          userData?.socialLinks?.twitter || 'N/A',
          userData?.socialLinks?.portfolio || 'N/A'
        ];
      });

      // Convert to CSV format
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => 
          row.map(field => 
            // Escape commas and quotes in CSV data
            typeof field === 'string' && (field.includes(',') || field.includes('"')) 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_attendees_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Event data exported successfully for "${event.title}"`);
    } catch (error) {
      console.error('Error exporting event data:', error);
      toast.error('Failed to export event data');
    }
  };

  const handleExportAllEventsData = () => {
    try {
      if (allRSVPs.length === 0) {
        toast.info('No RSVP data found across all events');
        return;
      }

      // Prepare CSV data with comprehensive information including event details
      const csvHeaders = [
        'Event Title',
        'Event Type',
        'Event Status',
        'Event Date',
        'Organizer Name',
        'Organizer Email',
        'Attendee Name',
        'User ID',
        'Attendee Email',
        'RSVP Status',
        'Registration Date',
        'Confirmed At',
        'Attendance Status',
        'Check-in Time',
        'Check-in Method',
        'Bio',
        'Location',
        'LinkedIn',
        'GitHub',
        'Twitter',
        'Portfolio'
      ];

      const csvData = allRSVPs.map(rsvp => {
        const event = allEvents.find(e => e.id === rsvp.eventId);
        const userData = allUsers.find(u => u.id === rsvp.userId);
        const organizer = allUsers.find(u => u.id === event?.organizerId);
        const formatDate = (dateString?: string) => 
          dateString ? new Date(dateString).toLocaleString() : 'N/A';
        
        return [
          event?.title || 'N/A',
          event?.type || 'N/A',
          event?.status || 'N/A',
          event?.startDate ? formatDate(event.startDate) : 'N/A',
          organizer?.name || 'N/A',
          organizer?.email || 'N/A',
          userData?.name || 'N/A',
          rsvp.userId,
          userData?.email || 'N/A',
          rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1),
          formatDate(rsvp.registrationDate),
          formatDate(rsvp.confirmedAt),
          rsvp.attendanceStatus ? 
            rsvp.attendanceStatus.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
            (rsvp.checkedIn ? 'Checked In' : 'Not Checked In'),
          formatDate(rsvp.checkedInAt),
          rsvp.checkedInMethod ? 
            rsvp.checkedInMethod.charAt(0).toUpperCase() + rsvp.checkedInMethod.slice(1) : 'N/A',
          userData?.bio || 'N/A',
          userData?.location || 'N/A',
          userData?.socialLinks?.linkedin || 'N/A',
          userData?.socialLinks?.github || 'N/A',
          userData?.socialLinks?.twitter || 'N/A',
          userData?.socialLinks?.portfolio || 'N/A'
        ];
      });

      // Convert to CSV format
      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => 
          row.map(field => 
            // Escape commas and quotes in CSV data
            typeof field === 'string' && (field.includes(',') || field.includes('"')) 
              ? `"${field.replace(/"/g, '""')}"` 
              : field
          ).join(',')
        )
      ].join('\n');

      // Create and download the file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `all_events_data_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`All events data exported successfully (${allRSVPs.length} records)`);
    } catch (error) {
      console.error('Error exporting all events data:', error);
      toast.error('Failed to export all events data');
    }
  };

  const statuses = ['all', 'draft', 'published', 'cancelled', 'completed'];
  const types = ['all', 'conference', 'workshop', 'networking', 'social', 'online'];

  const publishedEvents = allEvents.filter(e => e.status === 'published').length;
  const draftEvents = allEvents.filter(e => e.status === 'draft').length;
  const cancelledEvents = allEvents.filter(e => e.status === 'cancelled').length;

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">All Events</h1>
            <p className="text-muted-foreground">Monitor and manage all events on the platform</p>
          </div>
          <Button onClick={handleExportAllEventsData} variant="outline" className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Download All Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{allEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published</p>
                <p className="text-2xl font-bold">{publishedEvents}</p>
              </div>
              <Eye className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Draft</p>
                <p className="text-2xl font-bold">{draftEvents}</p>
              </div>
              <Edit className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{cancelledEvents}</p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events, organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <Button
                key={status}
                variant={selectedStatus === status ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedStatus(status)}
                className="capitalize"
              >
                {status === 'all' ? 'All Status' : status}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Table */}
      <Card className="card-glass">
        <CardHeader>
          <CardTitle>Events ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Event</th>
                  <th className="text-left py-3 px-4 font-medium">Organizer</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">RSVPs</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium line-clamp-1">{event.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {event.location.type === 'online' ? 'Online Event' : 
                             event.location.venue || `${event.location.city}, ${event.location.country}`}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {event.organizer?.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </span>
                        </div>
                        <span className="text-sm">{event.organizer?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge 
                        variant={
                          event.status === 'published' ? 'default' : 
                          event.status === 'draft' ? 'secondary' : 
                          event.status === 'cancelled' ? 'destructive' :
                          'outline'
                        }
                      >
                        {event.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="outline" className="capitalize">
                        {event.type}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p>{new Date(event.startDate).toLocaleDateString()}</p>
                        <p className="text-muted-foreground">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="font-medium">{event.confirmedRSVPs}/{event.capacity}</p>
                        <p className="text-muted-foreground">{event.rsvpCount} total</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExportEventData(event.id)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Data
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {event.status === 'draft' && (
                            <DropdownMenuItem onClick={() => handleUpdateEventStatus(event.id, 'published')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {event.status === 'published' && (
                            <DropdownMenuItem onClick={() => handleUpdateEventStatus(event.id, 'cancelled')}>
                              <Shield className="h-4 w-4 mr-2" />
                              Cancel
                            </DropdownMenuItem>
                          )}
                          {event.status === 'cancelled' && (
                            <DropdownMenuItem onClick={() => handleUpdateEventStatus(event.id, 'published')}>
                              <Eye className="h-4 w-4 mr-2" />
                              Republish
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDeleteEvent(event.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No events found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
