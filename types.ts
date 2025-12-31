
export enum UserRole {
  ADMIN = 'ADMIN',
  INTERN = 'INTERN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  department?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockInTime: string;
  clockOutTime?: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT';
}

export interface DailyReport {
  id: string;
  userId: string;
  date: string;
  taskTitle: string;
  taskDescription: string;
  toolsUsed: string[];
  timeSpent: string;
  submittedAt: string;
}

export interface DashboardStats {
  totalInterns: number;
  activeToday: number;
  pendingReports: number;
  completionRate: number;
}
