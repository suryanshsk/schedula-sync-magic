// Local storage-based data persistence for Schedula demo
import { User, Event, RSVP, Notification, Attendance, UserFilters, EventFilters } from './types';

// Storage keys
const STORAGE_KEYS = {
  USERS: 'schedula_users',
  EVENTS: 'schedula_events',
  RSVPS: 'schedula_rsvps',
  NOTIFICATIONS: 'schedula_notifications',
  ATTENDANCE: 'schedula_attendance',
  CURRENT_USER: 'schedula_current_user',
} as const;

// Helper functions
const getStorageData = <T>(key: string, defaultValue: T[] = []): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key ${key}:`, error);
    return defaultValue;
  }
};

const setStorageData = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing to localStorage key ${key}:`, error);
  }
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// User Storage
export const userStorage = {
  getAll: (): User[] => getStorageData<User>(STORAGE_KEYS.USERS, []),

  getById: (id: string): User | null => {
    const users = userStorage.getAll();
    return users.find(user => user.id === id) || null;
  },

  getByEmail: (email: string): User | null => {
    const users = userStorage.getAll();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const users = userStorage.getAll();
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    users.push(newUser);
    setStorageData(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | null => {
    const users = userStorage.getAll();
    const index = users.findIndex(user => user.id === id);
    if (index === -1) return null;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStorageData(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = userStorage.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    if (filteredUsers.length === users.length) return false;
    setStorageData(STORAGE_KEYS.USERS, filteredUsers);
    return true;
  },

  approve: (id: string): User | null => {
    return userStorage.update(id, { status: 'active' });
  },

  filter: (filters: UserFilters): User[] => {
    let users = userStorage.getAll();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(user => 
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    if (filters.role) {
      users = users.filter(user => user.role === filters.role);
    }

    if (filters.status) {
      users = users.filter(user => user.status === filters.status);
    }

    return users;
  },
};

// Event Storage
export const eventStorage = {
  getAll: (): Event[] => getStorageData<Event>(STORAGE_KEYS.EVENTS, []),

  getById: (id: string): Event | null => {
    const events = eventStorage.getAll();
    return events.find(event => event.id === id) || null;
  },

  getByOrganizer: (organizerId: string): Event[] => {
    const events = eventStorage.getAll();
    return events.filter(event => event.organizerId === organizerId);
  },

  create: (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Event => {
    const events = eventStorage.getAll();
    const newEvent: Event = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metrics: {
        totalRSVPs: 0,
        confirmedRSVPs: 0,
        waitlistCount: 0,
        attendanceCount: 0,
        viewCount: 0,
        shareCount: 0,
      },
    };
    events.push(newEvent);
    setStorageData(STORAGE_KEYS.EVENTS, events);
    return newEvent;
  },

  update: (id: string, updates: Partial<Event>): Event | null => {
    const events = eventStorage.getAll();
    const index = events.findIndex(event => event.id === id);
    if (index === -1) return null;

    events[index] = {
      ...events[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    setStorageData(STORAGE_KEYS.EVENTS, events);
    return events[index];
  },

  delete: (id: string): boolean => {
    const events = eventStorage.getAll();
    const filteredEvents = events.filter(event => event.id !== id);
    if (filteredEvents.length === events.length) return false;
    setStorageData(STORAGE_KEYS.EVENTS, filteredEvents);
    return true;
  },

  filter: (filters: EventFilters): Event[] => {
    let events = eventStorage.getAll();

    if (filters.search) {
      const search = filters.search.toLowerCase();
      events = events.filter(event => 
        event.title.toLowerCase().includes(search) ||
        event.description.toLowerCase().includes(search) ||
        event.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    if (filters.type) {
      events = events.filter(event => event.type === filters.type);
    }

    if (filters.category) {
      events = events.filter(event => event.category === filters.category);
    }

    if (filters.status) {
      events = events.filter(event => event.status === filters.status);
    }

    if (filters.organizerId) {
      events = events.filter(event => event.organizerId === filters.organizerId);
    }

    if (filters.dateFrom) {
      events = events.filter(event => event.startDate >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      events = events.filter(event => event.startDate <= filters.dateTo!);
    }

    return events;
  },

  incrementViewCount: (id: string): void => {
    const events = eventStorage.getAll();
    const index = events.findIndex(event => event.id === id);
    if (index !== -1 && events[index].metrics) {
      events[index].metrics!.viewCount += 1;
      setStorageData(STORAGE_KEYS.EVENTS, events);
    }
  },
};

// RSVP Storage
export const rsvpStorage = {
  getAll: (): RSVP[] => getStorageData<RSVP>(STORAGE_KEYS.RSVPS, []),

  getById: (id: string): RSVP | null => {
    const rsvps = rsvpStorage.getAll();
    return rsvps.find(rsvp => rsvp.id === id) || null;
  },

  getByUser: (userId: string): RSVP[] => {
    const rsvps = rsvpStorage.getAll();
    return rsvps.filter(rsvp => rsvp.userId === userId);
  },

  getByEvent: (eventId: string): RSVP[] => {
    const rsvps = rsvpStorage.getAll();
    return rsvps.filter(rsvp => rsvp.eventId === eventId);
  },

  getByUserAndEvent: (userId: string, eventId: string): RSVP | null => {
    const rsvps = rsvpStorage.getAll();
    return rsvps.find(rsvp => rsvp.userId === userId && rsvp.eventId === eventId) || null;
  },

  create: (rsvpData: Omit<RSVP, 'id' | 'registrationDate'>): RSVP => {
    const rsvps = rsvpStorage.getAll();
    const newRSVP: RSVP = {
      ...rsvpData,
      id: generateId(),
      registrationDate: new Date().toISOString(),
      checkedIn: false,
      attendanceStatus: 'not_checked_in',
      // Set confirmedAt only if status is confirmed
      ...(rsvpData.status === 'confirmed' && { confirmedAt: new Date().toISOString() })
    };
    rsvps.push(newRSVP);
    setStorageData(STORAGE_KEYS.RSVPS, rsvps);

    // Update event metrics
    const event = eventStorage.getById(rsvpData.eventId);
    if (event && event.metrics) {
      const eventRSVPs = rsvpStorage.getByEvent(rsvpData.eventId);
      const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
      const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
      
      eventStorage.update(rsvpData.eventId, {
        metrics: {
          ...event.metrics,
          totalRSVPs: eventRSVPs.length,
          confirmedRSVPs: confirmedCount,
          waitlistCount: waitlistCount,
        },
      });
    }

    return newRSVP;
  },

  update: (id: string, updates: Partial<RSVP>): RSVP | null => {
    const rsvps = rsvpStorage.getAll();
    const index = rsvps.findIndex(rsvp => rsvp.id === id);
    if (index === -1) return null;

    rsvps[index] = { ...rsvps[index], ...updates };
    setStorageData(STORAGE_KEYS.RSVPS, rsvps);

    // Update event metrics
    const eventId = rsvps[index].eventId;
    const event = eventStorage.getById(eventId);
    if (event && event.metrics) {
      const eventRSVPs = rsvpStorage.getByEvent(eventId);
      const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
      const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
      
      eventStorage.update(eventId, {
        metrics: {
          ...event.metrics,
          totalRSVPs: eventRSVPs.length,
          confirmedRSVPs: confirmedCount,
          waitlistCount: waitlistCount,
        },
      });
    }

    return rsvps[index];
  },

  delete: (id: string): boolean => {
    const rsvps = rsvpStorage.getAll();
    const rsvp = rsvps.find(r => r.id === id);
    if (!rsvp) return false;

    const filteredRSVPs = rsvps.filter(rsvp => rsvp.id !== id);
    setStorageData(STORAGE_KEYS.RSVPS, filteredRSVPs);

    // Update event metrics
    const event = eventStorage.getById(rsvp.eventId);
    if (event && event.metrics) {
      const eventRSVPs = rsvpStorage.getByEvent(rsvp.eventId);
      const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
      const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
      
      eventStorage.update(rsvp.eventId, {
        metrics: {
          ...event.metrics,
          totalRSVPs: eventRSVPs.length,
          confirmedRSVPs: confirmedCount,
          waitlistCount: waitlistCount,
        },
      });
    }

    return true;
  },

  promoteFromWaitlist: (eventId: string): RSVP | null => {
    const rsvps = rsvpStorage.getAll();
    const waitlistedRSVP = rsvps
      .filter(rsvp => rsvp.eventId === eventId && rsvp.status === 'waitlisted')
      .sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime())[0];

    if (waitlistedRSVP) {
      return rsvpStorage.update(waitlistedRSVP.id, { 
        status: 'confirmed',
        confirmedAt: new Date().toISOString(),
        attendanceStatus: 'not_checked_in'
      });
    }

    return null;
  },

  getEventStats: (eventId: string) => {
    const rsvps = rsvpStorage.getByEvent(eventId);
    return {
      total: rsvps.length,
      confirmed: rsvps.filter(r => r.status === 'confirmed').length,
      waitlisted: rsvps.filter(r => r.status === 'waitlisted').length,
      cancelled: rsvps.filter(r => r.status === 'cancelled').length,
      checkedIn: rsvps.filter(r => r.checkedIn).length,
    };
  },
};

// Notification Storage
export const notificationStorage = {
  getAll: (): Notification[] => getStorageData<Notification>(STORAGE_KEYS.NOTIFICATIONS, []),

  getByUser: (userId: string): Notification[] => {
    const notifications = notificationStorage.getAll();
    return notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  create: (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Notification => {
    const notifications = notificationStorage.getAll();
    const newNotification: Notification = {
      ...notificationData,
      id: generateId(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    notifications.push(newNotification);
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  markAsRead: (id: string): boolean => {
    const notifications = notificationStorage.getAll();
    const index = notifications.findIndex(notification => notification.id === id);
    if (index === -1) return false;

    notifications[index].read = true;
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return true;
  },

  markAllAsRead: (userId: string): void => {
    const notifications = notificationStorage.getAll();
    const updated = notifications.map(notification => 
      notification.userId === userId ? { ...notification, read: true } : notification
    );
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  delete: (id: string): boolean => {
    const notifications = notificationStorage.getAll();
    const filteredNotifications = notifications.filter(notification => notification.id !== id);
    if (filteredNotifications.length === notifications.length) return false;
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, filteredNotifications);
    return true;
  },

  getUnreadCount: (userId: string): number => {
    const notifications = notificationStorage.getByUser(userId);
    return notifications.filter(notification => !notification.read).length;
  },
};

// Attendance Storage
export const attendanceStorage = {
  getAll: (): Attendance[] => getStorageData<Attendance>(STORAGE_KEYS.ATTENDANCE, []),

  create: (attendanceData: Omit<Attendance, 'id' | 'checkedInAt'>): Attendance => {
    const attendances = attendanceStorage.getAll();
    const newAttendance: Attendance = {
      ...attendanceData,
      id: generateId(),
      checkedInAt: new Date().toISOString(),
    };
    attendances.push(newAttendance);
    setStorageData(STORAGE_KEYS.ATTENDANCE, attendances);

    // Update RSVP check-in status
    const rsvp = rsvpStorage.getByUserAndEvent(attendanceData.userId, attendanceData.eventId);
    if (rsvp) {
      rsvpStorage.update(rsvp.id, {
        checkedIn: true,
        checkedInAt: newAttendance.checkedInAt,
        checkedInBy: attendanceData.checkedInBy,
        checkedInMethod: attendanceData.method,
        attendanceStatus: 'checked_in'
      });
    }

    // Update event attendance metrics
    const event = eventStorage.getById(attendanceData.eventId);
    if (event && event.metrics) {
      const eventAttendances = attendanceStorage.getByEventId(attendanceData.eventId);
      eventStorage.update(attendanceData.eventId, {
        metrics: {
          ...event.metrics,
          attendanceCount: eventAttendances.length,
        },
      });
    }

    return newAttendance;
  },

  getByEventId: (eventId: string): Attendance[] => {
    const attendances = attendanceStorage.getAll();
    return attendances.filter(attendance => attendance.eventId === eventId);
  },

  getByUserId: (userId: string): Attendance[] => {
    const attendances = attendanceStorage.getAll();
    return attendances.filter(attendance => attendance.userId === userId);
  },

  getAttendanceStats: (eventId: string) => {
    const attendances = attendanceStorage.getByEventId(eventId);
    const rsvps = rsvpStorage.getByEvent(eventId);
    const confirmedRSVPs = rsvps.filter(r => r.status === 'confirmed');

    return {
      totalAttendees: attendances.length,
      attendanceRate: confirmedRSVPs.length > 0 ? (attendances.length / confirmedRSVPs.length) * 100 : 0,
      checkedInByMethod: {
        qr: attendances.filter(a => a.method === 'qr').length,
        manual: attendances.filter(a => a.method === 'manual').length,
        self: attendances.filter(a => a.method === 'self').length,
      },
    };
  },

  isUserCheckedIn: (userId: string, eventId: string): boolean => {
    const attendances = attendanceStorage.getAll();
    return attendances.some(attendance => 
      attendance.userId === userId && attendance.eventId === eventId
    );
  },
};

// Current user management
export const currentUserStorage = {
  get: (): User | null => {
    try {
      const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error reading current user from localStorage:', error);
      return null;
    }
  },

  set: (user: User): void => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error writing current user to localStorage:', error);
    }
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};