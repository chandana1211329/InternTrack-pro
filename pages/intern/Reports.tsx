
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { dataService } from '../../services/api.ts';
import { DailyReport } from '../../types.ts';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [tools, setTools] = useState('');
  const [timeSpent, setTimeSpent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReports = async () => {
    if (user) {
      setLoading(true);
      const data = await dataService.getReports(user.id);
      setReports(data.reverse());
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      if (isEditing) {
        const updated = await dataService.updateReport(isEditing, {
          taskTitle,
          taskDescription,
          toolsUsed: tools.split(',').map(t => t.trim()),
          timeSpent
        });
        setReports(reports.map(r => r.id === isEditing ? updated : r));
      } else {
        const newReport = await dataService.submitReport({
          userId: user.id,
          date: new Date().toISOString().split('T')[0],
          taskTitle,
          taskDescription,
          toolsUsed: tools.split(',').map(t => t.trim()),
          timeSpent
        });
        setReports([newReport, ...reports]);
      }
      resetForm();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(null);
    setTaskTitle('');
    setTaskDescription('');
    setTools('');
    setTimeSpent('');
  };

  const handleEdit = (report: DailyReport) => {
    setTaskTitle(report.taskTitle);
    setTaskDescription(report.taskDescription);
    setTools(report.toolsUsed.join(', '));
    setTimeSpent(report.timeSpent);
    setIsEditing(report.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this work log permanently?')) {
      try {
        await dataService.deleteReport(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  if (loading && reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
        <p className="text-slate-400 text-sm">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Work Logs</h1>
          <p className="text-sm text-slate-500">Detailed record of your daily activities and contributions</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Report
          </button>
        )}
      </header>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 overflow-hidden animate-in zoom-in duration-300">
          <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white">{isEditing ? 'Edit Work Report' : 'Daily Work Report'}</h2>
              <p className="text-indigo-100 text-sm">Fill in what you've achieved today</p>
            </div>
            {isEditing && (
               <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Editing ID: {isEditing}</span>
            )}
          </div>
          <form className="p-6 space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title</label>
                <input 
                  required
                  type="text" 
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. Dashboard UI Implementation"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-slate-700 mb-1">Time Spent</label>
                <input 
                  required
                  type="text" 
                  value={timeSpent}
                  onChange={e => setTimeSpent(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="e.g. 4 Hours"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Work Description</label>
              <textarea 
                required
                rows={4}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="Detailed explanation of the tasks completed..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Technologies / Tools (Comma separated)</label>
              <input 
                required
                type="text" 
                value={tools}
                onChange={e => setTools(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="React, Tailwind, Figma, Git"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button"
                onClick={resetForm}
                className="px-6 py-2 text-slate-600 font-semibold hover:bg-slate-50 rounded-lg"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-2 bg-indigo-600 text-white font-bold rounded-lg shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>}
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Log' : 'Submit Log')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reports.map(report => (
          <div key={report.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">{report.taskTitle}</h3>
              </div>
              <div className="flex items-center gap-2">
                 <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleEdit(report)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="Edit Log"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                       </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(report.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                      title="Delete Log"
                    >
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                       </svg>
                    </button>
                 </div>
                 <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">SUBMITTED</span>
              </div>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{report.taskDescription}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {report.toolsUsed.map(tool => (
                <span key={tool} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded uppercase">{tool}</span>
              ))}
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center text-xs">
              <div className="flex items-center text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {report.timeSpent}
              </div>
              <span className="text-slate-400 font-mono">ID: {report.id}</span>
            </div>
          </div>
        ))}
        {reports.length === 0 && !showForm && (
          <div className="col-span-full py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center">
            <p className="text-slate-500 font-medium">No reports yet. Time to log your first win!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
