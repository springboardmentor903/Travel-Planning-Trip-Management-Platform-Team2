"use client";

import { useEffect, useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
    TripMemberResponse,
    TripJoinResponse,
    TripMemberRole,
} from "@/lib/types";
import {
    getTripMembers,
    addTripMember,
    removeTripMember,
    changeMemberRole,
    getTripJoinRequests,
    acceptJoinRequest,
    rejectJoinRequest,
} from "@/lib/tripMemberApi";

interface TripMembersSectionProps {
    tripId: number;
    ownerName?: string;
    onMemberCountChange?: (count: number) => void;
}

const ROLE_BADGES: Record<string, { label: string; icon: string; className: string }> = {
    OWNER: {
        label: "Trip Owner",
        icon: "👑",
        className: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]",
    },
    GROUP_ADMIN: {
        label: "Group Admin",
        icon: "🛡️",
        className: "bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-violet-400/40 text-violet-300 shadow-[0_0_12px_rgba(139,92,246,0.2)]",
    },
    MEMBER: {
        label: "Member",
        icon: "👤",
        className: "bg-gradient-to-r from-sky-500/20 to-teal-500/20 border-sky-400/30 text-sky-300",
    },
};

export default function TripMembersSection({
    tripId,
    ownerName,
    onMemberCountChange,
}: TripMembersSectionProps) {
    const { user: currentUser } = useAuth();

    const [members, setMembers] = useState<TripMemberResponse[]>([]);
    const [joinRequests, setJoinRequests] = useState<TripJoinResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Invite Form State
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"MEMBER" | "GROUP_ADMIN">("MEMBER");
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");
    const [inviteSuccess, setInviteSuccess] = useState("");

    // Remove Confirmation Modal
    const [memberToRemove, setMemberToRemove] = useState<TripMemberResponse | null>(null);
    const [removing, setRemoving] = useState(false);

    // Role Updating
    const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);

    // Join Request Action State
    const [processingRequestId, setProcessingRequestId] = useState<number | null>(null);

    // Active Tab for Admins (Members vs Join Requests)
    const [activeTab, setActiveTab] = useState<"members" | "requests">("members");

    // Fetch members and requests
    useEffect(() => {
        loadData();
    }, [tripId]);

    async function loadData() {
        try {
            setLoading(true);
            setError("");
            const memberList = await getTripMembers(tripId);
            setMembers(memberList);
            if (onMemberCountChange) onMemberCountChange(memberList.length);

            // Check if user is admin/owner to load join requests
            const isUserAdminOrOwner = checkIfAdminOrOwner(memberList, currentUser?.email);
            if (isUserAdminOrOwner) {
                try {
                    const reqs = await getTripJoinRequests(tripId);
                    setJoinRequests(reqs);
                } catch {
                    // Ignore join requests load error if not authorized
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to load trip members.");
        } finally {
            setLoading(false);
        }
    }

    function checkIfAdminOrOwner(list: TripMemberResponse[], email?: string): boolean {
        if (!email) return false;
        const currentMember = list.find(
            (m) => m.email.toLowerCase() === email.toLowerCase()
        );
        return currentMember?.role === "OWNER" || currentMember?.role === "GROUP_ADMIN";
    }

    const currentMember = members.find(
        (m) => m.email.toLowerCase() === currentUser?.email?.toLowerCase()
    );
    const isOwner = currentMember?.role === "OWNER" || currentMember?.isOwner === true;
    const isGroupAdmin = currentMember?.role === "GROUP_ADMIN";
    const canManageMembers = isOwner || isGroupAdmin;

    const pendingRequests = joinRequests.filter((r) => r.status === "PENDING");

    // Handle Invite Member
    async function handleInviteSubmit(e: FormEvent) {
        e.preventDefault();
        if (!inviteEmail.trim()) return;

        setInviting(true);
        setInviteError("");
        setInviteSuccess("");

        try {
            const newMember = await addTripMember(tripId, {
                email: inviteEmail.trim(),
                role: inviteRole,
            });
            setMembers((prev) => [...prev, newMember]);
            if (onMemberCountChange) onMemberCountChange(members.length + 1);
            setInviteSuccess(`Successfully added ${newMember.name || newMember.email} as ${newMember.role === "GROUP_ADMIN" ? "Group Admin" : "Member"}!`);
            setInviteEmail("");
        } catch (err: any) {
            const rawMsg = err?.response?.data?.message || err?.message || "Failed to invite user.";
            if (rawMsg.includes("User not found")) {
                setInviteError(`No account registered with "${inviteEmail}". Ask them to sign up on TripNest first.`);
            } else if (rawMsg.includes("already a member")) {
                setInviteError(`"${inviteEmail}" is already a member of this trip.`);
            } else if (rawMsg.includes("already the owner")) {
                setInviteError(`"${inviteEmail}" is the owner of this trip.`);
            } else {
                setInviteError(rawMsg);
            }
        } finally {
            setInviting(false);
        }
    }

    // Handle Role Change
    async function handleRoleChange(member: TripMemberResponse, newRole: "MEMBER" | "GROUP_ADMIN") {
        if (!member.id || member.role === newRole) return;
        setUpdatingRoleId(member.id);
        setError("");

        try {
            const updated = await changeMemberRole(tripId, member.id, newRole);
            setMembers((prev) =>
                prev.map((m) => (m.id === member.id ? { ...m, role: updated.role } : m))
            );
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to change role.");
        } finally {
            setUpdatingRoleId(null);
        }
    }

    // Handle Remove Member
    async function confirmRemoveMember() {
        if (!memberToRemove || !memberToRemove.id) return;
        setRemoving(true);
        setError("");

        try {
            await removeTripMember(tripId, memberToRemove.id);
            setMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
            if (onMemberCountChange) onMemberCountChange(members.length - 1);
            setMemberToRemove(null);
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || "Failed to remove member.");
        } finally {
            setRemoving(false);
        }
    }

    // Handle Join Request Response (Accept / Reject)
    async function handleRespondRequest(requestId: number, accept: boolean) {
        setProcessingRequestId(requestId);
        setError("");

        try {
            if (accept) {
                const res = await acceptJoinRequest(tripId, requestId);
                setJoinRequests((prev) =>
                    prev.map((r) => (r.id === requestId ? { ...r, status: "ACCEPTED" } : r))
                );
                // Reload member list
                const updatedMembers = await getTripMembers(tripId);
                setMembers(updatedMembers);
                if (onMemberCountChange) onMemberCountChange(updatedMembers.length);
            } else {
                await rejectJoinRequest(tripId, requestId);
                setJoinRequests((prev) =>
                    prev.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" } : r))
                );
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || err?.message || `Failed to ${accept ? "accept" : "reject"} request.`);
        } finally {
            setProcessingRequestId(null);
        }
    }

    return (
        <div className="glass-card p-7 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500/20 via-amber-500/20 to-teal-500/10 border border-white/15 flex items-center justify-center text-lg shadow-inner">
                        👥
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-white tracking-tight">
                                Group Members
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 border border-white/10">
                                {members.length} {members.length === 1 ? "member" : "members"}
                            </span>
                        </div>
                        <p className="text-xs text-white/50 mt-0.5">
                            Collaborate and plan this trip together in real time
                        </p>
                    </div>
                </div>

                {/* Tabs for Admins */}
                {canManageMembers && (
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/[0.04] border border-white/10">
                        <button
                            onClick={() => setActiveTab("members")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                                activeTab === "members"
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            Members ({members.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("requests")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 relative flex items-center gap-1.5 ${
                                activeTab === "requests"
                                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
                                    : "text-white/60 hover:text-white"
                            }`}
                        >
                            <span>Join Requests</span>
                            {pendingRequests.length > 0 && (
                                <span className="w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="glass-banner glass-banner--error">
                    <span>⚠️</span>
                    <span className="flex-1">{error}</span>
                    <button
                        onClick={() => setError("")}
                        className="text-white/40 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="py-12 text-center">
                    <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-orange-400 border-t-transparent mx-auto mb-3" />
                    <p className="text-xs text-white/50">Loading trip members…</p>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB: MEMBERS */}
            {/* ============================================================ */}
            {!loading && activeTab === "members" && (
                <div className="space-y-6">
                    {/* Invite Form (Group Admin / Owner Only) */}
                    {canManageMembers && (
                        <div className="rounded-2xl border border-white/15 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-5 sm:p-6 backdrop-blur-xl">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm">✉️</span>
                                <h3 className="text-sm font-semibold text-white">
                                    Invite Member by Email
                                </h3>
                            </div>
                            <p className="text-xs text-white/60 mb-4 leading-relaxed">
                                Enter the email address of a registered TripNest user to give them access to this trip.
                            </p>

                            <form onSubmit={handleInviteSubmit} className="space-y-3">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <input
                                            type="email"
                                            required
                                            placeholder="traveler@example.com"
                                            value={inviteEmail}
                                            onChange={(e) => {
                                                setInviteEmail(e.target.value);
                                                setInviteError("");
                                                setInviteSuccess("");
                                            }}
                                            className="glass-input text-sm"
                                        />
                                    </div>
                                    <div className="w-full sm:w-40">
                                        <select
                                            value={inviteRole}
                                            onChange={(e) => setInviteRole(e.target.value as any)}
                                            className="glass-input text-sm bg-[#0f172a]"
                                        >
                                            <option value="MEMBER">Member</option>
                                            <option value="GROUP_ADMIN">Group Admin</option>
                                        </select>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={inviting || !inviteEmail.trim()}
                                        className="glass-btn-primary px-6 py-2.5 text-sm shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {inviting ? "Inviting…" : "Add Member"}
                                    </button>
                                </div>

                                {inviteError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-banner glass-banner--error text-xs"
                                    >
                                        <span>⚠️</span>
                                        <span>{inviteError}</span>
                                    </motion.div>
                                )}

                                {inviteSuccess && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-banner glass-banner--success text-xs"
                                    >
                                        <span>✅</span>
                                        <span>{inviteSuccess}</span>
                                    </motion.div>
                                )}
                            </form>
                        </div>
                    )}

                    {/* Member List Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {members.map((member) => {
                            const badge = ROLE_BADGES[member.role] || ROLE_BADGES.MEMBER;
                            const isCaller = member.email.toLowerCase() === currentUser?.email?.toLowerCase();
                            const isMemberOwner = member.role === "OWNER" || member.isOwner;

                            return (
                                <motion.div
                                    key={member.userId}
                                    layout
                                    className="rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 p-4 transition-all duration-200 flex items-center justify-between gap-3 group"
                                >
                                    {/* Member Info */}
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-orange-500/20 to-teal-500/20 border border-white/15 flex items-center justify-center shrink-0 font-bold text-sm text-white">
                                            {member.profilePhotoUrl ? (
                                                <img
                                                    src={member.profilePhotoUrl}
                                                    alt={member.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span>{member.name ? member.name.charAt(0).toUpperCase() : "U"}</span>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-white truncate">
                                                    {member.name || "Unnamed Traveler"}
                                                </p>
                                                {isCaller && (
                                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-300 font-medium border border-orange-500/30">
                                                        You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-white/50 truncate">
                                                {member.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Role & Actions */}
                                    <div className="flex items-center gap-2 shrink-0">
                                        {/* If user has manage access and target is not owner and not themselves */}
                                        {canManageMembers && !isMemberOwner ? (
                                            <div className="flex items-center gap-1.5">
                                                {/* Role change dropdown */}
                                                <select
                                                    value={member.role}
                                                    disabled={
                                                        updatingRoleId === member.id ||
                                                        (!isOwner && member.role === "GROUP_ADMIN") // Group admins can't change other admins
                                                    }
                                                    onChange={(e) =>
                                                        handleRoleChange(member, e.target.value as any)
                                                    }
                                                    className={`text-xs rounded-xl px-2.5 py-1 font-semibold border transition-colors bg-[#0a0f1d]/80 cursor-pointer ${badge.className} ${
                                                        !isOwner && member.role === "GROUP_ADMIN" ? "opacity-75 cursor-not-allowed" : ""
                                                    }`}
                                                >
                                                    <option value="MEMBER">👤 Member</option>
                                                    <option value="GROUP_ADMIN">🛡️ Group Admin</option>
                                                </select>

                                                {/* Remove Member Button */}
                                                {(isOwner || (isGroupAdmin && member.role !== "GROUP_ADMIN")) && (
                                                    <button
                                                        onClick={() => setMemberToRemove(member)}
                                                        title="Remove Member"
                                                        className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            /* Static Badge */
                                            <span
                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border ${badge.className}`}
                                            >
                                                <span>{badge.icon}</span>
                                                <span>{badge.label}</span>
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ============================================================ */}
            {/* TAB: JOIN REQUESTS */}
            {/* ============================================================ */}
            {!loading && activeTab === "requests" && canManageMembers && (
                <div className="space-y-4">
                    <p className="text-xs text-white/60">
                        Review requests from travelers wanting to join this trip. Accepting them gives full collaborative access.
                    </p>

                    {joinRequests.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                            <span className="text-2xl block mb-2">📬</span>
                            <p className="text-xs text-white/50">No join requests received yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {joinRequests.map((req) => {
                                const isPending = req.status === "PENDING";
                                const isAccepted = req.status === "ACCEPTED";

                                return (
                                    <div
                                        key={req.id}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-tr from-sky-500/20 to-violet-500/20 border border-white/15 flex items-center justify-center shrink-0 font-bold text-sm text-white">
                                                {req.userProfilePhotoUrl ? (
                                                    <img
                                                        src={req.userProfilePhotoUrl}
                                                        alt={req.userName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <span>{req.userName ? req.userName.charAt(0).toUpperCase() : "U"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-white">
                                                        {req.userName || "Traveler"}
                                                    </p>
                                                    <span
                                                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                            isPending
                                                                ? "bg-amber-500/20 border-amber-400/30 text-amber-300"
                                                                : isAccepted
                                                                ? "bg-emerald-500/20 border-emerald-400/30 text-emerald-300"
                                                                : "bg-rose-500/20 border-rose-400/30 text-rose-300"
                                                        }`}
                                                    >
                                                        {req.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-white/50">{req.userEmail}</p>
                                                {req.message && (
                                                    <p className="text-xs text-white/70 italic mt-1.5 bg-white/[0.03] p-2 rounded-lg border border-white/5">
                                                        &ldquo;{req.message}&rdquo;
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-white/40 mt-1">
                                                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Action buttons if PENDING */}
                                        {isPending && (
                                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                                <button
                                                    onClick={() => handleRespondRequest(req.id, true)}
                                                    disabled={processingRequestId === req.id}
                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition-colors disabled:opacity-50"
                                                >
                                                    {processingRequestId === req.id ? "…" : "Accept"}
                                                </button>
                                                <button
                                                    onClick={() => handleRespondRequest(req.id, false)}
                                                    disabled={processingRequestId === req.id}
                                                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-400/40 transition-colors disabled:opacity-50"
                                                >
                                                    {processingRequestId === req.id ? "…" : "Decline"}
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

            {/* ============================================================ */}
            {/* REMOVE CONFIRMATION MODAL */}
            {/* ============================================================ */}
            <AnimatePresence>
                {memberToRemove && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-sm rounded-3xl border border-white/20 bg-[#0f172a]/95 backdrop-blur-2xl p-6 shadow-2xl space-y-4"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-xl text-rose-300 mx-auto">
                                ⚠️
                            </div>
                            <div className="text-center">
                                <h3 className="text-base font-bold text-white">
                                    Remove Member?
                                </h3>
                                <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                                    Are you sure you want to remove{" "}
                                    <strong className="text-white">
                                        {memberToRemove.name || memberToRemove.email}
                                    </strong>{" "}
                                    from this trip? They will lose access to itineraries, activities, and budget tracking.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setMemberToRemove(null)}
                                    disabled={removing}
                                    className="glass-btn-ghost flex-1 py-2.5 text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={confirmRemoveMember}
                                    disabled={removing}
                                    className="glass-btn-danger flex-1 py-2.5 text-xs font-semibold disabled:opacity-50"
                                >
                                    {removing ? "Removing…" : "Yes, Remove"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
