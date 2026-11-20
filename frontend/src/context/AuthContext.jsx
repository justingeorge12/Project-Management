

import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(
    () => localStorage.getItem("access")
  );

  const login = async (username, password) => {
    const response = await api.post("/accounts/login/", {
      username,
      password,
    });

    const { access, refresh } = response.data;

    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);

    setAccessToken(access);
  };

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        isAuthenticated: Boolean(accessToken),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
