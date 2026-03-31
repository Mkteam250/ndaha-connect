import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Save, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function MasterProfile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
  });
  const [form, setForm] = useState(profile);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "M";

  const handleSave = () => {
    setProfile(form);
    setEditing(false);
    toast({ title: "Profile updated successfully!" });
  };

  return (
    <div>
      <PageHeader title="Profile" description="Manage your profile information" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 max-w-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-master-muted text-master flex items-center justify-center text-3xl font-bold">
              {initials}
            </div>
          </div>
          {!editing && (
            <>
              <h2 className="text-xl font-semibold text-foreground mt-3">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <span className="text-xs bg-master-muted text-master px-2 py-0.5 rounded-full font-medium mt-1">Master</span>
            </>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <Label>Bio</Label>
              <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gradient-master text-master-foreground border-0 hover:opacity-90">
                <Save className="w-4 h-4 mr-1" /> Save
              </Button>
              <Button variant="outline" onClick={() => { setForm(profile); setEditing(false); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {[
              ["Phone", profile.phone || "Not set"],
              ["Bio", profile.bio || "Not set"],
              ["Student Limit", `${user?.studentLimit || 5} students`],
            ].map(([label, value]) => (
              <div key={label} className="text-sm">
                <span className="text-muted-foreground">{label}</span>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
            <Button onClick={() => setEditing(true)} variant="outline" className="w-full mt-4">
              <User className="w-4 h-4 mr-2" /> Edit Profile
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
