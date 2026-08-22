"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTripById, Trip } from "@/lib/tripApi";
import {
    getItineraries,
    createItinerary,
    Itinerary,
} from "@/lib/itineraryApi";
import ActivitySection from "@/components/ActivitySection";
export default function TripDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [itineraries, setItineraries] = useState<Itinerary[]>([]);
    const [addingDay, setAddingDay] = useState(false);
    const [itineraryError, setItineraryError] = useState("");

    useEffect(() => {
        async function loadTrip() {
            try {
                setLoading(true);
                setError("");

                const id = Number(params.id);

                if (isNaN(id)) {
                    setError("Invalid trip ID.");
                    return;
                }

                const data = await getTripById(id);
                setTrip(data);
                const itineraryData = await getItineraries(id);
                setItineraries(itineraryData);
            } catch (err) {
                console.error(err);
                setError("Unable to load trip details.");
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [params.id]);

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f0f2f5] px-6 py-10">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 text-center">
                    <p className="text-gray-500">
                        Loading trip details...
                    </p>
                </div>
            </main>
        );
    }
    async function handleAddDay() {
        if (!trip) return;

        try {
            setAddingDay(true);
            setItineraryError("");

            // Use the trip start date as Day 1
            const startDate = new Date(trip.startDate);

            // Add one day for every existing itinerary day
            startDate.setDate(
                startDate.getDate() + itineraries.length
            );

            const dayDate = startDate.toISOString().split("T")[0];

            const newDay = await createItinerary(
                trip.id,
                dayDate
            );

            setItineraries((current) => [...current, newDay]);
        } catch (err) {
            console.error(err);
            setItineraryError("Unable to add itinerary day.");
        } finally {
            setAddingDay(false);
        }
    }

    if (error || !trip) {
        return (
            <main className="min-h-screen bg-[#f0f2f5] px-6 py-10">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl p-10 text-center">
                    <p className="text-red-500 mb-5">
                        {error || "Trip not found."}
                    </p>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Back to My Trips
                    </button>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f0f2f5]">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-xl font-bold text-gray-900"
                    >
                        TripNest
                        <span className="text-orange-500">.</span>
                    </button>

                    <button
                        onClick={() => router.push("/dashboard")}
                        className="text-sm text-gray-600 hover:text-orange-500"
                    >
                        ← Back to My Trips
                    </button>
                    <button
                        onClick={() => router.push(`/trips/${trip.id}/edit`)}
                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
                    >
                        Edit Trip
                    </button>

                </div>
            </nav>

            {/* Main content */}
            <div className="max-w-4xl mx-auto px-6 py-10">

                {/* Heading */}
                <div className="mb-8">

                    <div className="flex items-center justify-between">

                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wider text-orange-500">
                                {trip.status}
                            </p>

                            <h1 className="text-4xl font-bold text-gray-900 mt-2">
                                {trip.title}
                            </h1>
                        </div>

                        <span className="text-sm text-gray-400">
                            Trip #{trip.id}
                        </span>

                    </div>

                </div>

                {/* Trip information */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Trip Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Destination */}
                        <div>
                            <p className="text-sm text-gray-400">
                                Destination
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.destinationName || "Not specified"}
                            </p>
                        </div>

                        {/* Owner */}
                        <div>
                            <p className="text-sm text-gray-400">
                                Created by
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.ownerName}
                            </p>
                        </div>

                        {/* Start date */}
                        <div>
                            <p className="text-sm text-gray-400">
                                Start Date
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.startDate || "Not specified"}
                            </p>
                        </div>

                        {/* End date */}
                        <div>
                            <p className="text-sm text-gray-400">
                                End Date
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.endDate || "Not specified"}
                            </p>
                        </div>

                        {/* Budget */}
                        <div>
                            <p className="text-sm text-gray-400">
                                Budget
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.budget !== null
                                    ? `₹${trip.budget}`
                                    : "Not specified"}
                            </p>
                        </div>

                        {/* Created date */}
                        <div>
                            <p className="text-sm text-gray-400">
                                Created At
                            </p>

                            <p className="mt-1 font-medium text-gray-900">
                                {trip.createdAt}
                            </p>
                        </div>

                    </div>

                    {/* Description */}
                    {trip.description && (
                        <div className="mt-8 pt-6 border-t border-gray-100">

                            <p className="text-sm text-gray-400">
                                Description
                            </p>

                            <p className="mt-2 text-gray-700 leading-relaxed">
                                {trip.description}
                            </p>

                        </div>
                    )}

                </div>

                {/* Itinerary placeholder */}
                {/* Itinerary */}
                <div className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

                    <div className="flex items-center justify-between">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Itinerary
                            </h2>

                            <p className="text-gray-500 mt-1">
                                Plan your trip day by day.
                            </p>
                        </div>

                        <button
                            onClick={handleAddDay}
                            disabled={addingDay}
                            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {addingDay ? "Adding..." : "+ Add Day"}
                        </button>

                    </div>

                    {itineraryError && (
                        <p className="text-red-500 text-sm mt-4">
                            {itineraryError}
                        </p>
                    )}

                    {itineraries.length === 0 && !itineraryError && (
                        <div className="mt-6 rounded-xl bg-gray-50 p-6 text-center">
                            <p className="text-gray-500">
                                No itinerary days yet.
                            </p>
                        </div>
                    )}

                    {itineraries.length > 0 && (
                        <div className="mt-6 space-y-4">

                            {itineraries.map((day) => (
                                <div
                                    key={day.id}
                                    className="border border-gray-200 rounded-xl p-5"
                                >
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Day {itineraries.indexOf(day) + 1}
                                    </h3>

                                    <p className="text-sm text-gray-500 mt-1">
                                        {day.dayDate}
                                    </p>

                                    <ActivitySection itineraryId={day.id} />
                                </div>
                            ))}

                        </div>
                    )}

                </div>

            </div>

        </main>
    );
}