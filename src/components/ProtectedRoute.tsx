import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles: string[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles, 
  redirectTo = '/unauthorized' 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user doesn't have required role, redirect to unauthorized page
  if (!requiredRoles.includes(user.role)) {
    console.log(`Access denied: User role '${user.role}' not in required roles:`, requiredRoles);
    return <Navigate to={redirectTo} replace />;
  }

  // If user has the required role, render the children
  return <>{children}</>;
};
