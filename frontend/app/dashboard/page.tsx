"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
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

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">

                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-1">
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            TripNest
          </span>
                    <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" />
                </Link>

                {/* Navigation */}
                <div className="flex items-center gap-6">

                    <Link
                        href="/destinations"
                        className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                    >
                        Destinations
                    </Link>

                    <Link
                        href="/profile"
                        className="text-sm text-gray-600 hover:text-orange-500 transition-colors"
                    >
                        Profile
                    </Link>

                    <span className="text-sm text-gray-500">
            Welcome,{" "}
                        <span className="font-semibold text-gray-900">
              {user?.name}
            </span>
          </span>

                    <button
                        onClick={handleLogout}
                        className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-sm font-medium
                       text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                        Sign out
                    </button>

                </div>
            </nav>

            {/* Body */}
            <main className="max-w-6xl mx-auto px-6 py-14">

                {/* Header */}
                <div className="flex items-center justify-between mb-10">

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            My Trips
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Manage and explore your trips.
                        </p>
                    </div>

                    <Link
                        href="/trips/create"
                        className="rounded-xl bg-orange-500 hover:bg-orange-600
                       px-6 py-3 text-sm font-semibold text-white
                       transition-colors"
                    >
                        + Create Trip
                    </Link>

                </div>

                {/* Trips section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

                    <div className="text-center py-16">

                        {/* Icon */}
                        <div className="w-16 h-16 rounded-full bg-orange-50
                            flex items-center justify-center mx-auto mb-5">

                            <svg
                                viewBox="0 0 24 24"
                                className="h-8 w-8 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12
                     59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                                />
                            </svg>

                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Your Trips
                        </h2>

                        <p className="text-gray-500 text-sm mb-8">
                            View and manage your planned trips.
                        </p>

                        <Link
                            href="/trips"
                            className="inline-block rounded-xl bg-orange-500
                         hover:bg-orange-600 px-7 py-3
                         text-sm font-semibold text-white
                         transition-colors"
                        >
                            View My Trips
                        </Link>

                    </div>

                </div>

                {/* Quick links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

                    {/* Destinations */}
                    <Link
                        href="/destinations"
                        className="bg-white rounded-2xl border border-gray-100
                       shadow-sm p-7 hover:shadow-md
                       transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-50
                            flex items-center justify-center mb-4">

                            <span className="text-2xl">🌍</span>

                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            Explore Destinations
                        </h3>

                        <p className="text-sm text-gray-500">
                            Discover popular destinations and plan your next adventure.
                        </p>
                    </Link>

                    {/* Profile */}
                    <Link
                        href="/profile"
                        className="bg-white rounded-2xl border border-gray-100
                       shadow-sm p-7 hover:shadow-md
                       transition-shadow"
                    >
                        <div className="w-12 h-12 rounded-full bg-orange-50
                            flex items-center justify-center mb-4">

                            <span className="text-2xl">👤</span>

                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                            My Profile
                        </h3>

                        <p className="text-sm text-gray-500">
                            View and update your personal information.
                        </p>
                    </Link>

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