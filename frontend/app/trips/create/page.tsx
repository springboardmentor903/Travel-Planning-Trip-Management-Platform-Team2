"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrip } from "@/lib/tripApi";

export default function CreateTripPage() {
    const router = useRouter();

    const [title, setTitle] = useState("");
    const [destinationId, setDestinationId] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState("");
    const [status, setStatus] = useState("PLANNED");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!title.trim()) {
            setError("Trip title is required.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await createTrip({
                title: title.trim(),
                ...(destinationId
                    ? { destinationId: Number(destinationId) }
                    : {}),
                ...(startDate ? { startDate } : {}),
                ...(endDate ? { endDate } : {}),
                ...(description.trim()
                    ? { description: description.trim() }
                    : {}),
                ...(budget ? { budget: Number(budget) } : {}),
                status,
            });

            // Trip created successfully
            router.push("/dashboard");
        } catch (err: any) {
            console.error(err);

            setError(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Failed to create trip."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-gray-50 px-6 py-10">
            <div className="mx-auto max-w-2xl">

                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Create New Trip
                    </h1>

                    <p className="mt-2 text-gray-600">
                        Plan your next trip by adding the details below.
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6 rounded-xl bg-white p-6 shadow"
                >

                    {/* Error */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Trip Title */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Trip Title *
                        </label>

                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Example: Vizag Weekend Trip"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                            required
                        />
                    </div>

                    {/* Destination ID */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Destination ID
                        </label>

                        <input
                            type="number"
                            value={destinationId}
                            onChange={(e) => setDestinationId(e.target.value)}
                            placeholder="Enter destination ID"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />

                        <p className="mt-1 text-xs text-gray-500">
                            We will replace this with a destination selector later.
                        </p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                Start Date
                            </label>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block font-medium text-gray-700">
                                End Date
                            </label>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                            />
                        </div>

                    </div>

                    {/* Description */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Description
                        </label>

                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your trip..."
                            rows={4}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Budget */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Budget
                        </label>

                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            placeholder="Example: 10000"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-2 block font-medium text-gray-700">
                            Status
                        </label>

                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                        >
                            <option value="PLANNED">Planned</option>
                            <option value="ONGOING">Ongoing</option>
                            <option value="COMPLETED">Completed</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">

                        <button
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="rounded-md border border-gray-300 px-5 py-2 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-md bg-blue-600 px-5 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Trip"}
                        </button>

                    </div>

                </form>
            </div>
        </main>
    );
}