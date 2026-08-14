"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5]">

      {/* Navbar — matches auth page style */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-xl font-bold text-gray-900 tracking-tight">TripNest</span>
          <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Welcome, <span className="font-semibold text-gray-900">{user?.name}</span>
          </span>
          <button onClick={handleLogout}
            className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-sm font-medium
                       text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      {/* Body */}
      <main className="max-w-2xl mx-auto px-6 py-14">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <svg viewBox="0 0 24 24" className="h-8 w-8 text-orange-500" fill="none"
              stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You&apos;re in, {user?.name?.split(" ")[0]}!
          </h2>
          <p className="text-gray-400 text-sm mb-8">
            Authentication is working. Trip management features are coming next.
          </p>

          {/* Account card */}
          <div className="bg-[#f0f2f5] rounded-xl p-6 text-left max-w-xs mx-auto space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Your Account
            </p>
            {[
              { label: "Name",    value: user?.name },
              { label: "Email",   value: user?.email },
              { label: "User ID", value: `#${user?.id}` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-400">{label}</span>
                <span className="font-medium text-gray-900">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Token</span>
              <span className="font-semibold text-orange-500">Active ✓</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
