
import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/api.ts';
import { DashboardStats, User, Attendance, DailyReport } from '../../types.ts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [interns, setInterns] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchDashboardData = async () => {
    setIsSyncing(true);
    try {
      const [s, i, a, r] = await Promise.all([
        dataService.getDashboardStats(),
        dataService.getAllInterns(),
        dataService.getAttendance(),
        dataService.getReports()
      ]);
      setStats(s);
      setInterns(i);
      setAttendance(a);
      setReports(r);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getTodayStatus = (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const entry = attendance.find(a => a.userId === userId && a.date === today);
    return entry;
  };

  const getLatestReport = (userId: string) => {
    const userReports = reports.filter(r => r.userId === userId);
    return userReports[userReports.length - 1];
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Accessing Admin Panel...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 mt-1">Real-time status of all active intern programs</p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncing && (
             <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded-md animate-pulse uppercase tracking-widest">Syncing...</span>
          )}
          <button 
            onClick={fetchDashboardData}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
            title="Refresh Data"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Interns', value: stats?.totalInterns, color: 'indigo', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )},
          { label: 'Clocked In Today', value: stats?.activeToday, color: 'green', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )},
          { label: 'Pending Logs', value: stats?.pendingReports, color: 'orange', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )},
          { label: 'Completion Rate', value: `${Math.round(stats?.completionRate || 0)}%`, color: 'violet', icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-${stat.color}-600 bg-${stat.color}-50`}>
              {stat.icon}
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Interns Activity Feed */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Live Activity Feed</h2>
          <p className="text-sm text-slate-500 mt-1">Tracking presence and work progress of all interns</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Intern</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Attendance Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Latest Task</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interns.map(intern => {
                const attToday = getTodayStatus(intern.id);
                const latestReport = getLatestReport(intern.id);
                
                return (
                  <tr key={intern.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img src={intern.avatar} className="w-10 h-10 rounded-full bg-slate-100" alt="" />
                        <div>
                          <p className="font-bold text-slate-900">{intern.name}</p>
                          <p className="text-xs text-slate-500 font-medium">{intern.department}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {attToday ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-green-50 text-green-700 border border-green-100 uppercase tracking-tighter">
                            Present
                          </span>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">IN: {attToday.clockInTime}</p>
                          {attToday.clockOutTime && <p className="text-[10px] text-slate-400 font-bold uppercase">OUT: {attToday.clockOutTime}</p>}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tighter">
                          Pending Check-in
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {latestReport ? (
                        <div className="max-w-xs">
                          <p className="text-sm font-bold text-slate-800 line-clamp-1">{latestReport.taskTitle}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{latestReport.timeSpent}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No reports today</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-indigo-500 rounded-full transition-all duration-1000`} style={{ width: latestReport ? '100%' : '15%' }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{latestReport ? 'Reported' : 'Ongoing'}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
