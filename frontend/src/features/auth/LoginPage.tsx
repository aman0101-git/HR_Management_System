import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth.api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, type Variants } from "framer-motion";
import { Building2, User, Lock, Loader2, AlertCircle } from "lucide-react";

// Animation variants for the staggered entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: "easeOut" } 
  }
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!username || !password) {
      setError("Username and password are required");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Login → sets cookie
      await login({ username, password });

      // 2️⃣ Fetch identity ONCE
      const loggedInUser = await refreshUser();

      if (!loggedInUser) {
        throw new Error("Auth failed");
      }

      // 3️⃣ Redirect by role
      switch (loggedInUser.role) {
        case "ADMIN":
          navigate("/admin/dashboard", { replace: true });
          break;
        case "SUPERVISOR":
          navigate("/supervisor/dashboard", { replace: true });
          break;
        case "HR":
          navigate("/hr/dashboard", { replace: true });
          break;
        default:
          setError("Unknown role assigned to this account.");
      }
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      className="w-full sm:px-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="mb-10 text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-teal-600 rounded-[1.25rem] mx-auto flex items-center justify-center mb-6 shadow-soft ring-[6px] ring-primary/10">
          <Building2 className="w-8 h-8 text-white dark:text-[#020e14]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-foreground">
          Welcome Back
        </h1>
        <p className="text-[13px] font-bold text-muted-foreground uppercase tracking-widest">
          Enter credentials to access workspace
        </p>
      </motion.div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Username Field */}
        <motion.div variants={itemVariants} className="space-y-2 relative">
          <Label htmlFor="username" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest ml-1">
            Employee ID
          </Label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g., FCS0001"
              className="h-14 pl-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-background dark:border-border dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all rounded-2xl font-semibold"
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={itemVariants} className="space-y-2 relative">
          <div className="flex items-center justify-between ml-1">
            <Label htmlFor="password" className="text-muted-foreground font-black text-[10px] uppercase tracking-widest">
              Password
            </Label>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-14 pl-11 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 dark:bg-background dark:border-border dark:text-white dark:placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-transparent transition-all rounded-2xl font-semibold"
            />
          </div>
        </motion.div>

        {/* Error State with Shake Animation */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, x: [-5, 5, -5, 5, 0] }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm font-bold text-destructive border border-destructive/20"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.div variants={itemVariants} className="pt-2">
          <Button
            type="submit"
            className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-black text-sm transition-all shadow-soft rounded-2xl tracking-wide"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin h-5 w-5" />
                Authenticating...
              </span>
            ) : (
              "Secure Login"
            )}
          </Button>
        </motion.div>
      </form>

      {/* Footer info */}
      <motion.div variants={itemVariants} className="mt-10 text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
        <p>End-to-End Encrypted Session</p>
      </motion.div>
    </motion.div>
  );
}