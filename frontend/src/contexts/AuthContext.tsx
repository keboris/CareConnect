import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { API_BASE_URL, User, Profile } from '../config/api';
import { getCookie, setCookie, removeCookie } from '../lib/cookies';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      // Get authentication token from cookies
      const token = getCookie('auth_token');
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const profileData = await fetchProfile(user.id);
      setProfile(profileData);
    }
  };

  useEffect(() => {
    // Check for existing authentication token and user data in cookies
    const token = getCookie('auth_token');
    const storedUser = getCookie('user');

    if (token && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      fetchProfile(userData.id).then(setProfile);
    }

    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, full_name: fullName })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data = await response.json();
    // Store authentication token and user data in cookies (expires in 7 days)
    setCookie('auth_token', data.token, 7);
    setCookie('user', JSON.stringify(data.user), 7);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    // Store authentication token and user data in cookies (expires in 7 days)
    setCookie('auth_token', data.token, 7);
    setCookie('user', JSON.stringify(data.user), 7);
    setUser(data.user);
    setProfile(data.profile);
  };

  const signOut = async () => {
    // Remove authentication token and user data from cookies
    removeCookie('auth_token');
    removeCookie('user');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
