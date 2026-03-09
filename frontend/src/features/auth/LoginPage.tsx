import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "./auth.api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
      setError("Invalid username or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
      
      {/* Header Section */}
      <div className="mb-8 text-center space-y-2">
        <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4 shadow-sm">
          {/* Simple geometric logo placeholder */}
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Firstclose Workspace
        </h1>
        <p className="text-sm text-slate-500">
          Enter your credentials to access the HRMS portal
        </p>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-slate-700 font-medium">Employee ID</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., FCS0001"
            className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:ring-offset-0 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
            <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-blue-600 focus-visible:ring-offset-0 transition-colors"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all shadow-sm"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Authenticating...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Footer info */}
      <div className="mt-8 text-center text-xs text-slate-400">
        <p>Secure connection. Authorized personnel only.</p>
      </div>
    </div>
  );
}