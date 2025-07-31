// Dashboard page for Schedula
import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { UserDashboard } from '@/components/dashboards/UserDashboard';
import { OrganizerDashboard } from '@/components/dashboards/OrganizerDashboard';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // This should be handled by route protection
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'organizer':
      return <OrganizerDashboard />;
    case 'user':
    default:
      return <UserDashboard />;
  }
};