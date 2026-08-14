"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

const inputBase = "w-full rounded-lg bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-500 focus:outline-none";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [showCf, setShowCf]     = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await authApi.register({ name, email, password });
      setSuccess(res.message || "Account created! Redirecting…");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally { setLoading(false); }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign Up</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your information (we&apos;ll never spam you)</p>

      {error   && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>}
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
          <input type="text" required autoComplete="name" value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            className={`${inputBase} border-2 border-orange-400 focus:border-orange-500`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
          <input type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Example@gmail.com"
            className={`${inputBase} border border-gray-300 focus:border-orange-400`} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className={`${inputBase} border border-gray-300 focus:border-orange-400 pr-16`} />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-orange-500">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <input type={showCf ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter password"
              className={`${inputBase} border border-gray-300 focus:border-orange-400 pr-16`} />
            <button type="button" onClick={() => setShowCf(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-500 hover:text-orange-500">
              {showCf ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="rounded-full bg-orange-500 hover:bg-orange-600 px-8 py-2.5 text-sm font-semibold
                     text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-center text-xs text-gray-400 mb-3">Or continue with</p>
        <a href="http://localhost:8081/oauth2/authorization/google"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300
                     bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <svg viewBox="0 0 24 24" className="h-4 w-4">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </a>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-orange-500 font-medium hover:underline">Log In</Link>
      </p>
    </>
  );
}
