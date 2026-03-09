// src/components/Navbar.tsx
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  PhoneCall, 
  Users, 
  Activity, 
  Handshake,
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
          text: "HR Helpline: +91 800-555-0199",
          Icon: PhoneCall,
          colorClass: "text-emerald-700",
          bgClass: "bg-emerald-50 border-emerald-200",
          pingClass: "bg-emerald-500",
        };
      case "SUPERVISOR":
        return {
          text: "Active Floor HRs: 2",
          Icon: Users,
          colorClass: "text-indigo-700",
          bgClass: "bg-indigo-50 border-indigo-200",
          pingClass: "bg-indigo-500",
        };
      case "ADMIN":
        return {
          text: "System Status: Online",
          Icon: Activity,
          colorClass: "text-violet-700",
          bgClass: "bg-violet-50 border-violet-200",
          pingClass: "bg-violet-500",
        };
      default:
        return {
          text: "Workspace",
          Icon: Handshake,
          colorClass: "text-slate-700",
          bgClass: "bg-slate-50 border-slate-200",
          pingClass: "bg-slate-500",
        };
    }
  };

  const displayConfig = getDisplayConfig();
  const DisplayIcon = displayConfig.Icon;

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shadow-sm transition-all duration-300 shrink-0">
      
      {/* Premium Logo & Greeting Section */}
      <div className="flex items-center gap-3.5 group cursor-pointer">
        {/* Upgraded Icon Container with gradient, ring, and hover tilt */}
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm ring-4 ring-blue-50 group-hover:ring-blue-100 group-hover:shadow-md transition-all duration-300">
          <Handshake className="w-5 h-5 text-white transform group-hover:-rotate-12 transition-transform duration-300" />
        </div>
        
        {/* Text Container with clear visual hierarchy */}
        <div className="flex flex-col justify-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
            Welcome Back
          </span>
          <h2 className="text-lg font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent tracking-tight leading-none">
            {user?.username ? user.username.toUpperCase() : "EMPLOYEE"}
          </h2>
        </div>
      </div>

      {/* Dynamic Status Pill */}
      <div className={`hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-full border shadow-sm transition-colors duration-300 ${displayConfig.bgClass}`}>
        <span className="relative flex h-2.5 w-2.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${displayConfig.pingClass}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${displayConfig.pingClass}`}></span>
        </span>
        <DisplayIcon className={`w-4 h-4 ${displayConfig.colorClass}`} />
        <span className={`text-sm font-semibold tracking-wide ${displayConfig.colorClass}`}>
          {displayConfig.text}
        </span>
      </div>

      {/* User Actions Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* User Profile Widget */}
        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-default border border-transparent hover:border-slate-200">
          <div className="flex flex-col text-right justify-center">
            <p className="text-sm font-bold text-slate-900 leading-none">
              {user?.username || "Employee"}
            </p>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1">
              {user?.role || "USER"}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 shadow-inner">
            {user?.username ? (
              <span className="text-sm font-bold text-slate-700">
                {user.username.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="w-5 h-5 text-slate-500" />
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

        {/* Logout Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLogout}
          className="text-slate-600 hover:text-red-700 hover:bg-red-50 transition-all font-medium px-3 h-9"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Log Out</span>
        </Button>

      </div>
    </header>
  );
}