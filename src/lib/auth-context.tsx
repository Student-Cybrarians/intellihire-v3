"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { verifySessionToken } from "@/lib/session";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  avatar?: string;
}

export const DEMO_USERS: Record<UserRole, User> = {
  candidate: {
    id: "cand_vishnu_p01",
    name: "Vishnu Sharma",
    email: "candidate@demo.intellihire.ai",
    role: "candidate",
    tenantId: "tenant_enterprise_demo",
    avatar: "VS",
  },
  recruiter: {
    id: "rec_priya_r01",
    name: "Priya Patel",
    email: "recruiter@demo.intellihire.ai",
    role: "recruiter",
    tenantId: "tenant_enterprise_demo",
    avatar: "PP",
  },
  admin: {
    id: "admin_michael_g01",
    name: "Boss Michael",
    email: "admin@demo.intellihire.ai",
    role: "admin",
    tenantId: "tenant_enterprise_demo",
    avatar: "BM",
  },
};

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (role: UserRole, email?: string, name?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  // New methods for session-based auth
  initializeFromSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize from session cookie on mount
  useEffect(() => {
    initializeFromSession();
  }, []);

  const initializeFromSession = async () => {
    try {
      // In a real app, we would read the cookie from document.cookie
      // But since we're in a client component and cookies are handled by middleware,
      // we'll rely on the middleware to redirect if not authenticated.
      // For now, we'll keep the demo behavior for development
      const stored = localStorage.getItem("ih_active_user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to demo candidate for initial developer convenience
        setUser(DEMO_USERS.candidate);
        localStorage.setItem("ih_active_user", JSON.stringify(DEMO_USERS.candidate));
      }
    } catch {
      setUser(DEMO_USERS.candidate);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (role: UserRole, email?: string, name?: string) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name || (role === "candidate" ? "Candidate User" : role === "recruiter" ? "Recruiter Lead" : "Platform Admin"),
      email: email || `${role}@demo.intellihire.ai`,
      role,
      tenantId: "tenant_enterprise_demo",
      avatar: (name || role).slice(0, 2).toUpperCase(),
    };
    setUser(newUser);
    try {
      localStorage.setItem("ih_active_user", JSON.stringify(newUser));
    } catch {}

    if (role === "candidate") router.push("/dashboard");
    else if (role === "recruiter") router.push("/recruiter/dashboard");
    else router.push("/admin/dashboard");
  };

  const switchRole = (role: UserRole) => {
    const demo = DEMO_USERS[role];
    setUser(demo);
    try {
      localStorage.setItem("ih_active_user", JSON.stringify(demo));
    } catch {}

    if (role === "candidate") router.push("/dashboard");
    else if (role === "recruiter") router.push("/recruiter/dashboard");
    else router.push("/admin/dashboard");
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem("ih_active_user");
    } catch {}
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role || null, isLoading, login, logout, switchRole, initializeFromSession }}>
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