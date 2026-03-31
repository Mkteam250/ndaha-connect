import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function generateQRValue() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).substring(2, 8);
  return `NDAHA-M001-${ts}-${rand}`;
}

export default function MasterQRDisplay() {
  const [qrValue, setQrValue] = useState(generateQRValue);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setQrValue(generateQRValue());
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/master/attendance")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQrValue(generateQRValue())}
          >
            <RefreshCw className="w-4 h-4 mr-1" /> New Code
          </Button>
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? "gradient-master text-master-foreground border-0" : ""}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto ON" : "Auto OFF"}
          </Button>
        </div>
      </div>

      {/* QR Code */}
      <div className="bg-white rounded-2xl p-8 shadow-xl">
        <QRCodeSVG
          value={qrValue}
          size={320}
          bgColor="#ffffff"
          fgColor="#000000"
          level="M"
        />
      </div>

      <p className="text-sm text-muted-foreground mt-6 text-center">
        Show this QR code to your students so they can check in
      </p>
      <p className="text-[10px] text-muted-foreground font-mono mt-2 break-all max-w-md text-center">{qrValue}</p>

      {autoRefresh && (
        <p className="text-xs text-master mt-3 animate-pulse">Auto-refreshing every 10 seconds</p>
      )}
    </div>
  );
}
