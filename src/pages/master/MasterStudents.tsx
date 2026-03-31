import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api, type RegisteredStudent } from "@/lib/api";
import { Search, Eye, Trash2, MapPin, Mail, Phone, BookOpen, User } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function MasterStudents() {
  const { toast } = useToast();
  const [studentsList, setStudentsList] = useState<RegisteredStudent[]>([]);
  const [studentLimit, setStudentLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<RegisteredStudent | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.getMyStudents();
      setStudentsList(res.data?.students || []);
      setStudentLimit(res.data?.studentLimit || 5);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load students";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = studentsList.filter((s) =>
    `${s.name} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const atLimit = studentsList.length >= studentLimit;

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.removeStudent(removeTarget);
      setStudentsList(prev => prev.filter(s => s.id !== removeTarget));
      toast({ title: "Student removed" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove student";
      toast({ title: msg, variant: "destructive" });
    }
    setRemoveTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Students" description="Students registered under you" />

      {/* Limit banner */}
      <div className="mb-4 rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">{studentsList.length}/{studentLimit} students {atLimit ? "(limit reached)" : ""}</p>
          <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <div className={`h-full rounded-full ${atLimit ? "bg-destructive" : "gradient-master"}`} style={{ width: `${Math.min((studentsList.length / studentLimit) * 100, 100)}%` }} />
          </div>
        </div>
        {atLimit && <p className="text-xs text-muted-foreground">Contact admin to increase your student limit.</p>}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No students registered yet. Students can browse and register under you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-student-muted text-student flex items-center justify-center text-base font-bold shrink-0">
                  {s.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground truncate">{s.name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {s.email}
                  </p>
                  {s.country && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {s.country}{s.province ? `, ${s.province}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {s.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{s.bio}</p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setViewStudent(s)} className="flex-1">
                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRemoveTarget(s.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Student */}
      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Student Profile</SheetTitle></SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-student-muted text-student flex items-center justify-center text-2xl font-bold">
                  {viewStudent.initials}
                </div>
                <h2 className="text-lg font-semibold text-foreground mt-3">{viewStudent.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {viewStudent.email}
                </p>
                <span className="text-xs bg-student-muted text-student px-2 py-0.5 rounded-full font-medium mt-2">Student</span>
              </div>

              {viewStudent.bio && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewStudent.bio}</p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border">
                {[
                  ["Phone", viewStudent.phone || "—"],
                  ["Country", viewStudent.country || "—"],
                  ["Province", viewStudent.province || "—"],
                  ["District", viewStudent.district || "—"],
                  ["Other Masters", `${viewStudent.masterCount}`],
                  ["Registered", new Date(viewStudent.registeredAt).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove Student"
        description="This will remove the student from your enrollment. They can register again later."
        onConfirm={handleRemove}
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
