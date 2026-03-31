import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Pencil, MapPin, Mail, Phone, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api, type Student } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function StudentProfile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getMyProfile();
        setStudent(res.data?.student ?? null);
      } catch {
        // Profile may not exist yet
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-student border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground mb-4">No profile found. Complete your registration first.</p>
        <Button onClick={() => navigate("/student/signup")} className="gradient-student text-student-foreground border-0 hover:opacity-90">
          Complete Registration
        </Button>
      </div>
    );
  }

  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  return (
    <div>
      <PageHeader title="My Profile" description="View and manage your information" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-student-muted text-student flex items-center justify-center text-3xl font-bold">
            {initials}
          </div>
          <h2 className="text-xl font-semibold text-foreground mt-3">{student.firstName} {student.lastName}</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Mail className="w-3.5 h-3.5" /> {student.email}
          </p>
          {student.masterId && (
            <p className="text-xs text-master mt-1 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5" /> {student.masterId.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            ["Phone", student.phone || "—"],
            ["Country", student.country || "—"],
            ["Province", student.province || "—"],
            ["District", student.district || "—"],
            ["Sector", student.sector || "—"],
            ["Cell", student.cell || "—"],
          ].map(([label, value]) => (
            <div key={label} className="text-sm">
              <span className="text-muted-foreground">{label}</span>
              <p className="font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>

        {student.address && (
          <div className="mb-6 text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Address
            </span>
            <p className="font-medium text-foreground">{student.address}</p>
          </div>
        )}

        <div className="rounded-lg bg-student-muted p-4 mb-6">
          <p className="text-sm font-medium text-foreground">Enrolled Since</p>
          <p className="text-lg font-bold text-student mt-1">
            {new Date(student.enrolledDate).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        <Button onClick={() => navigate("/student/signup")} variant="outline" className="w-full">
          <Pencil className="w-4 h-4 mr-2" /> Edit Profile
        </Button>
      </motion.div>
    </div>
  );
}
