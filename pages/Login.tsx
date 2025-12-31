import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { UserRole } from '../types.ts';

const Login: React.FC = () => {
  const { login, registerWithPassword } = useAuth();
  const [activeRole, setActiveRole] = useState<UserRole>(UserRole.INTERN);
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password validation state
  const [passwordValidity, setPasswordValidity] = useState({
    minChar: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  useEffect(() => {
    if (isRegister) {
      setPasswordValidity({
        minChar: password.length >= 8,
        hasUpper: /[A-Z]/.test(password),
        hasLower: /[a-z]/.test(password),
        hasNumber: /[0-9]/.test(password),
      });
    }
  }, [password, isRegister]);

  const isPasswordStrong = () => {
    return passwordValidity.minChar && 
           passwordValidity.hasUpper && 
           passwordValidity.hasLower && 
           passwordValidity.hasNumber;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister && activeRole === UserRole.INTERN && !isPasswordStrong()) {
      setError('Please ensure your password meets all strength requirements.');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegister && activeRole === UserRole.INTERN) {
        await registerWithPassword(name, email, password, department);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    setIsRegister(false);
    setError('');
    if (role === UserRole.ADMIN) {
      setEmail('admin@system.com');
    } else {
      setEmail('');
    }
  };

  const ValidationItem = ({ label, met }: { label: string, met: boolean }) => (
    <div className={`flex items-center text-[11px] font-bold uppercase tracking-wider transition-colors ${met ? 'text-green-500' : 'text-slate-400'}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-2 ${met ? 'bg-green-500' : 'bg-slate-300'}`}></div>
      {label}
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 transition-all">
        
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mb-6 shadow-lg shadow-indigo-200">I</div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
            <button
              type="button"
              onClick={() => handleRoleChange(UserRole.INTERN)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeRole === UserRole.INTERN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Intern Portal
            </button>
            <button
              type="button"
              onClick={() => handleRoleChange(UserRole.ADMIN)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeRole === UserRole.ADMIN ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Admin Portal
            </button>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegister ? 'Create Account' : (activeRole === UserRole.ADMIN ? 'Admin Sign In' : 'Intern Sign In')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isRegister ? 'Join our intern program' : `Access your ${activeRole === UserRole.ADMIN ? 'management' : 'tracking'} tools`}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {isRegister && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
              <input
                required
                type="email"
                className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
                placeholder={activeRole === UserRole.ADMIN ? "admin@system.com" : "intern@company.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {isRegister && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Department</label>
                <select
                  className="block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm appearance-none"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <option>Engineering</option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Marketing</option>
                  <option>Human Resources</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                required
                type="password"
                className={`block w-full px-4 py-3.5 bg-slate-50 border rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all shadow-sm ${
                  isRegister && !isPasswordStrong() && password.length > 0 ? 'border-amber-200 focus:ring-amber-500' : 'border-slate-200 focus:ring-indigo-500'
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              
              {isRegister && (
                <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 animate-in fade-in duration-500">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Strength Checklist</p>
                  <ValidationItem label="At least 8 characters" met={passwordValidity.minChar} />
                  <ValidationItem label="Uppercase letter" met={passwordValidity.hasUpper} />
                  <ValidationItem label="Lowercase letter" met={passwordValidity.hasLower} />
                  <ValidationItem label="At least one number" met={passwordValidity.hasNumber} />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-xs font-bold bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center animate-in shake-in duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (isRegister && !isPasswordStrong())}
            className={`w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black uppercase tracking-widest rounded-2xl text-white transition-all shadow-xl ${
              isLoading || (isRegister && !isPasswordStrong())
                ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-indigo-200 active:translate-y-0'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (isRegister ? 'Register & Sign In' : 'Sign In')}
          </button>
        </form>

        <div className="mt-8 text-center">
          {activeRole === UserRole.INTERN ? (
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); setPassword(''); }}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          ) : (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em]">Admin Notice</p>
              <p className="text-xs text-indigo-700 mt-1 font-medium leading-relaxed">Administrator accounts must be pre-provisioned. Use system credentials to manage the platform.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;