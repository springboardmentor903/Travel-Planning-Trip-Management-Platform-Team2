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
    // Placeholder — password reset backend not yet implemented
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-2 leading-tight">
        Forgot your<br />password?
      </h1>
      <p className="text-gray-500 text-sm mb-7">
        Enter your email address or phone number to receive instructions
        on how to reset your password.
      </p>

      {sent ? (
        <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-4 text-sm text-green-700 mb-6">
          ✅ Reset instructions sent to <strong>{email}</strong>. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email or Phone</label>
            <input
              type="text" required
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email or Phone"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-400 placeholder-gray-400"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="rounded-full bg-orange-500 hover:bg-orange-600 px-6 py-2.5 text-sm
                       font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Send Reset Instructions"}
          </button>
        </form>
      )}

      <p className="mt-8 text-sm text-gray-500">
        Remember your password?{" "}
        <Link href="/login" className="text-orange-500 font-medium hover:underline">
          Log In
        </Link>
      </p>
    </>
  );
}
