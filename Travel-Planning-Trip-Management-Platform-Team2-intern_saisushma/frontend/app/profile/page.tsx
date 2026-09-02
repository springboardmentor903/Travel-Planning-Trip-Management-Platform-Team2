"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/context/AuthContext";
import { Destination, MessageResponse, PhotoUploadResponse, ResetPasswordRequest, TripResponse, UserResponse } from "@/lib/types";
import apiClient from "@/lib/apiClient";
import FadeIn from "@/components/ui/FadeIn";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

const STATUS_PILL: Record<string, string> = {
  PLANNED: "glass-pill glass-pill--planned",
  ONGOING: "glass-pill glass-pill--ongoing",
  COMPLETED: "glass-pill glass-pill--completed",
  CANCELLED: "glass-pill glass-pill--cancelled",
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function Orbs() {
  return (
    <div className="glass-orbs" aria-hidden>
      <motion.div
        className="glass-orb glass-orb--orange"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glass-orb glass-orb--violet"
        animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="glass-orb glass-orb--cyan"
        animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <div className="glass-grain" />
    </div>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);

  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [favoriteDestination, setFavoriteDestination] = useState<Destination | null>(null);
  const [favoriteId, setFavoriteId] = useState("");
  const [favoriteSaving, setFavoriteSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const initials = (profile?.name ?? user?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");

  useEffect(() => {
    Promise.all([
      apiClient.get<UserResponse>("/api/users/me").then((res) => {
        setProfile(res.data);
        setName(res.data.name);
        setEmail(res.data.email);
        setAddress(res.data.address ?? "");
      }),
      loadTrips(),
      apiClient.get<Destination[]>("/api/destinations").then((res) => setDestinations(res.data)),
      apiClient.get<Destination | null>("/api/users/me/favorite-destination")
        .then((res) => { setFavoriteDestination(res.data); setFavoriteId(res.data ? String(res.data.id) : ""); })
        .catch(() => {}),
    ])
      .catch(() => setError("Unable to load profile from server."))
      .finally(() => setLoading(false));
  }, []);

  async function saveFavoriteDestination() {
    if (!favoriteId) return;
    setFavoriteSaving(true);
    try {
      const res = await apiClient.put<Destination>(`/api/users/me/favorite-destination/${favoriteId}`);
      setFavoriteDestination(res.data);
      addToast("Favorite destination saved", "success");
    } catch {
      addToast("Unable to save favorite destination", "error");
    } finally {
      setFavoriteSaving(false);
    }
  }

  async function clearFavoriteDestination() {
    setFavoriteSaving(true);
    try {
      await apiClient.delete("/api/users/me/favorite-destination");
      setFavoriteDestination(null);
      setFavoriteId("");
      addToast("Favorite destination removed", "info");
    } catch {
      addToast("Unable to remove favorite destination", "error");
    } finally {
      setFavoriteSaving(false);
    }
  }

  async function loadTrips() {
    setTripsLoading(true);
    try {
      const res = await apiClient.get<TripResponse[]>("/api/users/me/trips");
      setTrips(res.data);
    } catch {
      // ignore
    } finally {
      setTripsLoading(false);
    }
  }

  async function handleUpdate() {
    setError("");
    if (!name.trim()) { setError("Name is required."); return; }
    if (!email.trim()) { setError("Email is required."); return; }

    setSaving(true);
    try {
      const res = await apiClient.put<UserResponse>("/api/users/me", {
        name: name.trim(),
        email: email.trim(),
        address: address.trim() || null,
      });
      setProfile(res.data);
      setName(res.data.name);
      setEmail(res.data.email);
      setAddress(res.data.address ?? "");
      await refreshUser();
      addToast("Profile updated", "success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Unable to update profile.");
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  function onChoosePhotoClick() {
    fileInputRef.current?.click();
  }

  async function onPhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      addToast("Please select an image file", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast("Image size must be less than 5MB", "error");
      return;
    }

    setPhotoUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await apiClient.post<PhotoUploadResponse>("/api/users/me/photo", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((p) => p ? { ...p, profilePhotoUrl: res.data.profilePhotoUrl } : p);
      await refreshUser();
      addToast(res.data.message ?? "Photo uploaded", "success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Unable to upload photo.");
      addToast(msg, "error");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleResetPassword() {
    setPwError("");
    if (!currentPw) { setPwError("Current password is required"); return; }
    if (!newPw) { setPwError("New password is required"); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (newPw !== confirmPw) { setPwError("Confirm password does not match"); return; }
    if (newPw === currentPw) { setPwError("New password must be different"); return; }

    const payload: ResetPasswordRequest = {
      currentPassword: currentPw,
      newPassword: newPw,
      confirmPassword: confirmPw,
    };

    setPwSaving(true);
    try {
      const res = await apiClient.post<MessageResponse>("/api/users/me/reset-password", payload);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      addToast(res.data.message ?? "Password reset successfully", "success");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        (err instanceof Error ? err.message : "Unable to reset password.");
      setPwError(msg);
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) return (
    <div className="glass-canvas">
      <Orbs />
      <div className="relative z-10">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent" />
            <p className="text-sm text-white/40">Loading profile…</p>
          </div>
        </div>
      </div>
    </div>
  );

  const sortedTrips = [...trips].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="glass-canvas">
      <Orbs />

      <div className="glass-content">
        <Navbar />

        <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-6 sm:space-y-8">

          {/* ============ HEADER + PROFILE BASICS ============ */}
          <FadeIn direction="up">
            <section className="glass-card p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6 mb-8 pb-6 border-t-0 border-x-0 border-b border-white/10">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  {profile?.profilePhotoUrl ? (
                    <img
                      src={profile.profilePhotoUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover ring-4 ring-orange-400/30 shadow-xl bg-orange-50"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 ring-4 ring-white/10 flex items-center justify-center shadow-lg">
                      <span className="text-3xl font-bold text-white">{initials || "?"}</span>
                    </div>
                  )}
                  {photoUploading && (
                    <div className="absolute inset-0 rounded-full bg-white/60 flex items-center justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-2xl font-bold text-white mb-1">My Profile</h1>
                  <p className="text-sm text-white/50 mb-4 leading-relaxed">
                    Your information is managed through TripNest servers.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={onChoosePhotoClick}
                      disabled={photoUploading}
                      className="glass-btn-ghost disabled:opacity-60"
                    >
                      {profile?.profilePhotoUrl ? "Change photo" : "Upload photo"}
                    </motion.button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={onPhotoSelected}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="glass-banner-error mb-5">
                  <span className="shrink-0">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="glass-label">User ID</label>
                  <input
                    type="text" value={profile ? `#${profile.id}` : ""} disabled
                    className="glass-input opacity-60 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="glass-label">Member since</label>
                  <input
                    type="text" value={formatDate(profile?.createdAt ?? null)} disabled
                    className="glass-input opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="h-4" />

              <div className="mb-4">
                <label className="glass-label">Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="mb-4">
                <label className="glass-label">Email</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="glass-input"
                />
              </div>

              <div className="mb-7">
                <label className="glass-label">Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  placeholder="e.g. 123 Main St, City, State, Country — 123456"
                  className="glass-input resize-none"
                />
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleUpdate} disabled={saving}
                className="glass-btn-primary"
              >
                {saving ? "Saving…" : "Save Changes"}
              </motion.button>

              <p className="text-xs text-white/40 mt-4 leading-relaxed">
                Changes are saved to the server and reflected immediately.
              </p>
            </section>
          </FadeIn>

          <FadeIn direction="up" delay={0.025}>
            <section className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/10">
                <div className="glass-icon-chip">
                  <svg aria-hidden="true" className="w-5 h-5 text-orange-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>
                </div>
                <div>
                  <h2 className="glass-h2">Favorite Destination</h2>
                  <p className="text-xs text-white/50 mt-0.5">Keep one destination close to your plans.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={favoriteId}
                  onChange={(e) => setFavoriteId(e.target.value)}
                  className="glass-input bg-[#0f172a]/60"
                >
                  <option value="">Select a favorite destination</option>
                  {destinations.map((destination) => (
                    <option key={destination.id} value={destination.id}>{destination.name}, {destination.country}</option>
                  ))}
                </select>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={saveFavoriteDestination}
                  disabled={!favoriteId || favoriteSaving}
                  className="glass-btn-primary shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {favoriteSaving ? "Saving…" : "Save Favorite"}
                </motion.button>
                {favoriteDestination && (
                  <button
                    onClick={clearFavoriteDestination}
                    disabled={favoriteSaving}
                    className="glass-btn-ghost shrink-0 disabled:opacity-50"
                  >
                    Clear
                  </button>
                )}
              </div>
              {favoriteDestination && (
                <p className="text-sm text-orange-200/80 mt-4">Current favorite: {favoriteDestination.name}, {favoriteDestination.country}</p>
              )}
            </section>
          </FadeIn>

          {/* ============ TRAVEL HISTORY ============ */}
          <FadeIn direction="up" delay={0.05}>
            <section className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5 pb-3 border-t-0 border-x-0 border-b border-white/10">
                <div className="glass-icon-chip">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h18"/><path d="M5.5 5.5A8.5 8.5 0 0 1 18.5 12a8.5 8.5 0 0 1-13 6.5L2 12l3.5-6.5Z"/><path d="M18.5 5.5L22 12l-3.5 6.5A8.5 8.5 0 0 0 5.5 12a8.5 8.5 0 0 0 13-6.5Z"/></svg>
                </div>
                <div className="flex-1">
                  <h2 className="glass-h2">Travel History</h2>
                  <p className="text-xs text-white/50 mt-0.5">All your trips, newest first.</p>
                </div>
                <button
                  onClick={() => loadTrips()}
                  className="ml-auto text-xs font-semibold text-orange-300 hover:text-orange-200 transition-colors"
                  title="Refresh"
                >
                  Refresh
                </button>
              </div>

              {tripsLoading && (
                <div className="py-6 text-center text-sm text-white/50">Loading trips…</div>
              )}

              {!tripsLoading && sortedTrips.length === 0 && (
                <div className="py-10 text-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02]">
                  <div className="mx-auto h-14 w-14 rounded-2xl glass-icon-chip mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h18"/><path d="M5.5 5.5A8.5 8.5 0 0 1 18.5 12a8.5 8.5 0 0 1-13 6.5L2 12l3.5-6.5Z"/></svg>
                  </div>
                  <p className="text-white/70 font-medium">No trips yet</p>
                  <p className="text-white/40 mt-1 text-sm">Your completed and planned trips will show here.</p>
                </div>
              )}

              {!tripsLoading && sortedTrips.length > 0 && (
                <ul className="space-y-3">
                  {sortedTrips.map((trip) => (
                    <li
                      key={trip.id}
                      className="glass-card-md p-4 sm:p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={STATUS_PILL[trip.status ?? "PLANNED"] ?? "glass-pill glass-pill--default"}>
                              {trip.status ?? "PLANNED"}
                            </span>
                          </div>
                          <h3 className="font-semibold text-white truncate">{trip.title}</h3>
                          <p className="text-xs text-white/60 mt-1">
                            <span className="inline-flex items-center gap-1.5">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-orange-300/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                              {trip.destinationName || "Unassigned destination"}
                            </span>
                            <span className="mx-2 text-white/20">·</span>
                            Created {formatDate(trip.createdAt)}
                          </p>
                          <p className="text-xs text-white/40 mt-1.5">
                            {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
                            {trip.budget != null && (
                              <span className="ml-2">· Budget ₹{trip.budget.toLocaleString()}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </FadeIn>

          {/* ============ RESET PASSWORD ============ */}
          <FadeIn direction="up" delay={0.1}>
            <section className="glass-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5 pb-3 border-t-0 border-x-0 border-b border-white/10">
                <div className="glass-icon-chip">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <h2 className="glass-h2">Reset Password</h2>
                  <p className="text-xs text-white/50 mt-0.5">Keep your account safe by using a strong, unique password.</p>
                </div>
              </div>

              {pwError && (
                <div className="glass-banner-error mb-5">
                  <span className="shrink-0 mt-0.5">⚠️</span>
                  <span>{pwError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="glass-label">Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="glass-label">New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    className="glass-input"
                  />
                </div>
                <div>
                  <label className="glass-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    autoComplete="new-password"
                    placeholder="Repeat the new password"
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="mt-6">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleResetPassword}
                  disabled={pwSaving}
                  className="glass-btn-primary"
                >
                  {pwSaving ? "Updating…" : "Update Password"}
                </motion.button>
              </div>
            </section>
          </FadeIn>

        </main>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>;
}
