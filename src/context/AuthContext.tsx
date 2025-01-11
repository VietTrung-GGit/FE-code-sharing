import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, logoutUser, refreshAccessToken, signupUser } from "../services/authService";

// Define the context type
interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => void;
  logout: () => void;
  refreshToken: () => void;
  signup: (username: string, email: string, password: string) => void;
}

// Define the props type for AuthProvider component
interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

 useEffect(() => {
  const checkAuthStatus = async () => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      try {
        // Optionally, you can call your backend to verify if the token is still valid.
        // If it's valid, set the auth state accordingly.
        const refreshedToken = await refreshAccessToken(); // Optionally refresh token
        if (refreshedToken) {
          localStorage.setItem("accessToken", refreshedToken); // Update the token if refreshed
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false); // In case the token is invalid or expired
        }
      } catch (error) {
        console.error("Error checking token:", error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  checkAuthStatus();
}, []);
  const login = async (username: string, password: string) => {
    try {
      const data = await loginUser(username, password);
      setIsAuthenticated(true);
      localStorage.setItem("accessToken", data.accessToken);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      await signupUser(username, email, password);
      // After successful sign-up, log in the user automatically
      await login(username, password);
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setIsAuthenticated(false);
      localStorage.removeItem("accessToken");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const refreshToken = async () => {
    try {
      const newAccessToken = await refreshAccessToken();
      localStorage.setItem("accessToken", newAccessToken);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      console.error("Token refresh failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, refreshToken, signup }}>
      {children}
    </AuthContext.Provider>
  );
};
