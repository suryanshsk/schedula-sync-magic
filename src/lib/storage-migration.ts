// Migration utility to help transition from localStorage to Supabase
// This provides a synchronous wrapper for existing code during migration

import { userStorage as supabaseUserStorage, eventStorage as supabaseEventStorage, rsvpStorage as supabaseRSVPStorage, notificationStorage as supabaseNotificationStorage, attendanceStorage as supabaseAttendanceStorage, currentUserStorage as supabaseCurrentUserStorage } from './supabase-storage';
import { userStorage as localUserStorage, eventStorage as localEventStorage, rsvpStorage as localRSVPStorage, notificationStorage as localNotificationStorage, attendanceStorage as localAttendanceStorage, currentUserStorage as localCurrentUserStorage } from './storage';

// Flag to control which storage to use
const USE_SUPABASE = false; // Set to true after authentication is implemented

// User Storage Wrapper
export const userStorage = {
  getAll: () => USE_SUPABASE ? supabaseUserStorage.getAll() : localUserStorage.getAll(),
  getById: (id: string) => USE_SUPABASE ? supabaseUserStorage.getById(id) : localUserStorage.getById(id),
  getByEmail: (email: string) => USE_SUPABASE ? supabaseUserStorage.getByEmail(email) : localUserStorage.getByEmail(email),
  create: (userData: any) => USE_SUPABASE ? supabaseUserStorage.create(userData) : localUserStorage.create(userData),
  update: (id: string, updates: any) => USE_SUPABASE ? supabaseUserStorage.update(id, updates) : localUserStorage.update(id, updates),
  delete: (id: string) => USE_SUPABASE ? supabaseUserStorage.delete(id) : localUserStorage.delete(id),
  approve: (id: string) => USE_SUPABASE ? supabaseUserStorage.approve(id) : localUserStorage.approve(id),
  filter: (filters: any) => USE_SUPABASE ? supabaseUserStorage.filter(filters) : localUserStorage.filter(filters),
};

// Event Storage Wrapper
export const eventStorage = {
  getAll: () => USE_SUPABASE ? supabaseEventStorage.getAll() : localEventStorage.getAll(),
  getById: (id: string) => USE_SUPABASE ? supabaseEventStorage.getById(id) : localEventStorage.getById(id),
  getByOrganizer: (organizerId: string) => USE_SUPABASE ? supabaseEventStorage.getByOrganizer(organizerId) : localEventStorage.getByOrganizer(organizerId),
  create: (eventData: any) => USE_SUPABASE ? supabaseEventStorage.create(eventData) : localEventStorage.create(eventData),
  update: (id: string, updates: any) => USE_SUPABASE ? supabaseEventStorage.update(id, updates) : localEventStorage.update(id, updates),
  delete: (id: string) => USE_SUPABASE ? supabaseEventStorage.delete(id) : localEventStorage.delete(id),
  filter: (filters: any) => USE_SUPABASE ? supabaseEventStorage.filter(filters) : localEventStorage.filter(filters),
  incrementViewCount: (id: string) => USE_SUPABASE ? supabaseEventStorage.incrementViewCount(id) : localEventStorage.incrementViewCount(id),
};

// RSVP Storage Wrapper
export const rsvpStorage = {
  getAll: () => USE_SUPABASE ? supabaseRSVPStorage.getAll() : localRSVPStorage.getAll(),
  getById: (id: string) => USE_SUPABASE ? supabaseRSVPStorage.getById(id) : localRSVPStorage.getById(id),
  getByUser: (userId: string) => USE_SUPABASE ? supabaseRSVPStorage.getByUser(userId) : localRSVPStorage.getByUser(userId),
  getByEvent: (eventId: string) => USE_SUPABASE ? supabaseRSVPStorage.getByEvent(eventId) : localRSVPStorage.getByEvent(eventId),
  getByUserAndEvent: (userId: string, eventId: string) => USE_SUPABASE ? supabaseRSVPStorage.getByUserAndEvent(userId, eventId) : localRSVPStorage.getByUserAndEvent(userId, eventId),
  create: (rsvpData: any) => USE_SUPABASE ? supabaseRSVPStorage.create(rsvpData) : localRSVPStorage.create(rsvpData),
  update: (id: string, updates: any) => USE_SUPABASE ? supabaseRSVPStorage.update(id, updates) : localRSVPStorage.update(id, updates),
  delete: (id: string) => USE_SUPABASE ? supabaseRSVPStorage.delete(id) : localRSVPStorage.delete(id),
  promoteFromWaitlist: (eventId: string) => USE_SUPABASE ? supabaseRSVPStorage.promoteFromWaitlist(eventId) : localRSVPStorage.promoteFromWaitlist(eventId),
  getEventStats: (eventId: string) => USE_SUPABASE ? supabaseRSVPStorage.getEventStats(eventId) : localRSVPStorage.getEventStats(eventId),
};

// Notification Storage Wrapper
export const notificationStorage = {
  getAll: () => USE_SUPABASE ? supabaseNotificationStorage.getAll() : localNotificationStorage.getAll(),
  getByUser: (userId: string) => USE_SUPABASE ? supabaseNotificationStorage.getByUser(userId) : localNotificationStorage.getByUser(userId),
  create: (notificationData: any) => USE_SUPABASE ? supabaseNotificationStorage.create(notificationData) : localNotificationStorage.create(notificationData),
  markAsRead: (id: string) => USE_SUPABASE ? supabaseNotificationStorage.markAsRead(id) : localNotificationStorage.markAsRead(id),
  markAllAsRead: (userId: string) => USE_SUPABASE ? supabaseNotificationStorage.markAllAsRead(userId) : localNotificationStorage.markAllAsRead(userId),
  delete: (id: string) => USE_SUPABASE ? supabaseNotificationStorage.delete(id) : localNotificationStorage.delete(id),
  getUnreadCount: (userId: string) => USE_SUPABASE ? supabaseNotificationStorage.getUnreadCount(userId) : localNotificationStorage.getUnreadCount(userId),
};

// Attendance Storage Wrapper
export const attendanceStorage = {
  getAll: () => USE_SUPABASE ? supabaseAttendanceStorage.getAll() : localAttendanceStorage.getAll(),
  create: (attendanceData: any) => USE_SUPABASE ? supabaseAttendanceStorage.create(attendanceData) : localAttendanceStorage.create(attendanceData),
  getByEventId: (eventId: string) => USE_SUPABASE ? supabaseAttendanceStorage.getByEventId(eventId) : localAttendanceStorage.getByEventId(eventId),
  getByUserId: (userId: string) => USE_SUPABASE ? supabaseAttendanceStorage.getByUserId(userId) : localAttendanceStorage.getByUserId(userId),
  getAttendanceStats: (eventId: string) => USE_SUPABASE ? supabaseAttendanceStorage.getAttendanceStats(eventId) : localAttendanceStorage.getAttendanceStats(eventId),
  isUserCheckedIn: (userId: string, eventId: string) => USE_SUPABASE ? supabaseAttendanceStorage.isUserCheckedIn(userId, eventId) : localAttendanceStorage.isUserCheckedIn(userId, eventId),
};

// Current User Storage Wrapper
export const currentUserStorage = {
  get: () => USE_SUPABASE ? supabaseCurrentUserStorage.get() : localCurrentUserStorage.get(),
  set: (user: any) => USE_SUPABASE ? supabaseCurrentUserStorage.set(user) : localCurrentUserStorage.set(user),
  clear: () => USE_SUPABASE ? supabaseCurrentUserStorage.clear() : localCurrentUserStorage.clear(),
};