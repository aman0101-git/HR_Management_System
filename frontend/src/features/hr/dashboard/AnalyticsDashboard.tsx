import { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { Users, PhoneCall, CheckCircle2, TrendingUp, Loader2, Filter, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { API_BASE } from '../../../apiBase';

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

// Vibrant, premium palette for the charts
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// Animation Variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

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
      if (timeframe === 'custom' && (!customStartDate || !customEndDate)) return;

      setLoading(true);
      setError('');

      try {
        const queryParams = new URLSearchParams({
          filter: timeframe,
          ...(timeframe === 'custom' && { start: customStartDate, end: customEndDate })
        });

        const response = await fetch(`${API_BASE}/api/analytics/dashboard?${queryParams}`, {
          credentials: 'include',
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError('Data retrieval failed. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe, customStartDate, customEndDate]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] animate-pulse">
          Aggregating Data...
        </p>
      </div>
    );
  }

  // Input styles for the Custom Date Pickers
  const inputClasses = "h-11 bg-slate-50 dark:bg-slate-900/50 border border-border focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary outline-none transition-colors rounded-xl text-sm font-bold text-foreground px-4";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 pb-12"
    >
      
      {/* Header & Filter Section */}
      <motion.div variants={itemVariants} className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hidden sm:flex">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-none">Intelligence Hub</h1>
            <p className="text-sm text-muted-foreground font-bold mt-2 uppercase tracking-widest text-[10px]">
              Real-time Performance Metrics
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
          {/* Timeframe Dropdown */}
          <div className="relative w-full sm:w-auto flex items-center bg-muted/60 dark:bg-muted/40 border border-border rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary/20 transition-all shadow-sm">
            <Filter className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
            
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-transparent text-sm font-bold text-foreground focus:ring-0 outline-none w-full sm:w-40 cursor-pointer appearance-none"
            >
              <option className="bg-white text-black dark:bg-card dark:text-foreground" value="today">Today</option>
              <option className="bg-white text-black dark:bg-card dark:text-foreground" value="yesterday">Yesterday</option>
              <option className="bg-white text-black dark:bg-card dark:text-foreground" value="this_week">This Week</option>
              <option className="bg-white text-black dark:bg-card dark:text-foreground" value="this_month">This Month</option>
              <option className="bg-white text-black dark:bg-card dark:text-foreground" value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Pickers */}
          {timeframe === 'custom' && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <input 
                type="date" 
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className={inputClasses}
              />
              <span className="text-muted-foreground text-[10px] font-black uppercase">to</span>
              <input 
                type="date" 
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className={inputClasses}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {error ? (
        <motion.div variants={itemVariants} className="p-6 text-center text-destructive font-bold bg-destructive/10 border border-destructive/20 rounded-2xl flex items-center justify-center gap-3">
          <AlertCircle className="w-5 h-5" /> {error}
        </motion.div>
      ) : data ? (
        <div className={`transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
          
          {/* 1. Top KPI Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {[
              { title: "Active Leads", value: data.kpis.totalActiveLeads, subtext: "Currently in pipeline", icon: Users, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
              { title: timeframe === 'this_month' ? "Hires (MTD)" : "Total Hires", value: data.kpis.hiresMtd, subtext: "Selected & Joined", icon: CheckCircle2, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
              { title: "Calls Made", value: data.kpis.totalCallsToday, subtext: "Total dialer attempts", icon: PhoneCall, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
              { title: "Connected Calls", value: data.kpis.connectedCallsToday, subtext: "Successful connections", icon: TrendingUp, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" }
            ].map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <div key={idx} className="bg-card p-6 rounded-3xl shadow-soft border border-border flex items-start gap-4 relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl -mr-8 -mt-8 transition-transform duration-500 group-hover:scale-150 ${kpi.bg}`}></div>
                  <div className={`p-3.5 rounded-2xl ${kpi.bg} border relative z-10`}>
                    <Icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{kpi.title}</h3>
                    <div className="text-3xl font-black text-foreground tracking-tighter mt-0.5">{kpi.value}</div>
                    <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-wider">{kpi.subtext}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* 2. Charts Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Pipeline Health Bar Chart */}
            <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border lg:col-span-2 flex flex-col">
              <h3 className="text-base font-black text-foreground mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-primary rounded-full"></div> Pipeline Health Matrix
              </h3>
              <div className="flex-1 min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.charts.pipelineFunnel} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border opacity-50" />
                    <XAxis dataKey="status_name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: 'currentColor' }} className="text-muted-foreground" angle={-35} textAnchor="end" />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: 'currentColor' }} className="text-muted-foreground" />
                    <Tooltip 
                      cursor={{ fill: 'currentColor', opacity: 0.05 }} 
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                      itemStyle={{ color: '#fff' }}
                    />
                    <Bar dataKey="count" fill="currentColor" className="text-primary" radius={[6, 6, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Call Outcomes Pie Chart */}
            <div className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border flex flex-col">
              <h3 className="text-base font-black text-foreground mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-amber-500 rounded-full"></div> Dialer Dispositions
              </h3>
              <div className="flex-1 min-h-[300px] w-full flex justify-center items-center">
                {data.charts.callOutcomes.length === 0 ? (
                  <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest border-2 border-dashed border-border p-6 rounded-2xl">No call data</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.charts.callOutcomes} cx="50%" cy="50%" innerRadius={75} outerRadius={105} paddingAngle={3} dataKey="count" nameKey="call_result">
                        {data.charts.callOutcomes.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="stroke-background" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }} 
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '20px' }} className="text-foreground" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>

          {/* 3. Sourcing ROI Table */}
          <motion.div variants={itemVariants} className="bg-card p-6 sm:p-8 rounded-3xl shadow-soft border border-border overflow-hidden">
            <h3 className="text-base font-black text-foreground mb-6 flex items-center gap-2">
              <div className="w-2 h-6 bg-emerald-500 rounded-full"></div> Sourcing ROI
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-slate-50/50 dark:bg-slate-900/20">
                    <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest rounded-tl-2xl">Source Origin</th>
                    <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Total Leads</th>
                    <th className="p-5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Total Hired</th>
                    <th className="p-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest rounded-tr-2xl">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.charts.sourceRoi.map((row, i) => {
                    const conversionRate = row.total_leads > 0 ? ((row.total_hired / row.total_leads) * 100).toFixed(1) : '0.0';
                    return (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-5 text-sm font-black text-foreground">{row.source}</td>
                        <td className="p-5 text-sm font-bold text-muted-foreground">{row.total_leads}</td>
                        <td className="p-5 text-sm font-black text-emerald-600 dark:text-emerald-400">{row.total_hired}</td>
                        <td className="p-5 text-sm font-bold text-foreground">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2.5 bg-secondary rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(Number(conversionRate), 100)}%` }} />
                            </div>
                            <span className="w-10">{conversionRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
          
        </div>
      ) : null}
    </motion.div>
  );
}