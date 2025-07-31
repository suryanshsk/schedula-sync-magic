// Sample data for Schedula demo
import { User, Event, RSVP, Notification, Attendance } from './types';
import { userStorage, eventStorage, rsvpStorage, notificationStorage, attendanceStorage } from './storage';

// Sample users
const sampleUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    email: 'admin@schedula.com',
    name: 'Sarah Admin',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c08c?w=150&h=150&fit=crop&crop=face',
    bio: 'Platform administrator and event management specialist.',
    location: 'San Francisco, CA',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/sarah-admin',
      github: 'https://github.com/sarah-admin',
      portfolio: 'https://sarahadmin.dev',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      eventReminders: true,
      marketingEmails: false,
      theme: 'system',
      language: 'en',
      timezone: 'America/Los_Angeles',
    },
  },
  {
    email: 'organizer@schedula.com',
    name: 'Michael Organizer',
    role: 'organizer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    bio: 'Tech conference organizer and community builder.',
    location: 'New York, NY',
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      eventReminders: true,
      marketingEmails: true,
      theme: 'light',
      language: 'en',
      timezone: 'America/New_York',
    },
  },
  {
    email: 'user@schedula.com',
    name: 'Emma User',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    bio: 'Technology enthusiast and lifelong learner.',
    location: 'Austin, TX',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/emma-user',
      github: 'https://github.com/emma-user',
      twitter: 'https://twitter.com/emma_user',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: false,
      eventReminders: true,
      marketingEmails: false,
      theme: 'dark',
      language: 'en',
      timezone: 'America/Chicago',
    },
  },
  {
    email: 'jane.designer@schedula.com',
    name: 'Jane Designer',
    role: 'organizer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    bio: 'UX designer organizing creative workshops.',
    location: 'Los Angeles, CA',
    socialLinks: {
      linkedin: 'https://linkedin.com/in/jane-designer',
      portfolio: 'https://janedesigner.com',
      twitter: 'https://twitter.com/jane_designer',
    },
    preferences: {
      emailNotifications: true,
      pushNotifications: true,
      eventReminders: true,
      marketingEmails: true,
      theme: 'light',
      language: 'en',
      timezone: 'America/Los_Angeles',
    },
  },
  {
    email: 'alex.dev@schedula.com',
    name: 'Alex Developer',
    role: 'user',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    bio: 'Full-stack developer passionate about learning.',
    location: 'Seattle, WA',
    preferences: {
      emailNotifications: false,
      pushNotifications: true,
      eventReminders: true,
      marketingEmails: false,
      theme: 'dark',
      language: 'en',
      timezone: 'America/Los_Angeles',
    },
  },
];

// Sample events
const sampleEvents: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'metrics' | 'organizerId'>[] = [
  {
    title: 'React Summit 2024',
    description: 'Join us for the biggest React conference of the year! Learn from industry experts, network with fellow developers, and discover the latest trends in React development. This two-day event features keynotes, workshops, and hands-on sessions covering React 18, Next.js, and modern development practices.',
    shortDescription: 'The biggest React conference featuring industry experts and latest trends.',
    startDate: '2024-09-15T09:00:00.000Z',
    endDate: '2024-09-16T18:00:00.000Z',
    location: {
      type: 'in-person',
      venue: 'Moscone Center',
      address: '747 Howard St',
      city: 'San Francisco',
      country: 'USA',
      coordinates: { lat: 37.7843, lng: -122.4015 },
    },
    type: 'conference',
    category: 'Technology',
    tags: ['React', 'JavaScript', 'Frontend', 'Web Development'],
    pricing: { type: 'paid', amount: 299, currency: 'USD' },
    capacity: 500,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop',
    requirements: ['Laptop with Node.js installed', 'Basic React knowledge'],
    agenda: [
      {
        id: '1',
        title: 'Opening Keynote: The Future of React',
        description: 'React team shares upcoming features and roadmap',
        startTime: '09:00',
        endTime: '10:00',
        speaker: 'Dan Abramov',
        location: 'Main Stage',
      },
      {
        id: '2',
        title: 'Workshop: Advanced React Patterns',
        description: 'Hands-on workshop covering render props, hooks, and context',
        startTime: '10:30',
        endTime: '12:00',
        speaker: 'Kent C. Dodds',
        location: 'Workshop Room A',
      },
    ],
    registrationDeadline: '2024-09-10T23:59:59.000Z',
  },
  {
    title: 'UX Design Thinking Workshop',
    description: 'A comprehensive workshop on design thinking methodology. Learn how to apply human-centered design principles to solve complex problems. This interactive session includes team exercises, real-world case studies, and practical tools you can implement immediately.',
    shortDescription: 'Interactive design thinking workshop with practical exercises.',
    startDate: '2024-08-20T10:00:00.000Z',
    endDate: '2024-08-20T16:00:00.000Z',
    location: {
      type: 'in-person',
      venue: 'Design Hub Studio',
      address: '123 Creative Blvd',
      city: 'Los Angeles',
      country: 'USA',
    },
    type: 'workshop',
    category: 'Design',
    tags: ['UX', 'Design Thinking', 'Innovation', 'Problem Solving'],
    pricing: { type: 'paid', amount: 150, currency: 'USD' },
    capacity: 30,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop',
    requirements: ['No prior experience needed', 'Bring a notebook'],
  },
  {
    title: 'Virtual Tech Meetup: AI & Machine Learning',
    description: 'Join our monthly virtual meetup focused on artificial intelligence and machine learning. This month we\'re covering the latest in large language models, computer vision, and practical AI applications in business.',
    shortDescription: 'Monthly virtual meetup on AI and ML trends.',
    startDate: '2024-08-25T19:00:00.000Z',
    endDate: '2024-08-25T21:00:00.000Z',
    location: {
      type: 'online',
      onlineUrl: 'https://zoom.us/j/1234567890',
    },
    type: 'networking',
    category: 'Technology',
    tags: ['AI', 'Machine Learning', 'Virtual', 'Networking'],
    pricing: { type: 'free' },
    capacity: 100,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
  },
  {
    title: 'Startup Founders Networking Night',
    description: 'Connect with fellow entrepreneurs, share experiences, and build valuable relationships. This casual networking event brings together startup founders, investors, and industry professionals for an evening of meaningful conversations.',
    shortDescription: 'Casual networking for startup founders and entrepreneurs.',
    startDate: '2024-08-30T18:00:00.000Z',
    endDate: '2024-08-30T22:00:00.000Z',
    location: {
      type: 'in-person',
      venue: 'Innovation Lounge',
      address: '456 Startup Ave',
      city: 'Austin',
      country: 'USA',
    },
    type: 'social',
    category: 'Business',
    tags: ['Startup', 'Entrepreneurship', 'Networking', 'Business'],
    pricing: { type: 'paid', amount: 25, currency: 'USD' },
    capacity: 75,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=400&fit=crop',
  },
  {
    title: 'Advanced JavaScript Workshop',
    description: 'Deep dive into advanced JavaScript concepts including closures, prototypes, async/await, and modern ES6+ features. Perfect for developers looking to level up their JavaScript skills.',
    shortDescription: 'Advanced JavaScript workshop for experienced developers.',
    startDate: '2024-09-05T09:00:00.000Z',
    endDate: '2024-09-05T17:00:00.000Z',
    location: {
      type: 'hybrid',
      venue: 'Tech Campus',
      address: '789 Code Street',
      city: 'Seattle',
      country: 'USA',
      onlineUrl: 'https://meet.google.com/abc-defg-hij',
    },
    type: 'workshop',
    category: 'Technology',
    tags: ['JavaScript', 'Programming', 'Web Development', 'Advanced'],
    pricing: { type: 'paid', amount: 199, currency: 'USD' },
    capacity: 40,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
  },
  {
    title: 'Marketing Strategy Masterclass',
    description: 'Learn cutting-edge marketing strategies from industry leaders. This masterclass covers digital marketing, content strategy, social media marketing, and growth hacking techniques.',
    shortDescription: 'Comprehensive marketing strategy training.',
    startDate: '2024-09-12T13:00:00.000Z',
    endDate: '2024-09-12T18:00:00.000Z',
    location: {
      type: 'in-person',
      venue: 'Business Center',
      address: '321 Marketing Plaza',
      city: 'Chicago',
      country: 'USA',
    },
    type: 'workshop',
    category: 'Marketing',
    tags: ['Marketing', 'Strategy', 'Digital Marketing', 'Growth'],
    pricing: { type: 'paid', amount: 175, currency: 'USD' },
    capacity: 50,
    status: 'published',
    visibility: 'public',
    imageUrl: 'https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop',
  },
];

// Initialize sample data
export const initializeSampleData = (): void => {
  // Check if data already exists
  const existingUsers = userStorage.getAll();
  if (existingUsers.length > 0) {
    console.log('Sample data already exists, skipping initialization');
    return;
  }

  console.log('Initializing sample data...');

  // Create users
  const createdUsers = sampleUsers.map(userData => userStorage.create(userData));
  
  // Find organizers and admin
  const organizer1 = createdUsers.find(u => u.email === 'organizer@schedula.com');
  const organizer2 = createdUsers.find(u => u.email === 'jane.designer@schedula.com');
  const admin = createdUsers.find(u => u.email === 'admin@schedula.com');
  const user1 = createdUsers.find(u => u.email === 'user@schedula.com');
  const user2 = createdUsers.find(u => u.email === 'alex.dev@schedula.com');

  if (!organizer1 || !organizer2 || !admin || !user1 || !user2) {
    console.error('Failed to create required users');
    return;
  }

  // Create events with proper organizer assignments
  const eventsWithOrganizers = [
    { ...sampleEvents[0], organizerId: organizer1.id }, // React Summit
    { ...sampleEvents[1], organizerId: organizer2.id }, // UX Workshop
    { ...sampleEvents[2], organizerId: organizer1.id }, // Virtual Meetup
    { ...sampleEvents[3], organizerId: organizer1.id }, // Networking Night
    { ...sampleEvents[4], organizerId: organizer2.id }, // JavaScript Workshop
    { ...sampleEvents[5], organizerId: organizer1.id }, // Marketing Masterclass
  ];

  const createdEvents = eventsWithOrganizers.map(eventData => eventStorage.create(eventData));

  // Create sample RSVPs
  const sampleRSVPs: Array<Omit<RSVP, 'id' | 'registrationDate'>> = [
    { userId: user1.id, eventId: createdEvents[0].id, status: 'confirmed', checkedIn: false },
    { userId: user2.id, eventId: createdEvents[0].id, status: 'confirmed', checkedIn: false },
    { userId: user1.id, eventId: createdEvents[1].id, status: 'confirmed', checkedIn: true },
    { userId: user2.id, eventId: createdEvents[2].id, status: 'confirmed', checkedIn: false },
    { userId: user1.id, eventId: createdEvents[3].id, status: 'waitlisted', checkedIn: false },
    { userId: user2.id, eventId: createdEvents[4].id, status: 'confirmed', checkedIn: false },
  ];

  sampleRSVPs.forEach(rsvpData => {
    rsvpStorage.create(rsvpData);
  });

  // Create sample notifications
  const sampleNotifications = [
    {
      userId: user1.id,
      type: 'success' as const,
      title: 'RSVP Confirmed',
      message: 'Your RSVP for React Summit 2024 has been confirmed!',
      actionUrl: `/events/${createdEvents[0].id}`,
      actionText: 'View Event',
    },
    {
      userId: user1.id,
      type: 'info' as const,
      title: 'Event Reminder',
      message: 'UX Design Thinking Workshop starts in 2 days!',
      actionUrl: `/events/${createdEvents[1].id}`,
      actionText: 'View Details',
    },
    {
      userId: user2.id,
      type: 'warning' as const,
      title: 'Waitlist Update',
      message: 'You\'re #3 on the waitlist for Startup Founders Networking Night.',
    },
    {
      userId: organizer1.id,
      type: 'success' as const,
      title: 'Event Published',
      message: 'Your event "Virtual Tech Meetup" has been successfully published!',
    },
  ];

  sampleNotifications.forEach(notificationData => {
    notificationStorage.create(notificationData);
  });

  // Create sample attendance records
  const sampleAttendance = [
    {
      eventId: createdEvents[1].id, // UX Workshop (past event)
      userId: user1.id,
      checkedInBy: organizer2.id,
      method: 'qr' as const,
      notes: 'Checked in via QR code scan',
    },
  ];

  sampleAttendance.forEach(attendanceData => {
    attendanceStorage.create(attendanceData);
  });

  console.log('Sample data initialized successfully');
  console.log(`Created ${createdUsers.length} users, ${createdEvents.length} events, ${sampleRSVPs.length} RSVPs`);
};