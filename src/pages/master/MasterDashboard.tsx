import { useState, useEffect } from "react";
import { Users, UserCheck, UserX, BarChart3, ArrowRight, Calendar, Download } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, type DashboardStats, type TrendPoint, type TopStudent, type ActivityItem } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useToast } from "@/hooks/use-toast";

export default function MasterDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getMasterDashboard();
        if (res.data) {
          setStats(res.data.stats);
          setTrend(res.data.trend);
          setTopStudents(res.data.topStudents);
          setRecentActivity(res.data.recentActivity);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load dashboard";
        toast({ title: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back">
        <Button onClick={() => navigate("/master/attendance")} className="gradient-master text-master-foreground border-0 hover:opacity-90">
          Start Today's Session <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Students" value={stats?.totalStudents || 0} accentClass="bg-master-muted text-master" />
        <StatCard icon={UserCheck} label="Present Today" value={stats?.presentToday || 0} accentClass="bg-student-muted text-student" />
        <StatCard icon={UserX} label="Absent Today" value={stats?.absentToday || 0} accentClass="bg-destructive/10 text-destructive" />
        <StatCard icon={BarChart3} label="Attendance Rate" value={`${stats?.rate || 0}%`} accentClass="bg-admin-muted text-admin" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance Trend (30 days)</h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(199 89% 48%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(199 89% 48%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(214 32% 91%)", fontSize: 12 }} />
                <Area type="monotone" dataKey="rate" stroke="hsl(199 89% 48%)" fill="url(#colorRate)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">
              No attendance data yet
            </div>
          )}
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[240px] overflow-auto">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === "attendance" ? "bg-master" : a.type === "registration" ? "bg-student" : "bg-muted-foreground"}`} />
                  <div>
                    <p className="text-sm text-foreground">{a.message}</p>
                    <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Top students */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground">Top Attending Students</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/master/calendar")}><Calendar className="w-4 h-4 mr-1" /> Calendar</Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/master/reports")}><Download className="w-4 h-4 mr-1" /> Export</Button>
          </div>
        </div>
        {topStudents.length > 0 ? (
          <div className="space-y-3">
            {topStudents.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                <AvatarBadge initials={s.initials} size="sm" accentClass="bg-master-muted text-master" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-master" style={{ width: `${s.attendanceRate}%` }} />
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">{s.attendanceRate}%</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No students enrolled yet</p>
        )}
      </motion.div>
    </div>
  );
}
