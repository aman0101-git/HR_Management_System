import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  PhoneCall, 
  Users, 
  Activity, 
  Building2,
  User 
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Dynamic logic returning text, specific icons, and color themes per role
  const getDisplayConfig = () => {
    switch (user?.role) {
      case "HR":
        return {
          text: "HR Helpline: Active",
          Icon: PhoneCall,
          colorClass: "text-emerald-700",
          bgClass: "bg-emerald-50 border-emerald-200",
          pingClass: "bg-emerald-500",
        };
      case "SUPERVISOR":
        return {
          text: "Floor Status: Supervised",
          Icon: Users,
          colorClass: "text-indigo-700",
          bgClass: "bg-indigo-50 border-indigo-200",
          pingClass: "bg-indigo-500",
        };
      case "ADMIN":
        return {
          text: "System Status: Online",
          Icon: Activity,
          colorClass: "text-blue-700",
          bgClass: "bg-blue-50 border-blue-200",
          pingClass: "bg-blue-500",
        };
      default:
        return {
          text: "Workspace Connected",
          Icon: Activity,
          colorClass: "text-slate-700",
          bgClass: "bg-slate-50 border-slate-200",
          pingClass: "bg-slate-500",
        };
    }
  };

  const displayConfig = getDisplayConfig();
  const DisplayIcon = displayConfig.Icon;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm transition-all duration-300">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LEFT: Premium Brand Logo Area */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
          <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all duration-300">
            <Building2 className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span className="text-lg font-black tracking-tight text-slate-800 leading-none mt-1">
              Firstclose <span className="text-blue-600">HRMS</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-0.5">
              HR Management
            </span>
          </div>
        </div>

        {/* CENTER: Dynamic Status Pill (Hidden on mobile to save space) */}
        <div className={`hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm transition-colors duration-300 ${displayConfig.bgClass}`}>
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${displayConfig.pingClass}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${displayConfig.pingClass}`}></span>
          </span>
          <DisplayIcon className={`w-3.5 h-3.5 ${displayConfig.colorClass}`} />
          <span className={`text-xs font-bold tracking-wide ${displayConfig.colorClass} uppercase`}>
            {displayConfig.text}
          </span>
        </div>

        {/* RIGHT: User Profile & Actions Section */}
        <div className="flex items-center gap-2 sm:gap-5">
          
          {/* User Profile Widget */}
          <div className="flex items-center gap-3 cursor-default">
            <div className="hidden sm:flex flex-col text-right justify-center">
              <p className="text-sm font-black text-slate-800 leading-none">
                {user?.username || "Employee"}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                {user?.role || "USER"} Portal
              </p>
            </div>
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner text-slate-600 font-bold text-sm">
              {user?.username ? (
                user.username.charAt(0).toUpperCase()
              ) : (
                <User className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {/* Clean Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

          {/* Logout Button */}
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-700 hover:bg-red-50 transition-all font-bold px-3 h-9 rounded-lg"
          >
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>

        </div>
      </div>
    </nav>
  );
}