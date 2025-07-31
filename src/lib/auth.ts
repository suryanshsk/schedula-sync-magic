// Authentication logic for Schedula
import { User, LoginForm, RegisterForm } from './types';
import { userStorage, currentUserStorage, notificationStorage } from './storage';

// Mock authentication functions for demo purposes
export const authenticate = async (email: string, password: string): Promise<User | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = userStorage.getByEmail(email);
    
    if (!user) {
      throw new Error('User not found');
    }

    // In a real app, you would verify the password hash
    // For demo purposes, we'll just check if password is not empty
    if (!password) {
      throw new Error('Invalid password');
    }

    if (user.status === 'suspended') {
      throw new Error('Account suspended. Please contact support.');
    }

    if (user.status === 'pending' && user.role === 'organizer') {
      throw new Error('Account pending approval. An admin will review your organizer application.');
    }

    // Update last login
    const updatedUser = userStorage.update(user.id, {
      updatedAt: new Date().toISOString(),
    });

    if (updatedUser) {
      currentUserStorage.set(updatedUser);
      return updatedUser;
    }

    return null;
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const register = async (
  email: string, 
  password: string, 
  name: string, 
  role: 'user' | 'organizer'
): Promise<User> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if user already exists
    const existingUser = userStorage.getByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Validate inputs
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Create new user
    const newUser = userStorage.create({
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role,
      status: role === 'organizer' ? 'pending' : 'active', // Organizers need approval
      preferences: {
        emailNotifications: true,
        pushNotifications: true,
        eventReminders: true,
        marketingEmails: false,
        theme: 'system',
        language: 'en',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    });

    // Create welcome notification
    notificationStorage.create({
      userId: newUser.id,
      type: 'success',
      title: 'Welcome to Schedula!',
      message: role === 'organizer' 
        ? 'Your organizer account has been created and is pending approval. You\'ll be notified once approved.'
        : 'Your account has been created successfully. Start exploring events!',
    });

    // If user (not organizer), set as current user
    if (role === 'user') {
      currentUserStorage.set(newUser);
    }

    return newUser;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const logout = (): void => {
  currentUserStorage.clear();
};

export const getCurrentUser = (): User | null => {
  return currentUserStorage.get();
};

export const updateCurrentUser = (updates: Partial<User>): User | null => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const updatedUser = userStorage.update(currentUser.id, updates);
  if (updatedUser) {
    currentUserStorage.set(updatedUser);
  }
  
  return updatedUser;
};

export const changePassword = async (
  currentPassword: string, 
  newPassword: string
): Promise<boolean> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // In a real app, you would verify the current password
    if (!currentPassword) {
      throw new Error('Current password is required');
    }

    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }

    // In a real app, you would hash the new password and update it
    // For demo purposes, we'll just update the updatedAt timestamp
    const updatedUser = userStorage.update(currentUser.id, {
      updatedAt: new Date().toISOString(),
    });

    if (updatedUser) {
      currentUserStorage.set(updatedUser);
      
      // Create notification
      notificationStorage.create({
        userId: currentUser.id,
        type: 'success',
        title: 'Password Changed',
        message: 'Your password has been successfully updated.',
      });

      return true;
    }

    return false;
  } catch (error) {
    console.error('Password change error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string): Promise<boolean> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = userStorage.getByEmail(email);
    if (!user) {
      // Don't reveal if user exists for security
      return true;
    }

    // In a real app, you would send a password reset email
    // For demo purposes, we'll just create a notification
    notificationStorage.create({
      userId: user.id,
      type: 'info',
      title: 'Password Reset Requested',
      message: 'A password reset link has been sent to your email address.',
    });

    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const deleteAccount = async (password: string): Promise<boolean> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('Not authenticated');
    }

    // In a real app, you would verify the password
    if (!password) {
      throw new Error('Password is required to delete account');
    }

    // Delete user data
    userStorage.delete(currentUser.id);
    currentUserStorage.clear();

    return true;
  } catch (error) {
    console.error('Account deletion error:', error);
    throw error;
  }
};

// Role and permission checks
export const hasRole = (user: User | null, roles: User['role'][]): boolean => {
  if (!user) return false;
  return roles.includes(user.role);
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, ['admin']);
};

export const isOrganizer = (user: User | null): boolean => {
  return hasRole(user, ['organizer', 'admin']);
};

export const isUser = (user: User | null): boolean => {
  return hasRole(user, ['user', 'organizer', 'admin']);
};

export const canCreateEvent = (user: User | null): boolean => {
  return user ? hasRole(user, ['organizer', 'admin']) && user.status === 'active' : false;
};

export const canManageUsers = (user: User | null): boolean => {
  return hasRole(user, ['admin']);
};

export const canApproveOrganizers = (user: User | null): boolean => {
  return hasRole(user, ['admin']);
};

// Check if user can access specific resource
export const canAccessEvent = (user: User | null, event: any): boolean => {
  if (!user || !event) return false;
  
  // Admins can access all events
  if (isAdmin(user)) return true;
  
  // Organizers can access their own events
  if (isOrganizer(user) && event.organizerId === user.id) return true;
  
  // Users can access published public events
  if (event.status === 'published' && event.visibility === 'public') return true;
  
  return false;
};

export const canEditEvent = (user: User | null, event: any): boolean => {
  if (!user || !event) return false;
  
  // Admins can edit all events
  if (isAdmin(user)) return true;
  
  // Organizers can edit their own events
  if (isOrganizer(user) && event.organizerId === user.id) return true;
  
  return false;
};