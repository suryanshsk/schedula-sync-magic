import React from 'react';
import { User, Calendar, CheckCircle, Clock, ExternalLink, Mail, MapPin, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { rsvpStorage, eventStorage, attendanceStorage } from '@/lib/storage';
import { User as UserType } from '@/lib/types';

interface UserProfileModalProps {
  user: UserType | null;
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose }) => {
  if (!user) return null;

  // Get user statistics
  const userRSVPs = rsvpStorage.getAll().filter(rsvp => rsvp.userId === user.id);
  const confirmedRSVPs = userRSVPs.filter(rsvp => rsvp.status === 'confirmed');
  const checkedInEvents = userRSVPs.filter(rsvp => rsvp.checkedIn);
  
  // Calculate time since account creation
  const accountAge = Math.floor((new Date().getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  
  const formatAccountAge = (days: number) => {
    if (days < 1) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 30) return `${days} days ago`;
    if (days < 365) {
      const months = Math.floor(days / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    }
    const years = Math.floor(days / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return '💼';
      case 'github':
        return '🐙';
      case 'twitter':
        return '🐦';
      case 'portfolio':
        return '🌐';
      default:
        return '🔗';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'organizer':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="text-lg">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <Badge className={getRoleColor(user.role)}>
                  {user.role}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              
              {user.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Joined {formatAccountAge(accountAge)}</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{user.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Event Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{userRSVPs.length}</div>
                  <div className="text-sm text-muted-foreground">Total RSVPs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{confirmedRSVPs.length}</div>
                  <div className="text-sm text-muted-foreground">Confirmed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{checkedInEvents.length}</div>
                  <div className="text-sm text-muted-foreground">Attended</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          {user.socialLinks && Object.values(user.socialLinks).some(link => link) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.socialLinks.linkedin && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSocialIcon('linkedin')}</span>
                        <span className="font-medium">LinkedIn</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(user.socialLinks!.linkedin, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  )}
                  
                  {user.socialLinks.github && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSocialIcon('github')}</span>
                        <span className="font-medium">GitHub</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(user.socialLinks!.github, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  )}
                  
                  {user.socialLinks.twitter && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSocialIcon('twitter')}</span>
                        <span className="font-medium">Twitter/X</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(user.socialLinks!.twitter, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  )}
                  
                  {user.socialLinks.portfolio && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getSocialIcon('portfolio')}</span>
                        <span className="font-medium">Portfolio</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(user.socialLinks!.portfolio, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Website
                      </Button>
                    </div>
                  )}
                  
                  {user.socialLinks.other && user.socialLinks.other.length > 0 && (
                    <div className="space-y-2">
                      <span className="font-medium">Other Links:</span>
                      {user.socialLinks.other.map((link, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getSocialIcon('other')}</span>
                            <span className="text-sm text-muted-foreground">{link}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Visit
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Events */}
          {userRSVPs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Event Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {userRSVPs.slice(0, 5).map((rsvp) => {
                    const event = eventStorage.getById(rsvp.eventId);
                    if (!event) return null;
                    
                    return (
                      <div key={rsvp.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rsvp.registrationDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={rsvp.status === 'confirmed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rsvp.status}
                          </Badge>
                          {rsvp.checkedIn && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              Attended
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
