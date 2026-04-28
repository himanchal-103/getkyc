import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const merchantLinks = [
  { to: "/merchant", label: "Overview", icon: "◈" },
  { to: "/merchant/business", label: "Business Profile", icon: "⬡" },
  { to: "/merchant/documents", label: "Documents", icon: "◻" },
  { to: "/merchant/submission", label: "Submission", icon: "◈" },
  { to: "/merchant/notifications", label: "Notifications", icon: "◎" },
];

const reviewerLinks = [
  { to: "/reviewer", label: "Dashboard", icon: "◈" },
  { to: "/reviewer/queue", label: "Queue", icon: "⬡" },
  { to: "/reviewer/notifications", label: "Notifications", icon: "◎" },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links =
    // user?.role === "reviewer" || user?.role === "admin"
    user?.role === "reviewer"
      ? reviewerLinks
      : merchantLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const NavLinks = () => (
    <>
      {links.map((l) => {
        const active =
          l.to === "/merchant" || l.to === "/reviewer"
            ? location.pathname === l.to
            : location.pathname.startsWith(l.to);
        return (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
              active
                ? "bg-accent text-white font-semibold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span className="text-base">{l.icon}</span>
            {l.label}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r border-slate-200 bg-white px-4 py-6">
        <div className="mb-8">
          <span className="font-bold text-ink text-lg tracking-tight font-mono">
            GetKYC
          </span>
          <div className="mt-1 text-xs text-muted capitalize">
            {user?.role} · {user?.name}
          </div>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          <NavLinks />
        </nav>
        <button
          onClick={handleLogout}
          className="btn-ghost text-sm w-full justify-start mt-4"
        >
          ⎋ Logout
        </button>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-56 bg-white px-4 py-6 flex flex-col z-50">
            <div className="mb-8">
              <span className="font-bold text-ink text-lg tracking-tight font-mono">
                GetKYC
              </span>
              <div className="mt-1 text-xs text-muted capitalize">
                {user?.role} · {user?.name}
              </div>
            </div>
            <nav className="flex flex-col gap-1 flex-1">
              <NavLinks />
            </nav>
            <button
              onClick={handleLogout}
              className="btn-ghost text-sm w-full justify-start mt-4"
            >
              ⎋ Logout
            </button>
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <span className="font-bold font-mono">GetKYC</span>
          <button
            onClick={() => setMobileOpen(true)}
            className="text-ink p-1"
          >
            ☰
          </button>
        </div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">{children}</div>
      </main>
    </div>
  );
}
