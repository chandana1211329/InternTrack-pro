
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const internLinks = [
    { name: 'Dashboard', path: '/intern' },
    { name: 'Attendance', path: '/intern/attendance' },
    { name: 'Work Log', path: '/intern/reports' },
  ];

  const adminLinks = [
    { name: 'Overview', path: '/admin' },
    { name: 'Manage Interns', path: '/admin/interns' },
  ];

  const links = user?.role === UserRole.ADMIN ? adminLinks : internLinks;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">I</div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Klassygo</span>
            </Link>
            
            <div className="hidden md:flex items-center space-x-4">
              {links.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(link.path) 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-3 py-1 bg-slate-50 rounded-full">
              <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full border border-white shadow-sm" />
              <div className="hidden sm:block text-xs">
                <p className="font-semibold text-slate-900">{user?.name}</p>
                <p className="text-slate-500 uppercase tracking-wider font-bold">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
