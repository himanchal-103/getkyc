import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .profile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const register = async (body) => {
    const data = await authApi.register(body);
    return data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);








// import React, { createContext, useContext, useState, useEffect } from "react";
// import { authApi } from "../api/client";

// const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     authApi
//       .profile()
//       .then(setUser)
//       .catch(() => setUser(null))
//       .finally(() => setLoading(false));
//   }, []);

//   const login = async (email, password) => {
//     const data = await authApi.login({ email, password });
//     setUser(data.user);
//     return data.user;
//   };

//   const logout = async () => {
//     await authApi.logout();
//     setUser(null);
//   };

//   const register = async (body) => {
//     const data = await authApi.register(body);
//     return data.user;
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, logout, register }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// export const useAuth = () => useContext(AuthContext);
