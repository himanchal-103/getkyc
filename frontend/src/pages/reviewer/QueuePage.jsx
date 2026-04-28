import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { reviewerApi } from "../../api/client";
import { PageHeader, Spinner, StatusBadge, Empty } from "../../components/UI";

export default function ReviewerQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewerApi
      .queue()
      .then((d) => setQueue(d?.queue || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Submission Queue"
        subtitle="All submissions assigned to you"
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : queue.length === 0 ? (
        <Empty message="No submissions in queue." />
      ) : (
        <div className="flex flex-col gap-3">
          {queue.map((item) => (
            <div key={item.id} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">
                      Submission #{item.id}
                    </span>
                    <StatusBadge status={item.state} />
                    {item.at_risk && (
                      <span className="badge bg-red-100 text-red-600">
                        ⚠ At Risk (&gt;24h)
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    Merchant #{item.merchant} · Submitted{" "}
                    {new Date(item.submitted_at).toLocaleString()}
                  </div>
                </div>
                <Link
                  to={`/reviewer/submissions/${item.id}`}
                  className="btn-primary text-sm"
                >
                  Review →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
