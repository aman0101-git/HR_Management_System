import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, PhoneCall, CheckCircle2, TrendingUp, Loader2, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// --- Types mapping to our backend API response ---
interface DashboardData {
  kpis: {
    totalActiveLeads: number;
    hiresMtd: number;
    totalCallsToday: number;
    connectedCallsToday: number;
  };
  charts: {
    pipelineFunnel: { status_name: string; count: number }[];
    callOutcomes: { call_result: string; count: number }[];
    sourceRoi: { source: string; total_leads: number; total_hired: number }[];
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8B5CF6'];

export default function AnalyticsDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- Filter State ---
  const [timeframe, setTimeframe] = useState('this_month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      // Prevent fetching if custom is selected but dates are missing
      if (timeframe === 'custom' && (!customStartDate || !customEndDate)) return;

      setLoading(true);
      setError('');

      try {
        // Append filters to the query string
        const queryParams = new URLSearchParams({
          filter: timeframe,
          ...(timeframe === 'custom' && { start: customStartDate, end: customEndDate })
        });

        const response = await fetch(`http://localhost:8080/api/analytics/dashboard?${queryParams}`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError('Error loading analytics. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, customStartDate, customEndDate]); // Re-fetch when these change

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        <p className="text-slate-500 font-medium">Crunching the numbers...</p>
      </div>
    );
  }

  // Helper component for the top KPI cards
  const KpiCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-').replace('-500', '-600')}`} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className="text-3xl font-black text-slate-800 mt-1">{value}</div>
        <p className="text-xs text-slate-400 mt-1 font-medium">{subtext}</p>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Filter Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Overview</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time performance metrics and pipeline health.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Timeframe Dropdown */}
          <div className="relative w-full sm:w-auto flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Filter className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 outline-none w-full sm:w-40 cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Pickers (Only visible if 'custom' is selected) */}
          {timeframe === 'custom' && (
            <div className="flex items-center gap-2 w-full sm:w-auto animate-in slide-in-from-right-4">
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-auto"
              />
              <span className="text-slate-400 text-sm font-bold">to</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:ring-2 focus:ring-purple-500 outline-none w-full sm:w-auto"
              />
            </div>
          )}

          <Button variant="outline" onClick={() => navigate(-1)} className="font-semibold text-slate-600 w-full sm:w-auto shrink-0">
            Back to Queue
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 font-bold bg-red-50 rounded-xl">
          {error}
        </div>
      ) : data ? (
        <>
          {/* Loading overlay for when data is refreshing but old data is still visible */}
          <div className={`transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            
            {/* 1. Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <KpiCard 
                title="Active Leads" 
                value={data.kpis.totalActiveLeads} 
                subtext="Currently in pipeline" 
                icon={Users} 
                colorClass="bg-blue-500" 
              />
              <KpiCard 
                title={timeframe === 'this_month' ? "Hires (MTD)" : "Total Hires"} 
                value={data.kpis.hiresMtd} 
                subtext="Selected & Joined" 
                icon={CheckCircle2} 
                colorClass="bg-emerald-500" 
              />
              <KpiCard 
                title="Calls Made" 
                value={data.kpis.totalCallsToday} 
                subtext="Total dialer attempts" 
                icon={PhoneCall} 
                colorClass="bg-amber-500" 
              />
              <KpiCard 
                title="Connected Calls" 
                value={data.kpis.connectedCallsToday} 
                subtext="Successful connections" 
                icon={TrendingUp} 
                colorClass="bg-purple-500" 
              />
            </div>

            {/* 2. Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Pipeline Health */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Pipeline Health (Active Stages)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.charts.pipelineFunnel} margin={{ top: 5, right: 30, left: 0, bottom: 25 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="status_name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} angle={-25} textAnchor="end" />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                      <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Call Outcomes */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-6">Call Outcomes</h3>
                <div className="h-80 w-full flex justify-center items-center">
                  {data.charts.callOutcomes.length === 0 ? (
                    <p className="text-slate-400 font-medium text-sm">No call data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.charts.callOutcomes} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="count" nameKey="call_result">
                          {data.charts.callOutcomes.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Sourcing ROI Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Sourcing ROI</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-lg">Source</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Leads</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hired</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-lg">Conversion Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.charts.sourceRoi.map((row, i) => {
                      const conversionRate = row.total_leads > 0 ? ((row.total_hired / row.total_leads) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-800">{row.source}</td>
                          <td className="p-4 text-sm font-medium text-slate-600">{row.total_leads}</td>
                          <td className="p-4 text-sm font-medium text-emerald-600">{row.total_hired}</td>
                          <td className="p-4 text-sm font-bold text-slate-700">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(Number(conversionRate), 100)}%` }} />
                              </div>
                              {conversionRate}%
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}