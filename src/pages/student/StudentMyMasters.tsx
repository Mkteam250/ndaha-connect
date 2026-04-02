import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { api, type RegisteredMaster, type MasterProfile } from "@/lib/api";
import { MapPin, Users, BookOpen, Eye, UserMinus, Star, Search, Mail, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function StudentMyMasters() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [masters, setMasters] = useState<RegisteredMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMaster, setViewMaster] = useState<MasterProfile | null>(null);
  const [unregisterTarget, setUnregisterTarget] = useState<string | null>(null);
  const [unregistering, setUnregistering] = useState(false);

  const fetchMasters = useCallback(async () => {
    try {
      const res = await api.getMyMasters();
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

  const handleViewProfile = async (id: string) => {
    try {
      const res = await api.getMasterProfile(id);
      setViewMaster(res.data?.master ?? null);
    } catch {
      toast({ title: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleUnregister = async () => {
    if (!unregisterTarget) return;
    setUnregistering(true);
    try {
      await api.unregisterFromMaster(unregisterTarget);
      setMasters((prev) => prev.filter((m) => m.id !== unregisterTarget));
      toast({ title: "Unregistered successfully" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to unregister", variant: "destructive" });
    } finally {
      setUnregistering(false);
      setUnregisterTarget(null);
    }
  };

  const filtered = masters.filter((m) =>
    `${m.name} ${m.email} ${m.subject || ""} ${m.country || ""}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-student border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Masters" description="Masters you are currently registered under" />

      {masters.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">You haven't registered under any Master yet.</p>
          <Button
            onClick={() => navigate("/student/masters")}
            className="gradient-student text-student-foreground border-0 hover:opacity-90"
          >
            Browse Masters
          </Button>
        </div>
      ) : (
        <>
          {/* Search */}
          {masters.length > 1 && (
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your masters..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No masters match your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((m, i) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {m.avatar ? (
                        <img
                          src={m.avatar}
                          alt={m.name}
                          className="w-14 h-14 rounded-full object-cover ring-2 ring-master-muted"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-master-muted text-master flex items-center justify-center text-lg font-bold">
                          {m.initials}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">{m.name}</h3>
                        <Badge className="bg-master-muted text-master border-0 text-xs">Master</Badge>
                      </div>
                      {m.subject && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" /> {m.subject}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                        {m.country && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {m.country}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" /> {m.studentCount}/{m.studentLimit} students
                        </span>
                        {m.availability && <span>{m.availability}</span>}
                      </div>
                      {m.bio && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.bio}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(m.id)}
                      className="flex-1"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUnregisterTarget(m.id)}
                      className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    >
                      <UserMinus className="w-3.5 h-3.5 mr-1" /> Unregister
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Master Profile Sheet */}
      <Sheet open={!!viewMaster} onOpenChange={() => setViewMaster(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Master Profile</SheetTitle>
          </SheetHeader>
          {viewMaster && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center">
                {viewMaster.avatar ? (
                  <img
                    src={viewMaster.avatar}
                    alt={viewMaster.name}
                    className="w-20 h-20 rounded-full object-cover ring-2 ring-master-muted"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-master-muted text-master flex items-center justify-center text-2xl font-bold">
                    {viewMaster.initials}
                  </div>
                )}
                <h2 className="text-lg font-semibold text-foreground mt-3">{viewMaster.name}</h2>
                {viewMaster.subject && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" /> {viewMaster.subject}
                  </p>
                )}
                <Badge className="mt-2 bg-master-muted text-master border-0">Master</Badge>
              </div>

              {viewMaster.bio && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewMaster.bio}</p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border">
                {([
                  ["Email", viewMaster.email],
                  ["Availability", viewMaster.availability || "\u2014"],
                  ["Location", [viewMaster.country, viewMaster.province, viewMaster.district].filter(Boolean).join(", ") || "\u2014"],
                  ["Students", `${viewMaster.studentCount} / ${viewMaster.studentLimit}`],
                  ["Joined", new Date(viewMaster.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })],
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
        open={!!unregisterTarget}
        onOpenChange={() => setUnregisterTarget(null)}
        title="Unregister from Master"
        description="You will be removed from this Master's student list. You can always register again later."
        onConfirm={handleUnregister}
        confirmLabel="Unregister"
        destructive
      />
    </div>
  );
}
