export type User = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  phone: string;
  profileImage: string;
  bio: string;
  skills: string[];
  location: string;
  longitude: number;
  latitude: number;
  rating?: number;
  languages: string[];
  createdAt: string;
};

export type Category = {
  _id: string;
  name: string;
  icon?: string;
  color: string;
  description: string;
  createdAt: string;
};

export type OfferProps = {
  _id: string;
  userId: string;
  title: string;
  description: string;
  categoryId: string;
  isPaid: boolean;
  price?: number;
  location: string;
  longitude: number;
  latitude: number;
  images: string[];
  status:
    | "active"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "inactive"
    | "archived";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type RequestProps = {
  _id: string;
  userId: string;
  typeRequest: "alert" | "request";
  title?: string;
  description: string;
  categoryId: string;
  location: string;
  longitude: number;
  latitude: number;
  rewardType: "free" | "paid";
  price?: number;
  radius?: number;
  urgency: "low" | "normal" | "high";
  typeAlert?: "medical" | "danger" | "fire" | "police" | "assistance" | "other";
  images: string[];
  status:
    | "active"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "inactive"
    | "archived";
  user?: User;
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (formData: FormData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
};

export type Language = "en" | "de";

export type Translations = {
  [key: string]: {
    en: string;
    de: string;
  };
};

export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

export type HeroSectionProps = {
  onGetStarted: () => void;
  onOpenMap: () => void;
};

export type RegisterFormProps = {
  onRegisterSuccess: () => void;
};

export type LoginFormProps = {
  onLoginSuccess: () => void;
};

export type CategoriesSectionProps = {
  onCategoryClick: () => void;
};

export type LandingNavProps = {
  onHome?: () => void;
  onLogin: () => void;
  onRegister: () => void;
};

export type HeaderProps = {
  currentView: "map" | "messages";
  onViewChange: (view: "map" | "messages") => void;
};

export type MapModalProps = {
  onClose: () => void;
};
