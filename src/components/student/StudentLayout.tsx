import { Outlet } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-student flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-student-foreground" />
          </div>
          <span className="font-bold text-foreground">NDAHA</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-student-muted text-student px-2 py-0.5 rounded-full font-medium">Student</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
