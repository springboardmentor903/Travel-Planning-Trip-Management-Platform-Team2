"use client";

<<<<<<< HEAD
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";

const PREFERENCES = ["Beach", "Mountains", "City", "Adventure", "Cultural", "Backpacking", "Luxury", "Road Trip"];
const FAVOURITES   = ["Paris", "Bali", "Tokyo", "New York", "Maldives", "Dubai", "Rome", "Bangkok"];

function ProfileContent() {
  const { user } = useAuth();
  const [selectedPrefs, setSelectedPrefs]   = useState<string[]>([]);
  const [selectedFavs,  setSelectedFavs]    = useState<string[]>([]);

  function toggle(item: string, list: string[], setList: (v: string[]) => void) {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  }

  const chip = (active: boolean) =>
    `px-4 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-colors ${
      active ? "bg-orange-500 text-white border-orange-500" : "bg-white text-gray-600 border-gray-300 hover:border-orange-400"
    }`;

  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-sm text-gray-400 mt-1">Your travel identity.</p>
        </div>

        {/* Basic info card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#f0f2f5] rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">User ID</p>
              <p className="font-semibold text-gray-900">#{user?.id}</p>
            </div>
            <div className="bg-[#f0f2f5] rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Token</p>
              <p className="font-semibold text-orange-500">Active ✓</p>
            </div>
          </div>
        </div>

        {/* Travel Preferences */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Travel Preferences</h2>
          <div className="flex flex-wrap gap-2">
            {PREFERENCES.map(p => (
              <button key={p} onClick={() => toggle(p, selectedPrefs, setSelectedPrefs)}
                className={chip(selectedPrefs.includes(p))}>
                {p}
              </button>
            ))}
          </div>
          {selectedPrefs.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">Selected: {selectedPrefs.join(", ")}</p>
          )}
        </div>

        {/* Favourite Destinations */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Favourite Destinations</h2>
          <div className="flex flex-wrap gap-2">
            {FAVOURITES.map(d => (
              <button key={d} onClick={() => toggle(d, selectedFavs, setSelectedFavs)}
                className={chip(selectedFavs.includes(d))}>
                {d}
              </button>
            ))}
          </div>
          {selectedFavs.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">Selected: {selectedFavs.join(", ")}</p>
          )}
        </div>

      </main>
    </div>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
=======
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserResponse } from "@/lib/types";

function ProfileContent() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [profile, setProfile] = useState<UserResponse | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // Get current user from backend
    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await userApi.getProfile();

                setProfile(data);
                setName(data.name);
                setEmail(data.email);
            } catch (err: unknown) {
                setError(
                    err instanceof Error
                        ? err.message
                        : "Unable to load profile."
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    async function handleUpdate() {
        setError("");
        setMessage("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        if (!email.trim()) {
            setError("Email is required.");
            return;
        }

        setSaving(true);

        try {
            const updatedUser = await userApi.updateProfile({
                name: name.trim(),
                email: email.trim(),
            });

            setProfile(updatedUser);
            setName(updatedUser.name);
            setEmail(updatedUser.email);

            setMessage("Profile updated successfully.");
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to update profile."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleLogout() {
        logout();
        router.push("/login");
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
                <p className="text-gray-500">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0f2f5]">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-1"
                >
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            TripNest
          </span>

                    <span className="w-2 h-2 rounded-full bg-orange-500 mb-3" />
                </button>

                <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Welcome,{" "}
              <span className="font-semibold text-gray-900">
              {profile?.name || user?.name}
            </span>
          </span>

                    <button
                        onClick={handleLogout}
                        className="rounded-full border border-gray-300 bg-white px-5 py-1.5 text-sm font-medium text-gray-700 hover:border-orange-400 hover:text-orange-500 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </nav>

            {/* Profile */}
            <main className="max-w-2xl mx-auto px-6 py-12">

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    {/* Heading */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">
                            My Profile
                        </h1>

                        <p className="text-sm text-gray-400 mt-1">
                            Your profile information is managed securely through TripNest.
                        </p>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="mb-5 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-600">
                            {message}
                        </div>
                    )}

                    {/* Profile icon */}
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
                            <svg
                                viewBox="0 0 24 24"
                                className="w-10 h-10 text-orange-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.5}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                                />

                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4.5 20.25a8.25 8.25 0 0115 0"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* User ID */}
                    <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            User ID
                        </label>

                        <input
                            type="text"
                            value={profile ? `#${profile.id}` : ""}
                            disabled
                            className="w-full rounded-lg border border-gray-200 bg-gray-100 px-4 py-2.5 text-sm text-gray-500"
                        />
                    </div>

                    {/* Name */}
                    <div className="mb-5">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Name
                        </label>

                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                        />
                    </div>

                    {/* Email */}
                    <div className="mb-7">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                            Email
                        </label>

                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                        />
                    </div>

                    {/* Save */}
                    <button
                        onClick={handleUpdate}
                        disabled={saving}
                        className="w-full rounded-full bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>

                </div>
            </main>
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ProtectedRoute>
            <ProfileContent />
        </ProtectedRoute>
    );
}
>>>>>>> origin/intern_saisushma
