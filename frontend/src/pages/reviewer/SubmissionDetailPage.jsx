import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { reviewerApi } from "../../api/client";
import {
  PageHeader,
  Alert,
  Spinner,
  StatusBadge,
  Modal,
} from "../../components/UI";

const TRANSITIONS = [
  { label: "Start Review", state: "under_review", style: "btn-secondary" },
  { label: "Approve", state: "approved", style: "btn-primary" },
  { label: "Reject", state: "rejected", style: "btn-danger", needsReason: true },
  {
    label: "Request More Info",
    state: "more_info_requested",
    style: "btn-ghost border border-slate-300",
    needsReason: true,
  },
];

export default function SubmissionDetail() {
  const { pk } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Modal state
  const [modal, setModal] = useState({ open: false, transition: null });
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    reviewerApi
      .detail(pk)
      .then(setSubmission)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [pk]);

  const openTransition = (t) => {
    setReason("");
    setError("");
    setModal({ open: true, transition: t });
  };

  const doTransition = async () => {
    const t = modal.transition;
    if (t.needsReason && !reason.trim()) {
      setError("Please provide a reason.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = { new_state: t.state };
      if (reason.trim()) body.reason = reason.trim();
      await reviewerApi.transition(pk, body);
      setSuccess(`Submission moved to "${t.state}".`);
      setModal({ open: false, transition: null });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  if (!submission && error)
    return (
      <div className="py-16 text-center text-danger text-sm">{error}</div>
    );

  const { business_profile: bp, documents = [] } = submission || {};
  const currentState = submission?.state;

  // Which transitions are valid from current state?
  const validTransitions = {
    submitted: ["under_review", "more_info_requested"],
    under_review: ["approved", "rejected", "more_info_requested"],
  }[currentState] || [];

  const availableActions = TRANSITIONS.filter((t) =>
    validTransitions.includes(t.state)
  );

  return (
    <div>
      <div className="mb-2">
        <Link to="/reviewer/queue" className="text-sm text-muted hover:text-ink">
          ← Back to Queue
        </Link>
      </div>

      <PageHeader
        title={`Submission #${submission?.id}`}
        subtitle={`Merchant #${submission?.merchant}`}
        action={<StatusBadge status={currentState} />}
      />

      <Alert type="success" message={success} />
      <Alert type="error" message={error} />

      {/* Business Profile */}
      {bp && (
        <div className="card mb-4">
          <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-3">
            Business Profile
          </h2>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <Row label="Name" value={bp.business_name} />
            <Row
              label="Type"
              value={bp.business_type?.replace(/_/g, " ")}
            />
            <Row label="PAN" value={bp.pan_number} mono />
            <Row label="GSTIN" value={bp.gstin} mono />
            <Row label="Address" value={bp.business_address} full />
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="card mb-4">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-3">
          KYC Documents
        </h2>
        {documents.length === 0 ? (
          <p className="text-sm text-muted">No documents uploaded.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {documents.map((doc) => (
              <div key={doc.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">
                      {doc.doc_type.replace(/_/g, " ")}
                    </span>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.rejection_reason && (
                    <p className="text-xs text-danger mt-0.5">
                      {doc.rejection_reason}
                    </p>
                  )}
                </div>
                <a
                  href={`http://localhost:8000${doc.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs"
                >
                  View File
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {availableActions.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-3">
            Actions
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableActions.map((t) => (
              <button
                key={t.state}
                onClick={() => openTransition(t)}
                className={t.style}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transition modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false, transition: null })}
        title={modal.transition?.label}
      >
        <Alert type="error" message={error} />
        {modal.transition?.needsReason && (
          <div className="mt-3">
            <label className="label">Reason (required)</label>
            <textarea
              className="input h-24 resize-none"
              placeholder="Explain the reason..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <button
            onClick={doTransition}
            className={`${modal.transition?.style || "btn-primary"} flex-1`}
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : "Confirm"}
          </button>
          <button
            onClick={() => setModal({ open: false, transition: null })}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, mono, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <span className="text-xs text-muted">{label}: </span>
      <span className={mono ? "font-mono text-xs" : "text-sm"}>{value || "—"}</span>
    </div>
  );
}
