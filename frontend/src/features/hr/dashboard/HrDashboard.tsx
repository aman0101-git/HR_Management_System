import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { 
  UserPlus, 
  Sparkles, 
  BarChart3, 
  PhoneCall, 
  ArrowRight,
  Clock,
  Briefcase,
  Sun,
  Moon,
  Coffee
} from "lucide-react";

// --- Animations ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function HrDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  if (!user) return <div className="p-8 text-center text-muted-foreground font-bold">Session expired. Please log in again.</div>;

  // --- Dynamic Time & Greeting ---
  const dateObj = new Date();
  const today = dateObj.toLocaleDateString('en-GB', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });
  
  const hour = dateObj.getHours();
  let greeting = "Good evening";
  let TimeIcon = Moon;
  let iconColor = "text-indigo-400";

  if (hour < 12) {
    greeting = "Good morning";
    TimeIcon = Coffee;
    iconColor = "text-amber-500";
  } else if (hour < 18) {
    greeting = "Good afternoon";
    TimeIcon = Sun;
    iconColor = "text-amber-400";
  }

  // --- Access Cards Configuration ---
  const accessCards = [
    {
      title: "Add New Lead",
      description: "Initialize a new candidate into the tracking system.",
      icon: UserPlus,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      path: "/hr/add"
    },
    {
      title: "Active Pipeline",
      description: "Manage candidates, update stages, and track follow-ups.",
      icon: PhoneCall,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      path: "/hr/candidates"
    },
    {
      title: "Call Analytics",
      description: "Review your dialer metrics and conversion rates.",
      icon: BarChart3,
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
      path: "/hr/analytics"
    },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-[1600px] mx-auto space-y-8 pb-12 pt-2"
    >
      
      {/* 1. Premium Hero Section */}
      <motion.div 
        variants={itemVariants} 
        // Using glassmorphism so the global background glows shine through
        className="bg-white/60 dark:bg-card/60 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 shadow-float border border-white/40 dark:border-white/5 relative overflow-hidden"
      >
        
        {/* Inner decorative meshes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-indigo-500/5 to-transparent rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest mb-4">
            <span className="flex items-center gap-1.5 bg-muted dark:bg-muted/50 text-muted-foreground px-3 py-1.5 rounded-lg border border-border">
              <Clock className="w-3.5 h-3.5" /> {today}
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-foreground tracking-tight flex flex-wrap items-center gap-3 sm:gap-4 leading-tight">
            {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">{user.first_name || 'Team'}</span>
            <TimeIcon className={`w-8 h-8 sm:w-10 sm:h-10 ${iconColor} hidden sm:block animate-in fade-in zoom-in duration-1000`} />
          </h1>
          
          <p className="text-base sm:text-lg text-muted-foreground font-medium mt-5 max-w-2xl leading-relaxed">
            Your Executive Command Center. Navigate to your pipeline, initialize new leads, or review your real-time performance metrics.
          </p>
        </div>
      </motion.div>

      {/* 2. System Access Cards (The Grid) */}
      <motion.div variants={itemVariants} className="pt-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Workspace Modules
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {accessCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={index}
                whileHover={{ y: -6, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(card.path)}
                className="bg-white/60 dark:bg-card/60 backdrop-blur-xl p-8 rounded-[1.5rem] shadow-soft border border-white/40 dark:border-white/5 cursor-pointer group hover:shadow-float transition-all relative overflow-hidden flex flex-col h-full"
              >
                {/* Subtle hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                
                <div className="relative z-10 flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 ${card.bg}`}>
                    <Icon className={`w-7 h-7 ${card.color}`} />
                  </div>
                  <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-primary transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="relative z-10 mt-8 flex items-center text-sm font-black text-primary opacity-70 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                  Launch Module <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1.5 transition-transform duration-300" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}