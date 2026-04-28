import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { businessApi, documentApi, submissionApi } from "../../api/client";
import { StatusBadge, Spinner } from "../../components/UI";

export default function MerchantOverview() {
  const { user } = useAuth();
  const [data, setData] = useState({ businesses: [], docs: [], submission: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      businessApi.list(),          // FIX: was businessApi.list() with comment "Pass merchant ID" — list() needs no args
      documentApi.list(),
      submissionApi.myDetail(),
    ]).then(([b, d, s]) => {
      setData({
        businesses: Array.isArray(b.value) ? b.value : [],   // FIX: plain array, not object
        docs:       Array.isArray(d.value) ? d.value : [],   // FIX: was d.value?.results — API returns plain array, not paginated
        submission: s.value || null,
      });
      setLoading(false);
    });
  }, []);  // FIX: removed user.id dependency — list() takes no args, avoids unnecessary re-fetch

  if (loading)
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );

  const docsVerified = data.docs.filter((d) => d.status === "verified").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink">
          Welcome back, {user?.name}
        </h1>
        <p className="text-muted text-sm mt-0.5">
          Here's a summary of your KYC status.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Business Profiles"
          value={data.businesses.length}
          href="/merchant/business"
        />
        <StatCard
          label="Documents Uploaded"
          value={data.docs.length}
          href="/merchant/documents"
        />
        <StatCard
          label="Docs Verified"
          value={docsVerified}
          href="/merchant/documents"
        />
      </div>

      {/* Submission status */}
      <div className="card">
        <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-4">
          Submission Status
        </h2>
        {data.submission ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">
                  Submission #{data.submission.id}
                </span>
                <StatusBadge status={data.submission.state} />
              </div>
              {data.submission.reason && (
                <p className="text-sm text-muted mt-1">
                  Reason: {data.submission.reason}
                </p>
              )}
            </div>
            <Link to="/merchant/submission" className="btn-ghost text-sm">
              View →
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">No submission yet.</p>
            <Link to="/merchant/submission" className="btn-primary text-sm">
              Start KYC →
            </Link>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickLink
          to="/merchant/business"
          title="Business Profile"
          desc="Add or manage your business details"
        />
        <QuickLink
          to="/merchant/documents"
          title="KYC Documents"
          desc="Upload PAN, Aadhaar, bank statement"
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }) {
  return (
    <Link to={href} className="card hover:border-accent transition-colors">
      <div className="text-2xl font-bold font-mono text-ink">{value}</div>
      <div className="text-xs text-muted mt-1">{label}</div>
    </Link>
  );
}

function QuickLink({ to, title, desc }) {
  return (
    <Link
      to={to}
      className="card hover:border-accent transition-colors flex items-start justify-between"
    >
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-muted mt-0.5">{desc}</div>
      </div>
      <span className="text-muted text-sm">→</span>
    </Link>
  );
}






// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { businessApi, documentApi, submissionApi } from "../../api/client";
// import { StatusBadge, Spinner } from "../../components/UI";

// export default function MerchantOverview() {
//   const { user } = useAuth();
//   const [data, setData] = useState({ businesses: [], docs: [], submission: null });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.allSettled([
//       businessApi.list(), // Pass merchant ID
//       documentApi.list(),
//       submissionApi.myDetail(),
//     ]).then(([b, d, s]) => {
//       setData({
//         businesses: b.value || [],
//         docs: d.value?.results || [],
//         submission: s.value || null,
//       });
//       setLoading(false);
//     });
//   }, [user.id]);

//   if (loading)
//     return (
//       <div className="flex justify-center py-16">
//         <Spinner />
//       </div>
//     );

//   const docsVerified = data.docs.filter((d) => d.status === "verified").length;

//   return (
//     <div>
//       <div className="mb-6">
//         <h1 className="text-xl font-bold text-ink">
//           Welcome back, {user?.name}
//         </h1>
//         <p className="text-muted text-sm mt-0.5">
//           Here's a summary of your KYC status.
//         </p>
//       </div>

//       {/* Stats */}
//       <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
//         <StatCard
//           label="Business Profiles"
//           value={data.businesses.length}
//           href="/merchant/business"
//         />
//         <StatCard
//           label="Documents Uploaded"
//           value={data.docs.length}
//           href="/merchant/documents"
//         />
//         <StatCard
//           label="Docs Verified"
//           value={docsVerified}
//           href="/merchant/documents"
//         />
//       </div>

//       {/* Submission status */}
//       <div className="card">
//         <h2 className="font-semibold text-sm text-muted uppercase tracking-wide mb-4">
//           Submission Status
//         </h2>
//         {data.submission ? (
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="flex items-center gap-3">
//                 <span className="text-sm font-medium">
//                   Submission #{data.submission.id}
//                 </span>
//                 <StatusBadge status={data.submission.state} />
//               </div>
//               {data.submission.reason && (
//                 <p className="text-sm text-muted mt-1">
//                   Reason: {data.submission.reason}
//                 </p>
//               )}
//             </div>
//             <Link to="/merchant/submission" className="btn-ghost text-sm">
//               View →
//             </Link>
//           </div>
//         ) : (
//           <div className="flex items-center justify-between">
//             <p className="text-sm text-muted">No submission yet.</p>
//             <Link to="/merchant/submission" className="btn-primary text-sm">
//               Start KYC →
//             </Link>
//           </div>
//         )}
//       </div>

//       {/* Quick links */}
//       <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
//         <QuickLink
//           to="/merchant/business"
//           title="Business Profile"
//           desc="Add or manage your business details"
//         />
//         <QuickLink
//           to="/merchant/documents"
//           title="KYC Documents"
//           desc="Upload PAN, Aadhaar, bank statement"
//         />
//       </div>
//     </div>
//   );
// }

// function StatCard({ label, value, href }) {
//   return (
//     <Link to={href} className="card hover:border-accent transition-colors">
//       <div className="text-2xl font-bold font-mono text-ink">{value}</div>
//       <div className="text-xs text-muted mt-1">{label}</div>
//     </Link>
//   );
// }

// function QuickLink({ to, title, desc }) {
//   return (
//     <Link
//       to={to}
//       className="card hover:border-accent transition-colors flex items-start justify-between"
//     >
//       <div>
//         <div className="font-semibold text-sm">{title}</div>
//         <div className="text-xs text-muted mt-0.5">{desc}</div>
//       </div>
//       <span className="text-muted text-sm">→</span>
//     </Link>
//   );
// }
