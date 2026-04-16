import React, { useState, useEffect } from 'react';
import { PhoneCall, Lock, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { API_BASE } from '../../../apiBase';
import { motion, AnimatePresence } from 'framer-motion';

export interface StatusMaster {
  id: number;
  status_name: string;
  is_final_stage: number;
}

interface LogCallFormProps {
  candidateId: number;
  currentStatusName: string;
  isLocked: boolean;
  statuses: StatusMaster[];
  onSuccess: () => void;
}

export default function LogCallForm({ candidateId, currentStatusName, isLocked, statuses, onSuccess }: LogCallFormProps) {
  // Unified Form State
  const [statusId, setStatusId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [logCall, setLogCall] = useState(true); 
  const [callResult, setCallResult] = useState('Connected'); // Defaulting to Connected for speed
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill the current status when the form opens
  useEffect(() => {
    if (statuses.length > 0 && currentStatusName) {
      const currentStatusMatch = statuses.find(s => s.status_name === currentStatusName);
      if (currentStatusMatch) {
        setStatusId(currentStatusMatch.id.toString());
      }
    }
  }, [currentStatusName, statuses]);

  // LOGIC: Should we show the pipeline update fields?
  // Only update pipeline if they DIDN'T call, or if they called and CONNECTED.
  const isPipelineUpdate = !logCall || (logCall && callResult === 'Connected');

  const selectedStatusObj = statuses.find(s => s.id.toString() === statusId);
  const isSelectedTerminal = selectedStatusObj ? selectedStatusObj.is_final_stage === 1 : false;

  const handleSubmit = async (e: React.FormEvent) => {
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

      const res = await fetch(`${API_BASE}/api/candidates/${candidateId}/interaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to log interaction');
      }

      // Reset form and trigger the parent refresh/close
      setRemarks('');
      onSuccess();
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLocked) {
    return (
      <div className="bg-destructive/5 p-6 rounded-2xl border border-destructive/20 text-center space-y-3 mt-4">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <Lock className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="text-base font-black text-destructive tracking-tight">Profile Locked</h3>
        <p className="text-xs text-destructive/80 font-bold leading-relaxed">
          This candidate has reached a final stage. Further interactions are disabled.
        </p>
      </div>
    );
  }

  const inputClasses = "h-11 bg-muted/60 dark:bg-muted/40 border border-border focus:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl font-medium w-full text-sm px-3 py-2 outline-none text-foreground";
  const labelClasses = "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1 ";
  const optionClass = "bg-white text-black dark:bg-card dark:text-foreground";

  return (
    <div className="bg-card p-5 sm:p-6 rounded-3xl border border-border shadow-soft mt-4">
      <h3 className="text-base font-black text-foreground mb-5 flex items-center gap-2 pb-3 border-b border-border/50">
        <MessageSquare className="w-5 h-5 text-primary" /> Execute Interaction
      </h3>
      
      {error && (
        <div className="mb-5 p-3.5 bg-destructive/10 text-destructive text-xs font-bold rounded-xl border border-destructive/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Call Toggle */}
        <div className="flex items-center justify-between bg-muted/60 dark:bg-muted/40 p-4 rounded-xl border border-border shadow-sm">
          <label className="text-sm font-bold text-foreground flex items-center gap-3 cursor-pointer w-full select-none">
            <input 
              type="checkbox" 
              checked={logCall} 
              onChange={(e) => {
                setLogCall(e.target.checked);
                if (!e.target.checked) setCallResult('');
              }}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary/50 cursor-pointer"
            />
            Dialer Executed
          </label>
          {logCall && <PhoneCall className="w-5 h-5 text-primary animate-pulse" />}
        </div>

        {/* Call Result Dropdown */}
        <AnimatePresence>
          {logCall && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-1">
                <label className={labelClasses}>Call Result *</label>
                <select 
                  required={logCall} 
                  value={callResult} 
                  onChange={(e) => setCallResult(e.target.value)} 
                  className={inputClasses}
                >
                  <option className={optionClass} value="" disabled>Select call outcome...</option>
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

        {/* Pipeline Update Section */}
        <AnimatePresence>
          {isPipelineUpdate && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-3 border-t border-border/50 overflow-hidden"
            >
              <div>
                <label className={labelClasses}>Update Pipeline Stage *</label>
                <select 
                  required 
                  value={statusId} 
                  onChange={(e) => {
                    setStatusId(e.target.value);
                    const newStatus = statuses.find(s => s.id.toString() === e.target.value);
                    if (newStatus && newStatus.is_final_stage === 1) setFollowUpDate('');
                  }} 
                  className={inputClasses}
                >
                  <option className={optionClass} value="" disabled>Select next stage...</option>
                  {statuses.map(s => (
                    <option className={optionClass} key={s.id} value={s.id}>{s.status_name}</option>
                  ))}
                </select>
              </div>
              
              {!isSelectedTerminal && (
                <div>
                  <label className={labelClasses}>Next Follow-up Date *</label>
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
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-800 dark:text-red-400 p-3.5 rounded-xl text-xs font-bold flex items-start gap-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  Warning: Selecting this will lock the candidate profile permanently. No future follow-ups can be scheduled.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Remarks (Always Required) */}
        <div className="pt-2">
          <label className={labelClasses}>Interaction Notes *</label>
          <textarea 
            required 
            rows={3} 
            value={remarks} 
            onChange={(e) => setRemarks(e.target.value)} 
            placeholder={isPipelineUpdate ? "Summarize the interaction..." : "Why didn't the call connect? (e.g., 'Ringing no answer')"} 
            className={`${inputClasses} resize-none`}
          ></textarea>
        </div>

        <Button 
          type="submit" 
          disabled={isSubmitting} 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black py-6 rounded-xl shadow-soft transition-all text-sm uppercase tracking-wider"
        >
          {isSubmitting ? (
             <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Processing...</span>
          ) : (
            isPipelineUpdate ? 'Save & Progress Pipeline' : 'Log Call Attempt'
          )}
        </Button>
      </form>
    </div>
  );
}