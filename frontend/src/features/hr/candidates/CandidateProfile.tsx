import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Phone, Mail, Briefcase, MapPin, DollarSign, ExternalLink, Lock, CheckCircle2, Clock, XCircle } from "lucide-react";

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

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [candidate, setCandidate] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [statuses, setStatuses] = useState<StatusMaster[]>([]);
  
  // Form State
  const [statusId, setStatusId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the currently selected dropdown status is a final stage
  const selectedStatusObj = statuses.find(s => s.id.toString() === statusId);
  const isSelectedTerminal = selectedStatusObj ? selectedStatusObj.is_final_stage === 1 : false;

  // Check if the candidate's ACTUAL current status (latest timeline event) is a final stage
  const currentLeadStatus = timeline.length > 0 ? timeline[0] : null;
  const isProfileLocked = currentLeadStatus ? currentLeadStatus.is_final_stage === 1 : false;

  useEffect(() => {
    fetchProfileData();
    fetchStatuses();
  }, [id]);

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

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`http://localhost:8080/api/candidates/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status_id: statusId, remarks, follow_up_date: followUpDate }),
      });

      if (res.ok) {
        setStatusId(''); setRemarks(''); setFollowUpDate('');
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // UI Helpers
  const getStatusIcon = (statusName: string) => {
    if (statusName.includes('Selected') || statusName === 'Joined') return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    if (statusName.includes('Reject') || statusName.includes('Not Interested')) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-blue-500" />;
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
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
      
      {/* LEFT COLUMN: Details & Update Form */}
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

        {/* Dynamic Action Area: Either Form OR Locked State */}
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
            <h3 className="text-lg font-black text-slate-800 mb-4 border-b border-slate-100 pb-3">Log Interaction</h3>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">New Status *</label>
                <select required value={statusId} onChange={(e) => {
                    setStatusId(e.target.value);
                    const newStatus = statuses.find(s => s.id.toString() === e.target.value);
                    if (newStatus && newStatus.is_final_stage === 1) setFollowUpDate('');
                  }} 
                  className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium bg-white transition-all"
                >
                  <option value="" disabled>Select outcome...</option>
                  {statuses.map(s => (
                    <option key={s.id} value={s.id}>{s.status_name}</option>
                  ))}
                </select>
              </div>
              
              {!isSelectedTerminal && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
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

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Remarks *</label>
                <textarea required rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Summarize the call or outcome..." className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium resize-none transition-all"></textarea>
              </div>

              <Button type="submit" disabled={isSubmitting} onClick={() => navigate(-1)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 shadow-md">
                {isSubmitting ? 'Saving...' : 'Update Pipeline'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: The Immutable Timeline */}
      <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-200 h-fit">
        <h3 className="text-2xl font-black text-slate-800 mb-8 border-b border-slate-100 pb-4">Candidate Journey</h3>
        
        <div className="relative border-l-[3px] border-slate-100 ml-4 space-y-10">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative pl-10">
              {/* Status Icon Marker */}
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
      </div>

    </div>
  );
}