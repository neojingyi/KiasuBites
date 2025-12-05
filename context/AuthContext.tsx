import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "../types";
import { api } from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<User>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // No auto-login - user must explicitly log in
  // Removed localStorage restore to ensure app starts with no user logged in

  const login = async (email: string, role: UserRole): Promise<User> => {
    setIsLoading(true);
    try {
      const loggedInUser = await api.login(email, role);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
