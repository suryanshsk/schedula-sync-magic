// Core types for Schedula Event Management Platform

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'organizer' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  avatar?: string;
  bio?: string;
  location?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  shortDescription: string;
  organizerId: string;
  organizer?: User;
  startDate: string;
  endDate: string;
  location: {
    type: 'in-person' | 'online' | 'hybrid';
    venue?: string;
    address?: string;
    city?: string;
    country?: string;
    coordinates?: { lat: number; lng: number };
    onlineUrl?: string;
  };
  type: 'conference' | 'workshop' | 'networking' | 'social' | 'online';
  category: string;
  tags: string[];
  pricing: {
    type: 'free' | 'paid';
    amount?: number;
    currency?: string;
  };
  capacity: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'private' | 'unlisted';
  imageUrl?: string;
  requirements?: string[];
  agenda?: EventAgendaItem[];
  registrationDeadline?: string;
  createdAt: string;
  updatedAt: string;
  metrics?: EventMetrics;
}

export interface EventAgendaItem {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  speaker?: string;
  location?: string;
}

export interface EventMetrics {
  totalRSVPs: number;
  confirmedRSVPs: number;
  waitlistCount: number;
  attendanceCount: number;
  viewCount: number;
  shareCount: number;
}

export interface RSVP {
  id: string;
  userId: string;
  user?: User;
  eventId: string;
  event?: Event;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  registrationDate: string;
  qrCode?: string;
  notes?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  checkedInBy?: string;
  checkedInMethod?: 'qr' | 'manual' | 'self';
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface Attendance {
  id: string;
  eventId: string;
  userId: string;
  checkedInAt: string;
  checkedInBy: string;
  method: 'qr' | 'manual' | 'self';
  location?: string;
  notes?: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'organizer';
  agreedToTerms: boolean;
}

export interface EventForm {
  title: string;
  description: string;
  shortDescription: string;
  startDate: string;
  endDate: string;
  locationType: 'in-person' | 'online' | 'hybrid';
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  onlineUrl?: string;
  type: 'conference' | 'workshop' | 'networking' | 'social' | 'online';
  category: string;
  tags: string[];
  pricingType: 'free' | 'paid';
  amount?: number;
  currency?: string;
  capacity: number;
  visibility: 'public' | 'private' | 'unlisted';
  requirements?: string[];
  registrationDeadline?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter and search types
export interface EventFilters {
  search?: string;
  type?: string;
  category?: string;
  location?: string;
  dateFrom?: string;
  dateTo?: string;
  priceFrom?: number;
  priceTo?: number;
  tags?: string[];
  organizerId?: string;
  status?: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

// Dashboard analytics types
export interface DashboardStats {
  totalEvents: number;
  totalUsers: number;
  totalRSVPs: number;
  totalRevenue: number;
  eventsThisMonth: number;
  usersThisMonth: number;
  rsvpsThisMonth: number;
  revenueThisMonth: number;
  popularEvents: Event[];
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'event_created' | 'rsvp_confirmed' | 'user_registered' | 'event_cancelled';
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  eventId?: string;
  metadata?: Record<string, any>;
}

// QR Code types
export interface QRData {
  eventId: string;
  userId: string;
  rsvpId: string;
  timestamp: number;
  signature?: string;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireAuth?: boolean;
}