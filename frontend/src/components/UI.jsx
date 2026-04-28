import React from "react";

// ── Loading spinner ──────────────────────────────────────────────────────────
export function Spinner({ size = "md" }) {
  const sz = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <span
      className={`${sz} animate-spin rounded-full border-2 border-slate-200 border-t-accent inline-block`}
    />
  );
}

// ── Alert banner ─────────────────────────────────────────────────────────────
export function Alert({ type = "error", message }) {
  if (!message) return null;
  const styles = {
    error: "bg-red-50 text-danger border-red-200",
    success: "bg-green-50 text-success border-green-200",
    info: "bg-blue-50 text-accent border-blue-200",
    warn: "bg-amber-50 text-warn border-amber-200",
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {message}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    pending: "bg-slate-100 text-slate-600",
    submitted: "bg-blue-100 text-blue-700",
    under_review: "bg-amber-100 text-amber-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    more_info_requested: "bg-purple-100 text-purple-700",
    verified: "bg-green-100 text-green-700",
  };
  return (
    <span className={`badge ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status?.replace(/_/g, " ")}
    </span>
  );
}

// ── Page header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function Empty({ message = "Nothing here yet." }) {
  return (
    <div className="text-center py-16 text-muted text-sm">{message}</div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink transition text-lg leading-none"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
