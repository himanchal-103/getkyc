import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";    // FIX: was missing
import { businessApi, submissionApi } from "../../api/client";
import {
  PageHeader,
  Alert,
  Spinner,
  StatusBadge,
} from "../../components/UI";

export default function SubmissionPage() {
  const { user } = useAuth();                           // FIX: user was used but never imported/destructured
  const [submission, setSubmission] = useState(null);
  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    Promise.allSettled([
      submissionApi.myDetail(),
      businessApi.list(),           // FIX: was businessApi.retrieve(user.id) — retrieve() fetches one item by PK, list() returns all merchant businesses
    ]).then(([s, b]) => {
      setSubmission(s.value || null);
      setBusinesses(Array.isArray(b.value) ? b.value : []);  // FIX: guard against non-array (e.g. error fallback)
      setLoading(false);
    });
  };

  useEffect(load, []);

  useEffect(() => {
    if (submission?.state === "draft") {
      const submitDraft = async () => {
        try {
          const data = await submissionApi.submit(submission.id);
          setSubmission(data.data || data);
          setSuccess("Submission moved to 'submitted' state successfully.");
        } catch (err) {
          setError(err.message);
        }
      };
      submitDraft();
    }
  }, [submission]);

  const createSubmission = async () => {
    if (!selectedBusiness) return setError("Please select a business profile.");
    setError("");
    setSaving(true);
    try {
      const data = await submissionApi.create({
        business_profile: parseInt(selectedBusiness, 10),
      });
      setSubmission(data);
      setSuccess("Submission created successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const resubmit = async () => {
    if (!submission) return;
    setError("");
    setSaving(true);
    try {
      const data = await submissionApi.submit(submission.id);
      setSubmission(data.data || data);
      setSuccess("Resubmitted successfully.");
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

  return (
    <div>
      <PageHeader
        title="KYC Submission"
        subtitle="Submit your business profile for review"
      />
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {!submission ? (
        <div className="card">
          <h2 className="font-semibold text-sm mb-4">
            Create a New Submission
          </h2>
          {businesses.length === 0 ? (
            <p className="text-sm text-muted">
              Please{" "}
              <a href="/merchant/business" className="text-accent underline">
                create a business profile
              </a>{" "}
              first.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              <div>
                <label className="label">Select Business Profile</label>
                <select
                  className="input"
                  value={selectedBusiness}
                  onChange={(e) => setSelectedBusiness(e.target.value)}
                >
                  <option value="">— Select —</option>
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.business_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={createSubmission}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : "Submit for Review"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm">Submission #{submission.id}</h2>
              <StatusBadge status={submission.state} />
            </div>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <InfoRow label="State" value={submission.state?.replace(/_/g, " ")} />
              <InfoRow label="Reviewer ID" value={submission.reviewer || "Pending assignment"} />
              <InfoRow
                label="Submitted At"
                value={new Date(submission.submitted_at).toLocaleString()}
              />
            </div>
            {submission.reason && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
                <span className="font-semibold">Reviewer note: </span>
                {submission.reason}
              </div>
            )}
          </div>

          {submission.state === "more_info_requested" && (
            <div className="card border-amber-300">
              <p className="text-sm text-amber-800 mb-3">
                The reviewer has requested more information. Please update your
                documents and resubmit.
              </p>
              <button
                onClick={resubmit}
                className="btn-primary"
                disabled={saving}
              >
                {saving ? <Spinner size="sm" /> : "Resubmit"}
              </button>
            </div>
          )}

          {submission.state === "approved" && (
            <div className="card border-green-300 bg-green-50">
              <p className="text-sm text-success font-medium">
                🎉 Your KYC has been approved! You're all set.
              </p>
            </div>
          )}

          {submission.state === "rejected" && (
            <div className="card border-red-300 bg-red-50">
              <p className="text-sm text-danger font-medium">
                Your KYC was rejected. Please review the reason above and contact support.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <span className="text-xs text-muted">{label}: </span>
      <span className="font-medium capitalize">{value || "—"}</span>
    </div>
  );
}
