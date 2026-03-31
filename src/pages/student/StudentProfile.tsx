import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

const profile = {
  firstName: "Amina", lastName: "Uwimana", email: "amina@email.com", phone: "+250788001001",
  country: "Rwanda", province: "Kigali", district: "Gasabo", sector: "Kimironko", cell: "Bibare",
  address: "KG 123 St, Kigali", attendedSessions: 21, totalSessions: 22,
};

export default function StudentProfile() {
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="My Profile" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6">
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
    </div>
  );
}
