import React, { useEffect, useState } from "react";
import { businessApi } from "../../api/client";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader,
  Alert,
  Spinner,
  Empty,
  Modal,
  StatusBadge,
} from "../../components/UI";

const EMPTY_FORM = {
  business_name: "",
  business_type: "private_limited",
  monthly_volume: "",
};

export default function BusinessPage() {
  const { user } = useAuth();                      // FIX: was missing, caused ReferenceError
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = () => {
    setLoading(true);
    businessApi
      .list()                                      // FIX: was retrieve(user.id) — wrong endpoint, retrieve fetches a single item by PK
      .then((data) => setBusinesses(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handle = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await businessApi.create(form);
      setSuccess("Business profile created.");
      setShowModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const destroy = async (pk) => {
    if (!window.confirm("Delete this business profile?")) return;
    await businessApi.destroy(pk).catch(() => {});
    load();
  };

  return (
    <div>
      <PageHeader
        title="Business Profiles"
        subtitle="Manage your registered businesses"
        action={
          <button
            onClick={() => {
              setShowModal(true);
              setError("");
            }}
            className="btn-primary"
          >
            + Add Business
          </button>
        }
      />

      <Alert type="success" message={success} />

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : businesses.length === 0 ? (
        <Empty message="No business profiles yet. Add one to get started." />
      ) : (
        <div className="flex flex-col gap-4">
          {businesses.map((b) => (
            <div key={b.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{b.business_name}</div>
                  <div className="text-sm text-muted capitalize mt-0.5">
                    {b.business_type?.replace(/_/g, " ")}
                  </div>
                </div>
                <button
                  onClick={() => destroy(b.id)}
                  className="btn-ghost text-danger text-xs"
                >
                  Delete
                </button>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <InfoRow label="BUSINESS-TYPE" value={b.business_type} />
                <InfoRow label="MONTHLY-VOLUME" value={b.monthly_volume} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Business Profile"
      >
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Alert type="error" message={error} />
          <Field
            label="Business Name"
            name="business_name"
            value={form.business_name}
            onChange={handle}
            required
          />
          <div>
            <label className="label">Business Type</label>
            <select
              name="business_type"
              className="input"
              value={form.business_type}
              onChange={handle}
            >
              <option value="private_limited">Individual</option>
              <option value="partnership">Partnership</option>
              <option value="llp">LLP</option>
              <option value="private_limited">Private Limited</option>
              <option value="public_limited">Public Limited</option>
              <option value="sole_proprietorship">NGO</option>
              <option value="sole_proprietorship">Other</option>
            </select>
          </div>
          <Field
            label="Monthly Volume"
            name="monthly_volume"
            value={form.monthly_volume}
            onChange={handle}
            required
          />
          <button
            type="submit"
            className="btn-primary w-full mt-1"
            disabled={saving}
          >
            {saving ? <Spinner size="sm" /> : "Save"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, required }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input
        name={name}
        className="input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

function InfoRow({ label, value, full }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <span className="text-xs text-muted">{label}: </span>
      <span className="font-mono text-xs">{value || "—"}</span>
    </div>
  );
}










// import React, { useEffect, useState } from "react";
// import { businessApi } from "../../api/client";
// import {
//   PageHeader,
//   Alert,
//   Spinner,
//   Empty,
//   Modal,
//   StatusBadge,
// } from "../../components/UI";

// const EMPTY_FORM = {
//   business_name: "",
//   business_type: "private_limited",
//   monthly_volume: "",
// };

// export default function BusinessPage() {
//   const [businesses, setBusinesses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const load = () => {
//     setLoading(true);
//     businessApi
//       .retrieve(user.id) // Pass the logged-in user's ID
//       .then(setBusinesses)
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   };

//   useEffect(load, []);

//   const handle = (e) =>
//     setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

//   const submit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSaving(true);
//     try {
//       await businessApi.create(form);
//       setSuccess("Business profile created.");
//       setShowModal(false);
//       setForm(EMPTY_FORM);
//       load();
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setSaving(false);
//     }
//   };

//   const destroy = async (pk) => {
//     if (!window.confirm("Delete this business profile?")) return;
//     await businessApi.destroy(pk).catch(() => {});
//     load();
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Business Profiles"
//         subtitle="Manage your registered businesses"
//         action={
//           <button
//             onClick={() => {
//               setShowModal(true);
//               setError("");
//             }}
//             className="btn-primary"
//           >
//             + Add Business
//           </button>
//         }
//       />

//       <Alert type="success" message={success} />

//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Spinner />
//         </div>
//       ) : businesses.length === 0 ? (
//         <Empty message="No business profiles yet. Add one to get started." />
//       ) : (
//         <div className="flex flex-col gap-4">
//           {businesses.map((b) => (
//             <div key={b.id} className="card">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <div className="font-semibold">{b.business_name}</div>
//                   <div className="text-sm text-muted capitalize mt-0.5">
//                     {b.business_type?.replace(/_/g, " ")}
//                   </div>
//                 </div>
//                 <button
//                   onClick={() => destroy(b.id)}
//                   className="btn-ghost text-danger text-xs"
//                 >
//                   Delete
//                 </button>
//               </div>
//               <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
//                 <InfoRow label="PAN" value={b.pan_number} />
//                 <InfoRow label="GSTIN" value={b.gstin} />
//                 <InfoRow
//                   label="Address"
//                   value={b.business_address}
//                   full
//                 />
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <Modal
//         open={showModal}
//         onClose={() => setShowModal(false)}
//         title="Add Business Profile"
//       >
//         <form onSubmit={submit} className="flex flex-col gap-3">
//           <Alert type="error" message={error} />
//           <Field
//             label="Business Name"
//             name="business_name"
//             value={form.business_name}
//             onChange={handle}
//             required
//           />
//           <div>
//             <label className="label">Business Type</label>
//             <select
//               name="business_type"
//               className="input"
//               value={form.business_type}
//               onChange={handle}
//             >
//               <option value="private_limited">Individual</option>
//               <option value="partnership">Partnership</option>
//               <option value="llp">LLP</option>
//               <option value="private_limited">Private Limited</option>
//               <option value="public_limited">Public Limited</option>
//               <option value="sole_proprietorship">NGO</option>
//               <option value="sole_proprietorship">Other</option>
//             </select>
//           </div>
//           <Field
//             label="Monthly Volume"
//             name="monthly_volume"
//             value={form.monthly_volume}
//             onChange={handle}
//             required
//           />
//           <button
//             type="submit"
//             className="btn-primary w-full mt-1"
//             disabled={saving}
//           >
//             {saving ? <Spinner size="sm" /> : "Save"}
//           </button>
//         </form>
//       </Modal>
//     </div>
//   );
// }

// function Field({ label, name, value, onChange, placeholder, required }) {
//   return (
//     <div>
//       <label className="label">{label}</label>
//       <input
//         name={name}
//         className="input"
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         required={required}
//       />
//     </div>
//   );
// }

// function InfoRow({ label, value, full }) {
//   return (
//     <div className={full ? "col-span-2" : ""}>
//       <span className="text-xs text-muted">{label}: </span>
//       <span className="font-mono text-xs">{value || "—"}</span>
//     </div>
//   );
// }
