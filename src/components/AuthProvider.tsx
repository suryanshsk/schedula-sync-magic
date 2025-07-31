// Authentication context provider for Schedula
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, authenticate, register, logout } from '@/lib/auth';
import { initializeSampleData } from '@/lib/sampleData';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  registerUser: (email: string, password: string, name: string, role: 'user' | 'organizer') => Promise<User>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();

    // Check for existing authentication
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authenticate(email, password);
      if (!authenticatedUser) {
        throw new Error('Authentication failed');
      }
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (
    email: string, 
    password: string, 
    name: string, 
    role: 'user' | 'organizer'
  ): Promise<User> => {
    try {
      setIsLoading(true);
      const newUser = await register(email, password, name, role);
      
      // Only set as current user if it's a regular user (not pending organizer)
      if (newUser.status === 'active') {
        setUser(newUser);
      }
      
      return newUser;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    registerUser,
    logout: handleLogout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};