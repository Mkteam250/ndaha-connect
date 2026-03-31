import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { students } from "@/lib/mock-data";
import { StatCard } from "@/components/ui/stat-card";
import { Calendar, BarChart3, Award, UserX, Printer, FileText, FileSpreadsheet } from "lucide-react";
import { motion } from "framer-motion";

const masterStudents = students.filter((s) => s.masterId === "M001");
const avgRate = Math.round(masterStudents.reduce((a, b) => a + b.attendanceRate, 0) / masterStudents.length);
const bestStudent = masterStudents.sort((a, b) => b.attendanceRate - a.attendanceRate)[0];
const worstStudent = masterStudents.sort((a, b) => a.attendanceRate - b.attendanceRate)[0];

export default function MasterReports() {
  return (
    <div>
      <PageHeader title="Reports" description="Generate and export attendance reports" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Calendar} label="Total Sessions" value={22} accentClass="bg-master-muted text-master" />
        <StatCard icon={BarChart3} label="Avg Attendance" value={`${avgRate}%`} accentClass="bg-student-muted text-student" />
        <StatCard icon={Award} label="Best Student" value={bestStudent.firstName} accentClass="bg-admin-muted text-admin" />
        <StatCard icon={UserX} label="Most Absent" value={worstStudent.firstName} accentClass="bg-destructive/10 text-destructive" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Report Preview</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><Printer className="w-4 h-4 mr-1" /> Print</Button>
            <Button variant="outline" size="sm"><FileText className="w-4 h-4 mr-1" /> PDF</Button>
            <Button variant="outline" size="sm"><FileSpreadsheet className="w-4 h-4 mr-1" /> Excel</Button>
          </div>
        </div>
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
              {masterStudents.map((s) => {
                const present = Math.round((s.attendanceRate / 100) * 22);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{s.firstName} {s.lastName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{present}</td>
                    <td className="px-4 py-3 text-muted-foreground">{22 - present}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${s.attendanceRate >= 80 ? "text-student" : s.attendanceRate >= 60 ? "text-warning" : "text-destructive"}`}>
                        {s.attendanceRate}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
