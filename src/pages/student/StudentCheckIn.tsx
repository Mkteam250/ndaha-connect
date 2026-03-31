import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CheckCircle2, ScanLine, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import QRScanner from "@/components/student/QRScanner";

export default function StudentCheckIn() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [checkedIn, setCheckedIn] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkInData, setCheckInData] = useState<{ time: string; date: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanSuccess = async (qrCode: string) => {
    setProcessing(true);
    setError(null);
    try {
      const res = await api.checkIn({ qrCode });
      if (res.data?.attendance) {
        setCheckedIn(true);
        setCheckInData({
          time: res.data.attendance.time,
          date: res.data.attendance.date,
          status: res.data.attendance.status,
        });
        toast({ title: "Successfully checked in!" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Check-in failed";
      setError(msg);
      toast({ title: msg, variant: "destructive" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div>
      <PageHeader title="Check In" description="Scan your master's QR code to mark attendance" />

      {!checkedIn ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <ScanLine className="w-5 h-5 text-student" />
            <h3 className="text-lg font-semibold text-foreground">QR Scanner</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Point your camera at the QR code displayed by your master. Make sure you have good lighting and hold your device steady.
          </p>

          {processing ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-2 border-student border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-foreground">Processing check-in...</p>
            </div>
          ) : (
            <QRScanner onScanSuccess={handleScanSuccess} isProcessing={processing} />
          )}

          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-lg bg-destructive/10 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-destructive">Check-in Failed</p>
                <p className="text-xs text-destructive/80 mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border border-border bg-card p-6">
          <div className="text-center py-6">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 10 }}>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Checked In!</h3>
            <p className="text-sm text-muted-foreground mb-6">Your attendance has been recorded.</p>

            <div className="rounded-lg bg-student-muted p-4 max-w-xs mx-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium text-foreground">{checkInData?.date}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium text-foreground">{checkInData?.time}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className={`font-medium capitalize ${checkInData?.status === "present" ? "text-green-500" : "text-warning"}`}>
                  {checkInData?.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-center mt-6">
              <Button onClick={() => navigate("/student/dashboard")} className="gradient-student text-student-foreground border-0 hover:opacity-90">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => { setCheckedIn(false); setCheckInData(null); setError(null); }}>
                Scan Another
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
