// src/app/layouts/DashboardLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar";

export default function DashboardLayout() {
  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 overflow-hidden">
      {/* 1. The Navbar sits at the top and NEVER re-renders on page changes */}
      <Navbar />

      {/* 2. The dynamic content loads here (e.g., HrDashboard, AdminDashboard) */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Outlet /> 
        </div>
      </main>
    </div>
  );
}