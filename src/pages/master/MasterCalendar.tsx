import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { calendarData, todayAttendance, students } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

// Generate mock day detail data
function getDayAttendance(dateKey: string) {
  const data = calendarData[dateKey];
  if (!data) return [];
  // Use todayAttendance as a template for the current date, or generate mock for others
  if (dateKey === "2026-03-31") return todayAttendance;
  const masterStudents = students.filter(s => s.masterId === "M001");
  const shuffled = [...masterStudents].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, data.attended).map(s => ({
    studentId: s.id,
    studentName: `${s.firstName} ${s.lastName}`,
    avatar: s.avatar,
    time: `0${8 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
    date: dateKey,
  }));
}

export default function MasterCalendar() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2); // March (0-indexed)
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const days = getDaysInMonth(year, month);

  const goNext = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const goPrev = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const dayAttendance = selectedDay ? getDayAttendance(selectedDay) : [];
  const dayData = selectedDay ? calendarData[selectedDay] : null;

  return (
    <div>
      <PageHeader title="Calendar" description="Monthly attendance overview" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-6">
            <button onClick={goPrev} className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><ChevronLeft className="w-4 h-4" /></button>
            <h3 className="text-lg font-semibold text-foreground">{monthNames[month]} {year}</h3>
            <button onClick={goNext} className="p-2 rounded-lg hover:bg-accent text-muted-foreground"><ChevronRight className="w-4 h-4" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {days.map((date, i) => {
              if (!date) return <div key={`empty-${i}`} />;
              const key = date.toISOString().split("T")[0];
              const data = calendarData[key];
              const isToday = isCurrentMonth && date.getDate() === today.getDate();
              const isSelected = selectedDay === key;
              return (
                <motion.div
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedDay(key)}
                  className={`aspect-square rounded-lg border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    isSelected ? "border-master bg-master/10 ring-2 ring-master/30" :
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

        {/* Day detail panel */}
        <div className="rounded-xl border border-border bg-card p-5">
          <AnimatePresence mode="wait">
            {selectedDay ? (
              <motion.div key={selectedDay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-foreground">{new Date(selectedDay + "T00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</h3>
                  <button onClick={() => setSelectedDay(null)} className="p-1 rounded-lg hover:bg-accent text-muted-foreground"><X className="w-4 h-4" /></button>
                </div>
                {dayData ? (
                  <>
                    <div className="rounded-lg bg-master-muted p-3 mb-4">
                      <p className="text-xs text-muted-foreground">Attendance</p>
                      <p className="text-lg font-bold text-master">{dayData.attended}/{dayData.total} <span className="text-sm font-normal">({Math.round((dayData.attended / dayData.total) * 100)}%)</span></p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Students present</p>
                    <div className="space-y-2 max-h-[300px] overflow-auto">
                      {dayAttendance.map(a => (
                        <div key={a.studentId} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                          <AvatarBadge initials={a.avatar} size="sm" accentClass="bg-master-muted text-master" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{a.studentName}</p>
                            <p className="text-xs text-muted-foreground">{a.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">No session on this day.</p>
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <p className="text-sm text-muted-foreground">Click a day to see attendance details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
