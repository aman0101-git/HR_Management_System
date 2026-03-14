import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus, Sparkles, BarChart3 } from "lucide-react";
import MyLeadsList from '../candidates/MyLeadsList';

export default function HrDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Better Loading State
  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
    </div>
  );
  
  if (!user) return <div className="p-8 text-center text-slate-500 font-bold">Session expired. Please log in again.</div>;

  // Get nicely formatted current date
  const today = new Date().toLocaleDateString('en-GB', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* Welcome Banner / Hero Section */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Welcome back, {user.first_name || 'Team'} <Sparkles className="w-6 h-6 text-amber-400 hidden sm:block" />
          </h1>
          
          <p className="text-base text-slate-500 font-medium mt-2 max-w-2xl leading-relaxed">
            Manage your candidate pipeline, track upcoming follow-ups, and convert active leads into successful hires.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row shrink-0 mt-4 md:mt-0 gap-3">
          <Button 
            onClick={() => navigate('/hr/analytics')} 
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2.5 px-6 py-6 rounded-xl shadow-lg shadow-purple-600/20 transition-all hover:-translate-y-1 hover:shadow-purple-600/30 font-bold text-base w-full md:w-auto"
          >
            <BarChart3 className="w-5 h-5" />
            View Dashboard
          </Button>
          
          <Button 
            onClick={() => navigate('/hr/candidates/add')} 
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2.5 px-6 py-6 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1 hover:shadow-blue-600/30 font-bold text-base w-full md:w-auto"
          >
            <UserPlus className="w-5 h-5" />
            Add New Lead
          </Button>
        </div>
      </div>

      {/* Daily Queue Component (which now includes KPIs and Tabs) */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <MyLeadsList />
      </div>
      
    </div>
  );
}