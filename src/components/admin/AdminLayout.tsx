import { NavLink as RouterNavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, GraduationCap, Users, Server, Settings, Menu, ChevronLeft, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
  { label: "Masters", icon: GraduationCap, path: "/admin/masters" },
  { label: "Students", icon: Users, path: "/admin/students" },
  { label: "System", icon: Server, path: "/admin/system" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD";

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
                ? "bg-admin-muted text-admin"
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
              <span className="font-bold text-foreground text-lg">NDAHA</span>
              <span className="text-xs bg-admin-muted text-admin px-2 py-0.5 rounded-full font-medium">Admin</span>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <motion.aside initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-0 top-0 h-full w-60 border-r border-border bg-card z-50 flex flex-col lg:hidden">
              <div className="h-14 flex items-center px-4 border-b border-border">
                <span className="font-bold text-foreground text-lg">NDAHA</span>
                <span className="text-xs bg-admin-muted text-admin px-2 py-0.5 rounded-full font-medium ml-2">Admin</span>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-accent text-muted-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
              <span className="text-xs text-muted-foreground font-medium">Online</span>
            </div>
          </div>
          <AvatarBadge initials={initials} accentClass="bg-admin-muted text-admin" />
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
