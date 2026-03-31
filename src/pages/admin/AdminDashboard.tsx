import { useState, useEffect } from "react";
import { Users, GraduationCap, Activity, Database, Cpu, HardDrive, Clock, BarChart3 } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { api, type AdminStats, type AdminRecentUser } from "@/lib/api";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminRecentUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getAdminStats();
        if (res.data) {
          setStats(res.data.stats);
          setRecentUsers(res.data.recentUsers);
        }
      } catch (err: unknown) {
        toast({ title: err instanceof Error ? err.message : "Failed to load dashboard", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-admin border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        <StatCard icon={GraduationCap} label="Total Masters" value={stats?.totalMasters || 0} accentClass="bg-master-muted text-master" />
        <StatCard icon={Users} label="Total Students" value={stats?.totalStudents || 0} accentClass="bg-student-muted text-student" />
        <StatCard icon={Activity} label="Active Masters" value={stats?.activeMasters || 0} accentClass="bg-admin-muted text-admin" />
        <StatCard icon={BarChart3} label="Total Users" value={stats?.totalUsers || 0} accentClass="bg-master-muted text-master" />
      </div>

      {/* Recent users */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Registrations</h3>
        <div className="space-y-3">
          {recentUsers.length > 0 ? (
            recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-3">
                <AvatarBadge initials={u.initials} size="sm" accentClass={u.role === "master" ? "bg-master-muted text-master" : "bg-student-muted text-student"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "master" ? "bg-master-muted text-master" : "bg-student-muted text-student"}`}>
                  {u.role}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.status === "active" ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}>
                  {u.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No recent users</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
