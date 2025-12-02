import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { API_BASE_URL } from "../config/api";

import type { AuthContextType, User } from "../types";
import { tr } from "framer-motion/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasLoggedOut, setHasLoggedOut] = useState(false);

  const isAuthenticated = !!user && !!accessToken;

  const fetchUser = async (token?: string) => {
    const tokenToUse = token || accessToken;

    if (!tokenToUse) {
      setUser(null);
      return null;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToUse}` },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const data = await response.json();
      setUser(data.user);
      setHasLoggedOut(false);
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setHasLoggedOut(true);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log(user);
      console.log("AccessToken:", accessToken);
      if (hasLoggedOut) {
        setLoading(false);
        return; // ne tente pas le refresh
      }

      if (user || accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.status === 401 || !res.ok) {
          console.log("Status 401 on refresh or not ok", res?.status);
          setUser(null);
          setAccessToken(null);
          setHasLoggedOut(true);
          setLoading(false);
          return;
        }

        const data = await res.json();
        console.log(
          "Refreshed access token:",
          data.accessToken + "..." + data.message
        );

        setAccessToken(data.accessToken);
        await fetchUser(data.accessToken);
      } catch (error) {
        console.error("Error during auth initialization:", error);
        setUser(null);
        setAccessToken(null);
        setHasLoggedOut(true);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [hasLoggedOut]);

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
    setHasLoggedOut(false);
  };

  const signOut = async () => {
    try {
      if (accessToken) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: "include",
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      setHasLoggedOut(true);
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
  if (!context) throw new Error("useAuth must be used within an AuthProvider");

  return context;
}
