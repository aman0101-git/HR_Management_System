import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, AlertCircle, CheckCircle2, Calendar, Lock, Search,
  ChevronLeft, ChevronRight, Filter, PhoneCall, ExternalLink
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

// Import your centralized API Base and UI Components
import { API_BASE } from '../../../apiBase';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../../components/ui/sheet';
import { Button } from '../../../components/ui/button';
import LogCallForm, { type StatusMaster } from './LogCallForm';

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

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

export default function MyLeadsList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<KPIStats>({ totalActive: 0, overdue: 0, todayCalls: 0, upcoming: 0, closedTotal: 0, selected: 0 });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('action_required');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); 
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
  
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const limit = 10;
  const [masterStatuses, setMasterStatuses] = useState<StatusMaster[]>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/candidates/meta/statuses`, { credentials: 'include' });
        const data = await res.json();
        if (res.ok) setMasterStatuses(data.statuses);
      } catch (err) { console.error(err); }
    };
    fetchStatuses();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      if (pagination.currentPage !== 1) setPagination(prev => ({ ...prev, currentPage: 1 }));
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, [statusFilter]);

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
      if (statusFilter) queryParams.append('status', statusFilter);

      const response = await fetch(`${API_BASE}/api/candidates/my-leads?${queryParams.toString()}`, {
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
    setStatusFilter(''); 
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleRowClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsPanelOpen(true);
  };

  const getFollowUpBadge = (dateStr: string | null) => {
    if (!dateStr) return <span className="text-muted-foreground font-bold text-xs uppercase tracking-wider">Not Set</span>;
    
    const fDate = new Date(dateStr);
    const today = new Date();
    fDate.setHours(0,0,0,0);
    today.setHours(0,0,0,0);

    if (fDate < today) {
      return <span className="inline-flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest"><AlertCircle className="w-3 h-3"/> Overdue</span>;
    }
    if (fDate.getTime() === today.getTime()) {
      return <span className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest"><Clock className="w-3 h-3"/> Today</span>;
    }
    return <span className="text-foreground font-bold text-xs bg-secondary px-2.5 py-1 rounded-md border border-border">{fDate.toLocaleDateString('en-GB')}</span>;
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 mt-4 relative max-w-[1600px] mx-auto pb-12"
    >
      
      {/* Top KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Action Required", value: stats.overdue, label: "Overdue Leads", color: "text-destructive", bg: "bg-destructive/5", border: "border-destructive/10" },
          { title: "Calls Today", value: stats.todayCalls, label: "Scheduled", color: "text-amber-500", bg: "bg-amber-500/5", border: "border-amber-500/10" },
          { title: "Active Pipeline", value: stats.totalActive, label: "Candidates", color: "text-primary", bg: "bg-primary/5", border: "border-primary/10" },
          { title: "Converted", value: stats.selected, label: "Offers / Joined", color: "text-emerald-500", bg: "bg-emerald-500/5", border: "border-emerald-500/10", icon: <CheckCircle2 className="w-4 h-4 ml-1 inline-block"/> }
        ].map((kpi, i) => (
          <div key={i} className={`bg-card p-6 rounded-3xl shadow-sm border border-border relative overflow-hidden group`}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-transform duration-500 group-hover:scale-150 ${kpi.bg}`}></div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 relative z-10">
              {kpi.title} {kpi.icon}
            </p>
            <div className="flex items-end gap-3 relative z-10">
              <span className={`text-4xl font-black tracking-tighter ${kpi.color}`}>{kpi.value || 0}</span>
              <span className="text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wider">{kpi.label}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main Data Table Area */}
      <motion.div variants={itemVariants} className="bg-card rounded-3xl shadow-soft border border-border overflow-hidden flex flex-col">
        
        {/* Header Section */}
        <div className="p-6 sm:p-8 border-b border-border">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6">
            <div>
              <h2 className="text-2xl font-black text-foreground tracking-tight">My Pipeline Manager</h2>
              <p className="text-sm font-medium text-muted-foreground mt-1">Prioritize your calls and track candidate movement.</p>
            </div>
            
            {/* Filters Container */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Pipeline Stage Dropdown */}
              <div className="relative w-full sm:w-64 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-9 pr-8 py-3 bg-muted/60 dark:bg-muted/40 border border-border rounded-xl text-sm font-bold text-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option className="bg-white text-black dark:bg-card dark:text-foreground" value="">
                    All Pipeline Stages
                  </option>

                  {PIPELINE_STAGES.map(stage => (
                    <option 
                      key={stage} 
                      value={stage}
                      className="bg-white text-black dark:bg-card dark:text-foreground"
                    >
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-border rounded-xl text-sm font-medium text-foreground placeholder:text-muted-foreground focus:bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
                />
              </div>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex gap-6 mt-8 overflow-x-auto scrollbar-hide">
            {[
              { id: 'action_required', label: 'Urgent & Today', count: (stats.overdue || 0) + (stats.todayCalls || 0), color: 'text-destructive', bg: 'bg-destructive' },
              { id: 'upcoming', label: 'Upcoming', count: stats.upcoming || 0, color: 'text-primary', bg: 'bg-primary' },
              { id: 'closed', label: 'Terminal / Closed', count: stats.closedTotal || 0, color: 'text-foreground', bg: 'bg-foreground' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)} 
                className={`relative pb-4 text-sm font-black transition-colors whitespace-nowrap tracking-wide uppercase ${activeTab === tab.id ? tab.color : 'text-muted-foreground hover:text-foreground'}`}
              >
                {tab.label}
                <span className={`ml-2 px-2 py-0.5 rounded-md text-[10px] border ${activeTab === tab.id ? `${tab.bg}/10 border-${tab.bg}/20` : 'bg-secondary border-border text-muted-foreground'}`}>
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <motion.div layoutId="pipeline-tab-indicator" className={`absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full ${tab.bg}`} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/20 text-muted-foreground font-black text-[10px] uppercase tracking-widest border-b border-border">
              <tr>
                <th className="px-8 py-4 whitespace-nowrap">Candidate Profile</th>
                <th className="px-8 py-4 whitespace-nowrap">Contact</th>
                <th className="px-8 py-4 whitespace-nowrap">Pipeline Stage</th>
                <th className="px-8 py-4 whitespace-nowrap">Action Target</th>
                <th className="px-8 py-4 whitespace-nowrap">Last Modified</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest animate-pulse">Syncing pipeline data...</p>
                    </div>
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary border border-border mb-4 shadow-sm">
                      <Calendar className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground font-black text-lg mb-1">No candidates found</h3>
                    <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">There are no leads matching your current filters in this pipeline stage.</p>
                  </td>
                </tr>
              ) : (
                leads.map((lead, index) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={lead.id} 
                    onClick={() => handleRowClick(lead)} 
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="font-black text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {lead.first_name} {lead.last_name}
                      </div>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className="font-mono font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-md border border-border text-[11px]">
                        {lead.phone}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${lead.is_final_stage === 1 ? 'bg-secondary text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20'}`}>
                        {lead.status_name}
                      </span>
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap">
                      {lead.is_final_stage === 1 ? (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground font-black text-[10px] uppercase tracking-widest bg-secondary px-3 py-1 rounded-lg border border-border">
                          <Lock className="w-3 h-3"/> Locked
                        </span>
                      ) : (
                        getFollowUpBadge(lead.follow_up_date)
                      )}
                    </td>
                    <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-muted-foreground">
                      {new Date(lead.last_update_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!isLoading && pagination.totalPages > 1 && (
          <div className="px-8 py-5 border-t border-border flex flex-col sm:flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/20 gap-4">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Page <span className="text-foreground">{pagination.currentPage}</span> of <span className="text-foreground">{pagination.totalPages}</span>
              <span className="mx-2 opacity-50">|</span>
              {pagination.totalRecords} Records
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                size="icon"
                disabled={pagination.currentPage === 1}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                className="rounded-xl border-border"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline"
                size="icon"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                className="rounded-xl border-border"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Slide-out Panel (Sheet) for Quick Interactions */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent className="w-full sm:max-w-md border-l border-border shadow-2xl overflow-y-auto bg-card">
          <SheetHeader className="pb-6 border-b border-border">
            <SheetTitle className="text-3xl font-black text-foreground tracking-tight">
              {selectedLead?.first_name} {selectedLead?.last_name}
            </SheetTitle>
            <SheetDescription className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 inline-block px-3 py-1 rounded-lg w-fit mt-2">
              {selectedLead?.phone}
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-2 gap-3">
               <Button 
                  className="w-full flex items-center justify-center gap-2 rounded-xl font-bold border-border" 
                  variant="outline" 
                  onClick={() => window.open(`tel:${selectedLead?.phone}`)}
               >
                 <PhoneCall className="w-4 h-4" /> Dial Number
               </Button>
               <Button 
                  className="w-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-foreground flex items-center justify-center gap-2 border border-border rounded-xl font-bold"
                  onClick={() => navigate(`/hr/candidates/${selectedLead?.id}`)}
               >
                 <ExternalLink className="w-4 h-4" /> Full Profile
               </Button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-border text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Current Status:</span>
                  <span className="font-black text-foreground">{selectedLead?.status_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Follow-up:</span>
                  <span className="font-black text-foreground">
                    {selectedLead?.follow_up_date ? new Date(selectedLead.follow_up_date).toLocaleDateString() : 'None Set'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Last Modified:</span>
                  <span className="font-black text-foreground">
                    {selectedLead ? new Date(selectedLead.last_update_time).toLocaleDateString() : ''}
                  </span>
                </div>
            </div>

            {selectedLead && (
              <LogCallForm 
                candidateId={selectedLead.id}
                currentStatusName={selectedLead.status_name}
                isLocked={selectedLead.is_final_stage === 1}
                statuses={masterStatuses}
                onSuccess={() => {
                  setIsPanelOpen(false); 
                  fetchLeads(); 
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}