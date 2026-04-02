import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { api, type AdminStudent } from "@/lib/api";
import { Search, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Users } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type SortField = "name" | "email" | "createdAt" | "country";
type SortOrder = "asc" | "desc";

export default function AdminStudents() {
  const { toast } = useToast();
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<AdminStudent | null>(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await api.getAdminStudents();
      setStudents(res.data?.students || []);
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students
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
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "country":
          cmp = (a.country || "").localeCompare(b.country || "");
          break;
      }
      return sortOrder === "desc" ? -cmp : cmp;
    });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAdminUser(deleteTarget);
      setStudents((prev) => prev.filter((s) => s.id !== deleteTarget));
      toast({ title: "Student deleted" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to delete", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortHeader = ({ field, label }: { field: SortField; label: string }) => (
    <button
      onClick={() => toggleSort(field)}
      className="flex items-center gap-1 text-left font-medium text-muted-foreground hover:text-foreground transition-colors"
    >
      {label}
      {sortField === field ? (
        sortOrder === "asc" ? (
          <ArrowUp className="w-3.5 h-3.5 text-admin" />
        ) : (
          <ArrowDown className="w-3.5 h-3.5 text-admin" />
        )
      ) : (
        <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-admin border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Students" description="All registered students across the platform" />

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
        <Select
          value={`${sortField}-${sortOrder}`}
          onValueChange={(val) => {
            const [field, order] = val.split("-") as [SortField, SortOrder];
            setSortField(field);
            setSortOrder(order);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest first</SelectItem>
            <SelectItem value="createdAt-asc">Oldest first</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            <SelectItem value="email-asc">Email (A-Z)</SelectItem>
            <SelectItem value="country-asc">Location (A-Z)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {search ? "No students match your search." : "No students in the system."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3">
                    <SortHeader field="name" label="Student" />
                  </th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">
                    <SortHeader field="email" label="Email" />
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">
                    <SortHeader field="country" label="Country" />
                  </th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell font-medium text-muted-foreground">Masters</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {s.avatar ? (
                          <img
                            src={s.avatar}
                            alt={s.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-student-muted text-student flex items-center justify-center text-xs font-bold shrink-0">
                            {s.initials}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.country || "\u2014"}</td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {s.masterCount}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewStudent(s)}
                          className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s.id)}
                          className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Student */}
      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
          </SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                {viewStudent.avatar ? (
                  <img
                    src={viewStudent.avatar}
                    alt={viewStudent.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-student-muted"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-student-muted text-student flex items-center justify-center text-2xl font-bold">
                    {viewStudent.initials}
                  </div>
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{viewStudent.name}</p>
                <p className="text-sm text-muted-foreground">{viewStudent.email}</p>
                <Badge className="mt-2 bg-student-muted text-student border-0">Student</Badge>
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                {([
                  ["Bio", viewStudent.bio || "\u2014"],
                  ["Country", viewStudent.country || "\u2014"],
                  ["Province", viewStudent.province || "\u2014"],
                  ["Registered Masters", `${viewStudent.masterCount}`],
                  ["Joined", new Date(viewStudent.createdAt).toLocaleDateString()],
                ] as const).map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Student"
        description="This will permanently remove this student from the platform."
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
