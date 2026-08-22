"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/travel-history", label: "Travel History" },
  { href: "/settings", label: "Settings" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() { logout(); router.push("/login"); }

  return (
    <nav className="bg-white border-b border-gray-200 px-8 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-1">
        <Link href="/dashboard" className="text-xl font-bold text-gray-900 tracking-tight">TripNest</Link>
        <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" />
      </div>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-6">
        {navLinks.map(({ href, label }) => (
          <Link key={href} href={href}
            className={`text-sm font-medium transition-colors ${
              pathname === href ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
            }`}>
            {label}
          </Link>
        ))}
      </div>

      {/* User + sign out */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden md:block">
          <span className="font-semibold text-gray-900">{user?.name}</span>
        </span>
        <button onClick={handleLogout}
          className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium
                     text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors">
          Sign out
        </button>
      </div>
    </nav>
  );
}
