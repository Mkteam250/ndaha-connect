import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { students, todayAttendance as initialAttendance } from "@/lib/mock-data";
import { ScanLine, Search, Trash2, CheckCircle2, Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const masterStudents = students.filter((s) => s.masterId === "M001");

export default function MasterAttendance() {
  const [attendance, setAttendance] = useState(initialAttendance);
  const [searchQuery, setSearchQuery] = useState("");
  const [lastScanned, setLastScanned] = useState<string | null>(attendance[attendance.length - 1]?.studentName ?? null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const handleManualAdd = () => {
    const found = masterStudents.find(
      (s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase() === searchQuery.toLowerCase()
    );
    if (found && !attendance.find((a) => a.studentId === found.id)) {
      const now = new Date();
      const newRecord = {
        studentId: found.id,
        studentName: `${found.firstName} ${found.lastName}`,
        avatar: found.avatar,
        time: now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", hour12: false }),
        date: now.toISOString().split("T")[0],
      };
      setAttendance((prev) => [...prev, newRecord]);
      setLastScanned(newRecord.studentName);
      setSearchQuery("");
    }
  };

  const handleRemove = () => {
    if (removeTarget) {
      setAttendance((prev) => prev.filter((a) => a.studentId !== removeTarget));
      setRemoveTarget(null);
    }
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Tuesday, March 31, 2026" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Scanner panel */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4" /> QR Scanner
          </h3>
          <div className="aspect-video rounded-lg bg-muted/50 border border-dashed border-border flex flex-col items-center justify-center mb-4">
            <ScanLine className="w-12 h-12 text-master animate-pulse-soft mb-2" />
            <p className="text-sm text-muted-foreground">Camera viewport — scan student QR code</p>
            <p className="text-xs text-muted-foreground mt-1">Position QR code within the frame</p>
          </div>

          <AnimatePresence mode="wait">
            {lastScanned && (
              <motion.div
                key={lastScanned}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-student-muted mb-4"
              >
                <CheckCircle2 className="w-5 h-5 text-student" />
                <div>
                  <p className="text-sm font-medium text-foreground">{lastScanned}</p>
                  <p className="text-xs text-muted-foreground">Checked in successfully</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2">
            <Input
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualAdd()}
            />
            <Button onClick={handleManualAdd} variant="outline" size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Today's checklist */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's Checklist</h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {attendance.map((a) => (
              <motion.div
                key={a.studentId}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <AvatarBadge initials={a.avatar} size="sm" accentClass="bg-master-muted text-master" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.studentName}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <button onClick={() => setRemoveTarget(a.studentId)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{attendance.length}</span> / {masterStudents.length} students present
            </p>
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove Check-in"
        description="Are you sure you want to remove this student's attendance record?"
        onConfirm={handleRemove}
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
