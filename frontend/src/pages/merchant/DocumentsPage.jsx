// import React, { useEffect, useState, useCallback } from "react";
// import { documentApi } from "../../api/client";
// import { PageHeader, Alert, Spinner, StatusBadge } from "../../components/UI";

// const DOC_TYPES = ["pan", "aadhaar", "bank_statement"];
// const DOC_LABELS = {
//   pan: "PAN card",
//   aadhaar: "Aadhaar card",
//   bank_statement: "Bank statement",
// };

// export default function DocumentsPage() {
//   const [docs, setDocs] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [uploading, setUploading] = useState("");
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const load = useCallback(() => {
//     setLoading(true);
//     documentApi
//       .list()
//       .then((data) => setDocs(Array.isArray(data) ? data : []))
//       .catch(() => setError("Failed to load documents."))
//       .finally(() => setLoading(false));
//   }, []);

//   useEffect(load, [load]);

//   const handleUpload = async (docType, file) => {
//     if (!file) return;
//     setError("");
//     setSuccess("");
//     setUploading(docType);
//     try {
//       const fd = new FormData();
//       fd.append("doc_type", docType);
//       fd.append("file", file);
//       await documentApi.upload(fd);
//       setSuccess(`${DOC_LABELS[docType]} uploaded successfully.`);
//       load();
//     } catch (err) {
//       setError(err.message || "Upload failed. Please try again.");
//     } finally {
//       setUploading("");
//     }
//   };

//   const docMap = Object.fromEntries(docs.map((d) => [d.doc_type, d]));

//   return (
//     <div>
//       <PageHeader
//         title="KYC Documents"
//         subtitle="Upload your PAN, Aadhaar, and bank statement for verification."
//       />

//       {error && <Alert type="error" message={error} />}
//       {success && <Alert type="success" message={success} />}

//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Spinner />
//         </div>
//       ) : (
//         <div className="flex flex-col gap-3 mt-4">
//           {DOC_TYPES.map((type) => {
//             const doc = docMap[type];
//             const isUploading = uploading === type;

//             return (
//               <div key={type} className="card">
//                 <div className="flex items-center justify-between gap-4">

//                   <div className="flex flex-col gap-1">
//                     <span className="font-medium text-sm">
//                       {DOC_LABELS[type]}
//                     </span>
//                     {doc ? (
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <StatusBadge status={doc.status} />
//                         {doc.rejection_reason && (
//                           <span className="text-xs text-danger">
//                             {doc.rejection_reason}
//                           </span>
//                         )}
//                         <span className="text-xs text-muted">
//                           {doc.file?.split("/").pop()}
//                         </span>
//                       </div>
//                     ) : (
//                       <span className="text-xs text-muted">Not uploaded</span>
//                     )}
//                   </div>

//                   <div className="flex items-center gap-2 shrink-0">
//                     {doc?.file && (
//                       <a
//                         href={`${process.env.REACT_APP_API_URL || "http://localhost:8000"}${doc.file}`}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="btn-ghost text-xs"
//                       >
//                         View
//                       </a>
//                     )}
//                     <label className="btn-secondary text-xs cursor-pointer">
//                       {isUploading ? <Spinner size="sm" /> : doc ? "Replace" : "Upload"}
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept=".jpg,.jpeg,.png,.pdf"
//                         disabled={isUploading}
//                         onChange={(e) => handleUpload(type, e.target.files[0])}
//                       />
//                     </label>
//                   </div>

//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       <p className="text-xs text-muted mt-4">
//         Accepted: JPG, PNG, PDF · Max 5 MB · Uploading replaces the existing file.
//       </p>
//     </div>
//   );
// }











import React, { useEffect, useState } from "react";
import { documentApi } from "../../api/client";
import { PageHeader, Alert, Spinner, Empty, StatusBadge } from "../../components/UI";

const DOC_TYPES = ["pan", "aadhaar", "bank_statement"];

export default function DocumentsPage() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    documentApi
      .list()
      .then(setDocs)
      .then((res) => setDocs(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (docType, file) => {
    if (!file) return;
    setError("");
    setSuccess("");
    setUploading(docType);
    try {
      const fd = new FormData();
      fd.append("doc_type", docType);
      fd.append("file", file);
      await documentApi.upload(fd);
      setSuccess(`${docType.toUpperCase()} uploaded successfully.`);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading("");
    }
  };

  const docMap = {};
  docs.forEach((d) => (docMap[d.doc_type] = d));

  return (
    <div>
      <PageHeader
        title="KYC Documents"
        subtitle="Upload your PAN, Aadhaar, and bank statement"
      />
      <Alert type="error" message={error} />
      <Alert type="success" message={success} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : (
        <div className="flex flex-col gap-4 mt-4">
          {DOC_TYPES.map((type) => {
            const doc = docMap[type];
            const isUploading = uploading === type;
            return (
              <div key={type} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm capitalize">
                      {type.replace(/_/g, " ")}
                    </div>
                    {doc ? (
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={doc.status} />
                        {doc.rejection_reason && (
                          <span className="text-xs text-danger">
                            {doc.rejection_reason}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted mt-1 block">
                        Not uploaded
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {doc?.file && (
                      <a
                        href={`http://localhost:8000${doc.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-xs"
                      >
                        View
                      </a>
                    )}
                    <label className="btn-secondary text-xs cursor-pointer">
                      {isUploading ? (
                        <Spinner size="sm" />
                      ) : doc ? (
                        "Replace"
                      ) : (
                        "Upload"
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        disabled={isUploading}
                        onChange={(e) =>
                          handleUpload(type, e.target.files[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted mt-4">
        Accepted formats: JPG, PNG, PDF. Uploading again replaces the existing
        document.
      </p>
    </div>
  );
}