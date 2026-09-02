"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <h1 className="text-[1.75rem] font-bold text-white leading-snug mb-2">
        Forgot your<br />password?
      </h1>
      <p className="text-white/60 text-sm mb-8 leading-relaxed">
        Enter your email address or phone number to receive instructions
        on how to reset your password.
      </p>

      {sent ? (
        <div className="glass-banner glass-banner--success mb-6">
          <span className="shrink-0">✅</span>
          <span>Reset instructions sent to <strong>{email}</strong>. Check your inbox.</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="glass-label">
              Email or Phone
            </label>
            <input
              type="text" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email or Phone"
              className="glass-input"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="glass-btn-primary w-full px-6 py-3
                       disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? "Sending…" : "Send Reset Instructions"}
          </button>
        </form>
      )}

      <p className="mt-8 text-sm text-white/60">
        Remember your password?{" "}
        <Link href="/login" className="text-orange-400 font-semibold hover:text-orange-300 hover:underline transition-colors">
          Log In
        </Link>
      </p>
    </>
  );
}
