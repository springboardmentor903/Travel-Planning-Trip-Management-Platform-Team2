"use client";

import { FormEvent, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { createTrip } from "@/lib/tripApi";
import { Destination } from "@/lib/types";
import apiClient from "@/lib/apiClient";
import FadeIn from "@/components/ui/FadeIn";
import { ToastContainer } from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

function Orbs() {
    return (
        <div className="glass-orbs pointer-events-none">
            <motion.div
                className="glass-orb glass-orb--orange"
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{
                    duration: 16,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="glass-orb glass-orb--violet"
                animate={{ x: [0, -25, 0], y: [0, 20, 0] }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            <motion.div
                className="glass-orb glass-orb--cyan"
                animate={{ x: [0, 20, 0], y: [0, 25, 0] }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}

/* =========================
   NOMINATIM RESULT TYPE
========================= */

interface NominatimResult {
    place_id: number;
    display_name: string;
    name?: string;
    type?: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        state?: string;
        country?: string;
    };
}

function CreateTripContent() {
    const router = useRouter();

    const { toasts, addToast, removeToast } = useToast();

    // =========================
    // TRIP FORM
    // =========================

    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [status, setStatus] = useState("PLANNED");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =========================
    // DESTINATION SEARCH
    // =========================

    const [destQuery, setDestQuery] = useState("");

    const [destResults, setDestResults] =
        useState<NominatimResult[]>([]);

    const [selectedDest, setSelectedDest] =
        useState<Destination | null>(null);

    const [destSearching, setDestSearching] =
        useState(false);

    const debounceRef =
        useRef<ReturnType<typeof setTimeout> | null>(null);

    // =========================
    // SEARCH DESTINATIONS
    // USING OPENSTREETMAP / NOMINATIM
    // =========================

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (!destQuery.trim()) {
            setDestResults([]);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setDestSearching(true);

                const response = await apiClient.get<NominatimResult[]>(
                    "/api/destinations/search",
                    {
                        params: {
                            query: destQuery.trim(),
                        },
                    }
                );

                setDestResults(response.data || []);
            } catch (error) {
                console.error(
                    "Destination search failed:",
                    error
                );

                setDestResults([]);
            } finally {
                setDestSearching(false);
            }
        }, 500);

        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [destQuery]);

    // =========================
    // CREATE TRIP
    // =========================

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();

        if (!title.trim()) {
            setError("Trip title is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            // =========================
            // 1. CREATE TRIP
            // =========================

            const trip = await createTrip({
                title: title.trim(),

                ...(selectedDest
                    ? {
                        destinationId: selectedDest.id,
                    }
                    : {}),

                ...(startDate
                    ? {
                        startDate,
                    }
                    : {}),

                ...(endDate
                    ? {
                        endDate,
                    }
                    : {}),

                ...(description.trim()
                    ? {
                        description: description.trim(),
                    }
                    : {}),

                ...(budget
                    ? {
                        budget: Number(budget),
                    }
                    : {}),

                status,
            });

            // =========================
            // 2. CREATE BUDGET RECORD
            // =========================

            if (budget && Number(budget) > 0) {
                await apiClient.post(
                    `/api/trips/${trip.id}/budget`,
                    {
                        totalBudget: Number(budget),
                        currency: "INR",
                    }
                );
            }

            addToast(
                "Trip created successfully",
                "success"
            );

            // =========================
            // 3. GO TO TRIP DETAILS
            // =========================

            router.push(`/trips/${trip.id}`);
        } catch (err: unknown) {
            console.error(
                "Create trip error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create trip."
            );
        } finally {
            setLoading(false);
        }
    }

    // =========================
    // UI
    // =========================

    return (
        <div className="glass-canvas min-h-screen">

            <Orbs />

            <div className="glass-grain" />

            <Navbar
                backHref="/trips"
                backLabel="My Trips"
            />

            <main className="glass-content relative max-w-2xl mx-auto px-4 sm:px-6 py-10">

                <div className="mb-7">

                    <h1 className="glass-h1">
                        Create New Trip
                    </h1>

                    <p className="glass-sub mt-1.5">
                        Plan your next adventure.
                    </p>

                </div>

                <FadeIn direction="up">

                    <form
                        onSubmit={handleSubmit}
                        className="glass-card p-7 sm:p-8 space-y-6"
                    >

                        {/* =========================
                ERROR
            ========================= */}

                        {error && (
                            <div className="glass-banner glass-banner--error">

                <span className="shrink-0 mt-0.5">
                  ⚠️
                </span>

                                <span>
                  {error}
                </span>

                            </div>
                        )}

                        {/* =========================
                TRIP TITLE
            ========================= */}

                        <div>

                            <label className="glass-label">
                                Trip Title *
                            </label>

                            <input
                                type="text"
                                value={title}
                                onChange={(e) =>
                                    setTitle(e.target.value)
                                }
                                required
                                placeholder="e.g. Goa Weekend Escape"
                                className="glass-input"
                            />

                        </div>

                        {/* =========================
                DESTINATION
            ========================= */}

                        <div>

                            <label className="glass-label">
                                Destination
                            </label>

                            {selectedDest ? (

                                <div className="flex items-center justify-between rounded-xl border border-orange-400/40 bg-orange-500/10 px-4 py-3 backdrop-blur-sm">

                                    <div>

                                        <p className="text-sm font-semibold text-white">
                                            {selectedDest.name}
                                        </p>

                                        <p className="text-xs text-white/60 mt-0.5">

                                            {selectedDest.city}

                                            {selectedDest.city &&
                                            selectedDest.country
                                                ? ", "
                                                : ""}

                                            {selectedDest.country}

                                        </p>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDest(null);
                                            setDestQuery("");
                                        }}
                                        className="text-xs text-orange-400 hover:text-orange-300 font-semibold transition-colors"
                                    >
                                        Change
                                    </button>

                                </div>

                            ) : (

                                <div className="relative">

                                    <input
                                        type="text"
                                        value={destQuery}
                                        onChange={(e) =>
                                            setDestQuery(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Search destinations…"
                                        className="glass-input"
                                    />

                                    {/* SEARCHING */}

                                    {destSearching && (
                                        <p className="text-xs text-white/40 mt-1">
                                            Searching…
                                        </p>
                                    )}

                                    {/* SEARCH RESULTS */}

                                    {destResults.length > 0 && (

                                        <ul className="absolute z-10 mt-1 w-full rounded-xl border border-white/10 bg-[#0f172a]/95 backdrop-blur-2xl shadow-lg max-h-52 overflow-y-auto divide-y divide-white/5">

                                            {destResults.map((d) => (

                                                <li key={d.place_id}>

                                                    <button
                                                        type="button"

                                                        onClick={async () => {

                                                            try {

                                                                setDestSearching(true);
                                                                setError("");

                                                                const address =
                                                                    d.address || {};

                                                                const city =
                                                                    address.city ||
                                                                    address.town ||
                                                                    address.village ||
                                                                    address.municipality ||
                                                                    null;

                                                                const country =
                                                                    address.country ||
                                                                    null;

                                                                const name =
                                                                    city ||
                                                                    d.name ||
                                                                    d.display_name
                                                                        ?.split(",")[0] ||
                                                                    "Unknown Destination";

                                                                // =========================
                                                                // SAVE DESTINATION TO DATABASE
                                                                // =========================

                                                                const response =
                                                                    await apiClient.post<Destination>(
                                                                        "/api/destinations/from-search",
                                                                        {
                                                                            name,
                                                                            city,
                                                                            country,
                                                                            description:
                                                                                d.display_name ||
                                                                                null,
                                                                            imageUrl: null,
                                                                        }
                                                                    );

                                                                // Save database destination
                                                                setSelectedDest(
                                                                    response.data
                                                                );

                                                                setDestQuery("");

                                                                setDestResults([]);

                                                            } catch (error) {

                                                                console.error(
                                                                    "Failed to save destination:",
                                                                    error
                                                                );

                                                                setError(
                                                                    "Could not save this destination."
                                                                );

                                                            } finally {

                                                                setDestSearching(false);

                                                            }
                                                        }}

                                                        className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors duration-100"
                                                    >

                                                        <p className="text-sm font-semibold text-white">
                                                            {d.display_name}
                                                        </p>

                                                        <p className="text-xs text-white/60 mt-0.5">
                                                            {d.type}
                                                        </p>

                                                    </button>

                                                </li>

                                            ))}

                                        </ul>

                                    )}

                                    {/* NO RESULTS */}

                                    {destQuery.trim() &&
                                        !destSearching &&
                                        destResults.length === 0 && (

                                            <p className="text-xs text-white/40 mt-1.5">
                                                No destinations found.
                                            </p>

                                        )}

                                </div>

                            )}

                        </div>

                        {/* =========================
                DATES
            ========================= */}

                        <div className="grid grid-cols-2 gap-4">

                            <div>

                                <label className="glass-label">
                                    Start Date
                                </label>

                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) =>
                                        setStartDate(
                                            e.target.value
                                        )
                                    }
                                    className="glass-input"
                                />

                            </div>

                            <div>

                                <label className="glass-label">
                                    End Date
                                </label>

                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) =>
                                        setEndDate(
                                            e.target.value
                                        )
                                    }
                                    min={startDate}
                                    className="glass-input"
                                />

                            </div>

                        </div>

                        {/* =========================
                DESCRIPTION
            ========================= */}

                        <div>

                            <label className="glass-label">
                                Description
                            </label>

                            <textarea
                                value={description}
                                onChange={(e) =>
                                    setDescription(
                                        e.target.value
                                    )
                                }
                                rows={3}
                                placeholder="Describe your trip…"
                                className="glass-input resize-none"
                            />

                        </div>

                        {/* =========================
                BUDGET
            ========================= */}

                        <div>

                            <label className="glass-label">
                                Budget (₹)
                            </label>

                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={budget}
                                onChange={(e) =>
                                    setBudget(e.target.value)
                                }
                                placeholder="e.g. 25000"
                                className="glass-input"
                            />

                        </div>

                        {/* =========================
                STATUS
            ========================= */}

                        <div>

                            <label className="glass-label">
                                Status
                            </label>

                            <select
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value)
                                }
                                className="glass-input bg-[#0f172a]/60"
                            >

                                <option value="PLANNED">
                                    Planned
                                </option>

                                <option value="ONGOING">
                                    Ongoing
                                </option>

                                <option value="COMPLETED">
                                    Completed
                                </option>

                            </select>

                        </div>

                        {/* =========================
                BUTTONS
            ========================= */}

                        <div className="flex justify-end gap-3 pt-2 border-t border-white/10">

                            <button
                                type="button"
                                onClick={() =>
                                    router.push("/trips")
                                }
                                className="glass-btn-ghost px-5 py-2.5"
                            >
                                Cancel
                            </button>

                            <motion.button
                                whileTap={{
                                    scale: 0.98,
                                }}
                                type="submit"
                                disabled={loading}
                                className="glass-btn-primary px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
                            >

                                {loading
                                    ? "Creating…"
                                    : "Create Trip"}

                            </motion.button>

                        </div>

                    </form>

                </FadeIn>

            </main>

            <ToastContainer
                toasts={toasts}
                removeToast={removeToast}
            />

        </div>
    );
}

export default function CreateTripPage() {
    return (
        <ProtectedRoute>
            <CreateTripContent />
        </ProtectedRoute>
    );
}