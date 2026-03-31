import { Users, GraduationCap, Activity, Database, Cpu, HardDrive, Clock, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { masters, students, recentActivity } from "@/lib/mock-data";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  return (
    <div>
      <PageHeader title="Admin Dashboard" description="System overview and platform metrics" />

      {/* System health */}
      <h3 className="text-sm font-semibold text-foreground mb-3">System Health</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-admin-muted flex items-center justify-center"><Cpu className="w-5 h-5 text-admin" /></div>
            <span className="text-sm font-medium text-foreground">CPU Usage</span>
          </div>
          <p className="text-2xl font-bold text-foreground">23%</p>
          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full gradient-admin" style={{ width: "23%" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-admin-muted flex items-center justify-center"><Database className="w-5 h-5 text-admin" /></div>
            <span className="text-sm font-medium text-foreground">RAM</span>
          </div>
          <p className="text-2xl font-bold text-foreground">3.2 / 8 GB</p>
          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full gradient-admin" style={{ width: "40%" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-admin-muted flex items-center justify-center"><HardDrive className="w-5 h-5 text-admin" /></div>
            <span className="text-sm font-medium text-foreground">Storage</span>
          </div>
          <p className="text-2xl font-bold text-foreground">45 / 100 GB</p>
          <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full gradient-admin" style={{ width: "45%" }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-student-muted flex items-center justify-center"><Clock className="w-5 h-5 text-student" /></div>
            <span className="text-sm font-medium text-foreground">Uptime</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground">14d 6h 32m</p>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse-soft" />
          </div>
        </motion.div>
      </div>

      {/* Platform stats */}
      <h3 className="text-sm font-semibold text-foreground mb-3">Platform Stats</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={GraduationCap} label="Total Masters" value={masters.length} accentClass="bg-master-muted text-master" />
        <StatCard icon={Users} label="Total Students" value={students.length} accentClass="bg-student-muted text-student" />
        <StatCard icon={Activity} label="Active Sessions" value={2} accentClass="bg-admin-muted text-admin" />
        <StatCard icon={BarChart3} label="Attendance Records" value={156} trend={12} accentClass="bg-master-muted text-master" />
      </div>

      {/* Recent registrations & activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Registrations</h3>
          <div className="space-y-3">
            {students.slice(0, 5).map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <AvatarBadge initials={s.avatar} size="sm" accentClass="bg-student-muted text-student" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.firstName} {s.lastName}</p>
                  <p className="text-xs text-muted-foreground">{s.enrolledDate}</p>
                </div>
                <span className="text-xs bg-student-muted text-student px-2 py-0.5 rounded-full">Student</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Activity Log</h3>
          <div className="space-y-3 max-h-[300px] overflow-auto">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                  a.type === "attendance" ? "bg-master" : a.type === "registration" ? "bg-student" : a.type === "limit_change" ? "bg-admin" : "bg-muted-foreground"
                }`} />
                <div>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
