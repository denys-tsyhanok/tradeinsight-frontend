"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  authApi,
  tokenStorage,
  type UserProfileDto,
  type LoginDto,
  type RegisterDto,
  type ApiError,
} from "@/lib/api";

interface AuthContextType {
  user: UserProfileDto | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ["/login", "/register", "/"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Check auth status on mount
  React.useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.get();
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await authApi.getProfile();
        setUser(profile);
      } catch {
        // Token is invalid, remove it
        tokenStorage.remove();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Redirect logic
  React.useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

    if (!isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }

    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  const login = async (data: LoginDto) => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.login(data);
      const profile = await authApi.getProfile();
      setUser(profile);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterDto) => {
    setError(null);
    setIsLoading(true);

    try {
      await authApi.register(data);
      const profile = await authApi.getProfile();
      setUser(profile);
      router.push("/dashboard");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    // Also clear the saved portfolio selection to prevent cross-account data leakage
    if (typeof window !== "undefined") {
      localStorage.removeItem("trade_insight_active_portfolio");
    }
    setUser(null);
    router.push("/login");
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

