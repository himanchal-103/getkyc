import React, { useEffect, useState } from "react";
import { notificationApi } from "../../api/client";
import { PageHeader, Spinner, Empty, StatusBadge } from "../../components/UI";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationApi
      .list()
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Updates on your submissions and reviews"
      />
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : notifications.length === 0 ? (
        <Empty message="No notifications yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div key={n.id} className="card">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={n.payload?.new_state} />
                    <span className="text-xs text-muted font-mono">
                      #{n.payload?.submission_id}
                    </span>
                  </div>
                  {n.payload?.reason && (
                    <p className="text-sm text-muted mt-1">
                      {n.payload.reason}
                    </p>
                  )}
                  {n.payload?.reviewer && (
                    <p className="text-xs text-muted mt-1">
                      Reviewer: {n.payload.reviewer}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted whitespace-nowrap ml-4">
                  {new Date(n.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}








// import React, { useEffect, useState } from "react";
// import { notificationApi } from "../../api/client";
// import { PageHeader, Spinner, Empty, StatusBadge } from "../../components/UI";

// export default function NotificationsPage() {
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     notificationApi
//       .list()
//       .then(setNotifications)
//       .catch(() => {})
//       .finally(() => setLoading(false));
//   }, []);

//   return (
//     <div>
//       <PageHeader
//         title="Notifications"
//         subtitle="Updates on your submissions and reviews"
//       />
//       {loading ? (
//         <div className="flex justify-center py-16">
//           <Spinner />
//         </div>
//       ) : notifications.length === 0 ? (
//         <Empty message="No notifications yet." />
//       ) : (
//         <div className="flex flex-col gap-3">
//           {notifications.map((n) => (
//             <div key={n.id} className="card">
//               <div className="flex items-start justify-between">
//                 <div>
//                   <div className="flex items-center gap-2 mb-1">
//                     <StatusBadge status={n.payload?.new_state} />
//                     <span className="text-xs text-muted font-mono">
//                       #{n.payload?.submission_id}
//                     </span>
//                   </div>
//                   {n.payload?.reason && (
//                     <p className="text-sm text-muted mt-1">
//                       {n.payload.reason}
//                     </p>
//                   )}
//                   {n.payload?.reviewer && (
//                     <p className="text-xs text-muted mt-1">
//                       Reviewer: {n.payload.reviewer}
//                     </p>
//                   )}
//                 </div>
//                 <span className="text-xs text-muted whitespace-nowrap ml-4">
//                   {new Date(n.created_at).toLocaleDateString()}
//                 </span>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
