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

  const isAuthenticated = Boolean(accessToken && user);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing authentication...");
        if (accessToken) {
          const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
            credentials: "include",
            headers: accessToken
              ? { Authorization: `Bearer ${accessToken}` }
              : {},
          });

          if (meRes.ok) {
            const data = await meRes.json();
            setUser(data.user);
            return;
          }
        }

        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refreshRes.ok) {
          setUser(null);
          return setLoading(false);
        }

        const refreshData = await refreshRes.json();
        setAccessToken(refreshData.accessToken);

        const meRes = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${refreshData.accessToken}`,
          },
        });

        if (meRes.ok) {
          const data = await meRes.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error during auth initialization:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [accessToken]);

  const issuesToFieldErrors = (issues: any[]) => {
    const fieldErrors: Record<string, string> = {};
    issues.forEach((issue) => {
      fieldErrors[issue.field] = issue.message;
    });
    throw fieldErrors;
  };

  const apiAuthRequest = async (url: string, options: RequestInit) => {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    // Error handling
    if (!response.ok) {
      if (data.issues) {
        issuesToFieldErrors(data.issues);
      }
      const message =
        data && typeof data.message === "string"
          ? data.message
          : "An error occurred";
      const err = new Error(message);
      if (data && "field" in data) {
        (err as any).field = data.field;
      }
      throw err;
    }

    return data;
  };

  const signUp = async (formData: FormData) => {
    await apiAuthRequest(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      body: formData,
    });

    // After successful signup, automatically sign in the user
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    await signIn(email, password);
  };

  const signIn = async (email: string, password: string) => {
    const data = await apiAuthRequest(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

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
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${accessToken}`);
      init.headers = headers;
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
        const headers = new Headers(init.headers);
        headers.set("Authorization", `Bearer ${data.accessToken}`);
        init.headers = headers;

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
        isAuthenticated,
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
