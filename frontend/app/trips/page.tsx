"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { tripApi } from "@/lib/api";
import { TripResponse } from "@/lib/types";

function TripsContent() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const [trips, setTrips] = useState<TripResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTrips() {
            try {
                setLoading(true);
                setError("");

                const data = await tripApi.getAll();
                setTrips(data);
            } catch (err: unknown) {
                console.error(err);

                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load your trips."
                );
            } finally {
                setLoading(false);
            }
        }

        loadTrips();
    }, []);

    function handleLogout() {
        logout();
        router.push("/login");
    }

    return (
        <div className="min-h-screen bg-[#f0f2f5]">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    {/* Logo */}
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-1"
                    >
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
                </div>
            </nav>

            {/* Main */}
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
                        px-6 py-3 text-sm font-semibold text-white transition-colors"
                    >
                        + Create Trip
                    </Link>

                </div>

                {/* Loading */}
                {loading && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                        <p className="text-gray-500">
                            Loading your trips...
                        </p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-12 text-center">

                        <p className="text-red-500 mb-5">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="rounded-xl bg-orange-500 px-6 py-3
                            text-sm font-semibold text-white hover:bg-orange-600"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* No trips */}
                {!loading && !error && trips.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">

                        <div
                            className="w-16 h-16 rounded-full bg-orange-50
                            flex items-center justify-center mx-auto mb-5"
                        >
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
                            No trips yet
                        </h2>

                        <p className="text-gray-500 text-sm mb-8">
                            Start planning your first trip with TripNest.
                        </p>

                        <Link
                            href="/trips/create"
                            className="inline-block rounded-xl bg-orange-500
                            hover:bg-orange-600 px-7 py-3
                            text-sm font-semibold text-white"
                        >
                            Create Your First Trip
                        </Link>

                    </div>
                )}

                {/* Trips */}
                {!loading && !error && trips.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {trips.map((trip) => (
                            <div
                                key={trip.id}
                                className="bg-white rounded-2xl border border-gray-100
                                shadow-sm overflow-hidden"
                            >

                                {/* Card header */}
                                <div className="bg-orange-50 px-7 py-6">

                                    <div className="flex items-center justify-between">

                                        <span className="text-sm font-semibold uppercase tracking-wide text-orange-500">
                                            {trip.status || "PLANNED"}
                                        </span>

                                        <span className="text-sm text-gray-400">
                                            #{trip.id}
                                        </span>

                                    </div>

                                    <h2 className="text-xl font-bold text-gray-900 mt-3">
                                        {trip.title}
                                    </h2>

                                </div>

                                {/* Card body */}
                                <div className="px-7 py-6">

                                    <div className="space-y-4">

                                        {/* Destination */}
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-gray-400">
                                                Destination
                                            </span>

                                            <span className="text-sm font-medium text-gray-900 text-right">
                                                {trip.destinationName || "Not specified"}
                                            </span>
                                        </div>

                                        {/* Start */}
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-gray-400">
                                                Start
                                            </span>

                                            <span className="text-sm font-medium text-gray-900">
                                                {trip.startDate || "Not specified"}
                                            </span>
                                        </div>

                                        {/* End */}
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-gray-400">
                                                End
                                            </span>

                                            <span className="text-sm font-medium text-gray-900">
                                                {trip.endDate || "Not specified"}
                                            </span>
                                        </div>

                                        {/* Budget */}
                                        <div className="flex justify-between gap-4">
                                            <span className="text-sm text-gray-400">
                                                Budget
                                            </span>

                                            <span className="text-sm font-medium text-gray-900">
                                                {trip.budget !== null &&
                                                trip.budget !== undefined
                                                    ? `₹${trip.budget}`
                                                    : "Not specified"}
                                            </span>
                                        </div>

                                    </div>

                                    {/* Description */}
                                    {trip.description && (
                                        <p className="mt-5 text-sm text-gray-600 line-clamp-2">
                                            {trip.description}
                                        </p>
                                    )}

                                    {/* View Trip */}
                                    <Link
                                        href={`/trips/${trip.id}`}
                                        className="block mt-6 w-full rounded-xl border-2
                                        border-orange-500 px-5 py-3 text-center
                                        text-sm font-semibold text-orange-500
                                        hover:bg-orange-500 hover:text-white
                                        transition-colors"
                                    >
                                        View Trip
                                    </Link>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </main>
        </div>
    );
}

export default function TripsPage() {
    return (
        <ProtectedRoute>
            <TripsContent />
        </ProtectedRoute>
    );
}