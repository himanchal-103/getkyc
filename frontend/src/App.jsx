import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import { Spinner } from "./components/UI";

// Pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MerchantOverview from "./pages/merchant/OverviewPage";
import BusinessPage from "./pages/merchant/BusinessPage";
import DocumentsPage from "./pages/merchant/DocumentsPage";
import SubmissionPage from "./pages/merchant/SubmissionPage";
import MerchantNotifications from "./pages/merchant/NotificationsPage";
import ReviewerDashboard from "./pages/reviewer/DashboardPage";
import ReviewerQueue from "./pages/reviewer/QueuePage";
import SubmissionDetail from "./pages/reviewer/SubmissionDetailPage";
import ReviewerNotifications from "./pages/reviewer/NotificationsPage";

// ── Auth guard ───────────────────────────────────────────────────────────────
function RequireAuth({ roles }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

// ── Redirect logged-in users away from auth pages ────────────────────────────
function PublicOnly() {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  if (user) {
    return (
      <Navigate
        to={
          user.role === "reviewer" || user.role === "admin"
            ? "/reviewer"
            : "/merchant"
        }
        replace
      />
    );
  }
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Merchant */}
          <Route element={<RequireAuth roles={["merchant"]} />}>
            <Route path="/merchant" element={<MerchantOverview />} />
            <Route path="/merchant/business" element={<BusinessPage />} />
            <Route path="/merchant/documents" element={<DocumentsPage />} />
            <Route path="/merchant/submission" element={<SubmissionPage />} />
            <Route
              path="/merchant/notifications"
              element={<MerchantNotifications />}
            />
          </Route>

          {/* Reviewer / Admin */}
          <Route element={<RequireAuth roles={["reviewer", "admin"]} />}>
            <Route path="/reviewer" element={<ReviewerDashboard />} />
            <Route path="/reviewer/queue" element={<ReviewerQueue />} />
            <Route
              path="/reviewer/submissions/:pk"
              element={<SubmissionDetail />}
            />
            <Route
              path="/reviewer/notifications"
              element={<ReviewerNotifications />}
            />
          </Route>

          {/* Default */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
