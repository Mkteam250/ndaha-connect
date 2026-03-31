import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api, type Student } from "@/lib/api";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function MasterStudents() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", email: "", phone: "", country: "", province: "" });

  const LIMIT = user?.studentLimit || 5;

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.getStudents();
      setStudentsList(res.data?.students || []);
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
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );
  const atLimit = studentsList.length >= LIMIT;

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.deleteStudent(removeTarget);
      setStudentsList(prev => prev.filter(s => s._id !== removeTarget));
      toast({ title: "Student removed" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove student";
      toast({ title: msg, variant: "destructive" });
    }
    setRemoveTarget(null);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setAddingNew(false);
    setEditForm({ firstName: s.firstName, lastName: s.lastName, email: s.email, phone: s.phone, country: s.country, province: s.province });
  };

  const openAdd = () => {
    setAddingNew(true);
    setEditStudent(null);
    setEditForm({ firstName: "", lastName: "", email: "", phone: "", country: "", province: "" });
  };

  const handleSaveEdit = async () => {
    if (!editForm.firstName || !editForm.lastName || !editForm.email) return;
    setSaving(true);
    try {
      if (editStudent) {
        await api.updateStudent(editStudent._id, editForm);
        toast({ title: "Student updated" });
      } else {
        await api.createStudent(editForm);
        toast({ title: "Student added" });
      }
      await fetchStudents();
      setEditStudent(null);
      setAddingNew(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to save student";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const showEditPanel = !!editStudent || addingNew;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Students" description="Manage your enrolled students">
        <Button disabled={atLimit} onClick={openAdd} className="gradient-master text-master-foreground border-0 hover:opacity-90" title={atLimit ? "Contact admin to increase limit" : ""}>
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </PageHeader>

      {/* Limit banner */}
      <div className="mb-4 rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">{studentsList.length}/{LIMIT} students (limit {atLimit ? "reached" : ""})</p>
          <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <div className={`h-full rounded-full ${atLimit ? "bg-destructive" : "gradient-master"}`} style={{ width: `${Math.min((studentsList.length / LIMIT) * 100, 100)}%` }} />
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

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Country</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={`${s.firstName[0]}${s.lastName[0]}`.toUpperCase()} size="sm" accentClass="bg-master-muted text-master" />
                      <div>
                        <p className="font-medium text-foreground">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.country || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewStudent(s)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setRemoveTarget(s._id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Student */}
      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Student Profile</SheetTitle></SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                <AvatarBadge initials={`${viewStudent.firstName[0]}${viewStudent.lastName[0]}`.toUpperCase()} size="lg" accentClass="bg-master-muted text-master" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{viewStudent.firstName} {viewStudent.lastName}</p>
                <p className="text-sm text-muted-foreground">{viewStudent.email}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  ["Phone", viewStudent.phone || "—"],
                  ["Country", viewStudent.country || "—"],
                  ["Province", viewStudent.province || "—"],
                  ["Enrolled", new Date(viewStudent.enrolledDate).toLocaleDateString()],
                  ["Status", viewStudent.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Edit/Add Student */}
      <Sheet open={showEditPanel} onOpenChange={() => { setEditStudent(null); setAddingNew(false); }}>
        <SheetContent>
          <SheetHeader><SheetTitle>{editStudent ? "Edit Student" : "Add Student"}</SheetTitle></SheetHeader>
          <div className="mt-6 space-y-4">
            <div><Label>First Name</Label><Input value={editForm.firstName} onChange={e => setEditForm({ ...editForm, firstName: e.target.value })} /></div>
            <div><Label>Last Name</Label><Input value={editForm.lastName} onChange={e => setEditForm({ ...editForm, lastName: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} /></div>
            <div><Label>Country</Label><Input value={editForm.country} onChange={e => setEditForm({ ...editForm, country: e.target.value })} /></div>
            <div><Label>Province</Label><Input value={editForm.province} onChange={e => setEditForm({ ...editForm, province: e.target.value })} /></div>
            <Button onClick={handleSaveEdit} disabled={saving} className="gradient-master text-master-foreground border-0 hover:opacity-90 w-full">
              {saving ? "Saving..." : editStudent ? "Save Changes" : "Add Student"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove Student"
        description="This will remove the student from your enrollment. This action cannot be undone."
        onConfirm={handleRemove}
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
