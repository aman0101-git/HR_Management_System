import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { 
  Phone, Mail, Briefcase, MapPin, DollarSign, ExternalLink, 
  Lock, CheckCircle2, Clock, XCircle, PhoneCall, List, PhoneMissed, PhoneOff, MessageSquare, ArrowLeft
} from "lucide-react";

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
  const [callResult, setCallResult] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const res = await fetch('http://localhost:8080/api/candidates/meta/statuses', { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setStatuses(data.statuses);
    } catch (err) { console.error(err); }
  };

  const fetchProfileData = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/candidates/${id}`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setCandidate(data.candidate);
        setTimeline(data.timeline);
      } else {
        navigate('/hr/dashboard'); 
      }
    } catch (err) { console.error(err); }
  };

  const fetchCallLogs = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/candidates/${id}/calls`, { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setCallLogs(data.callLogs);
    } catch (err) { console.error(err); }
  };

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        log_call: logCall,
        call_result: logCall ? callResult : null,
        status_id: isPipelineUpdate ? statusId : null,
        follow_up_date: (isPipelineUpdate && !isSelectedTerminal) ? followUpDate : null,
        remarks: remarks,
      };

      const res = await fetch(`http://localhost:8080/api/candidates/${id}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Redirect to main queue upon successful save
        navigate('/hr/dashboard');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (statusName: string) => {
    if (statusName.includes('Selected') || statusName === 'Joined') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (statusName.includes('Reject') || statusName.includes('Not Interested')) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
  };

  const getCallIcon = (result: string) => {
    switch(result) {
      case 'Connected': return <PhoneCall className="w-4 h-4 text-emerald-600" />;
      case 'Switched Off': return <PhoneOff className="w-4 h-4 text-red-500" />;
      default: return <PhoneMissed className="w-4 h-4 text-amber-500" />;
    }
  };

  if (!candidate) return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading Candidate Workspace...</div>;

  const DetailRow = ({ label, value }: { label: string, value: string | number | null | undefined }) => {
    if (!value) return null;
    return (
      <div className="flex justify-between items-start py-1.5 border-b border-slate-50 last:border-0">
        <span className="font-semibold text-slate-400 text-xs mt-0.5">{label}</span>
        <span className="text-right text-sm text-slate-700 font-medium max-w-[60%] break-words">{value}</span>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 mt-6 space-y-6">
      
      {/* Top Header & Navigation Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 hover:bg-slate-100 hidden sm:flex">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Candidate Workspace</h1>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)} className="font-semibold text-slate-600">
          Back to Queue
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Details & Unified Update Form */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Candidate Info Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{candidate.first_name} {candidate.last_name}</h2>
              <p className="text-sm font-bold text-blue-600 mt-1 uppercase tracking-wider">{candidate.current_designation || candidate.profile || 'General Profile'}</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0"/> 
                  <span className="font-mono font-bold">{candidate.phone}</span>
                </div>
                {candidate.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Mail className="w-4 h-4 text-slate-400 shrink-0"/> 
                    <span className="font-medium break-all">{candidate.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 mt-4">
                  <Briefcase className="w-3.5 h-3.5" /> Professional
                </h4>
                <DetailRow label="Experience" value={candidate.experience_level} />
                <DetailRow label="Company" value={candidate.current_company} />
                <DetailRow label="Education" value={candidate.qualification ? `${candidate.qualification} ${candidate.passing_year ? `('${candidate.passing_year})` : ''}` : null} />
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 mt-4">
                  <DollarSign className="w-3.5 h-3.5" /> Comp & Avail
                </h4>
                <DetailRow label="CTC (Cur/Exp)" value={candidate.current_ctc && candidate.expected_ctc ? `${candidate.current_ctc}L / ${candidate.expected_ctc}L` : null} />
                <DetailRow label="Notice Period" value={candidate.notice_period} />
              </div>

              <div className="space-y-1">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-3 mt-4">
                  <MapPin className="w-3.5 h-3.5" /> Source
                </h4>
                <DetailRow label="Location" value={candidate.current_location} />
                <div className="flex justify-between items-center py-2 border-t border-slate-100 mt-2">
                  <span className="font-semibold text-slate-400 text-xs">Origin</span>
                  <span className="bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded text-xs">{candidate.source}</span>
                </div>
              </div>

              {candidate.resume_url && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a href={candidate.resume_url} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white transition-all py-2.5 rounded-lg text-sm font-bold shadow-sm">
                    <ExternalLink className="w-4 h-4" /> View Resume
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Action Area */}
          {isProfileLocked ? (
            <div className="bg-slate-50 p-6 rounded-xl shadow-inner border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6 text-slate-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Profile Locked</h3>
              <p className="text-sm text-slate-500 font-medium">This candidate has reached a final stage (<span className="font-bold">{currentLeadStatus?.status_name}</span>). Further interactions and follow-ups are disabled.</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-black text-slate-800 mb-5 border-b border-slate-100 pb-3 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" /> Log Interaction
              </h3>
              
              <form onSubmit={handleLogInteraction} className="space-y-5">
                
                {/* Call Logging Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={logCall} 
                        onChange={(e) => {
                          setLogCall(e.target.checked);
                          if (!e.target.checked) setCallResult('');
                        }}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      I made a phone call
                    </label>
                    {logCall && <PhoneCall className="w-4 h-4 text-slate-400" />}
                  </div>

                  {logCall && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4 pt-2 border-t border-slate-200">
                      <div>
                        <select required={logCall} value={callResult} onChange={(e) => setCallResult(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium bg-white transition-all">
                          <option value="" disabled>Select call result...</option>
                          <option value="Connected">Connected</option>
                          <option value="Not Connected">Not Connected</option>
                          <option value="Switched Off">Switched Off</option>
                          <option value="Ringing">Ringing</option>
                          <option value="Busy">Busy</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pipeline Section (Only visible if connected or no call made) */}
                {isPipelineUpdate && (
                  <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Pipeline Stage *</label>
                      <select required value={statusId} onChange={(e) => {
                          setStatusId(e.target.value);
                          const newStatus = statuses.find(s => s.id.toString() === e.target.value);
                          if (newStatus && newStatus.is_final_stage === 1) setFollowUpDate('');
                        }} 
                        className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium bg-white transition-all"
                      >
                        <option value="" disabled>Select stage...</option>
                        {statuses.map(s => (
                          <option key={s.id} value={s.id}>{s.status_name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {!isSelectedTerminal && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Next Follow-up Date *</label>
                        <input 
                          type="date" 
                          required 
                          value={followUpDate} 
                          min={new Date().toISOString().split('T')[0]} 
                          onChange={(e) => setFollowUpDate(e.target.value)} 
                          className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition-all" 
                        />
                      </div>
                    )}

                    {isSelectedTerminal && (
                      <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs font-semibold flex items-start gap-2">
                        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                        Selecting this will lock the candidate profile. No future follow-ups can be scheduled.
                      </div>
                    )}

                    {/* Remarks are ALWAYS required, either as call notes or pipeline remarks */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Remarks / Notes *</label>
                      <textarea required rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder={isPipelineUpdate ? "Summarize the interaction..." : "Why didn't the call connect? (e.g., 'Ringing no answer')"} className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium resize-none transition-all"></textarea>
                    </div>
                  </div>
                )}

                <Button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-6 shadow-md transition-all">
                  {isSubmitting ? 'Saving...' : (isPipelineUpdate ? 'Save & Update Pipeline' : 'Save Call Log')}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: The Read-Only Dynamic Workspace (Tabs) */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 h-fit overflow-hidden">
          
          {/* Tab Header */}
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button 
              onClick={() => setActiveTab('journey')} 
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'journey' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <List className="w-4 h-4" /> Candidate Journey
            </button>
            <button 
              onClick={() => setActiveTab('calls')} 
              className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'calls' ? 'text-blue-600 border-b-2 border-blue-600 bg-white' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <PhoneCall className="w-4 h-4" /> Call Logs
              {callLogs.length > 0 && <span className="bg-slate-200 text-slate-600 py-0.5 px-2 rounded-full text-[10px] ml-1">{callLogs.length}</span>}
            </button>
          </div>

          <div className="p-8">
            {/* TAB CONTENT: Candidate Journey */}
            {activeTab === 'journey' && (
              <div className="relative border-l-[3px] border-slate-100 ml-4 space-y-10">
                {timeline.map((event, index) => (
                  <div key={event.id} className="relative pl-10">
                    <div className="absolute -left-[14px] top-0 bg-white p-1">
                      {getStatusIcon(event.status_name)}
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                      <h4 className={`text-base font-black ${index === 0 ? 'text-slate-900' : 'text-slate-500'}`}>
                        {event.status_name}
                        {index === 0 && <span className="ml-3 text-[10px] bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">Current Stage</span>}
                      </h4>
                      <span className="text-xs font-bold text-slate-400 mt-1 md:mt-0 bg-slate-50 px-3 py-1 rounded-md">
                        {new Date(event.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    
                    <p className={`text-sm p-4 rounded-xl font-medium shadow-sm border ${index === 0 ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-white border-slate-200 text-slate-600'}`}>
                      "{event.remarks}"
                    </p>

                    {event.follow_up_date && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wide flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Follow-up: {new Date(event.follow_up_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: Call Logs (View Only) */}
            {activeTab === 'calls' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-slate-400" /> Dialer Audit History
                </h4>
                
                <div className="space-y-3">
                  {callLogs.length === 0 ? (
                    <div className="text-center py-12 text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      <PhoneOff className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                      No calls logged for this candidate yet.
                    </div>
                  ) : (
                    callLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-4 p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors shadow-sm">
                        <div className="mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {getCallIcon(log.call_result)}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-bold text-slate-800 text-sm">{log.call_result}</span>
                            </div>
                            <span className="text-[11px] font-bold text-slate-400">{new Date(log.call_time).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}</span>
                          </div>
                          {log.notes && <p className="text-sm text-slate-600 mt-1">"{log.notes}"</p>}
                          <p className="text-[10px] font-semibold text-slate-400 mt-2 uppercase tracking-wide">
                            Logged by: {log.first_name} {log.last_name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}