import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "../config/api";

import type { AuthContextType, User } from "../types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
          await fetchUser();
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const signUp = async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }

    const data = await response.json();

    setAccessToken(data.accessToken);

    setUser(data.user);
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    const data = await response.json();

    setAccessToken(data.accessToken);

    setUser(data.user);
  };

  const signOut = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  // Function for secure fetch with auto-refresh
  const refreshUser = async (input: RequestInfo, init: RequestInit = {}) => {
    if (!init.headers) init.headers = {};
    if (accessToken) {
      (init.headers as any)["Authorization"] = `Bearer ${accessToken}`;
    }

    init.credentials = "include"; // to send the refreshToken cookie

    let res = await fetch(input, init);

    // If 401, try to get a new accessToken via refreshToken
    if (res.status === 401) {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include", // to send the refreshToken cookie
      });

      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setAccessToken(data.accessToken); // new token in memory

        // Refaire la requête initiale avec le nouveau token
        (init.headers as any)["Authorization"] = `Bearer ${data.accessToken}`;
        res = await fetch(input, init);
      } else {
        // refreshToken invalid → logout
        await signOut();
      }
    }

    return res;
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
