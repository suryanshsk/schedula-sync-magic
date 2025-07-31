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

const App = () => (
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event/:eventId" element={<EventDetails />} />
              <Route path="/event/:eventId/edit" element={<EditEvent />} />
              <Route path="/event/:eventId/manage" element={<EventManagement />} />
              <Route path="/event/:eventId/analytics" element={<EventAnalytics />} />
              <Route path="/calendar" element={<MyCalendar />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/my-events" element={<MyEvents />} />
              <Route path="/analytics" element={
                <ProtectedRoute requiredRoles={['organizer', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />
              <Route path="/qr-scanner" element={
                <ProtectedRoute requiredRoles={['organizer']}>
                  <QRScanner />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={<Settings />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              <Route path="/help" element={<Help />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              {/* Admin Routes */}
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/organizers" element={<AdminOrganizers />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
