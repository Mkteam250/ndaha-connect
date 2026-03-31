import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { masters as initialMasters } from "@/lib/mock-data";
import { Search, Eye, Pencil, Trash2, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function AdminMasters() {
  const [masters, setMasters] = useState(initialMasters);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editLimitId, setEditLimitId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState(5);

  const filtered = masters.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id: string) => {
    setMasters((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "suspended" as const : "active" as const } : m));
  };

  const openEditLimit = (id: string) => {
    const m = masters.find((m) => m.id === id);
    if (m) { setNewLimit(m.studentLimit); setEditLimitId(id); }
  };

  const saveLimit = () => {
    if (editLimitId) {
      setMasters((prev) => prev.map((m) => m.id === editLimitId ? { ...m, studentLimit: newLimit } : m));
      setEditLimitId(null);
    }
  };

  return (
    <div>
      <PageHeader title="Masters" description="Manage master accounts and student limits" />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search masters..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Master</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Students</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Limit</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <motion.tr key={m.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarBadge initials={m.avatar} size="sm" accentClass="bg-admin-muted text-admin" />
                      <span className="font-medium text-foreground">{m.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.email}</td>
                  <td className="px-4 py-3 text-foreground">{m.studentsEnrolled}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-foreground font-medium">{m.studentLimit}</span>
                      <button onClick={() => openEditLimit(m.id)} className="p-1 rounded hover:bg-accent text-muted-foreground"><Pencil className="w-3 h-3" /></button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.status === "active" ? "bg-student-muted text-student" : "bg-destructive/10 text-destructive"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatus(m.id)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground text-xs font-medium">
                        {m.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button onClick={() => setDeleteTarget(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit limit dialog */}
      <Dialog open={!!editLimitId} onOpenChange={() => setEditLimitId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Student Limit</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center gap-4 py-4">
            <Button variant="outline" size="icon" onClick={() => setNewLimit(Math.max(1, newLimit - 1))}><Minus className="w-4 h-4" /></Button>
            <span className="text-3xl font-bold text-foreground w-16 text-center">{newLimit}</span>
            <Button variant="outline" size="icon" onClick={() => setNewLimit(newLimit + 1)}><Plus className="w-4 h-4" /></Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditLimitId(null)}>Cancel</Button>
            <Button onClick={saveLimit} className="gradient-admin text-admin-foreground border-0 hover:opacity-90">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Master"
        description="This will permanently remove this master account and all associated data."
        onConfirm={() => { setMasters((prev) => prev.filter((m) => m.id !== deleteTarget)); setDeleteTarget(null); }}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
