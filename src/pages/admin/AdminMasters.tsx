import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { AvatarBadge } from "@/components/ui/avatar-badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api, type AdminMaster } from "@/lib/api";
import { Search, Eye, Pencil, Trash2, Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function AdminMasters() {
  const { toast } = useToast();
  const [masters, setMasters] = useState<AdminMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editLimitId, setEditLimitId] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState(5);
  const [viewMaster, setViewMaster] = useState<AdminMaster | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchMasters = useCallback(async () => {
    try {
      const res = await api.getAdminMasters();
      setMasters(res.data?.masters || []);
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to load", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMasters();
  }, [fetchMasters]);

  const filtered = masters.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id: string) => {
    const master = masters.find((m) => m.id === id);
    if (!master) return;
    const newStatus = master.status === "active" ? "suspended" : "active";
    setToggling(id);
    try {
      await api.updateMasterStatus(id, newStatus);
      setMasters((prev) => prev.map((m) => m.id === id ? { ...m, status: newStatus } : m));
      toast({ title: `Master ${newStatus}` });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to update status", variant: "destructive" });
    } finally {
      setToggling(null);
    }
  };

  const openEditLimit = (id: string) => {
    const m = masters.find((m) => m.id === id);
    if (m) { setNewLimit(m.studentLimit); setEditLimitId(id); }
  };

  const saveLimit = async () => {
    if (!editLimitId) return;
    try {
      await api.updateMasterLimit(editLimitId, newLimit);
      setMasters((prev) => prev.map((m) => m.id === editLimitId ? { ...m, studentLimit: newLimit } : m));
      toast({ title: "Limit updated" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to update limit", variant: "destructive" });
    }
    setEditLimitId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteAdminUser(deleteTarget);
      setMasters((prev) => prev.filter((m) => m.id !== deleteTarget));
      toast({ title: "Master deleted" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to delete", variant: "destructive" });
    }
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-admin border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
                      {m.avatar ? (
                        <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <AvatarBadge initials={m.initials} size="sm" accentClass="bg-admin-muted text-admin" />
                      )}
                      <div>
                        <span className="font-medium text-foreground">{m.name}</span>
                        {m.subject && <p className="text-xs text-muted-foreground hidden lg:block">{m.subject}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{m.email}</td>
                  <td className="px-4 py-3 text-foreground">{m.studentCount}</td>
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
                      <button onClick={() => setViewMaster(m)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => toggleStatus(m.id)} disabled={toggling === m.id} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground text-xs font-medium">
                        {toggling === m.id ? "..." : m.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button onClick={() => setDeleteTarget(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No masters found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Master */}
      <Sheet open={!!viewMaster} onOpenChange={() => setViewMaster(null)}>
        <SheetContent>
          <SheetHeader><SheetTitle>Master Profile</SheetTitle></SheetHeader>
          {viewMaster && (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                {viewMaster.avatar ? (
                  <img src={viewMaster.avatar} alt={viewMaster.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-master-muted" />
                ) : (
                  <AvatarBadge initials={viewMaster.initials} size="lg" accentClass="bg-master-muted text-master" />
                )}
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground">{viewMaster.name}</p>
                <p className="text-sm text-muted-foreground">{viewMaster.email}</p>
              </div>
              <div className="space-y-3 pt-4 border-t border-border">
                {[
                  ["Subject", viewMaster.subject || "—"],
                  ["Bio", viewMaster.bio || "—"],
                  ["Students", `${viewMaster.studentCount} / ${viewMaster.studentLimit}`],
                  ["Status", viewMaster.status],
                  ["Joined", new Date(viewMaster.createdAt).toLocaleDateString()],
                ].map(([label, value]) => (
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
        onConfirm={handleDelete}
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
