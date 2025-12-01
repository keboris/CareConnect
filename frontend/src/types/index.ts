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
  isAuthenticated: boolean;
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

export type CategoriesSectionProps = {
  onCategoryClick: () => void;
};

export type MapModalProps = {
  onClose: () => void;
};

export type Lang = {
  _id: string;
  en: string;
  de: string;
  fr: string;
};

export type NotificationProps = {
  _id: string;
  model: "Offer" | "Request" | "HelpSession";
  resourceId: string;
  type: "request" | "offer" | "sos" | "session" | "chat" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type AddressInputProps = {
  locationValue: string;
  onSelect: (data: {
    location: string;
    latitude: number;
    longitude: number;
  }) => void;
};

export type SuggestionAddress = {
  place_id: string;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    postcode?: string;
    [key: string]: any;
  };
};

export type ChatSessionProps = {
  _id: string;
  requestId: string;
  offerId: string;
  userRequesterId: string;
  userHelperId: string;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  offer?: OfferProps;
  request?: RequestProps;
};

export type ChatMessageProps = {
  _id: string;
  sessionId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachements: string[];
  createdAt: string;
  sender?: User;
  receiver?: User;
};
