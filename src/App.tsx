import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/components/AuthProvider";
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
import NotFound from "./pages/NotFound";

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
              <Route path="/calendar" element={<MyCalendar />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/my-events" element={<MyEvents />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/qr-scanner" element={<QRScanner />} />
              <Route path="/settings" element={<Settings />} />
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
