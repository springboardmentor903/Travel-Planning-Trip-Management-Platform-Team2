"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="glass-canvas">
        <div className="glass-orbs" aria-hidden>
          <motion.div
            className="glass-orb glass-orb--orange"
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="glass-orb glass-orb--violet"
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="glass-orb glass-orb--cyan"
            animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <div className="glass-grain" />
        </div>
        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent" />
            <p className="text-sm text-white/50 tracking-wide">Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
