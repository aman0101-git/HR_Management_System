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

      <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="bg-white">
          <div className="px-6 py-5 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Pipeline Manager</h2>
              <p className="text-sm text-slate-500 mt-1">Prioritize your calls and track candidate movement.</p>
            </div>
            
            {/* Filters Container */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              
              {/* Pipeline Stage Dropdown */}
              <div className="relative w-full sm:w-56 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="">All Pipeline Stages</option>
                  {PIPELINE_STAGES.map(stage => (
                    <option key={stage} value={stage}>{stage}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search candidate or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="px-6 flex gap-8 border-b border-slate-200 overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => handleTabChange('action_required')} 
              className={`relative pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'action_required' ? 'text-red-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Urgent & Today 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'action_required' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                {(stats.overdue || 0) + (stats.todayCalls || 0)}
              </span>
              {activeTab === 'action_required' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />}
            </button>

            <button 
              onClick={() => handleTabChange('upcoming')} 
              className={`relative pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'upcoming' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Upcoming Follow-ups 
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                {stats.upcoming || 0}
              </span>
              {activeTab === 'upcoming' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />}
            </button>

            <button 
              onClick={() => handleTabChange('closed')} 
              className={`relative pb-4 text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'closed' ? 'text-slate-900' : 'text-slate-500 hover:text-slate-800'}`}
            >
              Closed / Terminal
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeTab === 'closed' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'}`}>
                {stats.closedTotal || 0}
              </span>
              {activeTab === 'closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900 rounded-t-full" />}
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm text-slate-600 border-collapse">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 whitespace-nowrap">Candidate Profile</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Contact</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Pipeline Stage</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Action Target</th>
                <th className="px-6 py-3.5 whitespace-nowrap">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin"></div>
                      <p className="text-slate-400 font-medium text-sm animate-pulse">Syncing pipeline data...</p>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-50 border border-slate-100 mb-4 shadow-sm">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-slate-900 font-semibold text-base mb-1">No candidates found</h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">There are no leads matching your current filters in this pipeline stage.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    onClick={() => navigate(`/hr/candidates/${lead.id}`)}
                    className="cursor-pointer hover:bg-blue-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100 text-xs">
                        {lead.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ring-1 ring-inset ${lead.is_final_stage === 1 ? 'bg-slate-50 text-slate-600 ring-slate-500/10' : 'bg-blue-50 text-blue-700 ring-blue-600/20'}`}>
                        {lead.status_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lead.is_final_stage === 1 ? (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-xs bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                          <Lock className="w-3.5 h-3.5"/> Locked
                        </span>
                      ) : (
                        getFollowUpBadge(lead.follow_up_date)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
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
          <div className="px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between bg-white gap-4">
            <span className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-900">{pagination.currentPage}</span> of <span className="font-semibold text-slate-900">{pagination.totalPages}</span> pages
              <span className="mx-2 text-slate-300">|</span>
              {pagination.totalRecords} total records
            </span>
            <div className="flex gap-2">
              <button 
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed transition-all shadow-sm"
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