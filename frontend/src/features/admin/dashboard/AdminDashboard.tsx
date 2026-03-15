import { useAuth } from "@/context/AuthContext";
import AddUser from "../users/AddUser"; // ADDED

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Session expired. Please log in again.</div>;
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mount the Create User Form here */}
        <AddUser />
        
        {/* Other Admin Widgets can go here */}
      </div>
    </div>
  );
}