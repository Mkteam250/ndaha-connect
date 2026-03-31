import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { students as allStudents } from "@/lib/mock-data";
import { Search, Eye, Pencil, Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const masterStudents = allStudents.filter((s) => s.masterId === "M001");
const LIMIT = 5;

export default function MasterStudents() {
  const [search, setSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<typeof masterStudents[0] | null>(null);

  const filtered = masterStudents.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const atLimit = masterStudents.length >= LIMIT;

  return (
    <div>
      <PageHeader title="Students" description="Manage your enrolled students">
        <Button disabled={atLimit} className="gradient-master text-master-foreground border-0 hover:opacity-90" title={atLimit ? "Contact admin to increase limit" : ""}>
          <Plus className="w-4 h-4 mr-1" /> Add Student
        </Button>
      </PageHeader>

      {/* Limit banner */}
      <div className="mb-4 rounded-lg border border-border bg-card p-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">{masterStudents.length}/{LIMIT} students (limit {atLimit ? "reached" : ""})</p>
          <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
            <div className={`h-full rounded-full ${atLimit ? "bg-destructive" : "gradient-master"}`} style={{ width: `${(masterStudents.length / LIMIT) * 100}%` }} />
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Attendance</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={s.avatar} size="sm" accentClass="bg-master-muted text-master" />
                      <div>
                        <p className="font-medium text-foreground">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.country}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full rounded-full gradient-master" style={{ width: `${s.attendanceRate}%` }} />
                      </div>
                      <span className="text-xs font-medium text-foreground">{s.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setViewStudent(s)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setRemoveTarget(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!viewStudent} onOpenChange={() => setViewStudent(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Student Profile</SheetTitle>
          </SheetHeader>
          {viewStudent && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                <AvatarBadge initials={viewStudent.avatar} size="lg" accentClass="bg-master-muted text-master" />
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{viewStudent.firstName} {viewStudent.lastName}</p>
                <p className="text-sm text-muted-foreground">{viewStudent.email}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  ["Phone", viewStudent.phone],
                  ["Country", viewStudent.country],
                  ["Province", viewStudent.province],
                  ["Enrolled", viewStudent.enrolledDate],
                  ["Attendance", `${viewStudent.attendanceRate}%`],
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

      <ConfirmModal
        open={!!removeTarget}
        onOpenChange={() => setRemoveTarget(null)}
        title="Remove Student"
        description="This will remove the student from your enrollment. This action cannot be undone."
        onConfirm={() => setRemoveTarget(null)}
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
