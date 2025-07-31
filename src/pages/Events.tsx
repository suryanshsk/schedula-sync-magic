import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Calendar, MapPin, Users, Clock, Eye, Heart, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { eventStorage, rsvpStorage } from '@/lib/storage';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

export const Events: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedType, setSelectedType] = React.useState<string>('all');
  const [events, setEvents] = React.useState(eventStorage.getAll().filter(event => event.status === 'published'));
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  // Auto-refresh events every 30 seconds for live sync
  React.useEffect(() => {
    const interval = setInterval(() => {
      setEvents(eventStorage.getAll().filter(event => event.status === 'published'));
      setRefreshKey(prev => prev + 1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Also refresh on window focus for better UX
  React.useEffect(() => {
    const handleFocus = () => {
      setEvents(eventStorage.getAll().filter(event => event.status === 'published'));
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
  
  const eventTypes = ['all', 'conference', 'workshop', 'networking', 'social', 'online'];
  
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleRSVP = (eventId: string) => {
    if (!user) {
      toast.error('Please log in to RSVP for events');
      return;
    }

    // Only regular users can RSVP to events
    if (user.role !== 'user') {
      toast.error(user.role === 'admin' ? 'Admins cannot RSVP to events' : 'Organizers cannot RSVP to events');
      return;
    }

    try {
      // Check if user already has an RSVP for this event
      const existingRSVP = rsvpStorage.getAll().find(r => r.eventId === eventId && r.userId === user.id);
      
      if (existingRSVP) {
        toast.warning('You have already RSVP\'d for this event');
        return;
      }

      // Create new RSVP (goes to waitlist for organizer approval)
      rsvpStorage.create({
        userId: user.id,
        eventId: eventId,
        status: 'waitlisted',
        notes: '',
        checkedIn: false,
      });

      toast.success('Successfully RSVP\'d for the event! Your RSVP is pending organizer approval.');
      
      // Refresh events to update RSVP count
      setEvents(eventStorage.getAll().filter(event => event.status === 'published'));
    } catch (error) {
      toast.error('Failed to RSVP for the event');
    }
  };

  const handleViewDetails = (eventId: string) => {
    // Navigate to event details page (you can create this route later)
    navigate(`/event/${eventId}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Browse Events</h1>
        <p className="text-muted-foreground">Discover amazing events happening around you</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEvents(eventStorage.getAll().filter(event => event.status === 'published'));
              toast.success('Events refreshed');
            }}
            className="shrink-0"
          >
            Refresh
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {eventTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="capitalize"
            >
              {type === 'all' ? 'All Events' : type}
            </Button>
          ))}
        </div>
      </div>

      {/* Events Count */}
      <div className="mb-6">
        <p className="text-sm text-muted-foreground">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEvents.map((event) => {
          const allRSVPs = rsvpStorage.getAll();
          const eventRSVPs = allRSVPs.filter(r => r.eventId === event.id);
          const confirmedRSVPs = eventRSVPs.filter(r => r.status === 'confirmed').length;
          const userRSVP = user ? eventRSVPs.find(r => r.userId === user.id) : null;
          
          return (
            <Card key={event.id} className="card-glass hover:shadow-lg transition-all duration-300 hover:scale-105 flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {event.type}
                  </Badge>
                  <Badge variant={event.pricing.type === 'free' ? 'default' : 'outline'} className="text-xs">
                    {event.pricing.type === 'free' ? 'Free' : `$${event.pricing.amount}`}
                  </Badge>
                </div>
                <CardTitle className="text-base sm:text-lg line-clamp-2 leading-tight">{event.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                  {event.shortDescription || event.description}
                </p>
                
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{new Date(event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="truncate">{new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span className="line-clamp-1 text-xs">
                      {event.location.type === 'online' ? 'Online Event' : 
                       event.location.venue || `${event.location.city}, ${event.location.country}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <span>{confirmedRSVPs}/{event.capacity} attendees</span>
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  {/* Only show RSVP options for regular users */}
                  {user?.role === 'user' ? (
                    userRSVP ? (
                      <Button 
                        disabled 
                        className="w-full text-xs sm:text-sm" 
                        size="sm"
                        variant={userRSVP.status === 'confirmed' ? 'default' : 'secondary'}
                      >
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        {userRSVP.status === 'confirmed' ? 'RSVP Confirmed' : 
                         userRSVP.status === 'waitlisted' ? 'Pending Approval' : 'RSVP Cancelled'}
                      </Button>
                    ) : confirmedRSVPs >= event.capacity ? (
                      <Button disabled className="w-full text-xs sm:text-sm" variant="secondary" size="sm">
                        Event Full
                      </Button>
                    ) : (
                      <Button 
                        className="w-full text-xs sm:text-sm" 
                        size="sm"
                        onClick={() => handleRSVP(event.id)}
                      >
                        <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        RSVP Now
                      </Button>
                    )
                  ) : user?.role === 'admin' || user?.role === 'organizer' ? (
                    <Button disabled className="w-full text-xs sm:text-sm" variant="outline" size="sm">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      {user.role === 'admin' ? 'Admin View' : 'Organizer View'}
                    </Button>
                  ) : (
                    <Button 
                      className="w-full text-xs sm:text-sm" 
                      size="sm"
                      onClick={() => handleRSVP(event.id)}
                    >
                      <Heart className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      RSVP Now
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full text-xs sm:text-sm" 
                    size="sm"
                    onClick={() => handleViewDetails(event.id)}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No events found</h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Check back later for new events'}
          </p>
        </div>
      )}
    </div>
  );
};