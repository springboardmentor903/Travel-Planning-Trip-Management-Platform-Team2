"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import ActivitySection from "@/components/ActivitySection";
import BudgetExpenseSection from "@/components/BudgetExpenseSection";
import TripMembersSection from "@/components/TripMembersSection";
import { getTripById, deleteTrip } from "@/lib/tripApi";
import { getItineraries, createItinerary, updateItinerary } from "@/lib/itineraryApi";
import { TripResponse, ItineraryResponse } from "@/lib/types";
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

function TripDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { toasts, addToast, removeToast } = useToast();

  const [trip, setTrip] = useState<TripResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [itineraries, setItineraries] = useState<ItineraryResponse[]>([]);
  const [addingDay, setAddingDay] = useState(false);
  const [itineraryError, setItineraryError] = useState("");
  const [newDayDate, setNewDayDate] = useState("");
  const [editingDayId, setEditingDayId] = useState<number | null>(null);
  const [editingDayDate, setEditingDayDate] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [tripData, itin] = await Promise.all([
          getTripById(id),
          getItineraries(id),
        ]);
        setTrip(tripData);
        setItineraries(itin);
        setNewDayDate(tripData.startDate ?? new Date().toISOString().slice(0, 10));
      } catch {
        setError("Unable to load trip details.");
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(id)) load();
  }, [id]);

  async function handleAddDay() {
    if (!trip) return;
    try {
      setAddingDay(true); setItineraryError("");
      if (!newDayDate) return;
      const newDay = await createItinerary(id, newDayDate);
      setItineraries((prev) => [...prev, newDay].sort((a, b) => a.dayDate.localeCompare(b.dayDate)));
      addToast("Day added", "success");
    } catch {
      setItineraryError("Unable to add day. Please try again.");
    } finally {
      setAddingDay(false);
    }
  }

  async function handleUpdateDay(day: ItineraryResponse) {
    if (!editingDayDate) return;
    try {
      setAddingDay(true); setItineraryError("");
      const updatedDay = await updateItinerary(id, day.id, editingDayDate, day.notes ?? "");
      setItineraries((prev) => prev.map((item) => item.id === day.id ? updatedDay : item).sort((a, b) => a.dayDate.localeCompare(b.dayDate)));
      setEditingDayId(null);
      addToast("Itinerary date updated", "success");
    } catch {
      setItineraryError("Unable to update the itinerary date. Please try again.");
    } finally {
      setAddingDay(false);
    }
  }

  async function handleDeleteTrip() {
    if (!confirm("Delete this trip and all its data? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await deleteTrip(id);
      addToast("Trip deleted", "info");
      router.push("/trips");
    } catch {
      alert("Failed to delete trip.");
      setDeleting(false);
    }
  }

  if (loading) return (
    <div className="glass-canvas min-h-screen">
      <Orbs />
      <div className="glass-grain" />
      <Navbar backHref="/trips" backLabel="My Trips" />
      <div className="glass-content relative max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent mx-auto mb-4" />
        <p className="text-white/60 text-sm">Loading trip details…</p>
      </div>
    </div>
  );

  if (error || !trip) return (
    <div className="glass-canvas min-h-screen">
      <Orbs />
      <div className="glass-grain" />
      <Navbar backHref="/trips" backLabel="My Trips" />
      <div className="glass-content relative max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="glass-card p-12">
          <p className="text-red-400 mb-6 text-sm">{error ?? "Trip not found."}</p>
          <Link
            href="/trips"
            className="glass-btn-primary inline-flex items-center justify-center px-6 py-3"
          >
            Back to My Trips
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="glass-canvas min-h-screen">
      <Orbs />
      <div className="glass-grain" />
      <Navbar backHref="/trips" backLabel="My Trips" />

      <FadeIn>
        <main className="glass-content relative max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <span className={STATUS_PILL[trip.status] ?? "glass-pill glass-pill--default"}>
                {trip.status}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mt-2 leading-snug">{trip.title}</h1>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link
                href={`/trips/${id}/edit`}
                className="glass-btn-ghost px-4 py-2"
              >
                Edit
              </Link>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleDeleteTrip} disabled={deleting}
                className="glass-btn-danger px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting…" : "Delete"}
              </motion.button>
            </div>
          </div>

          <div className="glass-card p-7 sm:p-8">
            <div className="glass-icon-chip mb-5">
              <span className="text-sm">📋</span>
              <span className="text-sm font-semibold text-white/90">Trip Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InfoRow label="Destination" value={trip.destinationName ?? "Not specified"} />
              <InfoRow label="Owner" value={trip.ownerName} />
              <InfoRow label="Start Date" value={trip.startDate ?? "Not specified"} />
              <InfoRow label="End Date" value={trip.endDate ?? "Not specified"} />
              <InfoRow label="Budget" value={trip.budget != null ? `₹${trip.budget.toLocaleString()}` : "Not specified"} />
              <InfoRow label="Created" value={new Date(trip.createdAt).toLocaleDateString()} />
            </div>
            {trip.description && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="glass-label mb-2">Description</p>
                <p className="text-white/80 leading-relaxed text-sm">{trip.description}</p>
              </div>
            )}
          </div>

          <TripMembersSection tripId={id} ownerName={trip.ownerName} />

          <BudgetExpenseSection tripId={id} />

          <div className="glass-card p-7 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <div className="glass-icon-chip">
                <span className="text-sm">🗓️</span>
                <div>
                  <span className="block text-sm font-semibold text-white/90">Itinerary</span>
                  <p className="text-xs text-white/50 mt-0.5">
                    {itineraries.length === 0
                      ? "No days planned yet."
                      : `${itineraries.length} day${itineraries.length > 1 ? "s" : ""} planned.`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="date" value={newDayDate} onChange={(e) => setNewDayDate(e.target.value)} aria-label="Itinerary date" className="glass-input w-36 px-3 py-2 text-xs" />
                <button onClick={handleAddDay} disabled={addingDay || !newDayDate} className="glass-btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed">
                  {addingDay ? "Saving…" : "+ Add Day"}
                </button>
              </div>
            </div>

            {itineraryError && (
              <div className="glass-banner glass-banner--error mt-3">
                <span>⚠️</span>
                <span>{itineraryError}</span>
              </div>
            )}

            {itineraries.length === 0 && !itineraryError && (
              <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                <p className="text-white/40 text-sm">Click &ldquo;+ Add Day&rdquo; to start building your itinerary.</p>
              </div>
            )}

            {itineraries.length > 0 && (
              <StaggerList className="mt-6 space-y-4">
                {itineraries.map((day, index) => (
                  <StaggerItem key={day.id}>
                    <div className="glass-card-md overflow-hidden">
                      <div className="px-5 py-3.5 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-transparent">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">Day {index + 1}</span>
                          {editingDayId === day.id ? (
                            <input type="date" value={editingDayDate} onChange={(e) => setEditingDayDate(e.target.value)} aria-label={`Date for day ${index + 1}`} className="glass-input mt-1 w-44 px-3 py-1.5 text-xs" />
                          ) : (
                            <p className="text-sm font-semibold text-white mt-0.5">
                              {new Date(day.dayDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                            </p>
                          )}
                        </div>
                        {editingDayId === day.id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleUpdateDay(day)} disabled={addingDay || !editingDayDate} className="glass-btn-outline px-3 py-1.5 disabled:opacity-50">Save</button>
                            <button onClick={() => setEditingDayId(null)} className="glass-btn-ghost px-3 py-1.5">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditingDayId(day.id); setEditingDayDate(day.dayDate); }} className="glass-btn-outline px-3 py-1.5">Edit date</button>
                        )}
                      </div>
                      {day.notes && (
                        <p className="px-5 py-2.5 text-sm text-white/60 border-b border-white/10 bg-white/[0.015]">{day.notes}</p>
                      )}
                      <div className="px-5 py-4">
                        <ActivitySection itineraryId={day.id} />
                      </div>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerList>
            )}
          </div>
        </main>
      </FadeIn>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="glass-label">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

export default function TripDetailPage() {
  return <ProtectedRoute><TripDetailContent /></ProtectedRoute>;
}
