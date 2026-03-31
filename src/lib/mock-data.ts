export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  avatar: string;
  enrolledDate: string;
  attendanceRate: number;
  masterId: string;
}

export interface Master {
  id: string;
  name: string;
  email: string;
  avatar: string;
  studentsEnrolled: number;
  studentLimit: number;
  status: "active" | "suspended";
}

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  avatar: string;
  time: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  message: string;
  timestamp: string;
  type: "registration" | "attendance" | "system" | "limit_change";
}

export const students: Student[] = [
  { id: "S001", firstName: "Amina", lastName: "Uwimana", email: "amina@email.com", phone: "+250788001001", country: "Rwanda", province: "Kigali", avatar: "AU", enrolledDate: "2025-09-15", attendanceRate: 96, masterId: "M001" },
  { id: "S002", firstName: "Jean", lastName: "Habimana", email: "jean@email.com", phone: "+250788002002", country: "Rwanda", province: "Eastern", avatar: "JH", enrolledDate: "2025-10-01", attendanceRate: 88, masterId: "M001" },
  { id: "S003", firstName: "Grace", lastName: "Mukamana", email: "grace@email.com", phone: "+250788003003", country: "Rwanda", province: "Kigali", avatar: "GM", enrolledDate: "2025-10-10", attendanceRate: 92, masterId: "M001" },
  { id: "S004", firstName: "Patrick", lastName: "Niyonzima", email: "patrick@email.com", phone: "+250788004004", country: "Rwanda", province: "Southern", avatar: "PN", enrolledDate: "2025-11-05", attendanceRate: 75, masterId: "M001" },
  { id: "S005", firstName: "Diane", lastName: "Ingabire", email: "diane@email.com", phone: "+250788005005", country: "Rwanda", province: "Western", avatar: "DI", enrolledDate: "2025-11-20", attendanceRate: 84, masterId: "M001" },
  { id: "S006", firstName: "Emmanuel", lastName: "Nsengiyumva", email: "emmanuel@email.com", phone: "+250788006006", country: "DRC", province: "North Kivu", avatar: "EN", enrolledDate: "2025-12-01", attendanceRate: 70, masterId: "M002" },
  { id: "S007", firstName: "Claudine", lastName: "Mukamurenzi", email: "claudine@email.com", phone: "+250788007007", country: "Rwanda", province: "Northern", avatar: "CM", enrolledDate: "2026-01-10", attendanceRate: 95, masterId: "M002" },
  { id: "S008", firstName: "Samuel", lastName: "Mugisha", email: "samuel@email.com", phone: "+250788008008", country: "Burundi", province: "Bujumbura", avatar: "SM", enrolledDate: "2026-01-15", attendanceRate: 60, masterId: "M002" },
];

export const masters: Master[] = [
  { id: "M001", name: "Dr. François Bizimungu", email: "francois@ndaha.com", avatar: "FB", studentsEnrolled: 5, studentLimit: 5, status: "active" },
  { id: "M002", name: "Prof. Marie Uwera", email: "marie@ndaha.com", avatar: "MU", studentsEnrolled: 3, studentLimit: 5, status: "active" },
  { id: "M003", name: "Dr. Joseph Karemera", email: "joseph@ndaha.com", avatar: "JK", studentsEnrolled: 0, studentLimit: 5, status: "suspended" },
];

export const todayAttendance: AttendanceRecord[] = [
  { studentId: "S001", studentName: "Amina Uwimana", avatar: "AU", time: "08:15", date: "2026-03-31" },
  { studentId: "S002", studentName: "Jean Habimana", avatar: "JH", time: "08:22", date: "2026-03-31" },
  { studentId: "S003", studentName: "Grace Mukamana", avatar: "GM", time: "08:30", date: "2026-03-31" },
  { studentId: "S005", studentName: "Diane Ingabire", avatar: "DI", time: "08:45", date: "2026-03-31" },
];

export const attendanceTrend = Array.from({ length: 30 }, (_, i) => {
  const date = new Date(2026, 2, i + 2);
  return {
    date: date.toLocaleDateString("en", { month: "short", day: "numeric" }),
    present: Math.floor(Math.random() * 3) + 2,
    total: 5,
    rate: Math.floor(Math.random() * 40) + 60,
  };
});

export const recentActivity: ActivityLog[] = [
  { id: "1", message: "Amina Uwimana checked in", timestamp: "08:15 AM", type: "attendance" },
  { id: "2", message: "Jean Habimana checked in", timestamp: "08:22 AM", type: "attendance" },
  { id: "3", message: "Grace Mukamana checked in", timestamp: "08:30 AM", type: "attendance" },
  { id: "4", message: "New student registered: Samuel Mugisha", timestamp: "Yesterday", type: "registration" },
  { id: "5", message: "Student limit updated for Dr. Bizimungu", timestamp: "2 days ago", type: "limit_change" },
  { id: "6", message: "Diane Ingabire checked in", timestamp: "08:45 AM", type: "attendance" },
  { id: "7", message: "System backup completed", timestamp: "3 days ago", type: "system" },
  { id: "8", message: "Prof. Uwera profile updated", timestamp: "4 days ago", type: "system" },
];

export const calendarData: Record<string, { attended: number; total: number }> = {};
for (let i = 1; i <= 31; i++) {
  const key = `2026-03-${String(i).padStart(2, "0")}`;
  if (Math.random() > 0.25) {
    const total = 5;
    const attended = Math.floor(Math.random() * total) + 1;
    calendarData[key] = { attended, total };
  }
}

export const countries = ["Rwanda", "DRC", "Burundi", "Uganda", "Kenya"];
export const provinces: Record<string, string[]> = {
  Rwanda: ["Kigali", "Eastern", "Western", "Northern", "Southern"],
  DRC: ["North Kivu", "South Kivu", "Kinshasa"],
  Burundi: ["Bujumbura", "Gitega", "Ngozi"],
  Uganda: ["Central", "Eastern", "Northern", "Western"],
  Kenya: ["Nairobi", "Mombasa", "Kisumu"],
};
