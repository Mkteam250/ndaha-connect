const API_BASE = "/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  token?: string;
  data?: T;
  message?: string;
  count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "master" | "student" | "admin";
  avatar?: string;
  bio?: string;
  phone?: string;
  subject?: string;
  availability?: string;
  country?: string;
  province?: string;
  district?: string;
  initials?: string;
  status?: string;
  studentLimit?: number;
  createdAt: string;
}

export interface MasterProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  bio: string | null;
  subject: string | null;
  availability: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  studentCount: number;
  studentLimit: number;
  createdAt: string;
}

export interface RegisteredMaster {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  bio: string | null;
  subject: string | null;
  availability: string | null;
  country: string | null;
  province: string | null;
  studentCount: number;
  studentLimit: number;
}

export interface RegisteredStudent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  phone: string | null;
  bio: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  masterCount: number;
  registeredAt: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  address: string;
  userId: string;
  masterId: { _id: string; name: string; email: string } | null;
  enrolledDate: string;
  status: string;
  initials: string;
  fullName: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  avatar: string;
  time: string;
  date: string;
  status: string;
}

export interface QRSession {
  id: string;
  code: string;
  expiresAt: string;
  isActive: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  rate: number;
  totalSessions: number;
}

export interface TrendPoint {
  date: string;
  present: number;
  total: number;
  rate: number;
}

export interface TopStudent {
  id: string;
  name: string;
  initials: string;
  attendanceRate: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: string;
}

export interface StudentDashboardData {
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    province: string;
    district: string;
    sector: string;
    cell: string;
    address: string;
    initials: string;
    masterName: string;
    masterId: string;
    enrolledDate: string;
  } | null;
  stats: {
    attendedSessions: number;
    totalSessions: number;
    attendanceRate: number;
    checkedInToday: boolean;
    weekAttendance: number;
  } | null;
}

export interface ReportData {
  totalSessions: number;
  avgRate: number;
  bestStudent: string;
  worstStudent: string;
  report: Array<{
    id: string;
    name: string;
    present: number;
    absent: number;
    rate: number;
  }>;
}

export interface AdminStats {
  totalMasters: number;
  totalStudents: number;
  activeMasters: number;
  suspendedMasters: number;
  totalUsers: number;
}

export interface AdminMaster {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  bio: string | null;
  subject: string | null;
  status: string;
  studentLimit: number;
  studentCount: number;
  createdAt: string;
}

export interface AdminStudent {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  initials: string;
  bio: string | null;
  country: string | null;
  province: string | null;
  masterCount: number;
  createdAt: string;
}

export interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  initials: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  initials: string;
  bio: string | null;
  subject: string | null;
  availability: string | null;
  phone: string | null;
  country: string | null;
  province: string | null;
  district: string | null;
  registeredMasters: Array<{ id: string; name: string; email: string; avatar: string | null; subject: string | null; initials: string }>;
  registeredStudents: Array<{ id: string; name: string; email: string; avatar: string | null; initials: string }>;
  createdAt: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

export const api = {
  // Auth
  register: (body: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    role?: string;
  }) =>
    request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string; role?: string }) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getMe: () => request<{ user: User }>("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  // Students
  getStudents: () => request<{ students: Student[] }>("/students"),
  getStudent: (id: string) => request<{ student: Student }>(`/students/${id}`),
  getMyProfile: () => request<{ student: Student }>("/students/me/profile"),
  createStudent: (body: Record<string, string>) =>
    request<{ student: Student }>("/students", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateStudent: (id: string, body: Record<string, string>) =>
    request<{ student: Student }>(`/students/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  deleteStudent: (id: string) =>
    request(`/students/${id}`, {
      method: "DELETE",
    }),

  // Attendance
  checkIn: (body: { qrCode: string }) =>
    request<{ attendance: AttendanceRecord }>("/attendance/check-in", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getTodayAttendance: () =>
    request<{ attendance: AttendanceRecord[] }>("/attendance/today"),
  getAttendanceHistory: (params?: { startDate?: string; endDate?: string; studentId?: string }) => {
    const query = new URLSearchParams();
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);
    if (params?.studentId) query.set("studentId", params.studentId);
    const qs = query.toString();
    return request<{ attendance: AttendanceRecord[] }>(`/attendance/history${qs ? `?${qs}` : ""}`);
  },
  getCalendarData: (year: number, month: number) =>
    request<{ calendarData: Record<string, { attended: number; total: number; records: AttendanceRecord[] }> }>(
      `/attendance/calendar?year=${year}&month=${month}`
    ),

  // QR
  generateQR: () =>
    request<{ session: QRSession }>("/qr/generate", {
      method: "POST",
    }),
  getActiveQR: () => request<{ session: QRSession | null }>("/qr/active"),
  deactivateQR: () =>
    request("/qr/deactivate", {
      method: "POST",
    }),

  // Dashboard
  getMasterDashboard: () =>
    request<{
      stats: DashboardStats;
      trend: TrendPoint[];
      topStudents: TopStudent[];
      recentActivity: ActivityItem[];
    }>("/dashboard/master"),

  getStudentDashboard: () =>
    request<StudentDashboardData>("/dashboard/student"),

  getReports: () => request<ReportData>("/dashboard/reports"),

  // Masters (student-facing)
  getAllMasters: () => request<{ masters: RegisteredMaster[]; count: number }>("/masters"),
  getMyMasters: () => request<{ masters: RegisteredMaster[]; count: number }>("/masters/my-masters"),
  getMasterProfile: (id: string) => request<{ master: MasterProfile }>(`/masters/${id}`),
  registerUnderMaster: (id: string) =>
    request(`/masters/${id}/register`, { method: "POST" }),
  unregisterFromMaster: (id: string) =>
    request(`/masters/${id}/unregister`, { method: "DELETE" }),

  // Masters (master-facing)
  getMyStudents: () => request<{ students: RegisteredStudent[]; count: number; studentLimit: number }>("/masters/my-students"),
  removeStudent: (studentId: string) =>
    request(`/masters/students/${studentId}`, { method: "DELETE" }),

  // Profile
  getProfile: () => request<{ user: UserProfile }>("/profile/me"),
  updateProfile: (body: Record<string, string>) =>
    request<{ user: UserProfile }>("/profile/me", {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  getUserProfile: (id: string) => request<{ user: UserProfile }>(`/profile/${id}`),

  // Admin
  getAdminStats: () => request<{ stats: AdminStats; recentUsers: AdminRecentUser[] }>("/admin/stats"),
  getAdminMasters: () => request<{ masters: AdminMaster[]; count: number }>("/admin/masters"),
  getAdminStudents: () => request<{ students: AdminStudent[]; count: number }>("/admin/students"),
  updateMasterStatus: (id: string, status: string) =>
    request(`/admin/masters/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  updateMasterLimit: (id: string, studentLimit: number) =>
    request(`/admin/masters/${id}/limit`, {
      method: "PUT",
      body: JSON.stringify({ studentLimit }),
    }),
  deleteAdminUser: (id: string) =>
    request(`/admin/users/${id}`, { method: "DELETE" }),
};
