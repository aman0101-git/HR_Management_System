import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, Calendar, Lock } from "lucide-react";

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  status_name: string;
  follow_up_date: string | null;
  last_update_time: string;
  is_final_stage: number;
}

type TabType = 'action_required' | 'upcoming' | 'closed';

export default function MyLeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('action_required');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/candidates/my-leads', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      setError('Network error while fetching leads.');
    } finally {
      setIsLoading(false);
    }
  };

  // KPI Calculations
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    totalActive: leads.filter(l => l.is_final_stage === 0).length,
    
    overdue: leads.filter(l => {
      if (l.is_final_stage === 1 || !l.follow_up_date) return false;
      const fDate = new Date(l.follow_up_date);
      fDate.setHours(0, 0, 0, 0);
      return fDate < today;
    }).length,
    
    todayCalls: leads.filter(l => {
      if (l.is_final_stage === 1 || !l.follow_up_date) return false;
      const fDate = new Date(l.follow_up_date);
      fDate.setHours(0, 0, 0, 0);
      return fDate.getTime() === today.getTime();
    }).length,
    
    // NEW: Accurate count specifically for the 'Upcoming' tab (> today)
    upcoming: leads.filter(l => {
      if (l.is_final_stage === 1 || !l.follow_up_date) return false;
      const fDate = new Date(l.follow_up_date);
      fDate.setHours(0, 0, 0, 0);
      return fDate > today;
    }).length,

    // NEW: Simplest & most reliable way to count Terminal/Closed leads
    closedTotal: leads.filter(l => l.is_final_stage === 1).length,
    
    selected: leads.filter(l => l.status_name.includes('Joined')).length,
    
    // FIX: Using || to check both strings correctly instead of concatenating
    notselected: leads.filter(l => l.status_name.includes('Not Interested') || l.status_name.includes('Rejected')).length,
  };

  // Filter logic based on Tabs
  const filteredLeads = leads.filter(lead => {
    if (activeTab === 'closed') return lead.is_final_stage === 1;
    
    if (lead.is_final_stage === 1) return false;

    if (activeTab === 'action_required') {
      if (!lead.follow_up_date) return false;
      const fDate = new Date(lead.follow_up_date);
      fDate.setHours(0,0,0,0);
      return fDate <= today; 
    }

    if (activeTab === 'upcoming') {
      if (!lead.follow_up_date) return false; 
      const fDate = new Date(lead.follow_up_date);
      fDate.setHours(0,0,0,0);
      return fDate > today;
    }
    
    return true;
  });

  // UI Helpers
  const getFollowUpBadge = (dateStr: string | null) => {
    if (!dateStr) return <span className="text-slate-400 font-medium">Not Set</span>;
    
    const fDate = new Date(dateStr);
    fDate.setHours(0,0,0,0);

    if (fDate < today) {
      return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold"><AlertCircle className="w-3 h-3"/> Overdue</span>;
    }
    if (fDate.getTime() === today.getTime()) {
      return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold"><Clock className="w-3 h-3"/> Call Today</span>;
    }
    return <span className="text-slate-600 font-medium">{fDate.toLocaleDateString('en-GB')}</span>;
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading Dashboard...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  return (
    <div className="space-y-6 mt-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Action Required</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-red-600">{stats.overdue}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Overdue Leads</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Calls Today</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-amber-500">{stats.todayCalls}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Scheduled</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active Pipeline</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-blue-600">{stats.totalActive}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Candidates</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Offers / Joined</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-emerald-600">{stats.selected}</span>
            <span className="text-sm font-semibold text-emerald-600/60 mb-1">Converted</span>
          </div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header & Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="px-6 py-5 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-800">My Pipeline Manager</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Prioritize your calls and track candidate movement.</p>
            </div>
          </div>
          
          {/* FIX: Tab buttons now use the precise stats calculated above */}
          <div className="px-6 flex gap-6 mt-2">
            <button onClick={() => setActiveTab('action_required')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'action_required' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Urgent & Today ({(stats.overdue + stats.todayCalls)})
            </button>
            <button onClick={() => setActiveTab('upcoming')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Upcoming Follow-ups ({stats.upcoming})
            </button>
            <button onClick={() => setActiveTab('closed')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'closed' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Closed / Terminal ({stats.closedTotal})
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-white text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Candidate Profile</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Pipeline Stage</th>
                <th className="px-6 py-4">Action Target</th>
                <th className="px-6 py-4">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold text-base">Inbox Zero!</p>
                    <p className="text-slate-400 text-sm mt-1">No candidates currently found in this view.</p>
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/hr/candidates/${lead.id}`)}
                    className="cursor-pointer hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-600">{lead.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider ${lead.is_final_stage === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {lead.status_name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {lead.is_final_stage === 1 ? (
                        <span className="inline-flex items-center gap-1 text-slate-400 font-bold text-xs uppercase"><Lock className="w-3 h-3"/> Locked</span>
                      ) : (
                        getFollowUpBadge(lead.follow_up_date)
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-400">
                      {new Date(lead.last_update_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}