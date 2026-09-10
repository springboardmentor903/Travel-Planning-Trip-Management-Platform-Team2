"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  const shouldReduce = useReducedMotion();
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);

  const colors = { success: "bg-green-500", error: "bg-red-500", info: "bg-orange-500" };
  const icons = { success: "✓", error: "✕", info: "ℹ" };

  return (
    <motion.div
      initial={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={shouldReduce ? { opacity: 0 } : { opacity: 0, y: 48, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl px-5 py-3.5 text-white text-sm font-semibold shadow-lg cursor-pointer ${colors[type]}`}
      onClick={onClose}
    >
      <span>{icons[type]}</span>
      {message}
    </motion.div>
  );
}

export interface ToastItem { id: string; message: string; type: "success" | "error" | "info"; }

export function ToastContainer({ toasts, removeToast }: { toasts: ToastItem[]; removeToast: (id: string) => void }) {
  return (
    <AnimatePresence>
      {toasts.map((t) => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
      ))}
    </AnimatePresence>
  );
}
