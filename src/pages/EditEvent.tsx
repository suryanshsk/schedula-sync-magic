import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, Save, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';
import { eventStorage } from '@/lib/storage';
import { toast } from 'sonner';

export const EditEvent: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(eventId ? eventStorage.getById(eventId) : null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    startDate: '',
    endDate: '',
    locationType: 'in-person' as 'in-person' | 'online' | 'hybrid',
    venue: '',
    address: '',
    city: '',
    country: '',
    onlineUrl: '',
    type: 'conference' as 'conference' | 'workshop' | 'networking' | 'social' | 'online',
    category: '',
    pricingType: 'free' as 'free' | 'paid',
    amount: 0,
    currency: 'USD',
    capacity: 100,
    visibility: 'public' as 'public' | 'private' | 'unlisted',
    registrationDeadline: '',
    status: 'draft' as 'draft' | 'published' | 'cancelled' | 'completed'
  });

  useEffect(() => {
    if (!event) return;

    // Check if user is authorized to edit this event
    if (!user || (user.role !== 'admin' && event.organizerId !== user.id)) {
      toast.error('You are not authorized to edit this event');
      navigate('/my-events');
      return;
    }

    // Populate form with existing event data
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      startDate: event.startDate.slice(0, 16), // Format for datetime-local input
      endDate: event.endDate.slice(0, 16),
      locationType: event.location.type,
      venue: event.location.venue || '',
      address: event.location.address || '',
      city: event.location.city || '',
      country: event.location.country || '',
      onlineUrl: event.location.onlineUrl || '',
      type: event.type,
      category: event.category,
      pricingType: event.pricing?.type || 'free',
      amount: event.pricing?.amount || 0,
      currency: event.pricing?.currency || 'USD',
      capacity: event.capacity,
      visibility: event.visibility,
      registrationDeadline: event.registrationDeadline ? event.registrationDeadline.slice(0, 16) : '',
      status: event.status
    });
  }, [event, user, navigate]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async (newStatus?: 'draft' | 'published' | 'cancelled') => {
    if (!event || !user) return;

    setIsLoading(true);
    try {
      const updatedEvent = {
        ...event,
        title: formData.title,
        description: formData.description,
        shortDescription: formData.shortDescription,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        location: {
          type: formData.locationType,
          venue: formData.venue,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          onlineUrl: formData.onlineUrl,
        },
        type: formData.type,
        category: formData.category,
        pricing: {
          type: formData.pricingType,
          amount: formData.amount,
          currency: formData.currency,
        },
        capacity: formData.capacity,
        visibility: formData.visibility,
        registrationDeadline: formData.registrationDeadline ? new Date(formData.registrationDeadline).toISOString() : undefined,
        status: newStatus || formData.status,
        updatedAt: new Date().toISOString()
      };

      eventStorage.update(event.id, updatedEvent);
      toast.success('Event updated successfully!');
      navigate('/my-events');
    } catch (error) {
      toast.error('Failed to update event');
    } finally {
      setIsLoading(false);
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
                The event you're trying to edit doesn't exist.
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

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/my-events')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Events
      </Button>

      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Edit Event</h1>
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
          <Button 
            variant="outline" 
            onClick={() => navigate(`/event/${event.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Information */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="title">Event Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            
            <div>
              <Label htmlFor="shortDescription">Short Description</Label>
              <Input
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                placeholder="Brief description for event cards"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Full Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Detailed event description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="type">Event Type</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Technology, Business"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate">Start Date & Time</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="endDate">End Date & Time</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="registrationDeadline">Registration Deadline (Optional)</Label>
              <Input
                id="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => handleInputChange('registrationDeadline', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="locationType">Location Type</Label>
              <Select value={formData.locationType} onValueChange={(value) => handleInputChange('locationType', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">Physical Location</SelectItem>
                    <SelectItem value="online">Online Event</SelectItem>
                    <SelectItem value="hybrid">Hybrid (Physical + Online)</SelectItem>
                  </SelectContent>
              </Select>
            </div>

            {(formData.locationType === 'in-person' || formData.locationType === 'hybrid') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="venue">Venue Name</Label>
                  <Input
                    id="venue"
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="e.g., Convention Center"
                  />
                </div>
                
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street address"
                  />
                </div>
                
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    placeholder="Country name"
                  />
                </div>
              </div>
            )}

            {(formData.locationType === 'online' || formData.locationType === 'hybrid') && (
              <div>
                <Label htmlFor="onlineUrl">Online Meeting URL</Label>
                <Input
                  id="onlineUrl"
                  value={formData.onlineUrl}
                  onChange={(e) => handleInputChange('onlineUrl', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Settings */}
        <Card className="card-glass">
          <CardHeader>
            <CardTitle>Event Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                />
              </div>
              
              <div>
                <Label htmlFor="visibility">Visibility</Label>
                <Select value={formData.visibility} onValueChange={(value) => handleInputChange('visibility', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="unlisted">Unlisted</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="pricingType">Pricing</Label>
                <Select value={formData.pricingType} onValueChange={(value) => handleInputChange('pricingType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.pricingType === 'paid' && (
                <>
                  <div>
                    <Label htmlFor="amount">Price</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button 
            variant="outline" 
            onClick={() => navigate('/my-events')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => handleSave('draft')}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save as Draft'}
          </Button>
          
          <Button 
            onClick={() => handleSave('published')}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Publishing...' : 'Save & Publish'}
          </Button>
        </div>
      </div>
    </div>
  );
};
