"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  backHref?: string;
  backLabel?: string;
}

export default function Navbar({ backHref, backLabel }: NavbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const isAdmin = user?.role === "ADMINISTRATOR";

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0f1d]/85 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-6">

        {/* Brand */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-lg group"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-[0_2px_8px_rgba(249,115,22,0.4)]">
            <span className="text-xs font-black text-white">{isAdmin ? "🛡️" : "✈"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[1.1rem] font-bold tracking-tight leading-none text-white">TripNest</span>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40">
                Admin Panel
              </span>
            )}
          </div>
        </Link>

        {/* Nav items */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-1 sm:gap-2"
        >
          {backHref && (
            <Link
              href={backHref}
              className="hidden sm:inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-sm text-white/60 hover:text-orange-300 hover:bg-orange-500/10 border border-transparent hover:border-orange-400/30 transition-all duration-150"
            >
              <span className="text-xs">←</span> {backLabel ?? "Back"}
            </Link>
          )}

          {isAdmin ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-1.5 text-sm font-semibold text-purple-300 bg-purple-500/10 border border-purple-400/30 transition-all duration-150"
              >
                🛡️ Control Center
              </Link>
              <Link
                href="/destinations"
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-150"
              >
                Destinations
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/trips"
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-150"
              >
                My Trips
              </Link>
              <Link
                href="/destinations"
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-150"
              >
                Destinations
              </Link>
              <Link
                href="/profile"
                className="rounded-xl px-3 py-1.5 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-150"
              >
                Profile
              </Link>
            </>
          )}

          {/* Divider */}
          <span className="hidden sm:block w-px h-5 bg-white/10 mx-1" />

          {user && (
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-white/40">
              <span>Hi,</span>
              <span className="font-semibold text-white/90">{user.name}</span>
              {isAdmin && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  ADMIN
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => { logout(); router.push("/login"); }}
            className="rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm font-medium text-white/80 hover:border-orange-400/60 hover:text-orange-300 hover:bg-orange-500/10 active:scale-95 transition-all duration-150 ml-1"
          >
            Sign out
          </button>
        </motion.div>
      </div>
    </nav>
  );
}
