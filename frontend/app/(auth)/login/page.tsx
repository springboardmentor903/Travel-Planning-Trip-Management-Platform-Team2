"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      if (!res.token) { setError("Login failed — no token received."); return; }
      login({ id: res.id, name: res.name, email: res.email, token: res.token });
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-1">Sign in</h1>
      <p className="text-gray-500 text-sm mb-7">Smarter travel starts the moment you sign in.</p>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input
            type="email" required autoComplete="email"
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Example@gmail.com"
            className="w-full rounded-lg border-2 border-orange-400 bg-white px-4 py-2.5 text-sm
                       focus:outline-none focus:border-orange-500 placeholder-gray-500 text-gray-900"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPw ? "text" : "password"} required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm
                         focus:outline-none focus:border-orange-400 placeholder-gray-500 text-gray-900 pr-16"
            />
            <button type="button" onClick={() => setShowPw(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600">
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <div className="text-right mt-1">
            <Link href="/forgot-password" className="text-xs text-orange-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Login button */}
        <button
          type="submit" disabled={loading}
          className="rounded-full bg-orange-500 hover:bg-orange-600 px-8 py-2.5 text-sm
                     font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in…" : "Login"}
        </button>
      </form>

      {/* Social login */}
      <div className="mt-7">
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

      {/* Sign up link */}
      <p className="mt-8 text-sm text-gray-500">
        Don&apos;t have any account?{" "}
        <Link href="/register" className="text-orange-500 font-medium hover:underline">
          Sign Up
        </Link>
      </p>
    </>
  );
}
