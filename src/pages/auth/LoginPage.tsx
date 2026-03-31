import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, LogIn, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"master" | "student" | "admin">("master");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    // Mock login — just navigate to the right portal
    toast({ title: `Logged in as ${role}` });
    if (role === "master") navigate("/master/dashboard");
    else if (role === "student") navigate("/student/profile");
    else navigate("/admin/dashboard");
  };

  const roles = [
    { key: "master" as const, label: "Master", accent: "bg-master-muted text-master border-master/30" },
    { key: "student" as const, label: "Student", accent: "bg-student-muted text-student border-student/30" },
    { key: "admin" as const, label: "Admin", accent: "bg-admin-muted text-admin border-admin/30" },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">NDAHA</h1>
          </div>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          {/* Role selector */}
          <div className="flex gap-2 mb-6">
            {roles.map((r) => (
              <button
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`flex-1 text-xs font-medium py-2 rounded-lg border transition-all ${
                  role === r.key ? r.accent + " border" : "text-muted-foreground border-transparent hover:bg-accent"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground border-0 hover:opacity-90">
              <LogIn className="w-4 h-4 mr-2" /> Sign In
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/register")} className="text-primary font-medium hover:underline">Register</button>
            </p>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground mt-4 block mx-auto">
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
