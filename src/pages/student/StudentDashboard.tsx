import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { api, type StudentDashboardData } from "@/lib/api";
import { BookOpen, CheckCircle2, TrendingUp, ScanLine } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.getStudentDashboard();
        setData(res.data ?? null);
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
        <div className="w-8 h-8 border-2 border-student border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">You haven't created your profile yet.</p>
        <Button onClick={() => navigate("/student/signup")} className="gradient-student text-student-foreground border-0 hover:opacity-90">
          Create Profile
        </Button>
      </div>
    );
  }

  const { profile, stats } = data;

  return (
    <div>
      <PageHeader title="Dashboard" description={`Welcome back, ${profile.firstName}`}>
        <Button onClick={() => navigate("/student/check-in")} className="gradient-student text-student-foreground border-0 hover:opacity-90">
          <ScanLine className="w-4 h-4 mr-2" />
          Check In
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={BookOpen}
          label="Total Sessions"
          value={stats?.totalSessions || 0}
          accentClass="bg-student-muted text-student"
        />
        <StatCard
          icon={CheckCircle2}
          label="Attended"
          value={stats?.attendedSessions || 0}
          accentClass="bg-green-500/10 text-green-500"
        />
        <StatCard
          icon={TrendingUp}
          label="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          accentClass="bg-admin-muted text-admin"
        />
        <StatCard
          icon={CheckCircle2}
          label="This Week"
          value={stats?.weekAttendance || 0}
          accentClass="bg-warning/10 text-warning"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Progress */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Attendance Progress</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Overall</span>
                <span className="font-medium text-foreground">{stats?.attendanceRate || 0}%</span>
              </div>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full gradient-student"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.attendanceRate || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center">
                <p className="text-2xl font-bold text-student">{stats?.attendedSessions || 0}</p>
                <p className="text-xs text-muted-foreground">Sessions Attended</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{stats?.totalSessions || 0}</p>
                <p className="text-xs text-muted-foreground">Total Sessions</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's Status</h3>
          {stats?.checkedInToday ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-foreground">Checked In!</p>
              <p className="text-sm text-muted-foreground mt-1">You've marked your attendance today.</p>
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 rounded-full bg-student-muted flex items-center justify-center mx-auto mb-3">
                <ScanLine className="w-6 h-6 text-student" />
              </div>
              <p className="text-lg font-semibold text-foreground">Not Checked In</p>
              <p className="text-sm text-muted-foreground mt-1">Scan your master's QR code to check in.</p>
              <Button onClick={() => navigate("/student/check-in")} className="mt-4 gradient-student text-student-foreground border-0 hover:opacity-90">
                <ScanLine className="w-4 h-4 mr-2" /> Scan Now
              </Button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Master Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Your Master</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-master-muted text-master flex items-center justify-center text-lg font-bold">
            {profile.masterName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-foreground">{profile.masterName}</p>
            <p className="text-sm text-muted-foreground">Enrolled since {new Date(profile.enrolledDate).toLocaleDateString("en", { month: "long", year: "numeric" })}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
