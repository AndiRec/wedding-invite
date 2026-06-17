import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Invitation from "./pages/Invitation";
import Plan from "./pages/Plan";
import Login from "./pages/Login";
import ViewOnly from "./pages/ViewOnly";
import AdminRsvps from "./pages/AdminRsvps";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public: the wedding invitation (front door) */}
          <Route path="/" element={<Invitation />} />
          {/* Admin login */}
          <Route path="/login" element={<Login />} />
          {/* Public: read-only seating map */}
          <Route path="/plan/view" element={<ViewOnly />} />
          {/* Admin: seating planner (login required) */}
          <Route path="/plan/admin" element={<ProtectedRoute><Plan /></ProtectedRoute>} />
          {/* Admin: RSVP submissions (login required) */}
          <Route path="/plan/rsvps" element={<ProtectedRoute><AdminRsvps /></ProtectedRoute>} />
          {/* /plan with no sub-path → send to the public view */}
          <Route path="/plan" element={<Navigate to="/plan/view" replace />} />
          {/* Legacy redirect */}
          <Route path="/pamje" element={<Navigate to="/plan/view" replace />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
