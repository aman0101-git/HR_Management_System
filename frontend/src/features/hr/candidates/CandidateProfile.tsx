import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Phone, Mail, Briefcase, MapPin, DollarSign, ExternalLink, 
  Lock, CheckCircle2, Clock, XCircle, PhoneCall, List, PhoneMissed, PhoneOff, MessageSquare, ArrowLeft,
  Loader2, ChevronRight, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { API_BASE } from '../../../apiBase';

interface StatusMaster {
  id: number;
  status_name: string;
  is_final_stage: number;
}

interface TimelineEvent {
  id: number;
  status_name: string;
  remarks: string;
  follow_up_date: string | null;
  created_at: string;
  is_final_stage: number;
}

interface CallLog {
  id: number;
  call_result: string;
  call_duration: number | null;
  notes: string;
  call_time: string;
  first_name: string;
  last_name: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [statuses, setStatuses] = useState<StatusMaster[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  
  // Tab State
  const [activeTab, setActiveTab] = useState<'journey' | 'calls'>('journey');

  // Unified Form State
  const [statusId, setStatusId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [logCall, setLogCall] = useState(true); 
  const [callResult, setCallResult] = useState('Connected');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // LOGIC: Should we show the pipeline update fields?
  const isPipelineUpdate = !logCall || (logCall && callResult === 'Connected');

  const selectedStatusObj = statuses.find(s => s.id.toString() === statusId);
  const isSelectedTerminal = selectedStatusObj ? selectedStatusObj.is_final_stage === 1 : false;

  const currentLeadStatus = timeline.length > 0 ? timeline[0] : null;
  const isProfileLocked = currentLeadStatus ? currentLeadStatus.is_final_stage === 1 : false;

  useEffect(() => {
    fetchProfileData();
    fetchStatuses();
    fetchCallLogs();
  }, [id]);

  useEffect(() => {
    if (timeline.length > 0 && statuses.length > 0 && !statusId) {
      const currentStatusMatch = statuses.find(s => s.status_name === timeline[0].status_name);
      if (currentStatusMatch) {
        setStatusId(currentStatusMatch.id.toString());
      }
    }
  }, [timeline, statuses]);

  const fetchStatuses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates/meta/statuses`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setStatuses(data.statuses);
    } catch (err) { console.error(err); }
  };

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setCandidate(data.candidate);
        setTimeline(data.timeline);
      } else {
        navigate('/hr/candidates'); 
      }
    } catch (err) { console.error(err); }
  };

  const fetchCallLogs = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/candidates/${id}/calls`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setCallLogs(data.callLogs);
    } catch (err) { console.error(err); }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const payload = {
        log_call: logCall,
        call_result: logCall ? callResult : null,
        status_id: isPipelineUpdate ? statusId : null,
        follow_up_date: (isPipelineUpdate && !isSelectedTerminal) ? followUpDate : null,
        remarks: remarks,
      };

      const res = await fetch(`${API_BASE}/api/candidates/${id}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // High-speed workflow: Return to pipeline queue instantly
        navigate('/hr/candidates');
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to save interaction');
      }
    } catch (err) {
      console.error(err);
      setError('Network error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (statusName: string) => {
    if (statusName.includes('Selected') || statusName === 'Joined') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (statusName.includes('Reject') || statusName.includes('Not Interested')) return <XCircle className="w-5 h-5 text-destructive" />;
    return <Clock className="w-5 h-5 text-primary" />;
  };

  const getCallIcon = (result: string) => {
    switch(result) {
      case 'Connected': return <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'Switched Off': return <PhoneOff className="w-4 h-4 text-destructive" />;
      default: return <PhoneMissed className="w-4 h-4 text-amber-500" />;
    }
  };

  if (!candidate) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <span className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">Loading Workspace...</span>
    </div>
  );

  const DetailRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-start py-2 border-b border-border/50 last:border-0">
        <span className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider mt-0.5">{label}</span>
        <span className="text-right text-sm text-foreground font-semibold max-w-[60%] break-words">{value}</span>
      </div>
    );
  };

  const inputClasses = "h-11 bg-muted/60 dark:bg-muted/40 border border-border focus:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl font-medium w-full text-sm px-3 py-2 outline-none text-foreground";
  const optionClass = "bg-white text-black dark:bg-card dark:text-foreground";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto p-4 sm:p-6 mt-4 space-y-6 pb-12"
    >
      
      {/* Top Header & Navigation Bar */}
      <motion.div variants={itemVariants} className="flex items-center justify-between bg-card p-4 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hidden sm:flex">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-foreground tracking-tight leading-none">Candidate Workspace</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">ID: {candidate.id} • Pipeline Execution</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/hr/candidates')} className="font-bold rounded-xl border-border">
          Back to Pipeline
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* LEFT COLUMN: Details & Unified Update Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Candidate Info Card */}
          <motion.div variants={itemVariants} className="bg-card p-6 rounded-3xl shadow-soft border border-border relative overflow-hidden">
            {/* Soft decorative background */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

            <div className="mb-6 relative z-10">
              <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">{candidate.first_name} {candidate.last_name}</h2>
              <p className="text-xs font-bold text-primary mt-1 uppercase tracking-wider">{candidate.current_designation || candidate.profile || 'General Profile'}</p>
            </div>

            <div className="space-y-6 relative z-10">
              {/* Quick Contact Block */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-3 text-sm text-foreground">
                  <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-border"><Phone className="w-4 h-4 text-primary shrink-0"/></div>
                  <span className="font-mono font-bold tracking-wide">{candidate.phone}</span>
                </div>
                {candidate.email && (
                  <div className="flex items-center gap-3 text-sm text-foreground">
                    <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg shadow-sm border border-border"><Mail className="w-4 h-4 text-primary shrink-0"/></div>
                    <span className="font-medium break-all">{candidate.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3">
                  <Briefcase className="w-3.5 h-3.5 text-primary" /> Professional
                </h4>
                <DetailRow label="Experience" value={candidate.experience_level} />
                <DetailRow label="Company" value={candidate.current_company} />
                <DetailRow label="Education" value={candidate.qualification ? `${candidate.qualification} ${candidate.passing_year ? `('${candidate.passing_year})` : ''}` : null} />
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3 mt-5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" /> Comp & Avail
                </h4>
                <DetailRow label="CTC (Cur/Exp)" value={candidate.current_ctc && candidate.expected_ctc ? `${candidate.current_ctc}L / ${candidate.expected_ctc}L` : null} />
                <DetailRow label="Notice Period" value={candidate.notice_period} />
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 mb-3 mt-5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" /> Source
                </h4>
                <DetailRow label="Location" value={candidate.current_location} />
                <div className="flex justify-between items-center py-2 border-t border-border mt-2">
                  <span className="font-bold text-muted-foreground text-[11px] uppercase tracking-wider">Origin</span>
                  <span className="bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider">{candidate.source}</span>
                </div>
              </div>

              {candidate.resume_url && (
                <div className="pt-2">
                  <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-all py-3 rounded-xl text-sm font-bold shadow-sm">
                    <ExternalLink className="w-4 h-4" /> View Resume Details
                  </a>
                </div>
              )}
            </div>
          </motion.div>

          {/* Dynamic Action Area */}
          <motion.div variants={itemVariants}>
            {isProfileLocked ? (
              <div className="bg-destructive/5 p-6 rounded-3xl border border-destructive/20 text-center space-y-3">
                <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-6 h-6 text-destructive" />
                </div>
                <h3 className="text-lg font-black text-destructive">Profile Locked</h3>
                <p className="text-xs text-destructive/80 font-bold leading-relaxed">This candidate reached a final stage (<span className="uppercase text-destructive">{currentLeadStatus?.status_name}</span>). Further interactions are disabled.</p>
              </div>
            ) : (
              <div className="bg-card p-6 rounded-3xl shadow-soft border border-border">
                <h3 className="text-base font-black text-foreground mb-5 pb-4 border-b border-border flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" /> Execute Interaction
                </h3>
                
                {error && (
                  <div className="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                <form onSubmit={handleLogInteraction} className="space-y-5">
                  
                  {/* Call Logging Section */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-border space-y-4">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-3 rounded-xl border border-border shadow-sm">
                      <label className="text-sm font-bold text-foreground flex items-center gap-3 cursor-pointer w-full">
                        <input 
                          type="checkbox" 
                          checked={logCall} 
                          onChange={(e) => {
                            setLogCall(e.target.checked);
                            if (!e.target.checked) setCallResult('');
                          }}
                          className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
                        />
                        Dialer Executed
                      </label>
                      {logCall && <PhoneCall className="w-4 h-4 text-primary animate-pulse" />}
                    </div>

                    <AnimatePresence>
                      {logCall && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-2">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Call Result *</label>
                            <select required={logCall} value={callResult} onChange={(e) => setCallResult(e.target.value)} className={inputClasses}>
                              <option className={optionClass} value="" disabled>Select outcome...</option>
                              <option className={optionClass} value="Connected">Connected</option>
                              <option className={optionClass} value="Not Connected">Not Connected</option>
                              <option className={optionClass} value="Switched Off">Switched Off</option>
                              <option className={optionClass} value="Ringing">Ringing</option>
                              <option className={optionClass} value="Busy">Busy</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Pipeline Section */}
                  <AnimatePresence>
                    {isPipelineUpdate && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-4 pt-2 overflow-hidden"
                      >
                        <div>
                          <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Update Pipeline Stage *</label>
                          <select required value={statusId} onChange={(e) => {
                              setStatusId(e.target.value);
                              const newStatus = statuses.find(s => s.id.toString() === e.target.value);
                              if (newStatus && newStatus.is_final_stage === 1) setFollowUpDate('');
                            }} 
                            className={inputClasses}
                          >
                            <option className={optionClass} value="" disabled>Select pipeline stage...</option>
                            {statuses.map(s => (
                              <option className={optionClass} key={s.id} value={s.id}>{s.status_name}</option>
                            ))}
                          </select>
                        </div>
                        
                        {!isSelectedTerminal && (
                          <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Next Follow-up Date *</label>
                            <input 
                              type="date" 
                              required 
                              value={followUpDate} 
                              min={new Date().toISOString().split('T')[0]} 
                              onChange={(e) => setFollowUpDate(e.target.value)} 
                              className={inputClasses}
                            />
                          </div>
                        )}

                        {isSelectedTerminal && (
                          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 p-3 rounded-xl text-xs font-bold flex items-start gap-2">
                            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                            Warning: Selecting this locks the profile permanently.
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remarks */}
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1">Interaction Notes *</label>
                    <textarea required rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={isPipelineUpdate ? "Summarize the interaction..." : "Why didn't the call connect?"} className={`${inputClasses} resize-none`}></textarea>
                  </div>

                  <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 rounded-xl shadow-soft transition-all text-sm uppercase tracking-wider">
                    {isSubmitting ? (
                      <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Syncing...</span>
                    ) : (
                      isPipelineUpdate ? 'Save & Progress Pipeline' : 'Log Call Attempt'
                    )}
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        </div>

        {/* RIGHT COLUMN: The Read-Only Dynamic Workspace (Tabs) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-card rounded-3xl shadow-soft border border-border h-fit overflow-hidden flex flex-col">
          
          {/* Animated Tab Header */}
          <div className="flex p-2 gap-2 border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
            {['journey', 'calls'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as 'journey' | 'calls')}
                className={`relative flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all rounded-xl z-10 ${
                  activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="active-tab-indicator"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-border -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {tab === 'journey' ? <List className="w-4 h-4" /> : <PhoneCall className="w-4 h-4" />}
                {tab === 'journey' ? 'Pipeline History' : 'Dialer Audit'}
                {tab === 'calls' && callLogs.length > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-[10px] ml-1 transition-colors ${activeTab === 'calls' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {callLogs.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8 bg-card flex-1">
            <AnimatePresence mode="wait">
              {/* TAB CONTENT: Candidate Journey */}
              {activeTab === 'journey' && (
                <motion.div 
                  key="journey"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="relative border-l-[3px] border-slate-100 dark:border-slate-800 ml-4 space-y-8"
                >
                  {timeline.map((event, index) => (
                    <div key={event.id} className="relative pl-8 sm:pl-10">
                      <div className="absolute -left-[17px] top-0 bg-card p-1.5 rounded-full border-[3px] border-slate-100 dark:border-slate-800">
                        {getStatusIcon(event.status_name)}
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-3">
                        <h4 className={`text-base font-black tracking-tight flex items-center gap-3 ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {event.status_name}
                          {index === 0 && <span className="text-[9px] bg-primary/10 text-primary px-2.5 py-1 rounded-md uppercase tracking-widest font-black border border-primary/20">Current Stage</span>}
                        </h4>
                        <span className="text-[11px] font-bold text-muted-foreground mt-1 md:mt-0 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg border border-border">
                          {new Date(event.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      
                      <div className={`text-sm p-5 rounded-2xl font-medium shadow-sm border ${index === 0 ? 'bg-primary/5 border-primary/20 text-foreground' : 'bg-white dark:bg-slate-900 border-border text-muted-foreground'}`}>
                        <p className="italic">"{event.remarks}"</p>
                      </div>

                      {event.follow_up_date && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Scheduled: {new Date(event.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {/* TAB CONTENT: Call Logs */}
              {activeTab === 'calls' && (
                <motion.div 
                  key="calls"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {callLogs.length === 0 ? (
                    <div className="text-center py-16 text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-border rounded-3xl flex flex-col items-center">
                      <PhoneOff className="w-10 h-10 text-slate-300 dark:text-slate-700 mb-4" />
                      <p className="font-bold">No dialer execution records found.</p>
                    </div>
                  ) : (
                    callLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-5 rounded-2xl border border-border bg-slate-50/50 dark:bg-slate-900/20 hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm group">
                        <div className="mt-1 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-border shadow-sm group-hover:scale-110 transition-transform">
                          {getCallIcon(log.call_result)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-black text-foreground tracking-tight">{log.call_result}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider border border-border">
                              {new Date(log.call_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                            </span>
                          </div>
                          {log.notes && <p className="text-sm text-muted-foreground font-medium leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-border">"{log.notes}"</p>}
                          <p className="text-[9px] font-black text-muted-foreground mt-3 uppercase tracking-widest flex items-center gap-1.5">
                            <ChevronRight className="w-3 h-3 text-primary" /> Executed by Agent: {log.first_name} {log.last_name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}