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
  const { user } = useAuth();

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
