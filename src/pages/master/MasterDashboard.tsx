import { Users, UserCheck, UserX, BarChart3, ArrowRight, Calendar, Download } from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { students, todayAttendance, attendanceTrend, recentActivity } from "@/lib/mock-data";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const masterStudents = students.filter((s) => s.masterId === "M001");
const presentToday = todayAttendance.length;
const absentToday = masterStudents.length - presentToday;
const rate = Math.round((presentToday / masterStudents.length) * 100);

export default function MasterDashboard() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Dashboard" description="Welcome back, Dr. Bizimungu">
        <Button onClick={() => navigate("/master/attendance")} className="gradient-master text-master-foreground border-0 hover:opacity-90">
          Start Today's Session <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={Users} label="Total Students" value={masterStudents.length} accentClass="bg-master-muted text-master" />
        <StatCard icon={UserCheck} label="Present Today" value={presentToday} trend={5} accentClass="bg-student-muted text-student" />
        <StatCard icon={UserX} label="Absent Today" value={absentToday} accentClass="bg-destructive/10 text-destructive" />
        <StatCard icon={BarChart3} label="Attendance Rate" value={`${rate}%`} trend={2} accentClass="bg-admin-muted text-admin" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={attendanceTrend}>
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
        </motion.div>

        {/* Recent activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-[240px] overflow-auto">
            {recentActivity.slice(0, 8).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.type === "attendance" ? "bg-master" : a.type === "registration" ? "bg-student" : "bg-muted-foreground"}`} />
                <div>
                  <p className="text-sm text-foreground">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{a.timestamp}</p>
                </div>
              </div>
            ))}
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
        <div className="space-y-3">
          {masterStudents
            .sort((a, b) => b.attendanceRate - a.attendanceRate)
            .slice(0, 5)
            .map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                <AvatarBadge initials={s.avatar} size="sm" accentClass="bg-master-muted text-master" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{s.firstName} {s.lastName}</p>
                </div>
                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-master" style={{ width: `${s.attendanceRate}%` }} />
                </div>
                <span className="text-sm font-medium text-foreground w-12 text-right">{s.attendanceRate}%</span>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  );
}
