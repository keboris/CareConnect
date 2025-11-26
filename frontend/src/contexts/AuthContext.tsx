
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { API_BASE_URL, type User } from "../config/api";

import { getCookie, setCookie, removeCookie } from '../lib/cookies';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (formData: FormData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = getCookie('accessToken');
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    const userData = await fetchUser();
    if (userData) {
      setUser(userData);
      setCookie('user', JSON.stringify(userData), 7);
    }
  };

  useEffect(() => {
    const token = getCookie('accessToken');
    const storedUser = getCookie('user');

    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        fetchUser().then((user) => {
          if (user) setUser(user);
        });
      } catch (error) {
        console.error("Error parsing user data:", error);
        removeCookie('accessToken');
        removeCookie('user');
      }
    }

    setLoading(false);
  }, []);

  const signUp = async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();

    setCookie('accessToken', data.token, 7);
    setCookie('refreshToken', data.token, 7);
    setCookie('user', JSON.stringify(data.user), 7);

    setUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    setCookie('accessToken', data.accessToken, 7);
    setCookie('refreshToken', data.refreshToken, 7);
    setCookie('user', JSON.stringify(data.user), 7);

    setUser(data.user);
  };

  const signOut = async () => {
    try {
      const token = getCookie('accessToken');
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    removeCookie('accessToken');
    removeCookie('refreshToken');
    removeCookie('user');

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
