import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

// Auth pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Layouts
import MasterLayout from "./components/master/MasterLayout";
import StudentLayout from "./components/student/StudentLayout";
import AdminLayout from "./components/admin/AdminLayout";

// Master pages
import MasterDashboard from "./pages/master/MasterDashboard";
import MasterAttendance from "./pages/master/MasterAttendance";
import MasterQRDisplay from "./pages/master/MasterQRDisplay";
import MasterCalendar from "./pages/master/MasterCalendar";
import MasterStudents from "./pages/master/MasterStudents";
import MasterReports from "./pages/master/MasterReports";
import MasterProfile from "./pages/master/MasterProfile";

// Student pages
import StudentSignup from "./pages/student/StudentSignup";
import StudentProfile from "./pages/student/StudentProfile";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMasters from "./pages/admin/AdminMasters";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Master Portal */}
          <Route path="/master" element={<MasterLayout />}>
            <Route path="dashboard" element={<MasterDashboard />} />
            <Route path="attendance" element={<MasterAttendance />} />
            <Route path="calendar" element={<MasterCalendar />} />
            <Route path="students" element={<MasterStudents />} />
            <Route path="reports" element={<MasterReports />} />
            <Route path="profile" element={<MasterProfile />} />
          </Route>
          <Route path="/master/qr-display" element={<MasterQRDisplay />} />

          {/* Student Portal */}
          <Route path="/student" element={<StudentLayout />}>
            <Route path="signup" element={<StudentSignup />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="masters" element={<AdminMasters />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="system" element={<AdminSystem />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
