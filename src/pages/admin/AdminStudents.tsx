import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Input } from "@/components/ui/input";
import { students, masters } from "@/lib/mock-data";
import { Search, Eye, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { motion } from "framer-motion";

export default function AdminStudents() {
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getMasterName = (id: string) => masters.find((m) => m.id === id)?.name || "Unknown";

  return (
    <div>
      <PageHeader title="Students" description="All registered students across the platform" />

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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Country</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Enrolled By</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={s.avatar} size="sm" accentClass="bg-student-muted text-student" />
                      <div>
                        <p className="font-medium text-foreground">{s.firstName} {s.lastName}</p>
                        <p className="text-xs text-muted-foreground md:hidden">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{s.email}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{s.country}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{getMasterName(s.masterId)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteTarget(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Student"
        description="This will permanently remove this student from the platform."
        onConfirm={() => setDeleteTarget(null)}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
