import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Save, X, Pencil, User, Mail, Phone, MapPin, BookOpen, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api, type UserProfile } from "@/lib/api";

export default function MasterProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    bio: "",
    subject: "",
    availability: "",
    country: "",
    province: "",
    district: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getProfile();
        const user = res.data?.user;
        if (user) {
          setProfile(user);
          setForm({
            name: user.name || "",
            phone: user.phone || "",
            bio: user.bio || "",
            subject: user.subject || "",
            availability: user.availability || "",
            country: user.country || "",
            province: user.province || "",
            district: user.district || "",
          });
        }
      } catch {
        // Profile may not exist
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateProfile(form);
      setProfile(res.data?.user ?? profile);
      setEditing(false);
      toast({ title: "Profile updated successfully!" });
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to update", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setForm({
        name: profile.name || "",
        phone: profile.phone || "",
        bio: profile.bio || "",
        subject: profile.subject || "",
        availability: profile.availability || "",
        country: profile.country || "",
        province: profile.province || "",
        district: profile.district || "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-master border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  return (
    <div>
      <PageHeader title="My Profile" description="Manage your profile information">
        {!editing ? (
          <Button onClick={() => setEditing(true)} variant="outline">
            <Pencil className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-1" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gradient-master text-master-foreground border-0 hover:opacity-90" size="sm">
              {saving ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">Profile Preview</h3>
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-master-muted text-master flex items-center justify-center text-3xl font-bold">
                {initials}
              </div>
              <h2 className="text-lg font-semibold text-foreground mt-3">{form.name || "Your Name"}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Mail className="w-3.5 h-3.5" /> {profile.email}
              </p>
              <span className="text-xs bg-master-muted text-master px-2 py-0.5 rounded-full font-medium mt-2">Master</span>
            </div>

            <div className="space-y-3 mt-6 pt-4 border-t border-border">
              {form.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" /> {form.phone}
                </div>
              )}
              {(form.country || form.province) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" /> {[form.country, form.province, form.district].filter(Boolean).join(", ") || "—"}
                </div>
              )}
              {form.subject && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-3.5 h-3.5" /> {form.subject}
                </div>
              )}
              {form.availability && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {form.availability}
                </div>
              )}
              {form.bio && (
                <div className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {form.bio}
                </div>
              )}
            </div>

            {profile.registeredStudents && profile.registeredStudents.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground mb-3">Registered Students ({profile.registeredStudents.length})</p>
                {profile.registeredStudents.slice(0, 5).map((s) => (
                  <div key={s.id} className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-student-muted text-student flex items-center justify-center text-xs font-bold">
                      {s.initials}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">{s.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Edit Form / Details */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              {editing ? "Edit Profile" : "Profile Details"}
            </h3>
            {editing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+250..." />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    placeholder="Tell students about yourself, your teaching style, experience..."
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/500</p>
                </div>
                <div>
                  <Label htmlFor="subject">Subject / Specialty</Label>
                  <Input id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g., Mathematics, Quran Studies" />
                </div>
                <div>
                  <Label htmlFor="availability">Availability</Label>
                  <Input id="availability" value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} placeholder="e.g., Mon-Fri 9am-5pm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Country" />
                  </div>
                  <div>
                    <Label htmlFor="province">Province</Label>
                    <Input id="province" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="Province" />
                  </div>
                  <div>
                    <Label htmlFor="district">District</Label>
                    <Input id="district" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="District" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  ["Full Name", profile.name],
                  ["Email", profile.email],
                  ["Phone", profile.phone || "Not set"],
                  ["Bio", profile.bio || "Not set"],
                  ["Subject", profile.subject || "Not set"],
                  ["Availability", profile.availability || "Not set"],
                  ["Country", profile.country || "Not set"],
                  ["Province", profile.province || "Not set"],
                  ["District", profile.district || "Not set"],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">{value}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(profile.createdAt).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
