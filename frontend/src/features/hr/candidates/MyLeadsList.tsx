import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertCircle, CheckCircle2, Calendar, Lock, Search, ChevronLeft, ChevronRight, Filter } from "lucide-react";

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

interface KPIStats {
  totalActive: number;
  overdue: number;
  todayCalls: number;
  upcoming: number;
  closedTotal: number;
  selected: number;
}

type TabType = 'action_required' | 'upcoming' | 'closed';

const PIPELINE_STAGES = [
  'New Lead', 'Not Interested', 'Interested', 'Follow-up Required',
  'Interview Scheduled', 'Interview Done', 'Rejected',
  'Selected-Not-Joined', 'Selected-Joined'
];

export default function MyLeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<KPIStats>({ totalActive: 0, overdue: 0, todayCalls: 0, upcoming: 0, closedTotal: 0, selected: 0 });
  
  // Pagination & Filtering State
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('action_required');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // NEW: Status Filter State
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  
  const navigate = useNavigate();
  const limit = 10;

  // Debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (pagination.currentPage !== 1) {
        setPagination(prev => ({ ...prev, currentPage: 1 }));
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Reset to page 1 when the status filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [statusFilter]);

  // Fetch leads whenever tab, search, status, or page changes
  useEffect(() => {
    fetchLeads();
  }, [activeTab, debouncedSearch, statusFilter, pagination.currentPage]);

  const fetchLeads = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: limit.toString(),
        tab: activeTab,
        search: debouncedSearch,
      });

      // Only append status if one is actively selected
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:8080/api/candidates/my-leads?${queryParams.toString()}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads);
        setStats(data.stats);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Network error while fetching leads.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter(''); // Clear the dropdown when switching main tabs
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const getFollowUpBadge = (dateStr: string | null) => {
    if (!dateStr) return <span className="text-slate-400 font-medium">Not Set</span>;
    
    const fDate = new Date(dateStr);
    const today = new Date();
    fDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    if (fDate < today) {
      return <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2.5 py-1 rounded-md text-xs font-bold"><AlertCircle className="w-3 h-3"/> Overdue</span>;
    }
    if (fDate.getTime() === today.getTime()) {
      return <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold"><Clock className="w-3 h-3"/> Call Today</span>;
    }
    return <span className="text-slate-600 font-medium">{fDate.toLocaleDateString('en-GB')}</span>;
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-red-50 to-white">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Action Required</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-red-600">{stats.overdue || 0}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Overdue Leads</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-yellow-50 to-white">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Calls Today</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-amber-500">{stats.todayCalls || 0}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Scheduled</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Active Pipeline</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-blue-600">{stats.totalActive || 0}</span>
            <span className="text-sm font-semibold text-slate-400 mb-1">Candidates</span>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1 flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4"/> Offers / Joined</p>
          <div className="flex items-end gap-3">
            <span className="text-3xl font-black text-emerald-600">{stats.selected || 0}</span>
            <span className="text-sm font-semibold text-emerald-600/60 mb-1">Converted</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header, Search, Dropdown & Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <div className="px-6 py-5 flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 border-b border-slate-200">
            <div>
              <h2 className="text-xl font-black text-slate-800">My Pipeline Manager</h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">Prioritize your calls and track candidate movement.</p>
            </div>
            
            {/* Filters Container */}
            <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
              
              {/* NEW: Pipeline Stage Dropdown */}
              <div className="relative w-full sm:w-48">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Stages</option>
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                {/* Custom dropdown arrow to replace default browser styling */}
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="px-6 flex gap-72 mt-2 overflow-x-auto whitespace-nowrap">
            <button onClick={() => handleTabChange('action_required')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'action_required' ? 'border-red-500 text-red-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Urgent & Today ({(stats.overdue || 0) + (stats.todayCalls || 0)})
            </button>
            <button onClick={() => handleTabChange('upcoming')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Upcoming Follow-ups ({stats.upcoming || 0})
            </button>
            <button onClick={() => handleTabChange('closed')} className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 ${activeTab === 'closed' ? 'border-slate-800 text-slate-800' : 'border-transparent text-slate-400 hover:text-slate-700'}`}>
              Closed / Terminal ({stats.closedTotal || 0})
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
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
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium animate-pulse">
                    Syncing pipeline data...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-bold text-base">Inbox Zero!</p>
                    <p className="text-slate-400 text-sm mt-1">No candidates currently found for this filter.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
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

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm font-medium text-slate-500">
              Showing page <span className="font-bold text-slate-800">{pagination.currentPage}</span> of <span className="font-bold text-slate-800">{pagination.totalPages}</span>
              {' '}({pagination.totalRecords} total records)
            </span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}