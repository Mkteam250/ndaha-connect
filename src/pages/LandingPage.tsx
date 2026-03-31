import { motion } from "framer-motion";
import { GraduationCap, Users, Shield, ArrowRight, LogIn, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const roles = [
  {
    title: "Master",
    description: "Manage your students, track attendance, and generate reports.",
    icon: GraduationCap,
    path: "/master/dashboard",
    gradient: "gradient-master",
    accent: "text-master",
    bg: "bg-master-muted",
  },
  {
    title: "Student",
    description: "Register, view your profile, and track your attendance.",
    icon: Users,
    path: "/student/signup",
    gradient: "gradient-student",
    accent: "text-student",
    bg: "bg-student-muted",
  },
  {
    title: "Admin",
    description: "Monitor the system, manage masters, and configure settings.",
    icon: Shield,
    path: "/admin/dashboard",
    gradient: "gradient-admin",
    accent: "text-admin",
    bg: "bg-admin-muted",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-master/10 blur-3xl animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-admin/10 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-student/5 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 relative z-10"
      >
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">NDAHA</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-6">
          Attendance Management System
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={() => navigate("/login")} className="gradient-primary text-primary-foreground border-0 hover:opacity-90">
            <LogIn className="w-4 h-4 mr-2" /> Sign In
          </Button>
          <Button onClick={() => navigate("/register")} variant="outline">
            <UserPlus className="w-4 h-4 mr-2" /> Register
          </Button>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full relative z-10"
      >
        {roles.map((role) => (
          <motion.button
            key={role.title}
            variants={item}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(role.path)}
            className="group rounded-2xl border border-border bg-card p-8 text-left transition-shadow hover:shadow-xl hover:shadow-primary/5 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <div className={`w-14 h-14 rounded-xl ${role.bg} flex items-center justify-center mb-6`}>
              <role.icon className={`w-7 h-7 ${role.accent}`} />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">{role.title}</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{role.description}</p>
            <div className={`inline-flex items-center gap-2 text-sm font-medium ${role.accent} group-hover:gap-3 transition-all`}>
              Enter <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-xs text-muted-foreground mt-12 relative z-10"
      >
        © 2026 NDAHA. All rights reserved.
      </motion.p>
    </div>
  );
}
