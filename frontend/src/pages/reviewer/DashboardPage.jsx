import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewerApi } from "../../api/client";
import { PageHeader, Spinner, StatusBadge, Empty } from "../../components/UI";
import { useAuth } from "../../context/AuthContext";

export default function ReviewerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewerApi
      .queue()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.id]);

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const metrics = data?.metrics || {};
  const queue = data?.queue || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">
          Reviewer Dashboard
        </h1>
        <p className="text-muted text-sm mt-0.5">
          Hello, {user?.name} — here's your current workload.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="In Queue"
          value={metrics.queue_count ?? "—"}
        />
        <MetricCard
          label="Avg Hours in Queue"
          value={
            metrics.avg_hours_in_queue != null
              ? Number(metrics.avg_hours_in_queue).toFixed(1)
              : "—"
          }
        />
        <MetricCard
          label="Approval Rate (7d)"
          value={metrics.approval_rate_7d ?? "—"}
        />
      </div>

      {/* Queue */}
      <div className="card">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-4">
          Pending Submissions
        </h2>
        {queue.length === 0 ? (
          <Empty message="Queue is empty — nice work!" />
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {queue.map((item) => (
              <QueueRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <div className="card text-center">
      <div className="text-2xl font-bold font-mono text-ink">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </div>
  );
}

function QueueRow({ item }) {
  return (
    <div className="py-3 flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Submission #{item.id}
          </span>
          <StatusBadge status={item.state} />
          {item.at_risk && (
            <span className="badge bg-red-100 text-red-600">⚠ At Risk</span>
          )}
        </div>
        <div className="text-xs text-muted mt-0.5">
          Merchant #{item.merchant} ·{" "}
          {new Date(item.submitted_at).toLocaleString()}
        </div>
      </div>
      <Link
        to={`/reviewer/submissions/${item.id}`}
        className="btn-primary text-sm"
      >
        Review
      </Link>
    </div>
  );
}
