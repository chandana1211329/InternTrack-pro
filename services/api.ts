
import { User, UserRole, Attendance, DailyReport, DashboardStats } from '../types.ts';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper to get auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper for API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: getAuthHeaders(),
    ...options
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }
  
  return response.json();
};

export const mockAuthService = {
  login: async (email: string, pass: string): Promise<User> => {
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  },

  register: async (name: string, email: string, department: string): Promise<User> => {
    // This will be handled by the Login component which passes the actual password
    throw new Error('Use registerWithPassword method instead');
  },

  registerWithPassword: async (name: string, email: string, password: string, department: string): Promise<User> => {
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role: 'INTERN', department })
    });
    
    // Store token
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response.user;
  }
};

export const dataService = {
  // Attendance
  async getAttendance(userId?: string): Promise<Attendance[]> {
    const params = userId ? `?userId=${userId}` : '';
    return apiCall(`/attendance${params}`);
  },

  async clockIn(userId: string): Promise<Attendance> {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    return apiCall('/attendance/clock-in', {
      method: 'POST',
      body: JSON.stringify({ date: today, clockInTime: time })
    });
  },

  async clockOut(userId: string): Promise<Attendance> {
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    return apiCall('/attendance/clock-out', {
      method: 'POST',
      body: JSON.stringify({ clockOutTime: time })
    });
  },

  // Break functionality
  async startBreak(): Promise<Attendance> {
    return apiCall('/attendance/start-break', {
      method: 'POST'
    });
  },

  async endBreak(): Promise<Attendance> {
    return apiCall('/attendance/end-break', {
      method: 'POST'
    });
  },

  async getBreakStatus(): Promise<any> {
    return apiCall('/attendance/break-status');
  },

  // Reports
  async getReports(userId?: string): Promise<DailyReport[]> {
    const params = userId ? `?userId=${userId}` : '';
    return apiCall(`/reports${params}`);
  },

  async submitReport(report: Omit<DailyReport, 'id' | 'submittedAt'>): Promise<DailyReport> {
    return apiCall('/reports', {
      method: 'POST',
      body: JSON.stringify(report)
    });
  },

  async updateReport(id: string, updates: Partial<DailyReport>): Promise<DailyReport> {
    return apiCall(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteReport(id: string): Promise<void> {
    return apiCall(`/reports/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin
  async getDashboardStats(): Promise<DashboardStats> {
    return apiCall('/admin/dashboard-stats');
  },

  async getAllInterns(): Promise<User[]> {
    return apiCall('/admin/users');
  },

  async deleteUser(userId: string): Promise<void> {
    return apiCall(`/admin/users/${userId}`, {
      method: 'DELETE'
    });
  }
};
