// src/app/layouts/DashboardLayout.tsx
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout() {
  const location = useLocation();

  return (
    // Replaced hardcoded dark hex with dark:bg-background to use the new Cyan base
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-background overflow-hidden selection:bg-primary/20 relative">
      
      {/* Clean ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden flex justify-center z-0">
        <div className="absolute -top-[20%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[120px]" />
      </div>
      <div className="relative z-50">
        <Navbar />
      </div>

      <main className="flex-1 overflow-y-auto relative z-10 w-full scroll-smooth">
        <div className="max-w-[1600px] mx-auto w-full p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="w-full h-full"
            >
              <Outlet /> 
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}