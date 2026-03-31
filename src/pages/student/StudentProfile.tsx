import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Pencil, ScanLine, MapPin, CheckCircle2, XCircle, Camera } from "lucide-react";
import { useNavigate } from "react-router-dom";

const profile = {
  firstName: "Amina", lastName: "Uwimana", email: "amina@email.com", phone: "+250788001001",
  country: "Rwanda", province: "Kigali", district: "Gasabo", sector: "Kimironko", cell: "Bibare",
  address: "KG 123 St, Kigali", attendedSessions: 21, totalSessions: 22,
};

export default function StudentProfile() {
  const navigate = useNavigate();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);
  const [masterName] = useState("Dr. François Bizimungu");

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
          setLocationDenied(false);
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

  const handleSimulateScan = () => {
    // Simulate successful QR scan
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setCheckedIn(true);
    }, 2000);
  };

  return (
    <div>
      <PageHeader title="My Profile" />

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 mb-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-student-muted text-student flex items-center justify-center text-3xl font-bold">
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <span className="text-xs text-background font-medium">Change</span>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-3">{profile.firstName} {profile.lastName}</h2>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            ["Phone", profile.phone], ["Country", profile.country],
            ["Province", profile.province], ["District", profile.district],
            ["Sector", profile.sector], ["Cell", profile.cell],
          ].map(([label, value]) => (
            <div key={label} className="text-sm">
              <span className="text-muted-foreground">{label}</span>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-student-muted p-4 mb-6">
          <p className="text-sm font-medium text-foreground">Attendance Summary</p>
          <p className="text-2xl font-bold text-student mt-1">{profile.attendedSessions}/{profile.totalSessions} sessions</p>
          <div className="w-full h-2 bg-background rounded-full mt-2 overflow-hidden">
            <div className="h-full rounded-full gradient-student" style={{ width: `${(profile.attendedSessions / profile.totalSessions) * 100}%` }} />
          </div>
        </div>

        <Button onClick={() => navigate("/student/signup")} className="gradient-student text-student-foreground border-0 hover:opacity-90 w-full">
          <Pencil className="w-4 h-4 mr-1" /> Edit Profile
        </Button>
      </motion.div>

      {/* QR Scanner Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border bg-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
          <Camera className="w-5 h-5" /> Check In
        </h3>
        <p className="text-sm text-muted-foreground mb-4">Scan your master's QR code to mark your attendance.</p>

        {/* Location permission */}
        {!locationEnabled && (
          <div className="rounded-lg border border-border bg-muted/30 p-4 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Location Required</p>
                <p className="text-xs text-muted-foreground">You must enable location to check in.</p>
              </div>
            </div>
            {locationDenied && (
              <div className="flex items-center gap-2 mb-3 text-destructive">
                <XCircle className="w-4 h-4" />
                <p className="text-xs">Location denied. Please allow location in your browser settings.</p>
              </div>
            )}
            <Button onClick={handleEnableLocation} variant="outline" className="w-full">
              <MapPin className="w-4 h-4 mr-2" /> Enable Location
            </Button>
          </div>
        )}

        {locationEnabled && !checkedIn && (
          <>
            <div className="flex items-center gap-2 mb-4 text-student">
              <CheckCircle2 className="w-4 h-4" />
              <p className="text-xs font-medium">Location enabled</p>
            </div>
            <div className="aspect-video rounded-lg bg-muted/50 border border-dashed border-border flex flex-col items-center justify-center mb-4">
              {scanning ? (
                <>
                  <ScanLine className="w-12 h-12 text-student animate-pulse mb-2" />
                  <p className="text-sm text-muted-foreground">Scanning...</p>
                </>
              ) : (
                <>
                  <ScanLine className="w-12 h-12 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Camera viewport — scan master's QR code</p>
                  <p className="text-xs text-muted-foreground mt-1">Point your camera at the master's QR code</p>
                </>
              )}
            </div>
            <Button onClick={handleSimulateScan} disabled={scanning} className="gradient-student text-student-foreground border-0 hover:opacity-90 w-full">
              <ScanLine className="w-4 h-4 mr-2" /> {scanning ? "Scanning..." : "Simulate Scan"}
            </Button>
          </>
        )}

        {checkedIn && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-lg bg-student-muted p-4 text-center">
            <CheckCircle2 className="w-10 h-10 text-student mx-auto mb-2" />
            <p className="text-lg font-semibold text-foreground">Checked In!</p>
            <p className="text-sm text-muted-foreground mt-1">You checked in with <span className="font-medium text-foreground">{masterName}</span></p>
            <p className="text-xs text-muted-foreground mt-1">{new Date().toLocaleTimeString()}</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
