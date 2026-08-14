"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [showCf, setShowCf]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    // Placeholder — password reset backend not yet implemented
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    router.push("/login");
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Type New Password</h1>
      <p className="text-gray-500 text-sm mb-7">
        Please type your new password and don&apos;t forget to re-check.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* New Password */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full rounded-lg border-2 border-orange-400 bg-white px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-500 placeholder-gray-400 pr-16"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Confirm Password</label>
          <div className="relative">
            <input
              type={showCf ? "text" : "password"} required
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-400 placeholder-gray-400 pr-16"
            />
            <button type="button" onClick={() => setShowCf(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
              {showCf ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="rounded-full bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-sm
                     font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving…" : "Save New Password"}
        </button>
      </form>

      <p className="mt-8 text-xs text-gray-400">
        By continuing, you agree to TripNest{" "}
        <Link href="#" className="text-orange-500 hover:underline">Privacy Policy</Link>
        {" "}and{" "}
        <Link href="#" className="text-orange-500 hover:underline">Terms of Service</Link>
      </p>
    </>
  );
}
