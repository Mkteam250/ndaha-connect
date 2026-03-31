import { useState, useEffect, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function MasterQRDisplay() {
  const [qrValue, setQrValue] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateQR = useCallback(async () => {
    try {
      const res = await api.generateQR();
      if (res.data?.session) {
        setQrValue(res.data.session.code);
      }
    } catch {
      toast({ title: "Failed to generate QR", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    generateQR();
  }, [generateQR]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      generateQR();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, generateQR]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/master/attendance")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateQR}
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

      <div className="bg-white rounded-2xl p-8 shadow-xl">
        {qrValue ? (
          <QRCodeSVG
            value={qrValue}
            size={320}
            bgColor="#ffffff"
            fgColor="#000000"
            level="M"
          />
        ) : (
          <div className="w-[320px] h-[320px] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
          </div>
        )}
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
