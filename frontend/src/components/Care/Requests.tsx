import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, REQUEST_API_URL } from "../../config";
import type { Category, RequestProps } from "../../types";
import { Card, CardContent, Loading } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  MapPin,
  DollarSign,
  User,
  Plus,
  X,
  Handshake,
  Search,
  Star,
  Zap,
  AlertCircle,
  Calendar,
  List,
  Folder,
} from "lucide-react";
import { timeAgo } from "../../lib";
import { useNavigate } from "react-router";

/**
 * Requests Component
 * Displays all available requests with filtering, sorting, and management features
 * Includes inline modal for creating new requests
 */
const Requests = () => {
  const { user, refreshUser, loading } = useAuth();
  const { t, language } = useLanguage();

  const navigate = useNavigate();
  // State management
  const [requests, setRequests] = useState<RequestProps[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<RequestProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [titleSet, setTitleSet] = useState<string>(t("dashboard.requests"));
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chooseRequests, setChooseRequests] = useState<string>("all");

  const [filterType, setFilterType] = useState<string>("all");
  const [filterUrgency, setFilterUrgency] = useState<string>("all");

  const [selectedRequest, setSelectedRequest] = useState<RequestProps | null>(
    null
  );
  const [deleting, setDeleting] = useState<string | null>(null);

  /**
   * Fetch all requests from the API
   * Called on component mount and when user data is loaded
   */
  useEffect(() => {
    if (loading) return;

    const fetchRequests = async () => {
      try {
        // Make API request to get all requests
        const response = await fetch(`${REQUEST_API_URL}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        // Update state with fetched requests
        if (data.requests) {
          setRequests(data.requests);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoadingRequests(false);
      }
    };

    fetchRequests();
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

  // Filter offers
  useEffect(() => {
    let filtered = requests;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((request) => {
        const req = request.category;
        if (!req) return false;
        if (typeof req === "string") return req === selectedCategory;
        return (req as Category)._id === selectedCategory;
      });
    }

    if (chooseRequests === "my") {
      filtered = filtered.filter((request) => {
        const requestUserId =
          typeof request.userId === "string"
            ? request.userId
            : (request.userId as any)?._id;
        return requestUserId === user?._id;
      });
    } else {
      filtered = filtered.filter((request) => {
        const requestStatus = request.status;
        return ["active"].includes(requestStatus);
      });
    }

    if (filterType !== "all") {
      filtered = filtered.filter(
        (request) => request.typeRequest === filterType
      );
    }

    if (filterUrgency !== "all") {
      filtered = filtered.filter(
        (request) => request.urgency === filterUrgency
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (request) => request.status === selectedStatus
      );
    }

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          (request.title || "").toLowerCase().includes(lower) ||
          (request.description || "").toLowerCase().includes(lower)
      );
    }

    setFilteredRequests(filtered);
  }, [
    requests,
    chooseRequests,
    filterType,
    filterUrgency,
    selectedCategory,
    selectedStatus,
    searchTerm,
  ]);

  /**
   * Filter requests based on selected type and urgency
   * Returns filtered array of requests
   */
  /*const filteredRequests = requests.filter((request) => {
    let typeMatch = true;
    let urgencyMatch = true;

    if (filterType !== "all") {
      typeMatch = request.typeRequest === filterType;
    }

    if (filterUrgency !== "all") {
      urgencyMatch = request.urgency === filterUrgency;
    }

    return typeMatch && urgencyMatch;
  });*/
  /**
   * Delete a request by ID
   * Removes the request from the database and updates UI
   */
  const handleDeleteRequest = async (requestId: string) => {
    // Confirm deletion with user
    if (!window.confirm("Are you sure you want to delete this request?"))
      return;

    try {
      setDeleting(requestId);

      // Send DELETE request to API
      const response = await refreshUser(`${REQUEST_API_URL}/${requestId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete request");
      }

      // Update state by removing deleted request
      setRequests((prev) =>
        prev.filter((request) => request._id !== requestId)
      );
      setSelectedRequest(null);

      console.log("Request deleted successfully");
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading spinner while fetching data
  if (loading || loadingRequests) return <Loading />;

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
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {titleSet}
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    ({filteredRequests.length})
                  </span>
                </h1>
                <p className="text-gray-600">{t("dashboard.msgRequests")}</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChooseRequests("all");
                setTitleSet(t("dashboard.requests"));
              }}
              className={`flex items-center cursor-pointer gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all
    ${
      chooseRequests === "all"
        ? "bg-green-700 text-white shadow-xl"
        : "bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-xl"
    }`}
            >
              <List className="w-5 h-5" />
              {t("dashboard.allRequests")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChooseRequests("my");
                setTitleSet(t("dashboard.myRequests"));
              }}
              className={`flex items-center cursor-pointer gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all
    ${
      chooseRequests === "my"
        ? "bg-emerald-700 text-white shadow-xl"
        : "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:shadow-xl"
    }
  `}
            >
              <Folder className="w-5 h-5" />
              {t("dashboard.myRequests")}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/app/requests/create")}
              className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full md:w-auto justify-center md:justify-start"
            >
              <Plus className="w-5 h-5" />
              {t("dashboard.createRequest")}
            </motion.button>
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
              <h2 className="self-center font-semibold text-gray-700">
                Type :
              </h2>
              {/* Type Filter */}
              <div className="flex gap-2">
                {["all", "request", "alert"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 cursor-pointer rounded-lg font-semibold transition-all text-sm flex items-center gap-2 ${
                      filterType === type
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {type === "alert" && <Zap className="w-4 h-4" />}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

            {chooseRequests === "my" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 2 * 0.1 }}
                className="flex gap-2 flex-wrap flex-wrap col-span-3 lg:col-span-4"
              >
                <h2 className="self-center font-semibold text-gray-700">
                  Status :
                </h2>
                {/* Status Filter */}
                <div className="flex gap-2">
                  {[
                    "all",
                    "active",
                    "in_progress",
                    "completed",
                    "cancelled",
                  ].map((status) => (
                    <button
                      key={status}
                      onClick={() => setSelectedStatus(status)}
                      className={`px-3 py-2 cursor-pointer rounded-lg font-semibold transition-all text-sm ${
                        selectedStatus === status
                          ? "bg-blue-600 text-white shadow-lg"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() +
                        status.slice(1).replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 2 * 0.1 }}
              className="flex gap-2 flex-wrap flex-wrap col-span-3 lg:col-span-4"
            >
              <h2 className="self-center font-semibold text-gray-700">
                Urgency :
              </h2>
              {/* Urgency Filter */}
              <div className="flex gap-2">
                {["all", "low", "normal", "high"].map((urgency) => (
                  <button
                    key={urgency}
                    onClick={() => setFilterUrgency(urgency)}
                    className={`px-4 py-2 cursor-pointer rounded-lg font-semibold transition-all text-sm ${
                      filterUrgency === urgency
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Search */}
            {filteredRequests.length > 0 && (
              <>
                <div className="relative col-span-3 lg:col-span-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
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
          {/* Requests List - Takes 3/4 of space */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="lg:col-span-3 flex flex-col gap-4 min-h-0"
          >
            {/* Requests Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto"
            >
              <AnimatePresence>
                {filteredRequests.length === 0 ? (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    {chooseRequests &&
                    filterType === "all" &&
                    filterUrgency === "all" &&
                    selectedCategory === "all" &&
                    selectedStatus === "all" &&
                    !searchTerm ? (
                      <p className="text-gray-600">
                        {t("dashboard.noRequests")}
                      </p>
                    ) : (
                      <p className="text-gray-600">
                        {t("dashboard.noRequestsCriteria")}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  // Request Cards
                  filteredRequests.map((request) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="h-full cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedRequest(request)}
                      >
                        <div className="relative">
                          {/* SOS BADGE ABSOLUTE */}
                          {request.typeRequest === "alert" && (
                            <span className="absolute top-2 right-2 z-20 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded shadow-md">
                              🚨 SOS
                            </span>
                          )}
                          <CardContent className="px-4 md:px-6">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                              <div className="flex-1 w-full">
                                {/* Request Description */}
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {request.title}
                                  </h3>
                                </div>
                                <p className="text-gray-600 mb-3">
                                  {request.description}
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
                                        {request.category
                                          ? language === "de"
                                            ? request.category.nameDE ||
                                              request.category.name
                                            : request.category.name ||
                                              request.category.nameDE
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
                                        {request.rewardType === "paid"
                                          ? `$${request.price}`
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
                                        {request.location}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Rating */}
                                  {request.userId &&
                                    typeof request.userId !== "string" &&
                                    (request.userId as any)._id &&
                                    (request.userId as any).rating != null && (
                                      <div className="flex items-center gap-2">
                                        <div className="p-2 bg-yellow-100 rounded">
                                          <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-gray-500">
                                            {t("dashboard.rating")}
                                          </p>
                                          <p className="text-sm font-semibold text-gray-900">
                                            {(
                                              request.userId as any
                                            ).rating.toFixed(1)}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Calendar
                                    size={16}
                                    className="text-gray-400"
                                  />
                                  <span>{timeAgo(request.createdAt)}</span>
                                </div>

                                {/* Creator */}
                                <div className="flex items-center gap-2 text-gray-600 mt-2">
                                  <User size={16} className="text-gray-400" />
                                  <span>
                                    {(() => {
                                      const u = request.userId as any;
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
                                </div>
                              </div>

                              {/* Actions */}
                              {/*{typeof user?._id === "string" &&
                              user._id ===
                                (typeof request.userId === "string"
                                  ? request.userId
                                  : (request.userId as any) &&
                                    (request.userId as any)._id) && (
                                <div className="flex gap-2 ml-0 md:ml-4 w-full md:w-auto">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      navigate(
                                        `/app/requests/${request._id}/edit`
                                      )
                                    }
                                    className="flex-1 cursor-pointer md:flex-none p-2 hover:bg-blue-100 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-5 h-5 text-blue-600 mx-auto md:mx-0" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      handleDeleteRequest(request._id)
                                    }
                                    className="flex-1 cursor-pointer md:flex-none p-2 hover:bg-red-100 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600 mx-auto md:mx-0" />
                                  </motion.button>
                                </div>
                              )}*/}
                            </div>

                            <div className="flex items-center justify-between gap-4 mt-4">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(
                                  request.status
                                )}`}
                              >
                                {request.status}
                              </span>

                              {/* Urgency */}
                              <div className="flex items-center gap-2 text-gray-600">
                                <AlertCircle
                                  size={16}
                                  className={
                                    request.urgency === "high"
                                      ? "text-red-600"
                                      : request.urgency === "normal"
                                      ? "text-yellow-600"
                                      : "text-green-600"
                                  }
                                />
                                <span className="font-semibold capitalize">
                                  {request.urgency} {t("dashboard.urgency")}
                                </span>
                              </div>
                            </div>
                            {/* Action Buttons - Only show for user's own offers */}
                            {typeof user?._id === "string" &&
                              user._id ===
                                (typeof request.userId === "string"
                                  ? request.userId
                                  : (request.userId as any) &&
                                    (request.userId as any)._id) && (
                                <div className="flex gap-2 mt-5 pt-2 border-t">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                    }}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-semibold"
                                  >
                                    <Edit2 size={16} />
                                    {t("common.edit")}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteRequest(request._id);
                                    }}
                                    disabled={deleting === request._id}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold disabled:opacity-50"
                                  >
                                    <Trash2 size={16} />
                                    {deleting === request._id
                                      ? t("common.deleting")
                                      : t("common.delete")}
                                  </button>
                                </div>
                              )}
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Create Form Panel - Takes 1/4 of space */}

          {/* Selected Request Details - Takes 1/4 of space */}
          {selectedRequest && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 flex flex-col gap-4 min-h-0"
            >
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold text-gray-800">Request Details</h3>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-1 cursor-pointer hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Type */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.typeRequest")}
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {selectedRequest.typeRequest === "alert"
                        ? "🚨 SOS Alert"
                        : "Regular Request"}
                    </p>
                  </div>

                  {/* Title */}
                  {selectedRequest.typeRequest !== "alert" && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {t("dashboard.title")}
                      </p>
                      <p className="text-sm text-gray-800 font-semibold">
                        {selectedRequest.title}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.description")}
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedRequest.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.location")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedRequest.location}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.category")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedRequest.category?.name || "N/A"}
                    </p>
                  </div>

                  {/* Urgency */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.urgency")}
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedRequest.urgency === "high"
                          ? "bg-red-100 text-red-800"
                          : selectedRequest.urgency === "normal"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {selectedRequest.urgency.charAt(0).toUpperCase() +
                        selectedRequest.urgency.slice(1)}
                    </span>
                  </div>

                  {/* Price */}
                  {selectedRequest.rewardType === "paid" && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {t("dashboard.price")}
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        ${selectedRequest.price}
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
                        selectedRequest.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedRequest.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : selectedRequest.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedRequest.status}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {t("dashboard.createdAt")}
                    </p>
                    <p className="text-sm text-gray-800">
                      {timeAgo(selectedRequest.createdAt)}
                    </p>
                  </div>

                  {/* Images */}
                  {selectedRequest.images &&
                    selectedRequest.images.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          {t("dashboard.images")}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {selectedRequest.images.slice(0, 4).map((img, i) => (
                            <img
                              key={i}
                              src={img}
                              alt={`Request ${i + 1}`}
                              className="w-full h-20 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
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

export default Requests;
