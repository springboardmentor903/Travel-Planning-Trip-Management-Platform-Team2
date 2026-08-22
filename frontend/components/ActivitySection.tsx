"use client";

import { useEffect, useState } from "react";
import {
    Activity,
    ActivityRequest,
    getActivities,
    createActivity,
    updateActivity,
    deleteActivity,
} from "@/lib/activityApi";

interface ActivitySectionProps {
    itineraryId: number;
}

export default function ActivitySection({
                                            itineraryId,
                                        }: ActivitySectionProps) {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState<ActivityRequest>({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "",
    });

    async function loadActivities() {
        try {
            setLoading(true);
            setError("");

            const data = await getActivities(itineraryId);
            setActivities(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load activities.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadActivities();
    }, [itineraryId]);

    function resetForm() {
        setForm({
            title: "",
            description: "",
            startTime: "",
            endTime: "",
            location: "",
            type: "",
        });

        setEditingId(null);
        setShowForm(false);
    }

    function handleEdit(activity: Activity) {
        setEditingId(activity.id);

        setForm({
            title: activity.title,
            description: activity.description || "",
            startTime: activity.startTime || "",
            endTime: activity.endTime || "",
            location: activity.location || "",
            type: activity.type || "",
        });

        setShowForm(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!form.title.trim()) {
            alert("Activity title is required.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const data: ActivityRequest = {
                title: form.title,
                description: form.description || "",
                startTime: form.startTime || undefined,
                endTime: form.endTime || undefined,
                location: form.location || "",
                type: form.type || "",
            };

            if (editingId !== null) {
                const updated = await updateActivity(
                    itineraryId,
                    editingId,
                    data
                );

                setActivities((current) =>
                    current.map((activity) =>
                        activity.id === editingId
                            ? updated
                            : activity
                    )
                );
            } else {
                const created = await createActivity(
                    itineraryId,
                    data
                );

                setActivities((current) => [
                    ...current,
                    created,
                ]);
            }

            resetForm();
        } catch (err) {
            console.error(err);
            setError("Unable to save activity.");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(activityId: number) {
        const confirmed = window.confirm(
            "Are you sure you want to delete this activity?"
        );

        if (!confirmed) return;

        try {
            await deleteActivity(
                itineraryId,
                activityId
            );

            setActivities((current) =>
                current.filter(
                    (activity) => activity.id !== activityId
                )
            );
        } catch (err) {
            console.error(err);
            alert("Unable to delete activity.");
        }
    }

    return (
        <div className="mt-5 border-t border-gray-100 pt-5">

            <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                    Activities
                </h4>

                <button
                    onClick={() => {
                        setEditingId(null);
                        setForm({
                            title: "",
                            description: "",
                            startTime: "",
                            endTime: "",
                            location: "",
                            type: "",
                        });
                        setShowForm(true);
                    }}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
                >
                    + Add Activity
                </button>
            </div>

            {error && (
                <p className="text-red-500 text-sm mt-3">
                    {error}
                </p>
            )}

            {loading && (
                <p className="text-gray-500 text-sm mt-4">
                    Loading activities...
                </p>
            )}

            {!loading &&
                activities.length === 0 &&
                !showForm && (
                    <p className="text-gray-500 text-sm mt-4">
                        No activities planned for this day.
                    </p>
                )}

            {/* Activity Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="mt-4 bg-gray-50 rounded-xl p-5 space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title *
                        </label>

                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    title: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Beach visit"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>

                        <textarea
                            value={form.description}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    description: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Visit the beach..."
                            rows={3}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>

                            <input
                                type="time"
                                value={form.startTime}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        startTime: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>

                            <input
                                type="time"
                                value={form.endTime}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        endTime: e.target.value,
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            />
                        </div>

                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Location
                        </label>

                        <input
                            type="text"
                            value={form.location}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    location: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Baga Beach"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>

                        <input
                            type="text"
                            value={form.type}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    type: e.target.value,
                                })
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            placeholder="Sightseeing"
                        />
                    </div>

                    <div className="flex gap-3">

                        <button
                            type="submit"
                            disabled={saving}
                            className="rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingId !== null
                                    ? "Update Activity"
                                    : "Save Activity"}
                        </button>

                        <button
                            type="button"
                            onClick={resetForm}
                            className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700"
                        >
                            Cancel
                        </button>

                    </div>
                </form>
            )}

            {/* Activities List */}
            {!loading && activities.length > 0 && (
                <div className="mt-4 space-y-3">

                    {activities.map((activity) => (
                        <div
                            key={activity.id}
                            className="border border-gray-200 rounded-xl p-4"
                        >
                            <div className="flex items-start justify-between gap-4">

                                <div>
                                    <h5 className="font-semibold text-gray-900">
                                        {activity.title}
                                    </h5>

                                    {activity.type && (
                                        <p className="text-xs text-orange-500 mt-1">
                                            {activity.type}
                                        </p>
                                    )}

                                    {activity.description && (
                                        <p className="text-sm text-gray-600 mt-2">
                                            {activity.description}
                                        </p>
                                    )}

                                    {(activity.startTime ||
                                        activity.endTime) && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            {activity.startTime || "--:--"}
                                            {" - "}
                                            {activity.endTime || "--:--"}
                                        </p>
                                    )}

                                    {activity.location && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            📍 {activity.location}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 shrink-0">

                                    <button
                                        onClick={() =>
                                            handleEdit(activity)
                                        }
                                        className="rounded-lg border border-orange-500 px-3 py-1.5 text-xs font-semibold text-orange-500 hover:bg-orange-50"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(activity.id)
                                        }
                                        className="rounded-lg border border-red-500 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}