import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { todayAttendance as initialAttendance } from "@/lib/mock-data";
import { QrCode, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const MASTER_QR_CODE = "NDAHA-MASTER-M001-DR-BIZIMUNGU";

export default function MasterAttendance() {
  const [attendance] = useState(initialAttendance);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(MASTER_QR_CODE);
    setCopied(true);
    toast({ title: "QR code value copied!" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Tuesday, March 31, 2026" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display for students to scan */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Your QR Code
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Display this QR code so students can scan it to check in.
          </p>
          <div className="aspect-square max-w-[280px] mx-auto rounded-xl bg-background border-2 border-dashed border-master/30 flex flex-col items-center justify-center p-6 mb-4">
            {/* Simulated QR code pattern */}
            <div className="w-full h-full bg-foreground/5 rounded-lg flex flex-col items-center justify-center gap-3">
              <QrCode className="w-24 h-24 text-master" />
              <p className="text-xs text-muted-foreground text-center font-mono break-all">{MASTER_QR_CODE}</p>
            </div>
          </div>
          <Button onClick={handleCopyCode} variant="outline" className="w-full">
            {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-student" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy QR Value"}
          </Button>
        </motion.div>

        {/* Today's checklist */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Today's Check-ins</h3>
          <div className="space-y-2 max-h-[400px] overflow-auto">
            {attendance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No check-ins yet today.</p>
            ) : (
              attendance.map((a) => (
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
                  <CheckCircle2 className="w-4 h-4 text-student shrink-0" />
                </motion.div>
              ))
            )}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{attendance.length}</span> students checked in today
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
