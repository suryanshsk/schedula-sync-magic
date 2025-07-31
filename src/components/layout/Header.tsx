// Header component for Schedula
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  Search,
  Plus
} from 'lucide-react';
import { notificationStorage } from '@/lib/storage';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const unreadNotifications = user ? notificationStorage.getUnreadCount(user.id) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'organizer': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <header className="card-glass border-b border-border/50 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient">Schedula</span>
            </Link>
          </div>

          {/* Desktop Navigation - Public */}
          {!user && (
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                to="/features" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/pricing" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/contact" 
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </div>
          )}

          {/* Desktop Navigation - Authenticated */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="btn-glass">
                <Search className="h-4 w-4 mr-2" />
                Search Events
              </Button>
              
              {(user.role === 'organizer' && user.status === 'active') && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="btn-neon"
                  onClick={() => navigate('/create-event')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              )}
            </div>
          )}

          {/* User Menu or Auth Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative btn-glass"
                  onClick={() => navigate('/notifications')}
                >
                  <Bell className="h-4 w-4" />
                  {unreadNotifications > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </Badge>
                  )}
                </Button>

                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="btn-glass p-1">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden md:block text-left">
                          <p className="text-sm font-medium">{user.name}</p>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                            {user.role}
                          </Badge>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 card-glass">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/calendar')}>
                      <Calendar className="mr-2 h-4 w-4" />
                      My Calendar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {/* Mobile Menu Toggle for Public */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden btn-glass"
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                >
                  <Menu className="h-4 w-4" />
                </Button>
                
                {/* Desktop Auth Buttons */}
                <div className="hidden md:flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="btn-glass"
                  >
                    Sign In
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => navigate('/auth')}
                    className="btn-neon"
                  >
                    Get Started
                  </Button>
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden btn-glass"
                onClick={onMenuClick}
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col space-y-2">
              {user ? (
                <>
                  <Button variant="ghost" size="sm" className="justify-start btn-glass">
                    <Search className="h-4 w-4 mr-2" />
                    Search Events
                  </Button>
                  {(user.role === 'organizer' && user.status === 'active') && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="justify-start btn-neon"
                      onClick={() => navigate('/create-event')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Link 
                    to="/features" 
                    className="py-2 px-4 text-sm font-medium hover:bg-muted/20 rounded-md transition-colors"
                  >
                    Features
                  </Link>
                  <Link 
                    to="/pricing" 
                    className="py-2 px-4 text-sm font-medium hover:bg-muted/20 rounded-md transition-colors"
                  >
                    Pricing
                  </Link>
                  <Link 
                    to="/contact" 
                    className="py-2 px-4 text-sm font-medium hover:bg-muted/20 rounded-md transition-colors"
                  >
                    Contact
                  </Link>
                  <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate('/auth')}
                      className="justify-start btn-glass"
                    >
                      Sign In
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => navigate('/auth')}
                      className="justify-start btn-neon"
                    >
                      Get Started
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};