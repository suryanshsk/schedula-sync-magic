// Sidebar navigation component for Schedula
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Home,
  Users,
  Settings,
  Bell,
  PlusCircle,
  BarChart3,
  QrCode,
  User,
  Shield,
  UserCheck,
  MapPin,
  Clock,
  Ticket
} from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  end?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon, label, badge, end = false }) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 group",
          "hover:bg-muted/50 hover:scale-102",
          isActive 
            ? "bg-primary/10 text-primary border border-primary/20 shadow-glow" 
            : "text-muted-foreground hover:text-foreground"
        )
      }
    >
      <div className="flex-shrink-0">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
      {badge && badge > 0 && (
        <div className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {badge > 9 ? '9+' : badge}
        </div>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isOrganizer = user.role === 'organizer' || user.role === 'admin';

  return (
    <aside className="w-64 h-screen card-glass border-r border-border/50 sticky top-0 overflow-y-auto">
      <div className="p-6">
        {/* User Profile Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/20">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          <div className="pb-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Main
            </h3>
            <div className="space-y-1">
              <SidebarItem
                to="/dashboard"
                icon={<Home className="h-4 w-4" />}
                label="Dashboard"
                end
              />
              <SidebarItem
                to="/events"
                icon={<Calendar className="h-4 w-4" />}
                label="Browse Events"
              />
              <SidebarItem
                to="/calendar"
                icon={<Clock className="h-4 w-4" />}
                label="My Calendar"
              />
              <SidebarItem
                to="/notifications"
                icon={<Bell className="h-4 w-4" />}
                label="Notifications"
                badge={3} // You can make this dynamic based on unread notifications
              />
            </div>
          </div>

          {/* Organizer Section */}
          {isOrganizer && (
            <div className="pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Organizer
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  to="/create-event"
                  icon={<PlusCircle className="h-4 w-4" />}
                  label="Create Event"
                />
                <SidebarItem
                  to="/my-events"
                  icon={<Ticket className="h-4 w-4" />}
                  label="My Events"
                />
                <SidebarItem
                  to="/analytics"
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Analytics"
                />
                <SidebarItem
                  to="/qr-scanner"
                  icon={<QrCode className="h-4 w-4" />}
                  label="QR Scanner"
                />
              </div>
            </div>
          )}

          {/* Admin Section */}
          {isAdmin && (
            <div className="pb-2">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Admin
              </h3>
              <div className="space-y-1">
                <SidebarItem
                  to="/admin/users"
                  icon={<Users className="h-4 w-4" />}
                  label="Manage Users"
                />
                <SidebarItem
                  to="/admin/organizers"
                  icon={<UserCheck className="h-4 w-4" />}
                  label="Approve Organizers"
                  badge={2} // Dynamic based on pending organizers
                />
                <SidebarItem
                  to="/admin/events"
                  icon={<Shield className="h-4 w-4" />}
                  label="All Events"
                />
                <SidebarItem
                  to="/admin/analytics"
                  icon={<BarChart3 className="h-4 w-4" />}
                  label="Platform Analytics"
                />
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="pt-2 border-t border-border/50">
            <div className="space-y-1">
              <SidebarItem
                to="/settings"
                icon={<Settings className="h-4 w-4" />}
                label="Settings"
              />
            </div>
          </div>
        </nav>

        {/* Quick Stats */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-primary/10">
          <h4 className="text-sm font-semibold mb-2">Quick Stats</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">My Events</span>
              <span className="font-medium">12</span>
            </div>
            {isOrganizer && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total RSVPs</span>
                  <span className="font-medium">456</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">This Month</span>
                  <span className="font-medium text-success">+23%</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};