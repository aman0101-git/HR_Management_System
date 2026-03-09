import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { User, Briefcase, Banknote, MapPin, FileText } from "lucide-react"; // Assuming you have lucide-react installed

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

export default function AddCandidate() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; text: string }>({ type: '', text: '' });

  const [formData, setFormData] = useState<CandidateFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    qualification: '',
    passing_year: '',
    profile: '',
    experience_level: 'Fresher',
    current_company: '',
    current_designation: '',
    current_ctc: '',
    expected_ctc: '',
    current_location: '',
    preferred_location: '',
    ready_to_relocate: 'Yes',
    notice_period: 'Immediate',
    available_from: '',
    source: 'Work India',
    resume_url: '',
    remark: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', text: '' });

    try {
      const response = await fetch('http://localhost:8080/api/candidates', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({ type: 'success', text: 'Candidate successfully added!' });
        setTimeout(() => {
          navigate('/hr/dashboard'); 
        }, 500);
      } else {
        setStatus({ type: 'error', text: data.error || 'Failed to add candidate.' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper component for section headers
  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-slate-100">
      <div className="bg-blue-50 p-1.5 rounded-md">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">{title}</h3>
    </div>
  );

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 mt-8 mb-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Lead</h2>
        <p className="text-sm text-slate-500 mt-1">Enter candidate details to initialize their lifecycle tracking.</p>
      </div>
      
      {/* Status Alert */}
      {status.text && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          {status.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2">
        
        {/* ================= 1. PERSONAL DETAILS ================= */}
        <SectionHeader icon={User} title="Personal Details" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">First Name *</label>
            <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Last Name *</label>
            <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Phone Number *</label>
            <input type="tel" name="phone" required maxLength={15} value={formData.phone} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        {/* ================= 2. PROFESSIONAL DETAILS ================= */}
        <SectionHeader icon={Briefcase} title="Education & Experience" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Qualification *</label>
            <input type="text" name="qualification" required value={formData.qualification} onChange={handleChange} placeholder="e.g. B.Tech, MBA" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Passing Year</label>
            <input type="number" min="1990" max="2030" name="passing_year" value={formData.passing_year} onChange={handleChange} placeholder="YYYY" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
  
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Experience Level *</label>
            <select name="experience_level" required value={formData.experience_level} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              <option value="Fresher">Fresher</option>
              <option value="0-1">0-1 Years</option>
              <option value="1-3">1-3 Years</option>
              <option value="3-5">3-5 Years</option>
              <option value="5+">5+ Years</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Target Job Profile</label>
            <input type="text" name="profile" value={formData.profile} onChange={handleChange} placeholder="e.g. Full-Stack Developer" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Current Company</label>
            <input type="text" name="current_company" value={formData.current_company} onChange={handleChange} placeholder="e.g. Firstclose Solutions" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Current Designation</label>
            <input type="text" name="current_designation" value={formData.current_designation} onChange={handleChange} placeholder="e.g. Software Engineer" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        {/* ================= 3. COMPENSATION & AVAILABILITY ================= */}
        <SectionHeader icon={Banknote} title="Compensation & Availability" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Current CTC (LPA)</label>
            <input type="number" step="0.01" min="0" name="current_ctc" value={formData.current_ctc} onChange={handleChange} placeholder="e.g. 3.5" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Expected CTC (LPA)</label>
            <input type="number" step="0.01" min="0" name="expected_ctc" value={formData.expected_ctc} onChange={handleChange} placeholder="e.g. 5.0" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Notice Period</label>
            <select name="notice_period" value={formData.notice_period} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              <option value="Immediate">Immediate</option>
              <option value="7 Days">7 Days</option>
              <option value="15 Days">15 Days</option>
              <option value="30 Days">30 Days</option>
              <option value="60 Days">60 Days</option>
              <option value="90 Days">90 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Available From</label>
            <input type="date" name="available_from" value={formData.available_from} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
        </div>

        {/* ================= 4. LOCATION & SOURCING ================= */}
        <SectionHeader icon={MapPin} title="Location Details" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Current Location *</label>
            <input type="text" name="current_location" required value={formData.current_location} onChange={handleChange} placeholder="e.g. Pune" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Preferred Location</label>
            <input type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange} placeholder="e.g. Mumbai" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Ready to Relocate</label>
            <select name="ready_to_relocate" value={formData.ready_to_relocate} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        {/* ================= 5. ADDITIONAL INFO ================= */}
        <SectionHeader icon={FileText} title="Sourcing & Documentation" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Lead Source *</label>
            <select name="source" required value={formData.source} onChange={handleChange} className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all">
              <option value="LinkedIn">LinkedIn</option>
              <option value="Naukri">Naukri</option>
              <option value="Indeed">Indeed</option>
              <option value="Work India">Work India</option>
              <option value="Apna Jobs">Apna Jobs</option>
              <option value="Monster">Monster</option>
              <option value="Shine">Shine</option>
              <option value="Recruiter HR Job">Recruiter HR Job</option>
              <option value="Reference">Reference</option>
              <option value="Walk-in">Walk-in</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Resume URL (Optional)</label>
            <input type="url" name="resume_url" value={formData.resume_url} onChange={handleChange} placeholder="https://drive.google.com/..." className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase">Initial Remarks</label>
            <textarea name="remark" rows={3} value={formData.remark} onChange={handleChange} placeholder="Add any initial notes or observations here..." className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-8 border-t border-slate-200">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-32 hover:bg-slate-50 font-semibold border-slate-300 text-slate-700">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} className="w-48 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
            {isLoading ? 'Saving...' : 'Save Candidate'}
          </Button>
        </div>
      </form>
    </div>
  );
}