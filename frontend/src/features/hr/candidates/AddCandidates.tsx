import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Briefcase, Banknote, MapPin, FileText, Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { API_BASE } from '../../../apiBase';

interface CandidateFormData {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  qualification: string;
  passing_year: string;
  profile: string;
  experience_level: string;
  current_company: string;
  current_designation: string;
  current_ctc: string;
  expected_ctc: string;
  current_location: string;
  preferred_location: string;
  ready_to_relocate: string;
  notice_period: string;
  available_from: string;
  source: string;
  resume_url: string;
  remark: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function AddCandidate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  const [formData, setFormData] = useState<CandidateFormData>({
    first_name: '', last_name: '', phone: '', email: '', qualification: '', passing_year: '',
    profile: '', experience_level: 'Fresher', current_company: '', current_designation: '',
    current_ctc: '', expected_ctc: '', current_location: '', preferred_location: '',
    ready_to_relocate: 'Yes', notice_period: 'Immediate', available_from: '', source: 'Work India',
    resume_url: '', remark: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE}/api/candidates`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', text: 'Candidate successfully added to pipeline!' });
        setTimeout(() => {
          navigate('/hr/candidates'); 
        }, 1500);
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to add candidate.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const SectionHeader = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="flex items-start gap-3 mb-5 border-b border-border pb-4">
      <div className="bg-primary/10 p-2.5 rounded-xl border border-primary/20">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
        <p className="text-xs font-medium text-muted-foreground">{description}</p>
      </div>
    </div>
  );

  const inputClasses = "h-11 bg-muted/60 dark:bg-muted/40 border border-border focus:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 transition-all rounded-xl font-medium w-full text-sm px-3 py-2 outline-none text-foreground";
  const labelClasses = "block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 ml-1";
  const optionClass = "bg-white text-black dark:bg-card dark:text-foreground";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto pb-12"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8 bg-card p-4 rounded-2xl shadow-sm border border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight leading-none">Initialize Lead</h2>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Candidate Pipeline Entry</p>
          </div>
        </div>
        <Button variant="outline" className="hidden sm:flex rounded-xl font-bold" onClick={() => setFormData({ ...formData, first_name: '' })}>
          Clear Form
        </Button>
      </motion.div>
      
      {status.text && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 mb-8 rounded-xl font-bold text-sm flex items-center gap-3 shadow-sm ${
            status.type === 'error' 
              ? 'bg-destructive/10 text-destructive border border-destructive/20' 
              : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
          }`}
        >
          {status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
          {status.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
          <SectionHeader icon={User} title="Identity & Contact" description="Basic candidate identification and communication channels." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>First Name *</label>
              <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className={inputClasses} placeholder="John" />
            </div>
            <div>
              <label className={labelClasses}>Last Name *</label>
              <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className={inputClasses} placeholder="Doe" />
            </div>
            <div>
              <label className={labelClasses}>Phone Number *</label>
              <input type="tel" name="phone" required maxLength={10} value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="9876543210" />
            </div>
            <div>
              <label className={labelClasses}>Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="john.doe@example.com" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
          <SectionHeader icon={Briefcase} title="Professional Background" description="Educational qualifications and current employment status." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Qualification *</label>
              <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} placeholder="e.g. B.Tech, MBA" className={inputClasses} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClasses}>Passing Year</label>
                <input type="number" min="1990" max="2030" name="passing_year" value={formData.passing_year} onChange={handleChange} placeholder="YYYY" className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Experience Level *</label>
                <select name="experience_level" required value={formData.experience_level} onChange={handleChange} className={`${inputClasses} ${optionClass}`}>
                  <option className={optionClass} value="Fresher">Fresher</option>
                  <option className={optionClass} value="0-1">0-1 Years</option>
                  <option className={optionClass} value="1-3">1-3 Years</option>
                  <option className={optionClass} value="3-5">3-5 Years</option>
                  <option className={optionClass} value="5+">5+ Years</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2 border-t border-border pt-6 mt-2">
              <label className={labelClasses}>Target Job Profile</label>
              <input type="text" name="profile" value={formData.profile} onChange={handleChange} placeholder="e.g. Full-Stack Developer" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Current Company</label>
              <input type="text" name="current_company" value={formData.current_company} onChange={handleChange} placeholder="e.g. Acme Corp" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Current Designation</label>
              <input type="text" name="current_designation" value={formData.current_designation} onChange={handleChange} placeholder="e.g. Software Engineer" className={inputClasses} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
          <SectionHeader icon={Banknote} title="Compensation & Availability" description="Financial expectations and joining timeline." />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelClasses}>Current CTC (LPA)</label>
              <input type="number" step="0.01" min="0" name="current_ctc" value={formData.current_ctc} onChange={handleChange} placeholder="e.g. 3.5" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Expected CTC (LPA)</label>
              <input type="number" step="0.01" min="0" name="expected_ctc" value={formData.expected_ctc} onChange={handleChange} placeholder="e.g. 5.0" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Notice Period</label>
              <select name="notice_period" value={formData.notice_period} onChange={handleChange} className={`${inputClasses} ${optionClass}`}>
                <option className={optionClass} value="Immediate">Immediate</option>
                <option className={optionClass} value="7 Days">7 Days</option>
                <option className={optionClass} value="15 Days">15 Days</option>
                <option className={optionClass} value="30 Days">30 Days</option>
                <option className={optionClass} value="60 Days">60 Days</option>
                <option className={optionClass} value="90 Days">90 Days</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Available From</label>
              <input type="date" name="available_from" value={formData.available_from} onChange={handleChange} className={inputClasses} />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
          <SectionHeader icon={MapPin} title="Location Details" description="Current base and relocation preferences." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClasses}>Current Location *</label>
              <input type="text" name="current_location" required value={formData.current_location} onChange={handleChange} placeholder="e.g. Pune" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Preferred Location</label>
              <input type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange} placeholder="e.g. Mumbai" className={inputClasses} />
            </div>
            <div>
              <label className={labelClasses}>Ready to Relocate</label>
              <select name="ready_to_relocate" value={formData.ready_to_relocate} onChange={handleChange} className={`${inputClasses} ${optionClass}`}>
                <option className={optionClass} value="Yes">Yes</option>
                <option className={optionClass} value="No">No</option>
              </select>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
          <SectionHeader icon={FileText} title="Sourcing & Documentation" description="Where did this lead originate from?" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClasses}>Lead Source *</label>
              <select name="source" required value={formData.source} onChange={handleChange} className={`${inputClasses} ${optionClass}`}>
                <option className={optionClass} value="LinkedIn">LinkedIn</option>
                <option className={optionClass} value="Naukri">Naukri</option>
                <option className={optionClass} value="Indeed">Indeed</option>
                <option className={optionClass} value="Work India">Work India</option>
                <option className={optionClass} value="Apna Jobs">Apna Jobs</option>
                <option className={optionClass} value="Monster">Monster</option>
                <option className={optionClass} value="Shine">Shine</option>
                <option className={optionClass} value="Recruiter HR Job">Recruiter HR Job</option>
                <option className={optionClass} value="Reference">Reference</option>
                <option className={optionClass} value="Walk-in">Walk-in</option>
                <option className={optionClass} value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className={labelClasses}>Resume URL (Optional)</label>
              <input type="url" name="resume_url" value={formData.resume_url} onChange={handleChange} placeholder="https://drive.google.com/..." className={inputClasses} />
            </div>
            <div className="md:col-span-2 pt-2">
              <label className={labelClasses}>Initial Remarks</label>
              <textarea name="remark" rows={3} value={formData.remark} onChange={handleChange} placeholder="Add any initial notes or observations here..." className="w-full bg-slate-50 dark:bg-slate-900/50 border-border focus-visible:ring-primary focus-visible:ring-offset-0 transition-colors rounded-xl font-medium text-sm px-4 py-3 outline-none border resize-none"></textarea>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end gap-4 pt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-32 rounded-xl font-bold border-border">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-56 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-soft rounded-xl h-11">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" /> Encoding...
              </span>
            ) : 'Initialize Candidate'}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}