"use client";

import { useEffect, useState } from "react";
import {
    listTripMembers,
    addTripMember,
    removeTripMember,
    updateTripMemberRole
} from "@/lib/tripMemberApi";
import {
    listTripJoinRequests,
    acceptTripJoinRequest,
    rejectTripJoinRequest
} from "@/lib/tripJoinApi";
import { TripMemberResponse, TripJoinResponse, TripMemberRole } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";

interface Props {
    tripId: number;
    ownerName?: string;
}

export default function TripMembersSection({ tripId }: Props) {
    const { user } = useAuth();
    const [members, setMembers] = useState<TripMemberResponse[]>([]);
    const [joinRequests, setJoinRequests] = useState<TripJoinResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"members" | "requests">("members");

    // Add Member form state
    const [newEmail, setNewEmail] = useState("");
    const [newRole, setNewRole] = useState<TripMemberRole>("MEMBER");
    const [adding, setAdding] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    // Action loading states
    const [actionId, setActionId] = useState<number | null>(null);

    const currentUserMember = members.find((m) => m.email.toLowerCase() === user?.email.toLowerCase());
    const isOwnerOrAdmin = currentUserMember?.isOwner || currentUserMember?.role === "GROUP_ADMIN" || currentUserMember?.role === "OWNER";

    useEffect(() => {
        loadData();
    }, [tripId]);

    async function loadData() {
        try {
            setLoading(true);
            setErrorMsg("");
            const memberList = await listTripMembers(tripId);
            setMembers(memberList);

            // Attempt to load join requests if possible
            try {
                const requests = await listTripJoinRequests(tripId);
                setJoinRequests(requests);
            } catch {
                // Not authorized to view join requests if regular member
                setJoinRequests([]);
            }
        } catch (err: unknown) {
            setErrorMsg(err instanceof Error ? err.message : "Failed to load members.");
        } finally {
            setLoading(false);
        }
    }

    async function handleAddMember(e: React.FormEvent) {
        e.preventDefault();
        if (!newEmail.trim()) return;

        try {
            setAdding(true);
            setErrorMsg("");
            setSuccessMsg("");
            const added = await addTripMember(tripId, {
                email: newEmail.trim(),
                role: newRole,
            });
            setMembers((prev) => [...prev, added]);
            setNewEmail("");
            setSuccessMsg(`Added ${added.name || added.email} as ${added.role}!`);
            setTimeout(() => setSuccessMsg(""), 4000);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to add member.");
            setErrorMsg(msg);
        } finally {
            setAdding(false);
        }
    }

    async function handleRoleChange(memberId: number, targetRole: TripMemberRole) {
        try {
            setActionId(memberId);
            setErrorMsg("");
            const updated = await updateTripMemberRole(tripId, memberId, { role: targetRole });
            setMembers((prev) => prev.map((m) => (m.id === memberId ? updated : m)));
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to change role.");
            setErrorMsg(msg);
        } finally {
            setActionId(null);
        }
    }

    async function handleRemove(memberId: number) {
        if (!confirm("Are you sure you want to remove this member from the trip?")) return;
        try {
            setActionId(memberId);
            setErrorMsg("");
            await removeTripMember(tripId, memberId);
            setMembers((prev) => prev.filter((m) => m.id !== memberId));
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to remove member.");
            setErrorMsg(msg);
        } finally {
            setActionId(null);
        }
    }

    async function handleAcceptRequest(requestId: number) {
        try {
            setActionId(requestId);
            setErrorMsg("");
            const updated = await acceptTripJoinRequest(tripId, requestId);
            setJoinRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
            // Reload members to reflect newly added member
            const updatedMembers = await listTripMembers(tripId);
            setMembers(updatedMembers);
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to accept request.");
            setErrorMsg(msg);
        } finally {
            setActionId(null);
        }
    }

    async function handleRejectRequest(requestId: number) {
        try {
            setActionId(requestId);
            setErrorMsg("");
            const updated = await rejectTripJoinRequest(tripId, requestId);
            setJoinRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (err instanceof Error ? err.message : "Failed to reject request.");
            setErrorMsg(msg);
        } finally {
            setActionId(null);
        }
    }

    const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");

    return (
        <div className="glass-card p-7 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="glass-icon-chip">
                    <span className="text-sm">👥</span>
                    <div>
                        <span className="block text-sm font-semibold text-white/90">Trip Members & Collaboration</span>
                        <p className="text-xs text-white/50 mt-0.5">
                            {members.length} participant{members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {isOwnerOrAdmin && (
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                                activeTab === "members" ? "bg-orange-500 text-white shadow" : "text-white/60 hover:text-white"
                            }`}
                        >
                            Members ({members.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition relative ${
                                activeTab === "requests" ? "bg-orange-500 text-white shadow" : "text-white/60 hover:text-white"
                            }`}
                        >
                            Join Requests
                            {pendingRequests.length > 0 && (
                                <span className="ml-1.5 bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {errorMsg && (
                <div className="glass-banner glass-banner--error mb-5 text-sm">
                    <span>⚠️</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            {successMsg && (
                <div className="glass-banner glass-banner--success mb-5 text-sm bg-emerald-500/20 border-emerald-500/30 text-emerald-200">
                    <span>✅</span>
                    <span>{successMsg}</span>
                </div>
            )}

            {activeTab === "members" && (
                <div className="space-y-6">
                    {/* Add Member Form (Admin/Owner only) */}
                    {isOwnerOrAdmin && (
                        <form onSubmit={handleAddMember} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Add Member by Email</h3>
                            <div className="flex flex-col sm:flex-row gap-2.5">
                                <input
                                    type="email"
                                    required
                                    placeholder="traveler@example.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    className="glass-input flex-1 sm:min-w-72 px-3.5 py-2 text-sm bg-black/20 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-orange-400"
                                />
                                <select
                                    value={newRole}
                                    onChange={(e) => setNewRole(e.target.value as TripMemberRole)}
                                    className="glass-input sm:w-36 shrink-0 px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-orange-400"
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="GROUP_ADMIN">Group Admin</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={adding}
                                    className="glass-btn-primary px-5 py-2 text-sm font-semibold disabled:opacity-50"
                                >
                                    {adding ? "Adding..." : "+ Add"}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Members List */}
                    {loading ? (
                        <div className="py-8 text-center text-white/50 text-sm">Loading participants...</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {members.map((m) => {
                                const isSelf = m.email.toLowerCase() === user?.email.toLowerCase();
                                const isGroupAdmin = m.role === "GROUP_ADMIN";
                                const isMember = m.role === "MEMBER";

                                return (
                                    <div
                                        key={m.id || m.userId}
                                        className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex items-center justify-between gap-3 hover:border-white/20 transition"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0 overflow-hidden">
                                                {m.profilePhotoUrl ? (
                                                    <img src={m.profilePhotoUrl} alt={m.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    (m.name || m.email)[0].toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white truncate">
                                                        {m.name || "Member"} {isSelf && <span className="text-xs text-white/40">(You)</span>}
                                                    </p>
                                                    <span
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                            m.isOwner || m.role === "OWNER"
                                                                ? "bg-purple-500/20 border border-purple-500/40 text-purple-300"
                                                                : m.role === "GROUP_ADMIN"
                                                                ? "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                                                                : "bg-cyan-500/20 border border-cyan-500/40 text-cyan-300"
                                                        }`}
                                                    >
                                                        {m.isOwner || m.role === "OWNER" ? "Owner" : m.role === "GROUP_ADMIN" ? "Admin" : "Member"}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50 truncate mt-0.5">{m.email}</p>
                                            </div>
                                        </div>

                                        {/* Actions for Group Admin / Owner */}
                                        {isOwnerOrAdmin && !m.isOwner && m.id && (
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {isMember && (
                                                    <button
                                                        onClick={() => handleRoleChange(m.id!, "GROUP_ADMIN")}
                                                        disabled={actionId === m.id}
                                                        className="text-[11px] text-amber-400 hover:text-amber-300 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition"
                                                        title="Promote to Group Admin"
                                                    >
                                                        Promote
                                                    </button>
                                                )}
                                                {isGroupAdmin && (
                                                    <button
                                                        onClick={() => handleRoleChange(m.id!, "MEMBER")}
                                                        disabled={actionId === m.id}
                                                        className="text-[11px] text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
                                                        title="Demote to Member"
                                                    >
                                                        Demote
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleRemove(m.id!)}
                                                    disabled={actionId === m.id}
                                                    className="text-xs text-rose-400 hover:text-rose-300 p-1.5 rounded hover:bg-rose-500/10 transition"
                                                    title="Remove Member"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {activeTab === "requests" && (
                <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400">Pending & Past Requests</h3>
                    {joinRequests.length === 0 ? (
                        <div className="p-8 text-center border border-dashed border-white/10 rounded-xl text-white/40 text-sm">
                            No join requests for this trip yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {joinRequests.map((req) => (
                                <div
                                    key={req.id}
                                    className="p-4 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-white/10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {(req.userName || req.userEmail)[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white">{req.userName || "Traveler"}</p>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                        req.status === "PENDING"
                                                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                                            : req.status === "ACCEPTED"
                                                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                                    }`}
                                                >
                                                    {req.status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-white/50">{req.userEmail}</p>
                                            {req.message && (
                                                <p className="text-xs text-white/70 italic mt-1 bg-white/5 px-2 py-1 rounded">
                                                    &ldquo;{req.message}&rdquo;
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {req.status === "PENDING" && (
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={() => handleAcceptRequest(req.id)}
                                                disabled={actionId === req.id}
                                                className="glass-btn-primary px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => handleRejectRequest(req.id)}
                                                disabled={actionId === req.id}
                                                className="glass-btn-danger px-3.5 py-1.5 text-xs font-semibold"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
