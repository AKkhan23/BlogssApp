 "use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
} from "react";
import { useRouter } from "next/navigation";
import { IUser } from "@/types/auth.types";

interface AuthContextType {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

/* ===============================
   SAFE useAuth Hook
================================ */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    // Safe fallback to prevent build crash
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: async () => {},
      signup: async () => {},
      logout: async () => {},
    };
  }

  return context;
}

/* ===============================
   Internal State Logic
================================ */
export function useAuthState(): AuthContextType {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("blog_user");
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          localStorage.removeItem("blog_user");
        }
      }
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message ?? "Login failed");

    setUser(data.data.user);

    if (typeof window !== "undefined") {
      localStorage.setItem("blog_user", JSON.stringify(data.data.user));
    }
  }, []);

  const signup = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message ?? "Signup failed");

      setUser(data.data.user);

      if (typeof window !== "undefined") {
        localStorage.setItem("blog_user", JSON.stringify(data.data.user));
      }
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    setUser(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("blog_user");
    }

    router.push("/login");
    router.refresh();
  }, [router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };
}