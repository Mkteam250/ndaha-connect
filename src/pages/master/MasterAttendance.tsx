import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { todayAttendance as initialAttendance } from "@/lib/mock-data";
import { QrCode, CheckCircle2, RefreshCw, Maximize2, MapPin, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

function generateQRValue() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `NDAHA-M001-${ts}-${rand}`;
}

export default function MasterAttendance() {
  const [attendance] = useState(initialAttendance);
  const [qrValue, setQrValue] = useState(generateQRValue);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-regenerate QR every 10 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setQrValue(generateQRValue());
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRegenerate = () => {
    setQrValue(generateQRValue());
    toast({ title: "QR code regenerated!" });
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
          setLocationDenied(false);
          toast({ title: "Location enabled successfully!" });
        },
        () => {
          setLocationDenied(true);
          setLocationEnabled(false);
        }
      );
    } else {
      setLocationDenied(true);
    }
  };

  return (
    <div>
      <PageHeader title="Attendance" description="Tuesday, March 31, 2026" />

      {/* Location Permission Banner */}
      {!locationEnabled && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-master-muted flex items-center justify-center">
              <MapPin className="w-5 h-5 text-master" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Enable Location</p>
              <p className="text-xs text-muted-foreground">Location must be enabled so students within range can check in.</p>
            </div>
          </div>
          {locationDenied && (
            <div className="flex items-center gap-2 mb-3 text-destructive">
              <XCircle className="w-4 h-4" />
              <p className="text-xs">Location denied. Please allow location in your browser settings.</p>
            </div>
          )}
          <Button onClick={handleEnableLocation} className="gradient-master text-master-foreground border-0 hover:opacity-90 w-full">
            <MapPin className="w-4 h-4 mr-2" /> Enable Location
          </Button>
        </motion.div>
      )}

      {locationEnabled && (
        <div className="flex items-center gap-2 mb-4 text-master">
          <CheckCircle2 className="w-4 h-4" />
          <p className="text-xs font-medium">Location enabled — students nearby can check in</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* QR Code Display */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <QrCode className="w-4 h-4" /> Your QR Code
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Display this QR code so students can scan it to check in.
          </p>
          <div className="aspect-square max-w-[280px] mx-auto rounded-xl bg-background border border-border flex items-center justify-center p-4 mb-4">
            <QRCodeSVG
              value={qrValue}
              size={240}
              bgColor="transparent"
              fgColor="currentColor"
              className="text-foreground w-full h-full"
              level="M"
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center font-mono break-all mb-4">{qrValue}</p>

          <div className="flex gap-2 mb-2">
            <Button onClick={handleRegenerate} variant="outline" className="flex-1">
              <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
            </Button>
            <Button onClick={() => navigate("/master/qr-display")} variant="outline" className="flex-1">
              <Maximize2 className="w-4 h-4 mr-2" /> Full Screen
            </Button>
          </div>
          <Button
            onClick={() => { setAutoRefresh(!autoRefresh); toast({ title: autoRefresh ? "Auto-refresh stopped" : "QR auto-refreshes every 10s" }); }}
            variant={autoRefresh ? "default" : "outline"}
            className={`w-full ${autoRefresh ? "gradient-master text-master-foreground border-0" : ""}`}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-Refresh ON" : "Enable Auto-Refresh"}
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
