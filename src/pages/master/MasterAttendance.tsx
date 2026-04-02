import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { api, type AttendanceRecord, type SearchStudent } from "@/lib/api";
import {
  QrCode,
  CheckCircle2,
  RefreshCw,
  Maximize2,
  MapPin,
  XCircle,
  UserPlus,
  Search,
  Loader2,
  User,
  Clock,
  XCircle as AbsentIcon,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentAttendanceRow {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  country: string | null;
  province: string | null;
  todayStatus: { status: string; time: string; id: string } | null;
}

type SortField = "name" | "email" | "country";
type SortOrder = "asc" | "desc";

export default function MasterAttendance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // QR state
  const [qrValue, setQrValue] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Today's check-ins (from QR scans)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // My students with attendance status
  const [myStudents, setMyStudents] = useState<StudentAttendanceRow[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState<string | null>(null);
  const [viewStudent, setViewStudent] = useState<StudentAttendanceRow | null>(null);

  // Add student dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<SearchStudent[]>([]);
  const [allStudentsLoading, setAllStudentsLoading] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [addSortField, setAddSortField] = useState<SortField>("name");
  const [addSortOrder, setAddSortOrder] = useState<SortOrder>("asc");
  const [addPage, setAddPage] = useState(1);
  const [addTotal, setAddTotal] = useState(0);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [studentLimit, setStudentLimit] = useState(5);
  const [registering, setRegistering] = useState<string | null>(null);
  const addLimit = 12;

  const generateQR = useCallback(async () => {
    try {
      const res = await api.generateQR();
      if (res.data?.session) {
        setQrValue(res.data.session.code);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to generate QR";
      toast({ title: msg, variant: "destructive" });
    }
  }, [toast]);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await api.getTodayAttendance();
      setAttendance(res.data?.attendance || []);
    } catch {
      // silent
    }
  }, []);

  const fetchMyStudents = useCallback(async () => {
    setStudentsLoading(true);
    try {
      const res = await api.getStudentsAttendanceStatus();
      setMyStudents(res.data?.students || []);
    } catch {
      // silent
    } finally {
      setStudentsLoading(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([generateQR(), fetchTodayAttendance(), fetchMyStudents()]);
      setLoading(false);
    };
    init();
  }, [generateQR, fetchTodayAttendance, fetchMyStudents]);

  // Auto-regenerate QR every 10 seconds when enabled
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      generateQR();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, generateQR]);

  // Auto-refresh attendance every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayAttendance();
      fetchMyStudents();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchTodayAttendance, fetchMyStudents]);

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
      setStudentLimit(res.data?.studentLimit || 5);
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

  const handleRegenerate = () => {
    generateQR();
    toast({ title: "QR code regenerated!" });
  };

  const handleEnableLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationEnabled(true);
          setLocationDenied(false);
          toast({ title: "Location enabled successfully!" });
        },
        () => {
          setLocationDenied(true);
          setLocationEnabled(false);
        }
      );
    } else {
      setLocationDenied(true);
    }
  };

  const handleMarkAttendance = async (studentId: string, status: "present" | "late" | "absent") => {
    setMarkingAttendance(studentId);
    try {
      const res = await api.markManualAttendance(studentId, status);
      toast({ title: res.message || `Marked as ${status}` });
      fetchMyStudents();
      fetchTodayAttendance();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to mark attendance";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setMarkingAttendance(null);
    }
  };

  const handleRegisterStudent = async (studentId: string) => {
    setRegistering(studentId);
    try {
      await api.registerStudent(studentId);
      toast({ title: "Student registered successfully" });
      fetchAllStudents();
      fetchMyStudents();
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
      setMyStudents((prev) =>
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

  const presentCount = myStudents.filter((s) => s.todayStatus?.status === "present").length;
  const lateCount = myStudents.filter((s) => s.todayStatus?.status === "late").length;
  const absentCount = myStudents.filter((s) => s.todayStatus?.status === "absent").length;
  const pendingCount = myStudents.filter((s) => !s.todayStatus).length;
  const addAtLimit = registeredCount >= studentLimit;
  const totalPages = Math.ceil(addTotal / addLimit);
  const today = new Date().toLocaleDateString("en", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Attendance" description={today}>
        <Button
          onClick={() => setAddDialogOpen(true)}
          className="gradient-master text-master-foreground border-0 hover:opacity-90"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </PageHeader>

      {/* Location Permission Banner */}
      {!locationEnabled && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-master-muted flex items-center justify-center">
              <MapPin className="w-5 h-5 text-master" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Enable Location</p>
              <p className="text-xs text-muted-foreground">Location must be enabled so students within range can check in.</p>
            </div>
          </div>
          {locationDenied && (
            <div className="flex items-center gap-2 mb-3 text-destructive">
              <XCircle className="w-4 h-4" />
              <p className="text-xs">Location denied. Please allow location in your browser settings.</p>
            </div>
          )}
          <Button onClick={handleEnableLocation} className="gradient-master text-master-foreground border-0 hover:opacity-90 w-full">
            <MapPin className="w-4 h-4 mr-2" /> Enable Location
          </Button>
        </motion.div>
      )}

      {locationEnabled && (
        <div className="flex items-center gap-2 mb-4 text-master">
          <CheckCircle2 className="w-4 h-4" />
          <p className="text-xs font-medium">Location enabled — students nearby can check in</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-student">{presentCount}</p>
          <p className="text-xs text-muted-foreground">Present</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-warning">{lateCount}</p>
          <p className="text-xs text-muted-foreground">Late</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-destructive">{absentCount}</p>
          <p className="text-xs text-muted-foreground">Absent</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-center">
          <p className="text-2xl font-bold text-muted-foreground">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Pending</p>
        </div>
      </div>

      <Tabs defaultValue="qr" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr" className="gap-2">
            <QrCode className="w-4 h-4" /> QR Check-in
          </TabsTrigger>
          <TabsTrigger value="manual" className="gap-2">
            <Users className="w-4 h-4" /> Manual Attendance
          </TabsTrigger>
        </TabsList>

        {/* QR Tab */}
        <TabsContent value="qr">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* QR Code Display */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <QrCode className="w-4 h-4" /> Your QR Code
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Display this QR code so students can scan it to check in.
              </p>
              <div className="aspect-square max-w-[280px] mx-auto rounded-xl bg-background border border-border flex items-center justify-center p-4 mb-4">
                {qrValue ? (
                  <QRCodeSVG
                    value={qrValue}
                    size={240}
                    bgColor="transparent"
                    fgColor="currentColor"
                    className="text-foreground w-full h-full"
                    level="M"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">Generating...</p>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground text-center font-mono break-all mb-4">{qrValue}</p>

              <div className="flex gap-2 mb-2">
                <Button onClick={handleRegenerate} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                </Button>
                <Button onClick={() => navigate("/master/qr-display")} variant="outline" className="flex-1">
                  <Maximize2 className="w-4 h-4 mr-2" /> Full Screen
                </Button>
              </div>
              <Button
                onClick={() => { setAutoRefresh(!autoRefresh); toast({ title: autoRefresh ? "Auto-refresh stopped" : "QR auto-refreshes every 10s" }); }}
                variant={autoRefresh ? "default" : "outline"}
                className={`w-full ${autoRefresh ? "gradient-master text-master-foreground border-0" : ""}`}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
                {autoRefresh ? "Auto-Refresh ON" : "Enable Auto-Refresh"}
              </Button>
            </motion.div>

            {/* Today's checklist (QR scans) */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-4">Today's QR Check-ins</h3>
              <div className="space-y-2 max-h-[400px] overflow-auto">
                {attendance.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No QR check-ins yet today.</p>
                ) : (
                  attendance.map((a) => (
                    <motion.div
                      key={a.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      {a.avatar && a.avatar.length > 3 ? (
                        <img src={a.avatar} alt={a.studentName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-master-muted text-master flex items-center justify-center text-xs font-bold shrink-0">
                          {a.avatar || "??"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{a.studentName}</p>
                        <p className="text-xs text-muted-foreground">{a.time} {a.status === "late" && <span className="text-warning">(late)</span>}</p>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-student shrink-0" />
                    </motion.div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{attendance.length}</span> students checked in via QR
                </p>
              </div>
            </motion.div>
          </div>
        </TabsContent>

        {/* Manual Attendance Tab */}
        <TabsContent value="manual">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Mark Attendance Manually</h3>
              <p className="text-xs text-muted-foreground">{myStudents.length} registered student{myStudents.length !== 1 ? "s" : ""}</p>
            </div>

            {studentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-master animate-spin" />
              </div>
            ) : myStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm mb-3">No students registered yet.</p>
                <Button onClick={() => setAddDialogOpen(true)} variant="outline">
                  <UserPlus className="w-4 h-4 mr-2" /> Add Students
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <AnimatePresence>
                  {myStudents.map((s, i) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                        s.todayStatus
                          ? s.todayStatus.status === "present"
                            ? "border-student/30 bg-student/5"
                            : s.todayStatus.status === "late"
                            ? "border-warning/30 bg-warning/5"
                            : "border-destructive/30 bg-destructive/5"
                          : "border-border hover:bg-accent/30"
                      }`}
                    >
                      <div className="relative shrink-0">
                        {s.avatar ? (
                          <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-student-muted text-student flex items-center justify-center text-sm font-bold">
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                          {s.todayStatus && (
                            <Badge
                              className={`text-xs border-0 ${
                                s.todayStatus.status === "present"
                                  ? "bg-student-muted text-student"
                                  : s.todayStatus.status === "late"
                                  ? "bg-warning/20 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {s.todayStatus.status} {s.todayStatus.time && `@ ${s.todayStatus.time}`}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {!s.todayStatus ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(s.id, "present")}
                              disabled={markingAttendance === s.id}
                              className="text-student border-student/30 hover:bg-student/10 h-8 px-2 text-xs"
                            >
                              {markingAttendance === s.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <>
                                  <CheckCircle2 className="w-3 h-3 mr-1" /> Present
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(s.id, "late")}
                              disabled={markingAttendance === s.id}
                              className="text-warning border-warning/30 hover:bg-warning/10 h-8 px-2 text-xs"
                            >
                              <Clock className="w-3 h-3 mr-1" /> Late
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAttendance(s.id, "absent")}
                              disabled={markingAttendance === s.id}
                              className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8 px-2 text-xs"
                            >
                              <AbsentIcon className="w-3 h-3 mr-1" /> Absent
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewStudent(s)}
                            className="h-8 px-2 text-xs"
                          >
                            <Eye className="w-3 h-3 mr-1" /> View
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

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
                {viewStudent.todayStatus && (
                  <Badge
                    className={`mt-2 border-0 ${
                      viewStudent.todayStatus.status === "present"
                        ? "bg-student-muted text-student"
                        : viewStudent.todayStatus.status === "late"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {viewStudent.todayStatus.status} {viewStudent.todayStatus.time && `at ${viewStudent.todayStatus.time}`}
                  </Badge>
                )}
              </div>

              <div className="space-y-3 pt-2 border-t border-border">
                {([
                  ["Location", [viewStudent.country, viewStudent.province].filter(Boolean).join(", ") || "\u2014"],
                ] as const).map(([label, value]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Re-mark attendance */}
              {viewStudent.todayStatus && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Update Attendance</p>
                  <div className="flex gap-2">
                    {(["present", "late", "absent"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={viewStudent.todayStatus?.status === status ? "default" : "outline"}
                        onClick={() => handleMarkAttendance(viewStudent.id, status)}
                        disabled={markingAttendance === viewStudent.id}
                        className={`flex-1 capitalize ${
                          viewStudent.todayStatus?.status === status
                            ? status === "present"
                              ? "bg-student text-student-foreground"
                              : status === "late"
                              ? "bg-warning text-warning-foreground"
                              : "bg-destructive text-destructive-foreground"
                            : ""
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Student Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-master" />
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
                        <img src={s.avatar} alt={s.name} className="w-10 h-10 rounded-full object-cover" />
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
    </div>
  );
}
