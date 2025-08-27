import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "admin@pminternship.in";
const ADMIN_PASSWORD = "Admin@12345";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on app load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Check admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const adminUser: User = {
          firstName: "Admin",
          lastName: "User",
          email: ADMIN_EMAIL,
          isAdmin: true,
        };
        setUser(adminUser);
        localStorage.setItem("user", JSON.stringify(adminUser));
        return true;
      }

      // Check regular user credentials
      const storedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const foundUser = storedUsers.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        const loginUser: User = {
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
          isAdmin: false,
        };
        setUser(loginUser);
        localStorage.setItem("user", JSON.stringify(loginUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Check if user already exists
      const storedUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const existingUser = storedUsers.find((u: any) => u.email === email);

      if (existingUser) {
        return false; // User already exists
      }

      // Add new user
      const newUser = { firstName, lastName, email, password };
      storedUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(storedUsers));

      // Automatically log in the user
      const loginUser: User = {
        firstName,
        lastName,
        email,
        isAdmin: false,
      };
      setUser(loginUser);
      localStorage.setItem("user", JSON.stringify(loginUser));

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
