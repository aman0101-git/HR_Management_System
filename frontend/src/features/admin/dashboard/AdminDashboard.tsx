import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Session expired. Please log in again.</div>;
  return (
    <h1>
        Admin dashboard
    </h1>
  );
}
