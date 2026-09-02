"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { tripApi } from "@/lib/api";
import { searchTrips, requestToJoinTrip } from "@/lib/tripJoinApi";
import { TripResponse, TripSearchResultResponse } from "@/lib/types";
import FadeIn from "@/components/ui/FadeIn";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

const STATUS_PILL: Record<string, string> = {
  PLANNED: "glass-pill glass-pill--planned",
  ONGOING: "glass-pill glass-pill--ongoing",
  COMPLETED: "glass-pill glass-pill--completed",
  CANCELLED: "glass-pill glass-pill--cancelled",
};

function Orbs() {
  return (
    <div className="glass-orbs pointer-events-none">
      <motion.div
        className="glass-orb glass-orb--orange"
        animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glass-orb glass-orb--violet"
        animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="glass-orb glass-orb--cyan"
        animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function TripsContent() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<"my-trips" | "search">("my-trips");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<TripSearchResultResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedTripToJoin, setSelectedTripToJoin] = useState<TripSearchResultResponse | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    loadTrips();
  }, []);

  async function loadTrips() {
    try {
      setLoading(true);
      setError("");
      setTrips(await tripApi.getAll());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to load trips.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault();
    try {
      setSearchLoading(true);
      const results = await searchTrips(searchQuery);
      setSearchResults(results);
    } catch {
      addToast("Failed to search trips.", "error");
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSendJoinRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTripToJoin) return;
    try {
      setSendingRequest(true);
      await requestToJoinTrip(selectedTripToJoin.id, { message: joinMessage });
      addToast("Join request sent to trip admin!", "success");
      setSearchResults((prev) =>
        prev.map((t) => (t.id === selectedTripToJoin.id ? { ...t, userRelationship: "REQUEST_PENDING" } : t))
      );
      setSelectedTripToJoin(null);
      setJoinMessage("");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : "Failed to send join request.");
      addToast(msg, "error");
    } finally {
      setSendingRequest(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this trip? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await tripApi.delete(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
      addToast("Trip deleted", "success");
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : "Failed to delete trip.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="glass-canvas min-h-screen">
      <Orbs />
      <div className="glass-grain" />
      <Navbar />

      <main className="glass-content relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <FadeIn direction="down">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="glass-h1">Trip Central</h1>
              <p className="glass-sub mt-1">Plan, collaborate, track, and explore trips together.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  onClick={() => setActiveTab("my-trips")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    activeTab === "my-trips" ? "bg-orange-500 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  My Trips
                </button>
                <button
                  onClick={() => {
                    setActiveTab("search");
                    if (searchResults.length === 0) handleSearch();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                    activeTab === "search" ? "bg-orange-500 text-white shadow" : "text-white/60 hover:text-white"
                  }`}
                >
                  🔍 Find & Join Trips
                </button>
              </div>
              <Link
                href="/trips/create"
                className="glass-btn-primary px-5 py-2.5 text-sm font-semibold inline-flex items-center gap-1.5"
              >
                <span>+</span> Create Trip
              </Link>
            </div>
          </div>
        </FadeIn>

        {activeTab === "my-trips" && (
          <>
            <FadeIn direction="up">
              <div className="relative h-[20rem] sm:h-[24rem] overflow-hidden rounded-3xl border border-white/15 shadow-2xl mb-8">
                <img
                  src="/trips-beach.avif"
                  alt="Tropical beach destination"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/90 via-[#0f172a]/45 to-[#0f172a]/20" />
                <div className="relative z-10 flex h-full max-w-md flex-col justify-center px-6 sm:px-8">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-300">Shared Adventures</span>
                  <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">Collaborative Travel Planning.</h2>
                  <p className="mt-2 text-sm text-white/70">Plan itineraries, track expenses, and travel with your group seamlessly.</p>
                </div>
              </div>
            </FadeIn>

            {loading && (
              <div className="glass-card p-14 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent mx-auto mb-4" />
                <p className="text-white/60 text-sm">Loading your trips…</p>
              </div>
            )}

            {!loading && error && (
              <div className="glass-card p-14 text-center">
                <div className="glass-banner glass-banner--error mb-6 text-left">
                  <TripIcon name="warning" className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={loadTrips}
                  className="glass-btn-primary px-6 py-3"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && trips.length === 0 && (
              <div className="glass-card p-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-rose-500/20 border border-white/10 flex items-center justify-center mx-auto mb-5">
                  <TripIcon name="plane" className="h-8 w-8 text-orange-200" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">No trips yet</h2>
                <p className="text-white/60 text-sm mb-8">Start planning your first adventure or search for public trips to join.</p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/trips/create"
                    className="glass-btn-primary inline-flex items-center justify-center px-7 py-3"
                  >
                    Create Your First Trip
                  </Link>
                  <button
                    onClick={() => {
                      setActiveTab("search");
                      handleSearch();
                    }}
                    className="glass-btn-outline px-6 py-3"
                  >
                    Find Trips to Join
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && trips.length > 0 && (
              <StaggerList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {trips.map((trip) => (
                  <StaggerItem key={trip.id}>
                    <div className="glass-card-md overflow-hidden flex flex-col">
                      <div className="px-6 py-5 border-b border-white/10 bg-gradient-to-br from-orange-500/15 via-amber-500/10 to-transparent">
                        <div className="flex items-center justify-between mb-2">
                          <span className={STATUS_PILL[trip.status] ?? "glass-pill glass-pill--default"}>
                            {trip.status}
                          </span>
                          <span className="text-xs text-white/40 font-medium">#{trip.id}</span>
                        </div>
                        <h2 className="text-base font-bold text-white truncate">{trip.title}</h2>
                      </div>

                      <div className="px-6 py-5 flex flex-col gap-3 flex-1">
                        <div className="space-y-1.5 text-sm">
                          <Row label="Destination" value={trip.destinationName ?? "Not specified"} />
                          <Row label="Owner" value={trip.ownerName} />
                          <Row label="Start" value={trip.startDate ?? "—"} />
                          <Row label="End" value={trip.endDate ?? "—"} />
                          <Row label="Budget" value={trip.budget != null ? `₹${trip.budget.toLocaleString()}` : "—"} />
                        </div>

                        {trip.description && (
                          <p className="text-sm text-white/60 line-clamp-2 leading-relaxed">{trip.description}</p>
                        )}

                        <div className="mt-auto pt-4 border-t border-white/10 flex gap-2">
                          <Link
                            href={`/trips/${trip.id}`}
                            className="glass-btn-primary flex-1 px-4 py-2 text-center text-sm font-semibold"
                          >
                            Open Trip
                          </Link>
                          <Link
                            href={`/trips/${trip.id}/edit`}
                            className="glass-btn-ghost px-3 py-2 text-sm"
                          >
                            Edit
                          </Link>
                          <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleDelete(trip.id)}
                            disabled={deletingId === trip.id}
                            className="glass-btn-danger px-3 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {deletingId === trip.id ? "…" : "Delete"}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </>
        )}

        {activeTab === "search" && (
          <div className="space-y-6">
            {/* Search form */}
            <div className="glass-card p-6 sm:p-8">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search trips by name or destination (e.g., Paris, Goa, Roadtrip)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input flex-1 px-4 py-3 bg-black/25 border border-white/15 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-orange-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="glass-btn-primary px-7 py-3 text-sm font-semibold disabled:opacity-50 shrink-0"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </form>
            </div>

            {/* Search Results */}
            {searchLoading ? (
              <div className="glass-card p-12 text-center text-white/50">
                <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent mx-auto mb-3" />
                Searching for trips...
              </div>
            ) : searchResults.length === 0 ? (
              <div className="glass-card p-12 text-center text-white/50">
                No trips found matching &ldquo;{searchQuery}&rdquo;. Try another search term.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((trip) => {
                  const isOwner = trip.userRelationship === "OWNER";
                  const isMember = trip.userRelationship === "MEMBER" || trip.userRelationship === "GROUP_ADMIN";
                  const isPending = trip.userRelationship === "REQUEST_PENDING";

                  return (
                    <div key={trip.id} className="glass-card-md overflow-hidden flex flex-col justify-between p-6 gap-4">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={STATUS_PILL[trip.status] ?? "glass-pill glass-pill--default"}>
                            {trip.status}
                          </span>
                          <span className="text-xs text-white/40">by {trip.ownerName}</span>
                        </div>
                        <h3 className="text-base font-bold text-white mb-2 truncate">{trip.title}</h3>
                        {trip.description && (
                          <p className="text-xs text-white/60 line-clamp-2 leading-relaxed mb-3">{trip.description}</p>
                        )}
                        <div className="space-y-1 text-xs text-white/70">
                          <Row label="Destination" value={trip.destinationName ?? "Not specified"} />
                          <Row label="Dates" value={trip.startDate ? `${trip.startDate} to ${trip.endDate || "—"}` : "Flexible"} />
                          <Row label="Budget" value={trip.budget != null ? `₹${trip.budget.toLocaleString()}` : "—"} />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-white/10">
                        {isOwner || isMember ? (
                          <Link
                            href={`/trips/${trip.id}`}
                            className="glass-btn-outline w-full py-2 text-center text-xs font-semibold block"
                          >
                            {isOwner ? "⭐ You Own This Trip (Open)" : "✅ You are a Member (Open)"}
                          </Link>
                        ) : isPending ? (
                          <button
                            disabled
                            className="w-full py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-not-allowed"
                          >
                            ⏳ Join Request Pending
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedTripToJoin(trip)}
                            className="glass-btn-primary w-full py-2 text-center text-xs font-semibold"
                          >
                            + Request to Join
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Join Request Modal */}
        {selectedTripToJoin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass-card max-w-md w-full p-6 sm:p-7 relative">
              <button
                onClick={() => setSelectedTripToJoin(null)}
                className="absolute top-4 right-4 text-white/60 hover:text-white text-lg"
              >
                ✕
              </button>
              <h3 className="text-lg font-bold text-white mb-1">Request to Join Trip</h3>
              <p className="text-xs text-orange-400 font-semibold mb-4">{selectedTripToJoin.title}</p>
              <form onSubmit={handleSendJoinRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1.5">
                    Optional note to the trip admin:
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Hello! I would love to join your trip because..."
                    value={joinMessage}
                    onChange={(e) => setJoinMessage(e.target.value)}
                    className="glass-input w-full p-3 bg-black/30 border border-white/15 rounded-xl text-white placeholder-white/40 text-xs focus:outline-none focus:border-orange-400"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTripToJoin(null)}
                    className="glass-btn-ghost px-4 py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingRequest}
                    className="glass-btn-primary px-5 py-2 text-xs font-semibold disabled:opacity-50"
                  >
                    {sendingRequest ? "Sending..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-white/40 shrink-0">{label}</span>
      <span className="font-medium text-white text-right truncate">{value}</span>
    </div>
  );
}

function TripIcon({ name, className }: { name: "plane" | "warning"; className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {name === "plane" ? (
        <path d="m3 11 18-7-7 18-2.5-8.5L3 11Zm8.5 2.5L21 4" />
      ) : (
        <><path d="m12 3 9 16H3L12 3Z" /><path d="M12 9v4M12 16h.01" /></>
      )}
    </svg>
  );
}

export default function TripsPage() {
  return <ProtectedRoute><TripsContent /></ProtectedRoute>;
}
