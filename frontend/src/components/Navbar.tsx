import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { 
  LogOut, 
  Building2,
  User,
  Menu,
  X,
  LayoutDashboard,
  Users,
  PhoneCall,
  Activity,
  Settings,
  Briefcase
} from "lucide-react";

// --- ROLE-BASED NAVIGATION CONFIGURATION ---
const NAV_LINKS = {
  HR: [
    { title: "Dashboard", path: "/hr/dashboard", icon: LayoutDashboard },
    { title: "Add Lead", path: "/hr/add", icon: Users },
    { title: "Pipeline", path: "/hr/candidates", icon: PhoneCall, },
    { title: "Analytics", path: "/hr/analytics", icon: Activity, },
  ],
  SUPERVISOR: [
    { title: "Dashboard", path: "/supervisor/dashboard", icon: LayoutDashboard },
    { title: "Team Performance", path: "/supervisor/team", icon: Activity },
    { title: "Call Audits", path: "/supervisor/audits", icon: PhoneCall },
  ],
  ADMIN: [
    { title: "System Overview", path: "/admin/dashboard", icon: Activity },
    { title: "User Management", path: "/admin/users", icon: Users },
    { title: "Job Postings", path: "/admin/jobs", icon: Briefcase },
    { title: "Settings", path: "/admin/settings", icon: Settings },
  ]
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Safely get the links for the current user's role
  const currentRole = (user?.role as keyof typeof NAV_LINKS) || "HR";
  const roleLinks = NAV_LINKS[currentRole] || [];

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background/80 backdrop-blur-xl border-b border-border shadow-sm transition-all duration-300"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
        
        {/* LEFT: Premium Brand Logo Area */}
        <div className="flex items-center gap-3 group">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 rounded-xl shadow-soft ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300 flex-shrink-0">
            <Building2 className="w-5 h-5 text-white transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-lg font-black tracking-tight text-foreground leading-none mt-1">
              Firstclose <span className="text-primary">HRMS</span>
            </span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-0.5">
              {user?.role || "Workspace"}
            </span>
          </div>
        </div>

        {/* CENTER: Desktop Role-Based Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {roleLinks.map((link) => {
            const isActive = location.pathname.includes(link.path);
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all duration-200 ${
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.title}
                {isActive && (
                  <motion.div 
                    layoutId="navbar-active-indicator"
                    className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-t-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* RIGHT: User Profile, Theme & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          <ThemeToggle />

          {/* Clean Vertical Divider */}
          <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

          {/* User Profile Widget (Desktop) */}
          <div className="hidden sm:flex items-center gap-3 cursor-default">
            <div className="flex flex-col text-right justify-center">
              <p className="text-sm font-black text-foreground leading-none">
                {user?.username || "Employee"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="hidden sm:flex text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-xl"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>

          {/* Mobile Menu Toggle Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden rounded-xl bg-slate-100 dark:bg-slate-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>

        </div>
      </div>

      {/* MOBILE MENU DROP-DOWN (Animated) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-white dark:bg-background border-b border-border shadow-lg"
          >
            <div className="p-4 flex flex-col gap-2">
              {/* Mobile User Profile */}
              <div className="flex items-center gap-3 p-3 mb-2 bg-slate-50 dark:bg-slate-900 rounded-xl border border-border">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div>
                  <p className="font-bold text-foreground leading-none">{user?.username}</p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">{user?.role}</p>
                </div>
              </div>

              {/* Mobile Links */}
              {roleLinks.map((link) => {
                const isActive = location.pathname.includes(link.path);
                const Icon = link.icon;
                return (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" /> {link.title}
                  </button>
                )
              })}

              <Button 
                variant="destructive" 
                className="w-full mt-2 font-bold rounded-xl flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}