import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";
import { User as AppUser, UserRole } from "../types";
import { Session, User as SupabaseUser } from "@supabase/supabase-js";

/**
 * A simple auth context built around Supabase.
 * Previously loading could stick true and user role defaults could mis-route to consumer.
 * Now we hydrate from getSession, listen to onAuthStateChange, and always clear loading.
 */

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string, role?: UserRole) => Promise<AppUser>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<AppUser>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<AppUser>) => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapAuthUserToAppUser = (authUser: SupabaseUser): AppUser => {
  const storedRole = localStorage.getItem("preferredRole") as UserRole | null;
  const role = (authUser.user_metadata?.role as UserRole) || storedRole || UserRole.CONSUMER;
  return {
    id: authUser.id,
    email: authUser.email || "",
    name: (authUser.user_metadata?.name as string) || authUser.email?.split("@")[0] || "User",
    role,
    profilePictureUrl: authUser.user_metadata?.profile_picture_url as string | undefined,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const init = async () => {
      try {
        setIsLoading(true);
        // Handle OAuth redirects; if this fails we still continue and clear loading
        if (
          window.location.hash.includes("access_token") ||
          window.location.hash.includes("refresh_token") ||
          window.location.hash.includes("code")
        ) {
          try {
            await supabase.auth.getSessionFromUrl({ storeSession: true });
          } catch (err) {
            console.error("Failed to hydrate session from URL", err);
          }
        }

        const { data, error } = await supabase.auth.getSession();
        if (ignore) return;
        if (error) {
          console.error("getSession error", error);
          setSession(null);
          setUser(null);
        } else {
          console.log("getSession result", data);
          setSession(data.session);
          setUser(data.session?.user ? mapAuthUserToAppUser(data.session.user) : null);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Unexpected auth init error", err);
          setSession(null);
          setUser(null);
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("onAuthStateChange", event, newSession);
      setSession(newSession);
      setUser(newSession?.user ? mapAuthUserToAppUser(newSession.user) : null);
      setIsLoading(false);
    });

    return () => {
      ignore = true;
      listener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string, role?: UserRole) => {
    if (role) {
      localStorage.setItem("preferredRole", role);
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    console.log("login result", { data, error });
    if (error || !data.user) {
      throw new Error(error?.message || "Login failed");
    }
    const mapped = mapAuthUserToAppUser(data.user);
    if (role && mapped.role !== role) {
      mapped.role = role;
    }
    setSession(data.session);
    setUser(mapped);
    return mapped;
  };

  const register = async (email: string, password: string, name: string, role: UserRole) => {
    localStorage.setItem("preferredRole", role);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    console.log("register result", { data, error });
    if (error) throw new Error(error.message || "Registration failed");
    if (data.session?.user) {
      const mapped = mapAuthUserToAppUser(data.session.user);
      setSession(data.session);
      setUser(mapped);
      return mapped;
    }
    if (data.user) {
      const mapped = mapAuthUserToAppUser(data.user);
      setUser(mapped);
      return mapped;
    }
    return { id: "", email, name, role };
  };

  const logout = async () => {
    // Immediately clear local state so UI updates even if Supabase call fails/hangs
    localStorage.removeItem("preferredRole");
    setUser(null);
    setSession(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: "global" });
      if (error) console.error("Supabase signOut failed", error);
    } catch (err) {
      console.error("Supabase signOut threw", err);
    }
  };

  const updateUser = async (updates: Partial<AppUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : prev));
    return user ? { ...user, ...updates } : null;
  };

  const value = useMemo(
    () => ({ user, session, isLoading, login, register, logout, updateUser }),
    [user, session, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
