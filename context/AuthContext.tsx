import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { mockAuthService } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, department: string) => Promise<void>;
  registerWithPassword: (name: string, email: string, password: string, department: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and user data
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const response = await mockAuthService.login(email, pass);
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, department: string) => {
    // This method is kept for compatibility but will throw an error
    throw new Error('Use registerWithPassword method instead');
  };

  const registerWithPassword = async (name: string, email: string, password: string, department: string) => {
    try {
      const response = await mockAuthService.registerWithPassword(name, email, password, department);
      setUser(response);
      localStorage.setItem('user', JSON.stringify(response));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerWithPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};