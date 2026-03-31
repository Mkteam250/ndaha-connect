import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Camera, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MasterProfile() {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "Dr. François Bizimungu",
    email: "francois@ndaha.com",
    phone: "+250788000001",
    bio: "Mathematics instructor with 10+ years experience.",
  });
  const [form, setForm] = useState(profile);

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
              FB
            </div>
            <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
              <Camera className="w-5 h-5 text-background" />
            </div>
          </div>
          {!editing && (
            <>
              <h2 className="text-xl font-semibold text-foreground mt-3">{profile.name}</h2>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
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
              ["Phone", profile.phone],
              ["Bio", profile.bio],
            ].map(([label, value]) => (
              <div key={label} className="text-sm">
                <span className="text-muted-foreground">{label}</span>
                <p className="font-medium text-foreground">{value}</p>
              </div>
            ))}
            <Button onClick={() => setEditing(true)} variant="outline" className="w-full mt-4">
              Edit Profile
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
