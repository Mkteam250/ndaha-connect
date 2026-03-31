import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ScanLine, User, LogOut, Menu, ChevronLeft, GraduationCap } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
  { label: "Check In", icon: ScanLine, path: "/student/check-in" },
  { label: "Profile", icon: User, path: "/student/profile" },
];

export default function StudentLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "S";

  const handleLogout = async () => {
    await logout();
    toast({ title: "Logged out" });
    navigate("/login");
  };

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <RouterNavLink
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? "bg-student-muted text-student"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </RouterNavLink>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-auto"
      >
        <LogOut className="w-5 h-5 shrink-0" />
        {!collapsed && <span>Logout</span>}
      </button>
    </nav>
  );

  return (
    <div className="flex h-screen bg-background">
      <aside className={`hidden lg:flex flex-col border-r border-border bg-card transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-student flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-student-foreground" />
              </div>
              <span className="font-bold text-foreground text-lg">NDAHA</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className={`p-1.5 rounded-lg hover:bg-accent text-muted-foreground ${collapsed ? "mx-auto" : ""}`}>
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-0 top-0 h-full w-60 border-r border-border bg-card z-50 flex flex-col lg:hidden">
            <div className="h-14 flex items-center px-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-student flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-student-foreground" />
                </div>
                <span className="font-bold text-foreground text-lg">NDAHA</span>
              </div>
            </div>
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-muted-foreground hidden sm:block">
              {new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-student-muted text-student px-2 py-0.5 rounded-full font-medium">Student</span>
            <div className="w-8 h-8 rounded-full bg-student-muted text-student flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
