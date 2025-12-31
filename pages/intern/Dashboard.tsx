
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { dataService } from '../../services/api.ts';
import { Attendance, DailyReport } from '../../types.ts';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [allAttendance, setAllAttendance] = useState<Attendance[]>([]);
  const [allReports, setAllReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [breakStatus, setBreakStatus] = useState<any>(null);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const history = await dataService.getAttendance(user.id);
      const today = new Date().toISOString().split('T')[0];
      setTodayAttendance(history.find(a => a.date === today) || null);
      setAllAttendance(history);
      const reports = await dataService.getReports(user.id);
      setAllReports(reports);
      
      // Get break status
      try {
        const status = await dataService.getBreakStatus();
        setBreakStatus(status);
      } catch (e) {
        // User hasn't clocked in yet
        setBreakStatus({ onBreak: false, hasClockedIn: false });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleClockIn = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const entry = await dataService.clockIn(user.id);
      setTodayAttendance(entry);
      setAllAttendance([...allAttendance, entry]);
      // Refresh break status
      const status = await dataService.getBreakStatus();
      setBreakStatus(status);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!user) return;
    setActionLoading(true);
    try {
      const entry = await dataService.clockOut(user.id);
      setTodayAttendance(entry);
      setAllAttendance(allAttendance.map(a => a.id === entry.id ? entry : a));
      // Refresh break status
      const status = await dataService.getBreakStatus();
      setBreakStatus(status);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartBreak = async () => {
    setActionLoading(true);
    try {
      const entry = await dataService.startBreak();
      setTodayAttendance(entry);
      // Refresh break status
      const status = await dataService.getBreakStatus();
      setBreakStatus(status);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEndBreak = async () => {
    setActionLoading(true);
    try {
      const entry = await dataService.endBreak();
      setTodayAttendance(entry);
      // Refresh break status
      const status = await dataService.getBreakStatus();
      setBreakStatus(status);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 font-medium animate-pulse">Synchronizing with server...</p>
      </div>
    );
  }

  const recentReports = [...allReports].reverse().slice(0, 3);
  const daysPresent = allAttendance.length;
  const workLogsCount = allReports.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hello, {user?.name}! 👋</h1>
          <p className="text-slate-500 mt-1">Here's your overview for today, {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Attendance Card */}
        <div className="col-span-1 md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
          {actionLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
               <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
            </div>
          )}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Time Tracking
            </h2>
            <div className="mt-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Current Status</p>
                <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                  !todayAttendance ? 'bg-slate-100 text-slate-600' :
                  todayAttendance.clockOutTime ? 'bg-green-100 text-green-700' :
                  breakStatus?.onBreak ? 'bg-orange-100 text-orange-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    !todayAttendance ? 'bg-slate-400' :
                    todayAttendance.clockOutTime ? 'bg-green-500' :
                    breakStatus?.onBreak ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}></span>
                  {!todayAttendance ? 'Not Checked In' :
                   todayAttendance.clockOutTime ? 'Finished for the day' :
                   breakStatus?.onBreak ? 'On Break' :
                   'Active / Working'}
                </div>
                
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase">Clock In</p>
                    <p className="text-xl font-bold text-slate-700">{todayAttendance?.clockInTime || '--:--'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-xs text-slate-400 font-bold uppercase">Clock Out</p>
                    <p className="text-xl font-bold text-slate-700">{todayAttendance?.clockOutTime || '--:--'}</p>
                  </div>
                </div>

                {breakStatus?.totalBreakMinutes > 0 && (
                  <div className="mt-4 bg-orange-50 p-3 rounded-lg border border-orange-100">
                    <p className="text-xs font-bold text-orange-600 uppercase">Total Break Time</p>
                    <p className="text-lg font-bold text-orange-700">
                      {Math.floor(breakStatus.totalBreakMinutes / 60)}h {breakStatus.totalBreakMinutes % 60}m
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 w-full md:w-auto">
                {!todayAttendance ? (
                  <button 
                    disabled={actionLoading}
                    onClick={handleClockIn}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                  >
                    Clock In Now
                  </button>
                ) : todayAttendance.clockOutTime ? (
                  <div className="px-8 py-4 bg-green-50 text-green-700 rounded-xl font-bold text-center">
                    Shift Completed! 🎉
                  </div>
                ) : breakStatus?.onBreak ? (
                  <button 
                    disabled={actionLoading}
                    onClick={handleEndBreak}
                    className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Resume Work
                  </button>
                ) : (
                  <>
                    <button 
                      disabled={actionLoading}
                      onClick={handleStartBreak}
                      className="px-8 py-4 bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Take Break
                    </button>
                    <button 
                      disabled={actionLoading}
                      onClick={handleClockOut}
                      className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                    >
                      Clock Out
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100">
            <p className="text-xs text-slate-500 text-center md:text-left">Attendance is verified based on system clock and IP security.</p>
          </div>
        </div>

        {/* Dynamic Stats */}
        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex flex-col justify-between">
          <div>
            <h3 className="text-indigo-100 font-medium">Your Performance</h3>
            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-500 pb-2">
                <span className="text-sm">Days Present</span>
                <span className="font-bold text-xl">{daysPresent}</span>
              </div>
              <div className="flex justify-between items-center border-b border-indigo-500 pb-2">
                <span className="text-sm">Work Logs</span>
                <span className="font-bold text-xl">{workLogsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Completion</span>
                <span className="font-bold text-xl">{daysPresent > 0 ? Math.round((workLogsCount / daysPresent) * 100) : 0}%</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-[10px] text-indigo-200 font-medium text-center uppercase tracking-widest">Calculated from actual history</p>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-800">Recent Work Reports</h2>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</button>
        </div>
        <div className="p-0">
          {recentReports.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentReports.map(report => (
                <div key={report.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-slate-900">{report.taskTitle}</h3>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{report.taskDescription}</p>
                      <div className="mt-3 flex gap-2">
                        {report.toolsUsed.map(tool => (
                          <span key={tool} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-bold uppercase tracking-tight">{tool}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">{report.timeSpent}</span>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(report.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">No reports submitted yet.</p>
              <p className="text-sm text-slate-400 mt-1">Start by logging your daily activity.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
