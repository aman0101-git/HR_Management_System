import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  status_name: string;
  follow_up_date: string | null;
  last_update_time: string;
}

export default function MyLeadsList() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/candidates/my-leads', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setLeads(data.leads);
      } else {
        setError(data.error || 'Failed to fetch leads');
      }
    } catch (err) {
      setError('Network error while fetching leads.');
    } finally {
      setIsLoading(false);
    }
  };

  // PRD Color Logic Implementation
  const getRowStyle = (followUpDateStr: string | null, lastUpdateStr: string) => {
    if (!followUpDateStr) {
      // No follow-up set. Check if updated in the last 24 hours (Green logic)
      const lastUpdate = new Date(lastUpdateStr);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      return lastUpdate > yesterday ? 'bg-emerald-50' : 'bg-white';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight for strict date comparison
    
    const followUpDate = new Date(followUpDateStr);
    followUpDate.setHours(0, 0, 0, 0);

    if (followUpDate < today) {
      return 'bg-red-50 border-l-4 border-red-500'; // Overdue
    } else if (followUpDate.getTime() === today.getTime()) {
      return 'bg-yellow-50 border-l-4 border-yellow-500'; // Follow-up Today
    }
    
    return 'bg-white'; // Future follow-up
  };

  if (isLoading) return <div className="p-6">Loading your queue...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-slate-800">My Daily Queue</h2>
          <p className="text-sm text-slate-500">Manage your active candidates and follow-ups.</p>
        </div>
        <div className="flex gap-3 text-xs font-semibold">
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-400 rounded-full"></div> Overdue</span>
          <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-full"></div> Today</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs">
            <tr>
              <th className="px-6 py-3">Candidate</th>
              <th className="px-6 py-3">Phone</th>
              <th className="px-6 py-3">Current Status</th>
              <th className="px-6 py-3">Next Follow-up</th>
              <th className="px-6 py-3">Last Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                  No candidates found. Start by adding a new lead!
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr 
                  key={lead.id} 
                  onClick={() => navigate(`/hr/candidates/${lead.id}`)}
                  className={`cursor-pointer hover:shadow-md transition-all ${getRowStyle(lead.follow_up_date, lead.last_update_time)}`}
                >
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {lead.first_name} {lead.last_name}
                  </td>
                  <td className="px-6 py-4 font-mono">{lead.phone}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                      {lead.status_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {lead.follow_up_date ? new Date(lead.follow_up_date).toLocaleDateString('en-GB') : 'Not Set'}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {new Date(lead.last_update_time).toLocaleString('en-GB')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}