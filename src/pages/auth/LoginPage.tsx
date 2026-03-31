import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, LogIn, Eye, EyeOff, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type Role = "master" | "student";

export default function LoginPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password, selectedRole || undefined);
      toast({ title: "Logged in successfully" });
      const redirectMap: Record<string, string> = {
        master: "/master/dashboard",
        student: "/student/dashboard",
      };
      navigate(redirectMap[selectedRole || ""] || "/", { replace: true });
    } catch (err) {
      toast({
        title: err instanceof Error ? err.message : "Login failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">NDAHA</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {!selectedRole ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-foreground text-center mb-2">Select your role to continue</p>
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("master")}
              className="w-full rounded-xl border border-border bg-card p-5 text-left hover:shadow-lg hover:shadow-master/5 hover:border-master/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-master-muted flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-master" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Master / Teacher</h3>
                  <p className="text-sm text-muted-foreground">Manage students, track attendance, and generate reports</p>
                </div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole("student")}
              className="w-full rounded-xl border border-border bg-card p-5 text-left hover:shadow-lg hover:shadow-student/5 hover:border-student/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-student-muted flex items-center justify-center">
                  <Users className="w-6 h-6 text-student" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">Student</h3>
                  <p className="text-sm text-muted-foreground">Check in, view your profile, and track attendance</p>
                </div>
              </div>
            </motion.button>

            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")} className="text-primary font-medium hover:underline">
                  Register
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedRole === "master" ? "bg-master-muted" : "bg-student-muted"}`}>
                {selectedRole === "master" ? (
                  <BookOpen className="w-5 h-5 text-master" />
                ) : (
                  <Users className="w-5 h-5 text-student" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">
                  Signing in as {selectedRole === "master" ? "Master" : "Student"}
                </p>
              </div>
              <button
                onClick={() => setSelectedRole(null)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Change
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className={`w-full border-0 hover:opacity-90 ${selectedRole === "master" ? "gradient-master text-master-foreground" : "gradient-student text-student-foreground"}`}
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <LogIn className="w-4 h-4 mr-2" />
                )}{" "}
                Sign In
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => navigate("/register")} className="text-primary font-medium hover:underline">
                  Register
                </button>
              </p>
            </div>
          </div>
        )}

        <button
          onClick={() => navigate("/")}
          className="text-xs text-muted-foreground hover:text-foreground mt-6 block mx-auto"
        >
          ← Back to home
        </button>
      </motion.div>
    </div>
  );
}
