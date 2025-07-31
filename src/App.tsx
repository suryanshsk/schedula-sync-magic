import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Events } from "./pages/Events";
import { MyCalendar } from "./pages/MyCalendar";
import { Notifications } from "./pages/Notifications";
import { CreateEvent } from "./pages/CreateEvent";
import { MyEvents } from "./pages/MyEvents";
import { Analytics } from "./pages/Analytics";
import { QRScanner } from "./pages/QRScanner";
import { Settings } from "./pages/Settings";
import { EventDetails } from "./pages/EventDetails";
import { EventManagement } from "./pages/EventManagement";
import { EventAnalytics } from "./pages/EventAnalytics";
import { EditEvent } from "./pages/EditEvent";
import NotFound from "./pages/NotFound";
import { AdminAnalytics } from "./pages/admin/AdminAnalytics";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminOrganizers } from "./pages/admin/AdminOrganizers";
import { AdminEvents } from "./pages/admin/AdminEvents";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Help from "./pages/Help";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/features" element={<Features />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                {/* Protected authenticated routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/events" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <Events />
                  </ProtectedRoute>
                } />
                <Route path="/event/:eventId" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <EventDetails />
                  </ProtectedRoute>
                } />
                <Route path="/event/:eventId/edit" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <EditEvent />
                  </ProtectedRoute>
                } />
                <Route path="/event/:eventId/manage" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <EventManagement />
                  </ProtectedRoute>
                } />
                <Route path="/event/:eventId/analytics" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <EventAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/calendar" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <MyCalendar />
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <Notifications />
                  </ProtectedRoute>
                } />
                <Route path="/create-event" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <CreateEvent />
                  </ProtectedRoute>
                } />
                <Route path="/my-events" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <MyEvents />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/qr-scanner" element={
                  <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                    <QRScanner />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute requiredRoles={['user', 'organizer', 'admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* Admin Routes */}
                <Route path="/admin/analytics" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminAnalytics />
                  </ProtectedRoute>
                } />
                <Route path="/admin/users" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/organizers" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminOrganizers />
                  </ProtectedRoute>
                } />
                <Route path="/admin/events" element={
                  <ProtectedRoute requiredRoles={['admin']}>
                    <AdminEvents />
                  </ProtectedRoute>
                } />
                
                {/* Catch-all route - must be last */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
