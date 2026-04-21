import { createContext, useContext, useEffect, useState } from "react";
import { apiUrl, authHeaders, clearAuthToken } from "../config/api";

type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(apiUrl("/api/auth/me"), {
        headers: authHeaders(),
      });

      if (!res.ok) {
        clearAuthToken();
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(apiUrl("/api/auth/logout"), {
      method: "POST",
      headers: authHeaders(),
    });
    clearAuthToken();
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);