
import React, { useState, useEffect } from 'react';
import { dataService } from '../../services/api';
import { User, Attendance, DailyReport } from '../../types';

const AdminInterns: React.FC = () => {
  const [interns, setInterns] = useState<User[]>([]);
  const [selectedIntern, setSelectedIntern] = useState<User | null>(null);
  const [internReports, setInternReports] = useState<DailyReport[]>([]);
  const [internAttendance, setInternAttendance] = useState<Attendance[]>([]);

  // Fix: Handle async response from dataService.getAllInterns
  const fetchInterns = async () => {
    const data = await dataService.getAllInterns();
    setInterns(data);
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  // Fix: Handle async responses and call reverse() on the resolved arrays
  const viewInternDetails = async (intern: User) => {
    setSelectedIntern(intern);
    const [reports, attendance] = await Promise.all([
      dataService.getReports(intern.id),
      dataService.getAttendance(intern.id)
    ]);
    setInternReports([...reports].reverse());
    setInternAttendance([...attendance].reverse());
  };

  // Fix: Ensure deleteUser is awaited before refreshing the list
  const handleDeleteIntern = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this intern? This will also remove all their logs and attendance history.')) {
      await dataService.deleteUser(id);
      setSelectedIntern(null);
      fetchInterns();
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Intern Directory</h1>
          <p className="text-sm text-slate-500">Manage intern accounts and track individual progress</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={fetchInterns}
             className="bg-white border border-slate-200 p-2 rounded-lg text-slate-600 hover:bg-slate-50"
             title="Refresh List"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intern List */}
        <div className="lg:col-span-4 space-y-4">
          {interns.length > 0 ? interns.map(intern => (
            <button
              key={intern.id}
              onClick={() => viewInternDetails(intern)}
              className={`w-full p-4 rounded-2xl text-left border transition-all ${
                selectedIntern?.id === intern.id 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <img src={intern.avatar} className="w-12 h-12 rounded-full border-2 border-white/20" alt="" />
                <div className="flex-1 overflow-hidden">
                  <h3 className="font-bold truncate">{intern.name}</h3>
                  <p className={`text-xs font-medium uppercase tracking-widest truncate ${selectedIntern?.id === intern.id ? 'text-indigo-100' : 'text-slate-400'}`}>
                    {intern.department}
                  </p>
                </div>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 italic">
              No interns registered yet.
            </div>
          )}
        </div>

        {/* Intern Details */}
        <div className="lg:col-span-8">
          {selectedIntern ? (
            <div className="space-y-6 animate-in slide-in-from-right duration-500">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-center">
                <img src={selectedIntern.avatar} className="w-24 h-24 rounded-full border-4 border-indigo-50 shadow-sm" alt="" />
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900">{selectedIntern.name}</h2>
                  <p className="text-slate-500 font-medium">{selectedIntern.email}</p>
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-widest">{selectedIntern.department}</span>
                    <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">Active Intern</span>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => handleDeleteIntern(selectedIntern.id)}
                     className="p-3 text-red-500 hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
                     title="Remove Intern"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Work Reports Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Activity History</h3>
                    <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{internReports.length} Logs</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {internReports.length > 0 ? internReports.map(report => (
                      <div key={report.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <p className="text-sm font-bold text-slate-900">{report.taskTitle}</p>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(report.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{report.taskDescription}</p>
                        <div className="flex justify-between items-center mt-3">
                           <span className="text-xs font-bold text-indigo-600 uppercase">{report.timeSpent}</span>
                           <div className="flex gap-1">
                             {report.toolsUsed.slice(0, 2).map(t => <span key={t} className="text-[8px] bg-slate-100 px-1 py-0.5 rounded">{t}</span>)}
                           </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-400 text-sm italic">No reports submitted yet.</div>
                    )}
                  </div>
                </div>

                {/* Attendance Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-widest">Attendance Records</h3>
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{internAttendance.length} Days</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {internAttendance.length > 0 ? internAttendance.map(att => (
                      <div key={att.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                          <div className="flex gap-3 mt-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">IN: {att.clockInTime}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OUT: {att.clockOutTime || '—'}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${att.status === 'PRESENT' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {att.status}
                        </span>
                      </div>
                    )) : (
                      <div className="p-12 text-center text-slate-400 text-sm italic">No attendance records found.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-slate-200 p-16 text-center text-slate-400">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                 </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-600">Select an Intern</h3>
              <p className="text-sm mt-2 max-w-xs mx-auto">Click on a name in the list to view their detailed work reports and attendance history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInterns;
