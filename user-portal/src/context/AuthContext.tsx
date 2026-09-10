import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import api from "../services/api";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await api.get("/user/me");

        setUser(response.data);
      } catch (error) {
        console.error("Authentication failed");

        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }

  return context;
}
