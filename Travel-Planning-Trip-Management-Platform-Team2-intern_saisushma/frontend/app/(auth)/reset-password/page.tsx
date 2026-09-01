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
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    router.push("/login");
  }

  return (
    <>
      <h1 className="text-[1.75rem] font-bold text-white leading-snug mb-2">Type New Password</h1>
      <p className="text-white/60 text-sm mb-8 leading-relaxed">
        Please type your new password and don&apos;t forget to re-check.
      </p>

      {error && (
        <div className="glass-banner glass-banner--error mb-5">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        <div>
          <label className="glass-label">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} required
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter new password"
              className="glass-input pr-16 !border-orange-400/60 focus:!border-orange-400"
            />
            <button
              type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white/80 px-1 rounded transition-colors duration-150"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="glass-label">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showCf ? "text" : "password"} required
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              className="glass-input pr-16"
            />
            <button
              type="button" onClick={() => setShowCf(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40 hover:text-white/80 px-1 rounded transition-colors duration-150"
            >
              {showCf ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button
          type="submit" disabled={loading}
          className="glass-btn-primary w-full px-6 py-3
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {loading ? "Saving…" : "Save New Password"}
        </button>
      </form>

      <p className="mt-8 text-xs text-white/40 leading-relaxed">
        By continuing, you agree to TripNest{" "}
        <Link href="#" className="text-orange-400 hover:underline font-medium">Privacy Policy</Link>
        {" "}and{" "}
        <Link href="#" className="text-orange-400 hover:underline font-medium">Terms of Service</Link>
      </p>
    </>
  );
}
