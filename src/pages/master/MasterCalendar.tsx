import { PageHeader } from "@/components/ui/page-header";
import { calendarData } from "@/lib/mock-data";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const days: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
  return days;
}

function getColor(attended: number, total: number) {
  const pct = (attended / total) * 100;
  if (pct >= 75) return "bg-student";
  if (pct >= 50) return "bg-warning";
  return "bg-destructive";
}

export default function MasterCalendar() {
  const year = 2026;
  const month = 2; // March
  const days = getDaysInMonth(year, month);

  return (
    <div>
      <PageHeader title="Calendar" description="Monthly attendance overview" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-6">
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
          <h3 className="text-lg font-semibold text-foreground">March 2026</h3>
          <button className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {daysOfWeek.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const key = date.toISOString().split("T")[0];
            const data = calendarData[key];
            const isToday = date.getDate() === 31;
            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.05 }}
                className={`aspect-square rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  isToday ? "border-master bg-master-muted" : "border-border hover:bg-accent/50"
                }`}
              >
                <span className={`text-sm font-medium ${isToday ? "text-master" : "text-foreground"}`}>{date.getDate()}</span>
                {data && (
                  <div className={`w-2 h-2 rounded-full mt-1 ${getColor(data.attended, data.total)}`} />
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          {[
            { color: "bg-student", label: ">75% attendance" },
            { color: "bg-warning", label: "50–75%" },
            { color: "bg-destructive", label: "<50%" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
