import { createContext, useContext, useEffect, useState } from "react";
import AxiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Bootstrap auth on app load (Google OAuth safe)
  useEffect(() => {
    const initAuth = async () => {
      try {
        await fetchUserProfile();
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const isAuthenticated = !!user;

  // 🔐 Login (cookies set by backend)
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const res = await AxiosInstance.post('/auth/login', credentials);

      if (res.status === 200) {
        await fetchUserProfile();
      }

      return res;

    } catch (error) {
      throw error;

    } finally {
      setIsLoading(false);
    }
  };

  // 👤 Profile fetch (single source of truth)
  const fetchUserProfile = async () => {
    const res = await AxiosInstance.get('/auth/me');
    if (res.status === 200) {
      // console.log("User profile fetched:", res.data.user);
      setUser(res.data.user);
    }
  };

  // 🚪 Logout (backend clears cookies)
  const logout = async (redirect = true) => {
    try {
      const response = await AxiosInstance.post('/auth/logout');
      if (response.status === 200) {
        toast.success(response.data.message || "Logged out successfully");
        setUser(null);
        if (redirect) {
          navigate('/login', { replace: true });
        }
      }
    } catch (error) {
      toast.error("Logout error: " + error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        setIsLoading,
        login,
        logout,
        fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
