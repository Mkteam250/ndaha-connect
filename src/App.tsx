import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentCheckIn from "./pages/student/StudentCheckIn";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMasters from "./pages/admin/AdminMasters";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminSystem from "./pages/admin/AdminSystem";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (user) {
    const redirectMap: Record<string, string> = {
      master: "/master/dashboard",
      student: "/student/dashboard",
      admin: "/admin/dashboard",
    };
    return <Navigate to={redirectMap[user.role] || "/"} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <AuthRedirect>
                  <LoginPage />
                </AuthRedirect>
              }
            />
            <Route
              path="/register"
              element={
                <AuthRedirect>
                  <RegisterPage />
                </AuthRedirect>
              }
            />

            {/* Master Portal */}
            <Route
              path="/master"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <MasterLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<MasterDashboard />} />
              <Route path="attendance" element={<MasterAttendance />} />
              <Route path="calendar" element={<MasterCalendar />} />
              <Route path="students" element={<MasterStudents />} />
              <Route path="reports" element={<MasterReports />} />
              <Route path="profile" element={<MasterProfile />} />
            </Route>
            <Route
              path="/master/qr-display"
              element={
                <ProtectedRoute allowedRoles={["master"]}>
                  <MasterQRDisplay />
                </ProtectedRoute>
              }
            />

            {/* Student Portal */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="check-in" element={<StudentCheckIn />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="signup" element={<StudentSignup />} />
            </Route>

            {/* Admin Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
