// Supabase-based data persistence for Schedula
import { supabase } from '@/integrations/supabase/client';
import { User, Event, RSVP, Notification, Attendance, UserFilters, EventFilters } from './types';

// Transform functions to match database schema
const transformToProfile = (user: User) => ({
  user_id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  bio: user.bio,
  location: user.location,
  social_links: user.socialLinks || {} as any,
  preferences: user.preferences as any,
});

const transformFromProfile = (profile: any): User => ({
  id: profile.user_id,
  email: profile.email,
  name: profile.name,
  role: profile.role,
  status: profile.status,
  avatar: profile.avatar,
  bio: profile.bio,
  location: profile.location,
  socialLinks: profile.social_links,
  preferences: profile.preferences,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

const transformToEvent = (event: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>) => ({
  title: event.title,
  description: event.description,
  short_description: event.shortDescription,
  organizer_id: event.organizerId,
  start_date: event.startDate,
  end_date: event.endDate,
  location: event.location as any,
  type: event.type,
  category: event.category,
  tags: event.tags,
  pricing: event.pricing as any,
  capacity: event.capacity,
  status: event.status,
  visibility: event.visibility,
  image_url: event.imageUrl,
  requirements: event.requirements,
  agenda: event.agenda as any,
  registration_deadline: event.registrationDeadline,
});

const transformFromEvent = (event: any): Event => ({
  id: event.id,
  title: event.title,
  description: event.description,
  shortDescription: event.short_description,
  organizerId: event.organizer_id,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  type: event.type,
  category: event.category,
  tags: event.tags,
  pricing: event.pricing,
  capacity: event.capacity,
  status: event.status,
  visibility: event.visibility,
  imageUrl: event.image_url,
  requirements: event.requirements,
  agenda: event.agenda,
  registrationDeadline: event.registration_deadline,
  createdAt: event.created_at,
  updatedAt: event.updated_at,
  metrics: event.metrics,
});

const transformToRSVP = (rsvp: Omit<RSVP, 'id' | 'registrationDate'>) => ({
  user_id: rsvp.userId,
  event_id: rsvp.eventId,
  status: rsvp.status,
  confirmed_at: rsvp.confirmedAt,
  qr_code: rsvp.qrCode,
  notes: rsvp.notes,
  checked_in: rsvp.checkedIn,
  checked_in_at: rsvp.checkedInAt,
  checked_in_by: rsvp.checkedInBy,
  checked_in_method: rsvp.checkedInMethod,
  attendance_status: rsvp.attendanceStatus,
});

const transformFromRSVP = (rsvp: any): RSVP => ({
  id: rsvp.id,
  userId: rsvp.user_id,
  eventId: rsvp.event_id,
  status: rsvp.status,
  registrationDate: rsvp.registration_date,
  confirmedAt: rsvp.confirmed_at,
  qrCode: rsvp.qr_code,
  notes: rsvp.notes,
  checkedIn: rsvp.checked_in,
  checkedInAt: rsvp.checked_in_at,
  checkedInBy: rsvp.checked_in_by,
  checkedInMethod: rsvp.checked_in_method,
  attendanceStatus: rsvp.attendance_status,
});

const transformToNotification = (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => ({
  user_id: notification.userId,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  action_url: notification.actionUrl,
  action_text: notification.actionText,
  expires_at: notification.expiresAt,
  metadata: notification.metadata || {} as any,
});

const transformFromNotification = (notification: any): Notification => ({
  id: notification.id,
  userId: notification.user_id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  actionUrl: notification.action_url,
  actionText: notification.action_text,
  read: notification.read,
  createdAt: notification.created_at,
  expiresAt: notification.expires_at,
  metadata: notification.metadata,
});

const transformToAttendance = (attendance: Omit<Attendance, 'id' | 'checkedInAt'>) => ({
  event_id: attendance.eventId,
  user_id: attendance.userId,
  checked_in_by: attendance.checkedInBy,
  method: attendance.method,
  location: attendance.location,
  notes: attendance.notes,
});

const transformFromAttendance = (attendance: any): Attendance => ({
  id: attendance.id,
  eventId: attendance.event_id,
  userId: attendance.user_id,
  checkedInAt: attendance.checked_in_at,
  checkedInBy: attendance.checked_in_by,
  method: attendance.method,
  location: attendance.location,
  notes: attendance.notes,
});

// User Storage
export const userStorage = {
  getAll: async (): Promise<User[]> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    
    return data?.map(transformFromProfile) || [];
  },

  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }
    
    return data ? transformFromProfile(data) : null;
  },

  getByEmail: async (email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
    
    return data ? transformFromProfile(data) : null;
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .insert(transformToProfile({ ...userData, id: '', createdAt: '', updatedAt: '' }))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    
    return data ? transformFromProfile(data) : null;
  },

  update: async (id: string, updates: Partial<User>): Promise<User | null> => {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.role) updateData.role = updates.role;
    if (updates.status) updateData.status = updates.status;
    if (updates.avatar) updateData.avatar = updates.avatar;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.socialLinks) updateData.social_links = updates.socialLinks;
    if (updates.preferences) updateData.preferences = updates.preferences;

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('user_id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user:', error);
      return null;
    }
    
    return data ? transformFromProfile(data) : null;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', id);
    
    if (error) {
      console.error('Error deleting user:', error);
      return false;
    }
    
    return true;
  },

  approve: async (id: string): Promise<User | null> => {
    return userStorage.update(id, { status: 'active' });
  },

  filter: async (filters: UserFilters): Promise<User[]> => {
    let query = supabase.from('profiles').select('*');

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    if (filters.role) {
      query = query.eq('role', filters.role);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error filtering users:', error);
      return [];
    }
    
    return data?.map(transformFromProfile) || [];
  },
};

// Event Storage
export const eventStorage = {
  getAll: async (): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      return [];
    }
    
    return data?.map(transformFromEvent) || [];
  },

  getById: async (id: string): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching event:', error);
      return null;
    }
    
    return data ? transformFromEvent(data) : null;
  },

  getByOrganizer: async (organizerId: string): Promise<Event[]> => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('organizer_id', organizerId)
      .order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events by organizer:', error);
      return [];
    }
    
    return data?.map(transformFromEvent) || [];
  },

  create: async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'metrics'>): Promise<Event | null> => {
    const { data, error } = await supabase
      .from('events')
      .insert(transformToEvent(eventData))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating event:', error);
      return null;
    }
    
    return data ? transformFromEvent(data) : null;
  },

  update: async (id: string, updates: Partial<Event>): Promise<Event | null> => {
    const updateData: any = {};
    
    // Map fields from Event type to database schema
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.shortDescription !== undefined) updateData.short_description = updates.shortDescription;
    if (updates.startDate) updateData.start_date = updates.startDate;
    if (updates.endDate) updateData.end_date = updates.endDate;
    if (updates.location) updateData.location = updates.location;
    if (updates.type) updateData.type = updates.type;
    if (updates.category) updateData.category = updates.category;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.pricing) updateData.pricing = updates.pricing;
    if (updates.capacity) updateData.capacity = updates.capacity;
    if (updates.status) updateData.status = updates.status;
    if (updates.visibility) updateData.visibility = updates.visibility;
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
    if (updates.requirements) updateData.requirements = updates.requirements;
    if (updates.agenda) updateData.agenda = updates.agenda;
    if (updates.registrationDeadline !== undefined) updateData.registration_deadline = updates.registrationDeadline;
    if (updates.metrics) updateData.metrics = updates.metrics;

    const { data, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating event:', error);
      return null;
    }
    
    return data ? transformFromEvent(data) : null;
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting event:', error);
      return false;
    }
    
    return true;
  },

  filter: async (filters: EventFilters): Promise<Event[]> => {
    let query = supabase.from('events').select('*');

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.organizerId) {
      query = query.eq('organizer_id', filters.organizerId);
    }

    if (filters.dateFrom) {
      query = query.gte('start_date', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('start_date', filters.dateTo);
    }

    const { data, error } = await query.order('start_date', { ascending: true });
    
    if (error) {
      console.error('Error filtering events:', error);
      return [];
    }
    
    return data?.map(transformFromEvent) || [];
  },

  incrementViewCount: async (id: string): Promise<void> => {
    const event = await eventStorage.getById(id);
    if (event && event.metrics) {
      const updatedMetrics = {
        ...event.metrics,
        viewCount: event.metrics.viewCount + 1,
      };
      await eventStorage.update(id, { metrics: updatedMetrics });
    }
  },
};

// RSVP Storage
export const rsvpStorage = {
  getAll: async (): Promise<RSVP[]> => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .order('registration_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching RSVPs:', error);
      return [];
    }
    
    return data?.map(transformFromRSVP) || [];
  },

  getById: async (id: string): Promise<RSVP | null> => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching RSVP:', error);
      return null;
    }
    
    return data ? transformFromRSVP(data) : null;
  },

  getByUser: async (userId: string): Promise<RSVP[]> => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', userId)
      .order('registration_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching RSVPs by user:', error);
      return [];
    }
    
    return data?.map(transformFromRSVP) || [];
  },

  getByEvent: async (eventId: string): Promise<RSVP[]> => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false });
    
    if (error) {
      console.error('Error fetching RSVPs by event:', error);
      return [];
    }
    
    return data?.map(transformFromRSVP) || [];
  },

  getByUserAndEvent: async (userId: string, eventId: string): Promise<RSVP | null> => {
    const { data, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();
    
    if (error) {
      console.error('Error fetching RSVP by user and event:', error);
      return null;
    }
    
    return data ? transformFromRSVP(data) : null;
  },

  create: async (rsvpData: Omit<RSVP, 'id' | 'registrationDate'>): Promise<RSVP | null> => {
    const { data, error } = await supabase
      .from('rsvps')
      .insert(transformToRSVP(rsvpData))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating RSVP:', error);
      return null;
    }
    
    const newRSVP = data ? transformFromRSVP(data) : null;
    
    // Update event metrics
    if (newRSVP) {
      const eventRSVPs = await rsvpStorage.getByEvent(rsvpData.eventId);
      const event = await eventStorage.getById(rsvpData.eventId);
      
      if (event && event.metrics) {
        const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
        const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
        
        await eventStorage.update(rsvpData.eventId, {
          metrics: {
            ...event.metrics,
            totalRSVPs: eventRSVPs.length,
            confirmedRSVPs: confirmedCount,
            waitlistCount: waitlistCount,
          },
        });
      }
    }
    
    return newRSVP;
  },

  update: async (id: string, updates: Partial<RSVP>): Promise<RSVP | null> => {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.confirmedAt) updateData.confirmed_at = updates.confirmedAt;
    if (updates.qrCode !== undefined) updateData.qr_code = updates.qrCode;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.checkedIn !== undefined) updateData.checked_in = updates.checkedIn;
    if (updates.checkedInAt) updateData.checked_in_at = updates.checkedInAt;
    if (updates.checkedInBy) updateData.checked_in_by = updates.checkedInBy;
    if (updates.checkedInMethod) updateData.checked_in_method = updates.checkedInMethod;
    if (updates.attendanceStatus) updateData.attendance_status = updates.attendanceStatus;

    const { data, error } = await supabase
      .from('rsvps')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating RSVP:', error);
      return null;
    }
    
    const updatedRSVP = data ? transformFromRSVP(data) : null;
    
    // Update event metrics
    if (updatedRSVP) {
      const eventRSVPs = await rsvpStorage.getByEvent(updatedRSVP.eventId);
      const event = await eventStorage.getById(updatedRSVP.eventId);
      
      if (event && event.metrics) {
        const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
        const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
        
        await eventStorage.update(updatedRSVP.eventId, {
          metrics: {
            ...event.metrics,
            totalRSVPs: eventRSVPs.length,
            confirmedRSVPs: confirmedCount,
            waitlistCount: waitlistCount,
          },
        });
      }
    }
    
    return updatedRSVP;
  },

  delete: async (id: string): Promise<boolean> => {
    const rsvp = await rsvpStorage.getById(id);
    
    const { error } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting RSVP:', error);
      return false;
    }
    
    // Update event metrics
    if (rsvp) {
      const eventRSVPs = await rsvpStorage.getByEvent(rsvp.eventId);
      const event = await eventStorage.getById(rsvp.eventId);
      
      if (event && event.metrics) {
        const confirmedCount = eventRSVPs.filter(r => r.status === 'confirmed').length;
        const waitlistCount = eventRSVPs.filter(r => r.status === 'waitlisted').length;
        
        await eventStorage.update(rsvp.eventId, {
          metrics: {
            ...event.metrics,
            totalRSVPs: eventRSVPs.length,
            confirmedRSVPs: confirmedCount,
            waitlistCount: waitlistCount,
          },
        });
      }
    }
    
    return true;
  },

  promoteFromWaitlist: async (eventId: string): Promise<RSVP | null> => {
    const rsvps = await rsvpStorage.getByEvent(eventId);
    const waitlistedRSVP = rsvps
      .filter(rsvp => rsvp.status === 'waitlisted')
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

  getEventStats: async (eventId: string) => {
    const rsvps = await rsvpStorage.getByEvent(eventId);
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
  getAll: async (): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data?.map(transformFromNotification) || [];
  },

  getByUser: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications by user:', error);
      return [];
    }
    
    return data?.map(transformFromNotification) || [];
  },

  create: async (notificationData: Omit<Notification, 'id' | 'createdAt' | 'read'>): Promise<Notification | null> => {
    const { data, error } = await supabase
      .from('notifications')
      .insert(transformToNotification(notificationData))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    return data ? transformFromNotification(data) : null;
  },

  markAsRead: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
    
    return true;
  },

  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  delete: async (id: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
    
    return true;
  },

  getUnreadCount: async (userId: string): Promise<number> => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
    
    return count || 0;
  },
};

// Attendance Storage
export const attendanceStorage = {
  getAll: async (): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('checked_in_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
    
    return data?.map(transformFromAttendance) || [];
  },

  create: async (attendanceData: Omit<Attendance, 'id' | 'checkedInAt'>): Promise<Attendance | null> => {
    const { data, error } = await supabase
      .from('attendance')
      .insert(transformToAttendance(attendanceData))
      .select()
      .single();
    
    if (error) {
      console.error('Error creating attendance:', error);
      return null;
    }
    
    const newAttendance = data ? transformFromAttendance(data) : null;
    
    // Update RSVP check-in status
    if (newAttendance) {
      const rsvp = await rsvpStorage.getByUserAndEvent(attendanceData.userId, attendanceData.eventId);
      if (rsvp) {
        await rsvpStorage.update(rsvp.id, {
          checkedIn: true,
          checkedInAt: newAttendance.checkedInAt,
          checkedInBy: attendanceData.checkedInBy,
          checkedInMethod: attendanceData.method,
          attendanceStatus: 'checked_in'
        });
      }

      // Update event attendance metrics
      const event = await eventStorage.getById(attendanceData.eventId);
      if (event && event.metrics) {
        const eventAttendances = await attendanceStorage.getByEventId(attendanceData.eventId);
        await eventStorage.update(attendanceData.eventId, {
          metrics: {
            ...event.metrics,
            attendanceCount: eventAttendances.length,
          },
        });
      }
    }
    
    return newAttendance;
  },

  getByEventId: async (eventId: string): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('event_id', eventId)
      .order('checked_in_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance by event:', error);
      return [];
    }
    
    return data?.map(transformFromAttendance) || [];
  },

  getByUserId: async (userId: string): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('checked_in_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance by user:', error);
      return [];
    }
    
    return data?.map(transformFromAttendance) || [];
  },

  getAttendanceStats: async (eventId: string) => {
    const attendances = await attendanceStorage.getByEventId(eventId);
    const rsvps = await rsvpStorage.getByEvent(eventId);
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

  isUserCheckedIn: async (userId: string, eventId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', eventId)
      .single();
    
    if (error) {
      return false;
    }
    
    return !!data;
  },
};

// Current user management (using Supabase auth)
export const currentUserStorage = {
  get: async (): Promise<User | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    // Get profile data
    const profile = await userStorage.getById(user.id);
    return profile;
  },

  set: async (user: User): Promise<void> => {
    // This is handled automatically by Supabase auth
    // Profile data is stored in the profiles table
  },

  clear: async (): Promise<void> => {
    await supabase.auth.signOut();
  },
};