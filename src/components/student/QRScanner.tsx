import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Camera, CameraOff, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface QRScannerProps {
  onScanSuccess: (qrCode: string) => void;
  isProcessing?: boolean;
}

export default function QRScanner({ onScanSuccess, isProcessing }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) { // SCANNING state
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch {
        // ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (cameras.length === 0) {
        setError("No camera found on this device");
        setHasPermission(false);
        return;
      }

      setHasPermission(true);

      const scannerId = "qr-reader";
      if (scannerRef.current) {
        try {
          await scannerRef.current.stop();
          scannerRef.current.clear();
        } catch {
          // ignore
        }
      }

      const scanner = new Html5Qrcode(scannerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          stopScanner();
        },
        () => {
          // QR code not found in frame - silent
        }
      );

      setIsScanning(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to access camera";
      if (msg.includes("Permission") || msg.includes("NotAllowed") || msg.includes("denied")) {
        setError("Camera access denied. Please allow camera permissions.");
        setHasPermission(false);
      } else if (msg.includes("NotFound") || msg.includes("No camera")) {
        setError("No camera found on this device.");
        setHasPermission(false);
      } else {
        setError(msg);
      }
    }
  }, [onScanSuccess, stopScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, [stopScanner]);

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-muted border-2 border-border"
      >
        <div id="qr-reader" className="w-full h-full" />

        {!isScanning && hasPermission === null && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Camera className="w-16 h-16 text-student mb-4" />
            </motion.div>
            <p className="text-sm font-medium text-foreground">Camera Ready</p>
            <p className="text-xs text-muted-foreground mt-1">Tap below to start scanning</p>
          </div>
        )}

        {!isScanning && hasPermission === false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted/80 backdrop-blur-sm">
            <CameraOff className="w-16 h-16 text-destructive mb-4" />
            <p className="text-sm font-medium text-foreground">Camera Unavailable</p>
            <p className="text-xs text-muted-foreground mt-1 text-center px-4">
              {error || "Please allow camera access"}
            </p>
          </div>
        )}

        {isScanning && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="absolute inset-4 border-2 border-student/50 rounded-xl">
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-student shadow-lg shadow-student/50"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
              />
            </div>
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-student rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-student rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-student rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-student rounded-br-lg" />
          </motion.div>
        )}
      </div>

      {error && isScanning === false && hasPermission !== false && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      <div className="flex gap-2">
        {!isScanning ? (
          <Button
            onClick={startScanner}
            disabled={isProcessing}
            className="flex-1 gradient-student text-student-foreground border-0 hover:opacity-90"
          >
            <ScanLine className="w-4 h-4 mr-2" />
            {hasPermission === false ? "Retry Camera" : "Start Camera"}
          </Button>
        ) : (
          <Button
            onClick={stopScanner}
            variant="outline"
            className="flex-1"
          >
            <CameraOff className="w-4 h-4 mr-2" />
            Stop Camera
          </Button>
        )}
      </div>
    </div>
  );
}
