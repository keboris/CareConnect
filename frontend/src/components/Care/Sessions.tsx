import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, SESSION_API_URL } from "../../config";
import type { Category, HelpSessionProps } from "../../types";
import { Card, CardContent, Loading } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  DollarSign,
  X,
  Handshake,
  Search,
  Clock,
  Star,
  CalendarClock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { timeAgo } from "../../lib";

/**
 * Sessions Component
 * Displays all available sessions with filtering, sorting, and management features
 */
const Sessions = () => {
  const { refreshUser, loading } = useAuth();
  const { t, language } = useLanguage();

  //const navigate = useNavigate();
  // State management
  const [sessions, setSessions] = useState<HelpSessionProps[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<HelpSessionProps[]>(
    []
  );
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingSessions, setLoadingSessions] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSession, setSelectedSession] =
    useState<HelpSessionProps | null>(null);

  /**
   * Fetch all offers from the API
   * Called on component mount and when user data is loaded
   */
  useEffect(() => {
    if (loading) return;

    const fetchSessions = async () => {
      try {
        // Make API request to get all sessions
        const response = await fetch(`${SESSION_API_URL}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        // Update state with fetched sessions
        if (data.helpSessions) {
          setSessions(data.helpSessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [loading]);

  // Fetch categories
  useEffect(() => {
    if (loading) return;

    const fetchCategories = async () => {
      try {
        const response = await fetch(`${CATEGORIE_API_URL}`, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [loading, refreshUser]);

  // Filter sessions
  useEffect(() => {
    let filtered = sessions;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((session) => {
        const cat = session.requestId
          ? session.requestId?.category
          : session.offerId?.category;
        if (!cat) return false;
        if (typeof cat === "string") return cat === selectedCategory;
        return (cat as Category)._id === selectedCategory;
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (session) => session.status === selectedStatus
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (session) =>
          (session.requestId?.title ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (session.requestId?.description ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (session.offerId?.title ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (session.offerId?.description ?? "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSessions(filtered);
  }, [sessions, selectedCategory, selectedStatus, searchTerm]);

  const markAsCompleted = async (sessionId: string) => {
    try {
      const response = await refreshUser(
        `${SESSION_API_URL}/${sessionId}/complete`,
        {
          method: "PUT",
        }
      );
      const data = await response.json();
      if (data.message) {
        // Refresh sessions
        setSessions((prev) =>
          prev.map((session) =>
            session._id === sessionId
              ? { ...session, status: "completed" }
              : session
          )
        );
      }
    } catch (error) {
      console.error("Error marking session as completed:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading spinner while fetching data
  if (loading || loadingSessions) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CalendarClock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("dashboard.sessions")}
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    ({filteredSessions.length})
                  </span>
                </h1>
                <p className="text-gray-600">{t("dashboard.msgSessions")}</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
            {/* Filter Controls */}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex gap-2 flex-wrap flex-wrap col-span-3 lg:col-span-4"
            >
              {["all", "active", "completed", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-2 rounded-lg cursor-pointer font-semibold transition-all text-sm ${
                    selectedStatus === status
                      ? "bg-blue-600 text-white shadow-lg"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {status.charAt(0).toUpperCase() +
                    status.slice(1).replace(/_/g, " ")}
                </button>
              ))}
            </motion.div>

            {/* Search */}
            {filteredSessions.length > 0 && (
              <>
                <div className="relative col-span-3 lg:col-span-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search offers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {language === "de" ? cat.nameDE : cat.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Help Sessions List - Takes 3/4 of space */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-4 min-h-0"
          >
            {/* Help Sessions Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto"
            >
              <AnimatePresence>
                {filteredSessions.length === 0 ? (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    {selectedCategory === "all" &&
                    selectedStatus === "all" &&
                    !searchTerm ? (
                      <p className="text-gray-600">
                        {t("dashboard.noSessions")}
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        {t("dashboard.noSessionsCriteria")}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  // Offer Cards
                  filteredSessions.map((session) => (
                    <motion.div
                      key={session._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="h-full cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedSession(session)}
                      >
                        <CardContent className="px-4 md:px-6">
                          <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                            <div className="flex-1 w-full">
                              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900">
                                  {session.requestId
                                    ? session.requestId?.title
                                    : session.offerId?.title}
                                </h3>
                              </div>
                              <p className="text-gray-600 mb-3">
                                {session.requestId
                                  ? session.requestId?.description
                                  : session.offerId?.description}
                              </p>

                              {/* Details Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                                {/* Category */}
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-blue-100 rounded">
                                    <Handshake className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      {t("dashboard.category")}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {session.requestId &&
                                      session.requestId.category
                                        ? language === "de"
                                          ? session.requestId.category.nameDE ||
                                            session.requestId.category.name
                                          : session.requestId.category.name ||
                                            session.requestId.category.nameDE
                                        : "-"}
                                    </p>
                                  </div>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-green-100 rounded">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      {t("dashboard.price")}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {session.requestId &&
                                      session.requestId.rewardType === "paid"
                                        ? `$${session.requestId.price}`
                                        : session.offerId &&
                                          session.offerId.isPaid
                                        ? `$${session.offerId.price}`
                                        : t("dashboard.free")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mb-4">
                                {/* Location */}
                                <div className="flex items-center gap-2">
                                  <div className="p-2 bg-red-100 rounded">
                                    <MapPin className="w-4 h-4 text-red-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      {t("dashboard.location")}
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {session.requestId
                                        ? session.requestId.location
                                        : session.offerId?.location}
                                    </p>
                                  </div>
                                </div>

                                {/* Rating */}
                                {session.rating && (
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 bg-yellow-100 rounded">
                                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">
                                        {t("dashboard.rating")}
                                      </p>
                                      <p className="text-sm font-semibold text-gray-900">
                                        {session.rating.toFixed(1)}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock size={16} className="text-gray-400" />
                                <span>{timeAgo(session.startedAt)}</span>
                              </div>

                              {/* Creator */}
                              {/*<div className="flex items-center gap-2 text-gray-600 mt-2">
                                <User size={16} className="text-gray-400" />
                                <span>
                                  {(() => {
                                    const u = offer.userId as any;
                                    if (u && typeof u === "object") {
                                      const first = u.firstName ?? "Unknown";
                                      const last = u.lastName
                                        ? ` ${u.lastName}`
                                        : "";
                                      return `${first}${last}`;
                                    }
                                    return "Unknown";
                                  })()}
                                </span>
                              </div>*/}
                            </div>
                          </div>
                          <div className="mt-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(
                                session.status
                              )}`}
                            >
                              {session.status}
                            </span>
                          </div>

                          {/* Action Buttons - Only show for user's own offers */}
                          {session.status === "active" && (
                            <div className="flex gap-2 mt-5 pt-2 border-t">
                              <button
                                onClick={() => {
                                  markAsCompleted(session._id);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all text-sm font-semibold"
                              >
                                <CheckCircle2 size={16} />
                                {t("dashboard.markAsCompleted")}
                              </button>

                              <button
                                onClick={() => {
                                  markAsCompleted(session._id);
                                }}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold"
                              >
                                <XCircle size={16} />
                                {t("dashboard.markAsCancelled")}
                              </button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Create Form Panel - Takes 1/4 of space */}

          {/* Selected Session Details - Takes 1/4 of space */}
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 flex flex-col gap-4 min-h-0"
            >
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold text-gray-800">Session Details</h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="p-1 hover:bg-gray-100 cursor-pointer rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.title")}
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {selectedSession.requestId
                        ? selectedSession.requestId.title
                        : selectedSession.offerId?.title}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.description")}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedSession.requestId
                        ? selectedSession.requestId.description
                        : selectedSession.offerId?.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.location")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedSession.requestId
                        ? selectedSession.requestId.location
                        : selectedSession.offerId?.location}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.category")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedSession.requestId
                        ? selectedSession.requestId.category?.name
                        : selectedSession.offerId?.category?.name}
                    </p>
                  </div>

                  {/* Price */}
                  {(selectedSession.offerId?.isPaid ||
                    selectedSession.requestId?.rewardType === "paid") && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {t("dashboard.price")}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        $
                        {selectedSession.offerId
                          ? selectedSession.offerId.price
                          : selectedSession.requestId?.price}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.status")}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedSession.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedSession.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedSession.status}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.createdAt")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {timeAgo(selectedSession.startedAt)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/*<div>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 flex flex-col gap-4 min-h-0 relative z-50 w-full max-w-3xl mx-auto"
            >
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold text-gray-800">Create New Offer</h3>
                  <button
                    onClick={() => navigate("/app/offers/create")}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                  ></button>
                </div>
              </Card>
            </motion.div>
          )}
        </div>*/}
      </div>
    </div>
  );
};

export default Sessions;
