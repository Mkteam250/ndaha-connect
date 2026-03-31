import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, ChevronRight, Upload, User, MapPin, FileCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const countries = ["Rwanda", "DRC", "Burundi", "Uganda", "Kenya"];
const provinces: Record<string, string[]> = {
  Rwanda: ["Kigali", "Eastern", "Western", "Northern", "Southern"],
  DRC: ["North Kivu", "South Kivu", "Kinshasa"],
  Burundi: ["Bujumbura", "Gitega", "Ngozi"],
  Uganda: ["Central", "Eastern", "Northern", "Western"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu"],
};

const steps = [
  { label: "Personal Info", icon: User },
  { label: "Location", icon: MapPin },
  { label: "Review", icon: FileCheck },
];

export default function StudentSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    country: "", province: "", district: "", sector: "", cell: "", address: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validateStep = () => {
    const errs: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName.trim()) errs.firstName = "Required";
      if (!form.lastName.trim()) errs.lastName = "Required";
      if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email required";
      if (!form.phone.trim()) errs.phone = "Required";
    }
    if (step === 1) {
      if (!form.country) errs.country = "Required";
      if (!form.province) errs.province = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => Math.min(s + 1, 2)); };
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await api.createStudent(form);
      toast({ title: "Profile created successfully!" });
      navigate("/student/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create profile";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Student Registration" description="Create your NDAHA account" />

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
              i < step ? "bg-student text-student-foreground" : i === step ? "bg-student-muted text-student border-2 border-student" : "bg-muted text-muted-foreground"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${i < step ? "bg-student" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="rounded-xl border border-border bg-card p-6">
          {step === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input value={form.firstName} onChange={(e) => update("firstName", e.target.value)} className={errors.firstName ? "border-destructive" : ""} />
                  {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input value={form.lastName} onChange={(e) => update("lastName", e.target.value)} className={errors.lastName ? "border-destructive" : ""} />
                  {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={errors.email ? "border-destructive" : ""} />
                {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label>Phone *</Label>
                <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={errors.phone ? "border-destructive" : ""} />
                {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Country *</Label>
                  <Select value={form.country} onValueChange={(v) => { update("country", v); update("province", ""); }}>
                    <SelectTrigger className={errors.country ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.country && <p className="text-xs text-destructive mt-1">{errors.country}</p>}
                </div>
                <div>
                  <Label>Province *</Label>
                  <Select value={form.province} onValueChange={(v) => update("province", v)} disabled={!form.country}>
                    <SelectTrigger className={errors.province ? "border-destructive" : ""}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{(provinces[form.country] || []).map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.province && <p className="text-xs text-destructive mt-1">{errors.province}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><Label>District</Label><Input value={form.district} onChange={(e) => update("district", e.target.value)} /></div>
                <div><Label>Sector</Label><Input value={form.sector} onChange={(e) => update("sector", e.target.value)} /></div>
                <div><Label>Cell</Label><Input value={form.cell} onChange={(e) => update("cell", e.target.value)} /></div>
              </div>
              <div>
                <Label>Address</Label>
                <Textarea value={form.address} onChange={(e) => update("address", e.target.value)} rows={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-student-muted text-student flex items-center justify-center text-2xl font-bold">
                  {form.firstName[0] || "?"}{form.lastName[0] || "?"}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["First Name", form.firstName], ["Last Name", form.lastName],
                  ["Email", form.email], ["Phone", form.phone],
                  ["Country", form.country], ["Province", form.province],
                  ["District", form.district || "—"], ["Sector", form.sector || "—"],
                  ["Cell", form.cell || "—"],
                ].map(([label, value]) => (
                  <div key={label} className="text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <p className="font-medium text-foreground">{value || "—"}</p>
                  </div>
                ))}
              </div>
              {form.address && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Address</span>
                  <p className="font-medium text-foreground">{form.address}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6 pt-4 border-t border-border">
            <Button variant="outline" onClick={prev} disabled={step === 0}>Back</Button>
            {step < 2 ? (
              <Button onClick={next} className="gradient-student text-student-foreground border-0 hover:opacity-90">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="gradient-student text-student-foreground border-0 hover:opacity-90">
                {saving ? "Saving..." : "Confirm & Register"}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
