-- Create Users table (profiles for auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'organizer', 'admin')) DEFAULT 'user',
  status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'suspended')) DEFAULT 'pending',
  avatar TEXT,
  bio TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}',
  preferences JSONB NOT NULL DEFAULT '{
    "emailNotifications": true,
    "pushNotifications": true,
    "eventReminders": true,
    "marketingEmails": false,
    "theme": "system",
    "language": "en",
    "timezone": "UTC"
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  organizer_id UUID NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  location JSONB NOT NULL DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('conference', 'workshop', 'networking', 'social', 'online')),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  pricing JSONB NOT NULL DEFAULT '{"type": "free"}',
  capacity INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'draft',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private', 'unlisted')) DEFAULT 'public',
  image_url TEXT,
  requirements TEXT[],
  agenda JSONB DEFAULT '[]',
  registration_deadline TIMESTAMPTZ,
  metrics JSONB DEFAULT '{
    "totalRSVPs": 0,
    "confirmedRSVPs": 0,
    "waitlistCount": 0,
    "attendanceCount": 0,
    "viewCount": 0,
    "shareCount": 0
  }',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create RSVPs table
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlisted', 'cancelled')) DEFAULT 'confirmed',
  registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  qr_code TEXT,
  notes TEXT,
  checked_in BOOLEAN NOT NULL DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  checked_in_method TEXT CHECK (checked_in_method IN ('qr', 'manual', 'self')),
  attendance_status TEXT CHECK (attendance_status IN ('not_checked_in', 'checked_in', 'no_show')) DEFAULT 'not_checked_in',
  UNIQUE(user_id, event_id)
);

-- Create Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_text TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Create Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  checked_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in_by UUID NOT NULL,
  method TEXT NOT NULL CHECK (method IN ('qr', 'manual', 'self')),
  location TEXT,
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can do anything with profiles" ON public.profiles FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS Policies for events
CREATE POLICY "Anyone can view published events" ON public.events FOR SELECT USING (
  status = 'published' AND visibility = 'public'
);
CREATE POLICY "Organizers can view their own events" ON public.events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND (role = 'organizer' OR role = 'admin')
  ) AND organizer_id = auth.uid()
);
CREATE POLICY "Organizers can create events" ON public.events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND (role = 'organizer' OR role = 'admin')
  ) AND organizer_id = auth.uid()
);
CREATE POLICY "Organizers can update their own events" ON public.events FOR UPDATE USING (
  organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Organizers can delete their own events" ON public.events FOR DELETE USING (
  organizer_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create RLS Policies for rsvps
CREATE POLICY "Users can view their own RSVPs" ON public.rsvps FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Event organizers can view RSVPs for their events" ON public.rsvps FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);
CREATE POLICY "Users can create their own RSVPs" ON public.rsvps FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own RSVPs" ON public.rsvps FOR UPDATE USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);
CREATE POLICY "Users can delete their own RSVPs" ON public.rsvps FOR DELETE USING (user_id = auth.uid());

-- Create RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- Create RLS Policies for attendance
CREATE POLICY "Event organizers can view attendance for their events" ON public.attendance FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  )
);
CREATE POLICY "Organizers and checkers can create attendance records" ON public.attendance FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events 
    WHERE id = event_id AND organizer_id = auth.uid()
  ) OR checked_in_by = auth.uid()
);

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_rsvps_user_id ON public.rsvps(user_id);
CREATE INDEX idx_rsvps_event_id ON public.rsvps(event_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_attendance_event_id ON public.attendance(event_id);
CREATE INDEX idx_attendance_user_id ON public.attendance(user_id);

-- Create trigger function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();