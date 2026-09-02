"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { NotificationResponse } from "@/lib/types";
import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/lib/notificationApi";

const TYPE_ICONS: Record<string, string> = {
    TRIP_INVITE: "✉️",
    JOIN_REQUEST: "🤝",
    JOIN_APPROVED: "🎉",
    JOIN_REJECTED: "❌",
    SYSTEM: "🔔",
};

export default function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000); // 30s poll
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    async function loadUnreadCount() {
        try {
            const count = await getUnreadNotificationCount();
            setUnreadCount(count);
        } catch {
            // Ignore if logged out
        }
    }

    async function handleToggleOpen() {
        if (!open) {
            setOpen(true);
            setLoading(true);
            try {
                const list = await getMyNotifications();
                setNotifications(list);
                setUnreadCount(list.filter((n) => !n.read).length);
            } catch {
                // Ignore
            } finally {
                setLoading(false);
            }
        } else {
            setOpen(false);
        }
    }

    async function handleMarkRead(id: number) {
        try {
            await markNotificationAsRead(id);
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch {
            // Ignore
        }
    }

    async function handleMarkAllRead() {
        try {
            await markAllNotificationsAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch {
            // Ignore
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                type="button"
                onClick={handleToggleOpen}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/[0.08] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.8}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>

                {/* Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-1 text-[10px] font-black text-white shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Popover */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl border border-white/20 bg-[#0f172a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[28rem]"
                    >
                        {/* Header */}
                        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-orange-500/15 via-transparent to-transparent">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className="text-[11px] font-medium text-orange-300 hover:text-orange-200 hover:underline transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 divide-y divide-white/5 no-scrollbar">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-400 border-t-transparent mx-auto mb-2" />
                                    <p className="text-xs text-white/50">Loading notifications…</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center space-y-1">
                                    <span className="text-2xl block mb-1">📭</span>
                                    <p className="text-xs font-semibold text-white">No notifications yet</p>
                                    <p className="text-[10px] text-white/40">You're all caught up!</p>
                                </div>
                            ) : (
                                notifications.map((n) => {
                                    const icon = TYPE_ICONS[n.type] || "🔔";
                                    const timeStr = new Date(n.createdAt).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    });

                                    return (
                                        <div
                                            key={n.id}
                                            className={`p-4 transition-colors flex items-start gap-3 text-left ${
                                                !n.read
                                                    ? "bg-white/[0.04] hover:bg-white/[0.07]"
                                                    : "opacity-70 hover:opacity-100 hover:bg-white/[0.02]"
                                            }`}
                                        >
                                            <div className="text-lg shrink-0 mt-0.5">{icon}</div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-1">
                                                    <p className="text-xs font-bold text-white truncate">
                                                        {n.title}
                                                    </p>
                                                    {!n.read && (
                                                        <span className="w-2 h-2 rounded-full bg-orange-400 shrink-0" />
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-white/70 mt-0.5 leading-relaxed">
                                                    {n.message}
                                                </p>

                                                <div className="mt-2 flex items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10px] text-white/40">
                                                    <span>{timeStr}</span>

                                                    <div className="flex items-center gap-2">
                                                        {n.relatedTripId && (
                                                            <Link
                                                                href={`/trips/${n.relatedTripId}`}
                                                                onClick={() => {
                                                                    if (!n.read) handleMarkRead(n.id);
                                                                    setOpen(false);
                                                                }}
                                                                className="text-orange-300 font-semibold hover:underline"
                                                            >
                                                                View Trip &rarr;
                                                            </Link>
                                                        )}

                                                        {!n.read && (
                                                            <button
                                                                onClick={() => handleMarkRead(n.id)}
                                                                className="hover:text-white transition-colors"
                                                            >
                                                                Mark read
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
