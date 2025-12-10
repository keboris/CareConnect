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
  nameDE?: string;
  nameFR?: string;
  icon?: string;
  color: string;
  description: string;
  descriptionDE?: string;
  descriptionFR?: string;
  offersCount: number;
  requestsCount: number;
  createdAt: string;
};

export type StatsProps = {
  offers: number;
  requests: number;
  alerts: number;
  chats: number;
  unRead: number;
  sessions: number;
  notifications: number;
};

export type LocationProps = {
  location: string;
  latitude: number;
  longitude: number;
};

export type OfferProps = {
  _id: string;
  userId: User;
  title: string;
  description: string;
  categoryId: string;
  isPaid: boolean;
  price?: number;
  location: string;
  longitude: number;
  latitude: number;
  images: string[];
  imagesPublicIds?: string[];
  status:
    | "active"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "inactive"
    | "archived";
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type RequestProps = {
  _id: string;
  userId: User;
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
  category?: Category;
  createdAt: string;
  updatedAt: string;
};

export type mapcenterProps = {
  lat: number;
  lng: number;
};

export type OrtMapProps = {
  orts: (OfferProps | RequestProps | User)[];
  mapCenter: number[] | null;
  isClick?: boolean;
  setIsClick?: (value: boolean) => void;
  currentOrt?: OfferProps | RequestProps | User | null;
  onMarkerClick: (ort: OfferProps | RequestProps | User) => void;
  isClickedZoom?: boolean;
  setIsClickedZoom?: (value: boolean) => void;
  onAccept?: (ort: OfferProps | RequestProps | User) => void;
  acceptLoading?: boolean;
  mapRef?: React.RefObject<L.Map | null>;
  overview?: boolean;
};

export type CountProps = {
  offers: number;
  requests: number;
  alerts: number;
  statuses: Record<string, number>;
  allActive: number;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  signUp: (formData: FormData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  refreshUser: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
  issuesToFieldErrors: (issues: Array<{ path: string[]; message: string }>) => {
    [key: string]: string;
  };
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
  error?: string;
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
  isRead: boolean;
  edited: boolean;
  createdAt: string;
  sender?: User;
  receiver?: User;
};

export type HelpSessionProps = {
  sessions: string | undefined;
  _id: string;
  option: string;
  etat: string;
  final: string;
  unreadCount: number;
  lastMessage?: ChatMessageProps;
  rating: number;
  offerId: OfferProps | null;
  requestId: RequestProps | null;
  userRequesterId: User | string;
  userHelperId: User | string;
  status: "active" | "completed" | "cancelled";
  startedAt: string;
  endedAt: string;
  finalizedAt: string;
  notes: string;
  ratingPending: boolean;
  result: string;
};

export type ConfirmModalProps = {
  title: string;
  message: string;
  onConfirm: (ort: OfferProps | RequestProps) => void;
  onCancel: () => void;
};

export type CareModalProps = {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  selectedCare: OfferProps | RequestProps | null;
  option: "show" | "create" | "edit";
  setOption?: React.Dispatch<React.SetStateAction<"show" | "edit" | "create">>;
  isModalOpen: boolean;
  closeModal: () => void;
  handleAction?: (newCare: OfferProps | RequestProps, option?: string) => void;
  page?: "request" | "alert";
};

export type CareProps = {
  item?: OfferProps | RequestProps | null;
  option?: "show" | "create" | "edit";
  page?: "offer" | "request" | "alert";
  handleAction?: (newCare: OfferProps | RequestProps, option?: string) => void;
  closeModal?: () => void;
};
