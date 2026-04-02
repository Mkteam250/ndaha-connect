import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, type RegisteredMaster, type MasterProfile } from "@/lib/api";
import { Search, MapPin, Users, BookOpen, Eye, UserPlus, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

export default function StudentBrowseMasters() {
  const { toast } = useToast();
  const [masters, setMasters] = useState<RegisteredMaster[]>([]);
  const [myMasterIds, setMyMasterIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMaster, setViewMaster] = useState<MasterProfile | null>(null);
  const [registering, setRegistering] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        api.getAllMasters(),
        api.getMyMasters(),
      ]);
      setMasters(allRes.data?.masters || []);
      setMyMasterIds(new Set((myRes.data?.masters || []).map((m) => m.id)));
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to load masters", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewProfile = async (id: string) => {
    try {
      const res = await api.getMasterProfile(id);
      setViewMaster(res.data?.master ?? null);
    } catch {
      toast({ title: "Failed to load profile", variant: "destructive" });
    }
  };

  const handleRegister = async (id: string) => {
    setRegistering(id);
    try {
      await api.registerUnderMaster(id);
      setMyMasterIds((prev) => new Set([...prev, id]));
      toast({ title: "Successfully registered!" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Registration failed", variant: "destructive" });
    } finally {
      setRegistering(null);
    }
  };

  const filtered = masters.filter((m) =>
    `${m.name} ${m.subject || ""} ${m.country || ""}`.toLowerCase().includes(search.toLowerCase())
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
      <PageHeader title="Browse Masters" description="Find and register under a Master/Teacher" />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, subject, or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((m, i) => {
          const isRegistered = myMasterIds.has(m.id);
          const isFull = m.studentCount >= m.studentLimit;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-full object-cover ring-2 ring-master-muted shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-master-muted text-master flex items-center justify-center text-lg font-bold shrink-0">
                    {m.initials}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground truncate">{m.name}</h3>
                  {m.subject && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5" /> {m.subject}
                    </p>
                  )}
                  {m.country && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {m.country}{m.province ? `, ${m.province}` : ""}
                    </p>
                  )}
                </div>
              </div>

              {m.bio && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{m.bio}</p>
              )}

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{m.studentCount}/{m.studentLimit} students</span>
                </div>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full rounded-full gradient-master" style={{ width: `${Math.min((m.studentCount / m.studentLimit) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleViewProfile(m.id)} className="flex-1">
                  <Eye className="w-3.5 h-3.5 mr-1" /> View
                </Button>
                {isRegistered ? (
                  <Button size="sm" disabled className="flex-1 bg-student-muted text-student border-0">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Registered
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled={isFull || registering === m.id}
                    onClick={() => handleRegister(m.id)}
                    className="flex-1 gradient-student text-student-foreground border-0 hover:opacity-90"
                  >
                    {registering === m.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <UserPlus className="w-3.5 h-3.5 mr-1" />
                    )}
                    {isFull ? "Full" : "Register"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No masters found matching your search.
          </div>
        )}
      </div>

      {/* Master Profile Sheet */}
      <Sheet open={!!viewMaster} onOpenChange={() => setViewMaster(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader><SheetTitle>Master Profile</SheetTitle></SheetHeader>
          {viewMaster && (
            <div className="mt-6 space-y-5">
              <div className="flex flex-col items-center">
                {viewMaster.avatar ? (
                  <img src={viewMaster.avatar} alt={viewMaster.name} className="w-20 h-20 rounded-full object-cover ring-2 ring-master-muted" />
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
                <span className="text-xs bg-master-muted text-master px-2 py-0.5 rounded-full font-medium mt-2">Master</span>
              </div>

              {viewMaster.bio && (
                <div className="rounded-lg bg-muted/50 p-4">
                  <p className="text-sm font-medium text-foreground mb-1">Bio</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{viewMaster.bio}</p>
                </div>
              )}

              <div className="space-y-3 pt-2 border-t border-border">
                {[
                  ["Email", viewMaster.email],
                  ["Availability", viewMaster.availability || "—"],
                  ["Location", [viewMaster.country, viewMaster.province, viewMaster.district].filter(Boolean).join(", ") || "—"],
                  ["Students", `${viewMaster.studentCount} / ${viewMaster.studentLimit}`],
                  ["Joined", new Date(viewMaster.createdAt).toLocaleDateString("en", { month: "long", year: "numeric" })],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
              </div>

              {myMasterIds.has(viewMaster.id) ? (
                <Button disabled className="w-full bg-student-muted text-student border-0">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Already Registered
                </Button>
              ) : viewMaster.studentCount >= viewMaster.studentLimit ? (
                <Button disabled className="w-full">Student Limit Reached</Button>
              ) : (
                <Button
                  onClick={() => { handleRegister(viewMaster.id); setViewMaster(null); }}
                  className="w-full gradient-student text-student-foreground border-0 hover:opacity-90"
                >
                  <UserPlus className="w-4 h-4 mr-2" /> Register Under This Master
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
