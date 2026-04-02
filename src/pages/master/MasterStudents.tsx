import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { api, type RegisteredStudent, type SearchStudent } from "@/lib/api";
import {
  Search,
  Eye,
  Trash2,
  MapPin,
  Mail,
  Phone,
  User,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GraduationCap,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type SortField = "name" | "email" | "createdAt" | "country";
type SortOrder = "asc" | "desc";

export default function MasterStudents() {
  const { toast } = useToast();

  // My students state
  const [studentsList, setStudentsList] = useState<RegisteredStudent[]>([]);
  const [studentLimit, setStudentLimit] = useState(5);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Remove state
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  // View student state
  const [viewStudent, setViewStudent] = useState<RegisteredStudent | null>(null);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);

  // Add student dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<SearchStudent[]>([]);
  const [allStudentsLoading, setAllStudentsLoading] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSortField, setAddSortField] = useState<SortField>("name");
  const [addSortOrder, setAddSortOrder] = useState<SortOrder>("asc");
  const [addPage, setAddPage] = useState(1);
  const [addTotal, setAddTotal] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [registering, setRegistering] = useState<string | null>(null);
  const addLimit = 12;

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

  // Fetch all students for add dialog
  const fetchAllStudents = useCallback(async () => {
    setAllStudentsLoading(true);
    try {
      const res = await api.searchAllStudents({
        search: addSearch || undefined,
        sortBy: addSortField,
        order: addSortOrder,
        page: addPage,
        limit: addLimit,
      });
      setAllStudents(res.data?.students || []);
      setAddTotal(res.data?.total || 0);
      setRegisteredCount(res.data?.registeredCount || 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load students";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setAllStudentsLoading(false);
    }
  }, [addSearch, addSortField, addSortOrder, addPage, toast]);

  useEffect(() => {
    if (addDialogOpen) {
      fetchAllStudents();
    }
  }, [addDialogOpen, fetchAllStudents]);

  // Filtered and sorted my students
  const filtered = studentsList
    .filter((s) =>
      `${s.name} ${s.email} ${s.country || ""} ${s.province || ""}`.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "email":
          cmp = a.email.localeCompare(b.email);
          break;
        case "createdAt":
          cmp = new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime();
          break;
        case "country":
          cmp = (a.country || "").localeCompare(b.country || "");
          break;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

  const atLimit = studentsList.length >= studentLimit;
  const addAtLimit = registeredCount >= studentLimit;

  const handleRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.removeStudent(removeTarget);
      setStudentsList((prev) => prev.filter((s) => s.id !== removeTarget));
      toast({ title: "Student removed" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove student";
      toast({ title: msg, variant: "destructive" });
    }
    setRemoveTarget(null);
  };

  const handleRegisterStudent = async (studentId: string) => {
    setRegistering(studentId);
    try {
      await api.registerStudent(studentId);
      toast({ title: "Student registered successfully" });
      fetchAllStudents();
      fetchStudents();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to register student";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setRegistering(null);
    }
  };

  const handleAvatarUpload = async (studentId: string, base64: string) => {
    setUploadingAvatar(studentId);
    try {
      await api.updateUserAvatar(studentId, base64);
      setStudentsList((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, avatar: base64 } : s))
      );
      if (viewStudent?.id === studentId) {
        setViewStudent((prev) => (prev ? { ...prev, avatar: base64 } : null));
      }
      toast({ title: "Photo updated" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload photo";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setUploadingAvatar(null);
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-master" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-master" />
    );
  };

  const totalPages = Math.ceil(addTotal / addLimit);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Students" description="Manage students registered under you">
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gradient-master text-master-foreground border-0 hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </PageHeader>

      {/* Limit banner */}
      <div className="mb-4 rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">
            {studentsList.length}/{studentLimit} students {atLimit ? "(limit reached)" : ""}
          </p>
          <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${atLimit ? "bg-destructive" : "gradient-master"}`}
              style={{ width: `${Math.min((studentsList.length / studentLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
        {atLimit && (
          <p className="text-xs text-muted-foreground">Contact admin to increase your student limit.</p>
        )}
      </div>

      {/* Search and sort controls */}
      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, email, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("name")}
            className="gap-1.5 text-xs"
          >
            Name <SortIcon field="name" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("createdAt")}
            className="gap-1.5 text-xs"
          >
            Date <SortIcon field="createdAt" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toggleSort("country")}
            className="gap-1.5 text-xs hidden sm:flex"
          >
            Location <SortIcon field="country" />
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">
            {search ? "No students match your search." : "No students registered yet."}
          </p>
          {!search && (
            <Button variant="outline" onClick={() => setAddDialogOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add your first student
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    {s.avatar ? (
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-student-muted"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-student-muted text-student flex items-center justify-center text-base font-bold">
                        {s.initials}
                      </div>
                    )}
                    {uploadingAvatar === s.id && (
                      <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">{s.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" /> {s.email}
                    </p>
                    {s.country && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" /> {s.country}
                        {s.province ? `, ${s.province}` : ""}
                      </p>
                    )}
                  </div>
                </div>

                {s.bio && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{s.bio}</p>
                )}

                <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                  <span>{s.masterCount} master{s.masterCount !== 1 ? "s" : ""}</span>
                  <span>Joined {new Date(s.registeredAt).toLocaleDateString("en", { month: "short", year: "numeric" })}</span>
                </div>

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
          </AnimatePresence>
        </div>
      )}

      {/* View Student Sheet */}
      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
          </SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center">
                <AvatarUpload
                  currentAvatar={viewStudent.avatar}
                  initials={viewStudent.initials}
                  size="xl"
                  accentClass="bg-student-muted text-student"
                  onUpload={(base64) => handleAvatarUpload(viewStudent.id, base64)}
                  disabled={uploadingAvatar === viewStudent.id}
                />
                <h2 className="text-lg font-semibold text-foreground mt-3">{viewStudent.name}</h2>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> {viewStudent.email}
                </p>
                <Badge className="mt-2 bg-student-muted text-student border-0">Student</Badge>
              </div>

              {viewStudent.bio && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewStudent.bio}</p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border">
                {([
                  ["Phone", viewStudent.phone || "\u2014"],
                  ["Country", viewStudent.country || "\u2014"],
                  ["Province", viewStudent.province || "\u2014"],
                  ["District", viewStudent.district || "\u2014"],
                  ["Other Masters", `${viewStudent.masterCount}`],
                  [
                    "Registered",
                    new Date(viewStudent.registeredAt).toLocaleDateString("en", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }),
                  ],
                ] as const).map(([label, value]) => (
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

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-master" />
              Add Students
            </DialogTitle>
            <DialogDescription>
              Browse and register students from the system. {registeredCount}/{studentLimit} slots used.
            </DialogDescription>
          </DialogHeader>

          {addAtLimit && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              You have reached your student limit of {studentLimit}. Contact admin to increase.
            </div>
          )}

          {/* Search and sort */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, location..."
                value={addSearch}
                onChange={(e) => {
                  setAddSearch(e.target.value);
                  setAddPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select
              value={`${addSortField}-${addSortOrder}`}
              onValueChange={(val) => {
                const [field, order] = val.split("-") as [SortField, SortOrder];
                setAddSortField(field);
                setAddSortOrder(order);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="createdAt-desc">Newest first</SelectItem>
                <SelectItem value="createdAt-asc">Oldest first</SelectItem>
                <SelectItem value="email-asc">Email (A-Z)</SelectItem>
                <SelectItem value="country-asc">Location (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {allStudentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-master animate-spin" />
              </div>
            ) : allStudents.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">
                  {addSearch ? "No students match your search." : "No students available in the system."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                {allStudents.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className={`rounded-lg border p-3 flex items-start gap-3 transition-colors ${
                      s.isRegistered
                        ? "border-student/30 bg-student/5"
                        : "border-border bg-card hover:bg-accent/30"
                    }`}
                  >
                    <div className="shrink-0">
                      {s.avatar ? (
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-student-muted text-student flex items-center justify-center text-sm font-bold">
                          {s.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground truncate">{s.name}</h4>
                        {s.isRegistered && (
                          <Badge variant="outline" className="text-xs border-student/30 text-student shrink-0">
                            Registered
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      {s.country && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" /> {s.country}
                          {s.province ? `, ${s.province}` : ""}
                        </p>
                      )}
                    </div>
                    {!s.isRegistered && !addAtLimit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRegisterStudent(s.id)}
                        disabled={registering === s.id}
                        className="shrink-0 text-master border-master/30 hover:bg-master/10"
                      >
                        {registering === s.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 mr-1" /> Add
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(addPage - 1) * addLimit + 1}-{Math.min(addPage * addLimit, addTotal)} of {addTotal}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddPage((p) => Math.max(1, p - 1))}
                  disabled={addPage <= 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-xs text-muted-foreground px-2">
                  {addPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddPage((p) => Math.min(totalPages, p + 1))}
                  disabled={addPage >= totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
