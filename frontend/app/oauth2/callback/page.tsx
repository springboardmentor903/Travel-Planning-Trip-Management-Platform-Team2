"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OAuth2CallbackPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const id    = params.get("id");
    const name  = params.get("name");
    const email = params.get("email");

    if (token && id && name && email) {
      login({
        id: parseInt(id),
        name,
        email,
        token,
      });
      router.replace("/dashboard");
    } else {
      // Something went wrong — go back to login
      router.replace("/login?error=oauth_failed");
    }
  }, [login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Signing you in with Google…</p>
      </div>
    </div>
  );
}
