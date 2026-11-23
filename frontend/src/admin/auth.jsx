import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/axios";

const Ctx = createContext({ user: null, loading: true, login: async () => {}, logout: () => {} });
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("bb_admin_token")));

  const logout = useCallback(() => {
    localStorage.removeItem("bb_admin_token");
    setUser(null);
  }, []);

  // restore the session when the page is opened
  useEffect(() => {
    if (!localStorage.getItem("bb_admin_token")) return;
    api
      .get("/auth/me")
      .then((r) => setUser(r.data.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  useEffect(() => {
    window.addEventListener("bb:logout", logout);
    return () => window.removeEventListener("bb:logout", logout);
  }, [logout]);

  const login = async (username, password) => {
    const { data } = await api.post("/auth/login", { username, password });
    localStorage.setItem("bb_admin_token", data.token);
    setUser(data.user);
  };

  return <Ctx.Provider value={{ user, loading, login, logout }}>{children}</Ctx.Provider>;
}
