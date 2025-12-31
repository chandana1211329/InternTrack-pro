
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { dataService } from '../../services/api';
import { Attendance } from '../../types';

const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState<Attendance[]>([]);

  // Fix: Correctly handle async response from dataService.getAttendance
  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const data = await dataService.getAttendance(user.id);
        setHistory([...data].reverse());
      }
    };
    fetchHistory();
  }, [user]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Attendance Log</h1>
        <p className="text-sm text-slate-500">Track your daily clock-in and clock-out activities</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock In</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Clock Out</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.map(att => (
                <tr key={att.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                    {new Date(att.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 border border-green-200">
                      {att.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{att.clockInTime}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{att.clockOutTime || 'Pending'}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 font-medium italic">Automatically verified via IP</span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic">No attendance history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-indigo-900">Need to correct a mistake?</h4>
          <p className="text-sm text-indigo-700">Attendance records are automatically logged. If you forgot to clock in or made an error, please contact your mentor to manually adjust your log.</p>
        </div>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-all">
          Contact Support
        </button>
      </div>
    </div>
  );
};

export default AttendancePage;
