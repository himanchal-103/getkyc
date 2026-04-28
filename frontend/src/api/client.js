const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

function getCSRFToken() {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith("csrftoken="))
    ?.split("=")[1];
}

async function request(method, path, body, isFormData = false) {
  const opts = {
  method,
  credentials: "include",
  headers: {
    "X-CSRFToken": getCSRFToken(),
  },
};

  if (body) {
    if (isFormData) {
      opts.body = body; // FormData - browser sets Content-Type with boundary
    } else {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE}${path}`, opts);

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data?.error ||
      data?.detail ||
      Object.values(data).flat()[0] ||
      `Error ${res.status}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return data;
}

// Auth
export const authApi = {
  register: (body) => request("POST", "/account/auth/register/", body),
  login: (body) => request("POST", "/account/auth/login/", body),
  logout: () => request("POST", "/account/auth/logout/"),
  profile: () => request("GET", "/account/auth/profile/"),
};

// KYC - Business Profiles
export const businessApi = {
  list: () => request("GET", "/kyc/list/all/"),
  create: (body) => request("POST", "/kyc/create/", body),
  retrieve: (pk) => request("GET", `/kyc/retrieve/${pk}/`),
  destroy: (pk) => request("DELETE", `/kyc/destroy/${pk}/`),
};

// KYC - Documents
export const documentApi = {
  list: () => request("GET", "/kyc/documents/"),
  upload: (formData) => request("POST", "/kyc/documents/upload/", formData, true),
  detail: (pk) => request("GET", `/kyc/documents/${pk}/`),
};

// Merchant Submissions
export const submissionApi = {
  create: (body) => request("POST", "/api/submissions/create/", body),
  myDetail: () => request("GET", "/api/submissions/"),
  submit: (pk) => request("POST", `/api/submissions/${pk}/submit/`),
};

// Reviewer
export const reviewerApi = {
  queue: () => request("GET", "/api/reviewer/queue/"),
  detail: (pk) => request("GET", `/api/reviewer/submissions/${pk}/`),
  transition: (pk, body) => request("POST", `/api/reviewer/submissions/${pk}/transition/`, body),
};

// Notifications
export const notificationApi = {
  list: () => request("GET", "/api/notifications/"),
};











// const BASE = process.env.REACT_APP_API_URL || "http://localhost:8000";

// function getCSRFToken() {
//   return document.cookie
//     .split("; ")
//     .find((row) => row.startsWith("csrftoken="))
//     ?.split("=")[1];
// }

// async function request(method, path, body, isFormData = false) {
//   const opts = {
//   method,
//   credentials: "include",
//   headers: {
//     "X-CSRFToken": getCSRFToken(),
//   },
// };

//   if (body) {
//     if (isFormData) {
//       opts.body = body; // FormData - browser sets Content-Type with boundary
//     } else {
//       opts.headers["Content-Type"] = "application/json";
//       opts.body = JSON.stringify(body);
//     }
//   }

//   const res = await fetch(`${BASE}${path}`, opts);

//   if (res.status === 204) return null;

//   const data = await res.json().catch(() => ({}));

//   if (!res.ok) {
//     const message =
//       data?.error ||
//       data?.detail ||
//       Object.values(data).flat()[0] ||
//       `Error ${res.status}`;
//     throw new Error(typeof message === "string" ? message : JSON.stringify(message));
//   }

//   return data;
// }

// // Auth
// export const authApi = {
//   register: (body) => request("POST", "/account/auth/register/", body),
//   login: (body) => request("POST", "/account/auth/login/", body),
//   logout: () => request("POST", "/account/auth/logout/"),
//   profile: () => request("GET", "/account/auth/profile/"),
// };

// // KYC - Business Profiles
// export const businessApi = {
//   list: () => request("GET", "/kyc/list/all/"),
//   create: (body) => request("POST", "/kyc/create/", body),
//   retrieve: (pk) => request("GET", `/kyc/retrieve/${pk}/`),
//   destroy: (pk) => request("DELETE", `/kyc/destroy/${pk}/`),
// };

// // KYC - Documents
// export const documentApi = {
//   list: () => request("GET", "/kyc/documents/"),
//   upload: (formData) => request("POST", "/kyc/documents/upload/", formData, true),
//   detail: (pk) => request("GET", `/kyc/documents/${pk}/`),
// };

// // Merchant Submissions
// export const submissionApi = {
//   create: (body) => request("POST", "/api/submissions/create/", body),
//   myDetail: () => request("GET", "/api/submissions/"),
//   submit: (pk) => request("POST", `/api/submissions/${pk}/submit/`),
// };

// // Reviewer
// export const reviewerApi = {
//   queue: () => request("GET", "/api/reviewer/queue/"),
//   detail: (pk) => request("GET", `/api/reviewer/submissions/${pk}/`),
//   transition: (pk, body) => request("POST", `/api/reviewer/submissions/${pk}/transition/`, body),
// };

// // Notifications
// export const notificationApi = {
//   list: () => request("GET", "/api/notifications/"),
// };
