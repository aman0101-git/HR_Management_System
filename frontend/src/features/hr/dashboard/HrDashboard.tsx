import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { UserPlus } from "lucide-react";
import MyLeadsList from '../candidates/MyLeadsList';

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Session expired. Please log in again.</div>;
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">HR Workspace</h1>
        
        {/* Add Candidate Action Button */}
        <Button onClick={() => navigate('/hr/candidates/add')} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Add New Lead
        </Button>
      </div>

      {/* Daily Queue Component */}
      <MyLeadsList />
      
      {/* ... rest of your dashboard ... */}
    </div>
  );
}
