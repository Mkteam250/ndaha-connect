import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { api, type ReportData } from "@/lib/api";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, BarChart3, Award, UserX, Printer, FileText, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function MasterReports() {
  const { toast } = useToast();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.getReports();
        setData(res.data ?? null);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load reports";
        toast({ title: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
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
      <PageHeader title="Reports" description="Generate and export attendance reports" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Calendar} label="Total Sessions" value={data?.totalSessions || 0} accentClass="bg-master-muted text-master" />
        <StatCard icon={BarChart3} label="Avg Attendance" value={`${data?.avgRate || 0}%`} accentClass="bg-student-muted text-student" />
        <StatCard icon={Award} label="Best Student" value={data?.bestStudent || "N/A"} accentClass="bg-admin-muted text-admin" />
        <StatCard icon={UserX} label="Most Absent" value={data?.worstStudent || "N/A"} accentClass="bg-destructive/10 text-destructive" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Report Preview</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" /> Print</Button>
            <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" /> PDF</Button>
            <Button variant="outline" size="sm"><FileSpreadsheet className="w-4 h-4 mr-1" /> Excel</Button>
          </div>
        </div>
        {data?.report && data.report.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Present</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Absent</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.report.map((s) => (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.present}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.absent}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${s.rate >= 80 ? "text-student" : s.rate >= 60 ? "text-warning" : "text-destructive"}`}>
                        {s.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No report data available yet.</p>
        )}
      </motion.div>
    </div>
  );
}
