"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTripById, updateTrip } from "@/lib/tripApi";

export default function EditTripPage() {
    const params = useParams();
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [destinationId, setDestinationId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [status, setStatus] = useState("PLANNED");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadTrip() {
            try {
                const id = Number(params.id);

                if (isNaN(id)) {
                    setError("Invalid trip ID.");
                    return;
                }

                const trip = await getTripById(id);

                setTitle(trip.title);
                setStartDate(trip.startDate || "");
                setEndDate(trip.endDate || "");
                setDescription(trip.description || "");
                setBudget(
                    trip.budget !== null ? String(trip.budget) : ""
                );
                setStatus(trip.status || "PLANNED");

            } catch (err) {
                console.error(err);
                setError("Unable to load trip.");
            } finally {
                setLoading(false);
            }
        }

        loadTrip();
    }, [params.id]);

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const id = Number(params.id);

            await updateTrip(id, {
                title: title.trim(),
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
                ...(description.trim()
                    ? { description: description.trim() }
                    : {}),
                ...(budget ? { budget: Number(budget) } : {}),
                status,
            });

            router.push(`/trips/${id}`);

        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to update trip."
            );
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-[#f0f2f5] px-6 py-10">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl p-10 text-center">
                    <p className="text-gray-500">
                        Loading trip...
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#f0f2f5] px-6 py-10">
            <div className="max-w-2xl mx-auto">

                <button
                    onClick={() =>
                        router.push(`/trips/${params.id}`)
                    }
                    className="mb-6 text-sm text-gray-600 hover:text-orange-500"
                >
                    ← Back to Trip
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Edit Trip
                    </h1>

                    <p className="mt-2 text-gray-500">
                        Update your trip details.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 bg-white rounded-2xl p-8 shadow-sm"
                >

                    {error && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Trip Title *
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) =>
                                setTitle(e.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Start and End */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) =>
                                    setStartDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
                            />
                        </div>

                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) =>
                                    setEndDate(e.target.value)
                                }
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows={4}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Budget
                        </label>

                        <input
                            type="number"
                            min="0"
                            value={budget}
                            onChange={(e) =>
                                setBudget(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) =>
                                setStatus(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:border-orange-500"
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

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={() =>
                                router.push(`/trips/${params.id}`)
                            }
                            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}