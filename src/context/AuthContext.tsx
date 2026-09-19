import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  id: number;
  name: string;
  email: string;
  role: "student" | "educator";
  token?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role?: "student" | "educator") => Promise<void>;
  demoLogin: (role?: "student" | "educator") => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { API_BASE } from "../lib/api";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("sp_auth_token");
      const savedUser = localStorage.getItem("sp_auth_user");

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        // Verify with server in background
        fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        })
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error("Session expired");
          })
          .then((data) => {
            if (data.user) {
              setUser(data.user);
              localStorage.setItem("sp_auth_user", JSON.stringify(data.user));
            }
          })
          .catch(() => {
            // Keep cached user for offline/demo friendliness if server had transient issue
          });
      }
    } catch {
      // Ignore parse errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveAuth = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    try {
      localStorage.setItem("sp_auth_token", authToken);
      localStorage.setItem("sp_auth_user", JSON.stringify(userData));
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed. Please check your credentials.");
    }
    saveAuth(data.user, data.token);
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "student" | "educator" = "student"
  ) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Registration failed. Please check your inputs.");
    }
    saveAuth(data.user, data.token);
  };

  const demoLogin = async (role: "student" | "educator" = "student") => {
    const email = role === "educator" ? "professor@demo.edu" : "student@demo.edu";
    await login(email, "demopassword");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem("sp_auth_token");
      localStorage.removeItem("sp_auth_user");
    } catch (e) {
      console.warn("Storage error", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
