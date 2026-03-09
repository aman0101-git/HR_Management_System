import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

// Define strict types for the incoming data
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
        navigate('/hr/dashboard'); // fallback if unauthorized
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
        // Reset form and refresh timeline
        setStatusId(''); setRemarks(''); setFollowUpDate('');
        fetchProfileData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!candidate) return <div className="p-8 text-center text-slate-500 font-medium">Loading Candidate Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      {/* LEFT COLUMN: Details & Update Form */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Candidate Info Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-extrabold text-slate-800">{candidate.first_name} {candidate.last_name}</h2>
          <p className="text-sm font-semibold text-blue-600 mb-4">{candidate.profile || 'General Profile'}</p>
          
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-400">Phone</span>
              <span className="font-mono">{candidate.phone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="font-semibold text-slate-400">Experience</span>
              <span>{candidate.experience_level}</span>
            </div>
            {candidate.current_company && (
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="font-semibold text-slate-400">Company</span>
                <span>{candidate.current_company}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold text-slate-400">Source</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{candidate.source}</span>
            </div>
          </div>
        </div>

        {/* Update Status Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Log Interaction</h3>
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Status *</label>
              <select required value={statusId} onChange={(e) => setStatusId(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm">
                <option value="" disabled>Select outcome...</option>
                {statuses.map(s => (
                  <option key={s.id} value={s.id}>{s.status_name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Next Follow-up Date</label>
              <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Remarks (Mandatory) *</label>
              <textarea required rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="What was discussed?" className="w-full border border-slate-300 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm resize-none"></textarea>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
              {isSubmitting ? 'Saving...' : 'Append to Timeline'}
            </Button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: The Immutable Timeline */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Candidate Journey Timeline</h3>
        
        <div className="relative border-l-2 border-blue-100 ml-3 md:ml-4 space-y-8">
          {timeline.map((event, index) => (
            <div key={event.id} className="relative pl-6 md:pl-8">
              {/* Timeline Dot */}
              <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white ${index === 0 ? 'bg-blue-600 shadow-[0_0_0_3px_rgba(37,99,235,0.2)]' : 'bg-slate-300'}`}></div>
              
              <div className="flex flex-col md:flex-row md:items-start justify-between mb-1">
                <h4 className={`text-sm font-extrabold ${index === 0 ? 'text-blue-700' : 'text-slate-700'}`}>
                  {event.status_name}
                  {index === 0 && <span className="ml-2 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Current</span>}
                </h4>
                <span className="text-xs font-semibold text-slate-400 mt-1 md:mt-0">
                  {new Date(event.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              
              <p className="text-sm text-slate-600 bg-slate-50 border border-slate-100 p-3 rounded-lg mt-2 font-medium">
                "{event.remarks}"
              </p>

              {event.follow_up_date && (
                <div className="mt-3 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="bg-emerald-100 px-2 py-1 rounded">
                    Scheduled Follow-up: {new Date(event.follow_up_date).toLocaleDateString('en-GB')}
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