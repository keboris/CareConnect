import { useState, useEffect, useRef } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, REQUEST_API_URL } from "../../config";
import type { Category, RequestProps } from "../../types";
import {
  Card,
  CardContent,
  CareModal,
  ConfirmModal,
  Loading,
} from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  Edit2,
  MapPin,
  DollarSign,
  User,
  Plus,
  X,
  Search,
  Zap,
  Calendar,
  List,
  Folder,
  FilePlus2,
  Archive,
  PauseCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { timeAgo } from "../../lib";
import { useLocation } from "react-router";

/**
 * Requests Component
 * Displays all available requests with filtering, sorting, and management features
 * Includes inline modal for creating new requests
 */
const Requests = ({ page }: { page: "request" | "alert" }) => {
  const { user, refreshUser, loading } = useAuth();
  const { t, language } = useLanguage();

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.successMessage
  );
  const [selectedCare, setSelectedCare] = useState<RequestProps | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [option, setOption] = useState<"show" | "create" | "edit">("show");

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

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [itemToAction, setItemToAction] = useState<RequestProps | null>(null);
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
          if (page === "alert") {
            setRequests(
              data.requests.filter(
                (req: RequestProps) => req.typeRequest === "alert"
              )
            );
            setTitleSet(t("dashboard.alerts"));
          } else {
            setRequests(
              data.requests.filter(
                (req: RequestProps) => req.typeRequest === "request"
              )
            );
            setTitleSet(t("dashboard.requests"));
          }
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
    if (chooseRequests === "all") {
      filtered = filtered.filter((request: RequestProps) => {
        const requestUserId =
          typeof request.userId === "string"
            ? request.userId
            : (request.userId as any)?._id;
        return request.status === "active" && requestUserId !== user?._id;
      });
    } else {
      filtered = filtered.filter((request: RequestProps) => {
        const requestUserId =
          typeof request.userId === "string"
            ? request.userId
            : (request.userId as any)?._id;
        return requestUserId === user?._id;
      });
    }

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

    // ERROR A REVOIR
    setFilterType(filterType);
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

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isModalOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!isModalOpen && dialog.open) {
      dialog.close();
    }
  }, [isModalOpen, dialogRef]);

  const openModal = (
    e: RequestProps | null = null,
    modalOption: "show" | "edit" | "create" = "show"
  ): void => {
    setSelectedCare(e);
    setOption(modalOption);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCare(null);
  };

  const handleAction = (
    newCare: RequestProps | any,
    option?: string | null
  ) => {
    if (option === "edit") {
      setRequests((prev) =>
        prev.map((request) => (request._id === newCare._id ? newCare : request))
      );

      if (page === "alert" && newCare.typeRequest === "alert")
        setSuccessMessage(t("dashboard.editAlertConfirm"));
      if (page === "request" && newCare.typeRequest === "request")
        setSuccessMessage(t("dashboard.editRequestConfirm"));
      setChooseRequests("my");

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else {
      setRequests((prev) => [newCare, ...prev]);

      if (page === "alert" && newCare.typeRequest === "alert")
        setSuccessMessage(t("dashboard.createAlertConfirm"));
      if (page === "request" && newCare.typeRequest === "request")
        setSuccessMessage(t("dashboard.createRequestConfirm"));
      setChooseRequests("my");

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [successMessage]);
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

  const getConfirmMsg = (action: string) => {
    if (action === "delete") {
      if (page === "request")
        setConfirmMessage(t("alert.deleteRequestMessage"));
      else if (page === "alert")
        setConfirmMessage(t("alert.deleteAlertMessage"));
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    // Confirm deletion with user

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

      if (page === "request")
        setSuccessMessage(t("dashboard.confirmDeleteRequest"));
      else if (page === "alert")
        setSuccessMessage(t("dashboard.confirmDeleteAlert"));

      setChooseRequests("my");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error deleting request:", error);
      alert("Failed to delete request. Please try again.");
    } finally {
      setDeleting(null);
      setShowConfirm(false);
      setConfirmMessage("");
      setItemToAction(null);
    }
  };

  const getAuthorId = (userField: any) =>
    typeof userField === "string" ? userField : userField?._id;

  const getStatusProps = (status: string, isActive: boolean) => {
    switch (status) {
      case "active":
        return {
          icon: (
            <Zap
              className={`w-4 h-4 ${
                isActive ? "text-white" : "text-green-600"
              }`}
            />
          ),
          color: isActive ? "bg-green-800 text-white" : "bg-green-100",
        };
      case "in_progress":
        return {
          icon: (
            <Loader2
              className={`w-4 h-4 ${
                isActive ? " text-white" : "text-yellow-600"
              }`}
            />
          ),
          color: isActive ? "bg-yellow-800 text-white" : "bg-yellow-100",
        };
      case "cancelled":
        return {
          icon: (
            <XCircle
              className={`w-4 h-4 ${isActive ? "text-white" : "text-red-600"}`}
            />
          ),
          color: isActive ? "bg-red-800 text-white" : "bg-red-100",
        };
      case "completed":
        return {
          icon: (
            <CheckCircle
              className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-600"}`}
            />
          ),
          color: isActive ? "bg-blue-800 text-white" : "bg-blue-100",
        };
      case "inactive":
        return {
          icon: (
            <PauseCircle
              className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600"}`}
            />
          ),
          color: isActive ? "bg-gray-800 text-white" : "bg-gray-100",
        };
      case "archived":
        return {
          icon: (
            <Archive
              className={`w-4 h-4 ${
                isActive ? "text-white" : "text-purple-600"
              }`}
            />
          ),
          color: isActive ? "bg-purple-800 text-white" : "bg-purple-100",
        };
      default:
        return {
          icon: (
            <FilePlus2
              className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-700"}`}
            />
          ),
          color: isActive ? "bg-gray-800 text-white" : "bg-gray-100",
        };
    }
  };

  const colorset = page === "alert" ? "red" : "green";
  const setC = page === "alert" ? "error" : "success";

  const getFarbe = (status: string) => {
    switch (status) {
      case "active":
        return { icon: "🟢", color: "green", text: "Active" };
      case "in_progress":
        return { icon: "🟡", color: "yellow", text: "In Progress" };
      case "completed":
        return { icon: "🔵", color: "blue", text: "Completed" };
      case "cancelled":
        return { icon: "🔴", color: "red", text: "Cancelled" };
      case "inactive":
        return { icon: "⚪", color: "gray", text: "Inactive" };
      case "archived":
        return { icon: "🟣", color: "purple", text: "Archived" };
      default:
        return { icon: "⚪", color: "gray", text: "Unknown" };
    }
  };

  console.log("Filtered Requests:", requests);
  // Show loading spinner while fetching data
  if (loading || loadingRequests) return <Loading />;

  return (
    <>
      {successMessage && (
        <div
          role="alert"
          className={`alert alert-${setC} cursor-pointer hover:opacity-80 mb-4 transition`}
          onClick={() => setSuccessMessage(null)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{successMessage}</span>
          <div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="btn btn-sm cursor-pointer btn-ghost btn-circle"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col gap-4 ">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {page === "alert" ? (
                      <Zap className="w-6 h-6 text-red-600" />
                    ) : (
                      <FilePlus2 className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {titleSet}
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        ({filteredRequests.length})
                      </span>
                    </h1>
                    <p className="text-sm md:text-md lg:text-lg text-gray-600">
                      {page === "alert"
                        ? t("dashboard.msgAlerts")
                        : t("dashboard.msgRequests")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setChooseRequests("all");
                      {
                        page === "alert"
                          ? setTitleSet(t("dashboard.alerts"))
                          : setTitleSet(t("dashboard.requests"));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm ${
                      chooseRequests === "all"
                        ? `bg-${colorset}-600 text-white shadow-xl`
                        : `bg-${colorset}-100 hover:shadow-xl`
                    }`}
                  >
                    <List className="w-5 h-5" />
                    {page === "alert"
                      ? t("dashboard.allAlerts")
                      : t("dashboard.allRequests")}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setChooseRequests("my");
                      {
                        page === "alert"
                          ? setTitleSet(t("dashboard.myAlerts"))
                          : setTitleSet(t("dashboard.myRequests"));
                      }
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm
            ${
              chooseRequests === "my"
                ? `bg-${colorset}-600 text-white shadow-xl`
                : `bg-${colorset}-100 hover:shadow-xl`
            }
  `}
                  >
                    <Folder className="w-5 h-5" />
                    {page === "alert"
                      ? t("dashboard.myAlerts")
                      : t("dashboard.myRequests")}
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-4 flex-wrap justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    openModal(null);
                    setOption("create");
                  }}
                  className={`px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm md:text-md lg:text-lg
                bg-${colorset}-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all`}
                >
                  <Plus className="w-5 h-5" />
                  {page === "alert"
                    ? t("dashboard.createAlert")
                    : t("dashboard.createRequest")}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 mb-6">
            {/* Filter Controls */}
            {chooseRequests === "my" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 2 * 0.1 }}
                className="col-span-3 lg:col-span-4 w-full"
              >
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2 items-center justify-start">
                  {[
                    "active",
                    "in_progress",
                    "completed",
                    "cancelled",
                    "inactive",
                    "archived",
                    "all",
                  ].map((status) => {
                    const isActive = selectedStatus === status;
                    const { icon, color } = getStatusProps(status, isActive);

                    return (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`flex items-center gap-2
              rounded-lg cursor-pointer font-medium
              transition-all whitespace-nowrap px-2 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm  md:px-4 md:py-2 md:text-sm ${color} hover:opacity-80`}
                      >
                        {icon}
                        {t(`status.${status}`) ||
                          status.charAt(0).toUpperCase() +
                            status.slice(1).replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Search */}

            {/* Urgency Filter */}
            <div className="col-span-3 lg:col-span4 w-full">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 2 * 0.1 }}
                className="flex gap-2 flex-wrap"
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
                          ? `bg-${colorset}-600 text-white shadow-lg`
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>

            <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full items-center">
              <div className="relative w-full lg:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-${colorset}-500`}
                />
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full
        px-4 py-2
        border border-gray-300 rounded-lg
        focus:outline-none focus:ring-2 focus:ring-${colorset}-500"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {language === "de" ? cat.nameDE : cat.name}
                  </option>
                ))}
              </select>

              <div></div>
            </div>
          </div>
        </div>

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
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        {getAuthorId(request?.userId) === user?._id && (
                          <>
                            {/* BADGE STATUS */}
                            <span
                              className={`absolute top-2 right-2 z-20 px-2 py-1 bg-${
                                getFarbe(request?.status).color
                              }-600 text-white text-xs font-bold rounded shadow-md`}
                            >
                              {getFarbe(request?.status).icon}{" "}
                              {getFarbe(request?.status).text}
                            </span>
                          </>
                        )}
                        <Card
                          className="h-full cursor-pointer hover:shadow-lg transition-all pt-0 pb-6"
                          onClick={() => openModal(request)}
                        >
                          {request.images && request.images.length > 0 ? (
                            <div className="">
                              <figure>
                                <img
                                  src={request.images[0]}
                                  alt={request.title}
                                  className="w-full h-48 overflow-hidden flex items-center justify-center bg-gray-100 object-cover rounded"
                                />
                              </figure>
                            </div>
                          ) : (
                            <>
                              {/*<div className="mb-6"></div>*/}
                              <div className="">
                                <figure>
                                  <img
                                    src="../logo.png"
                                    alt={request.title}
                                    className="w-full h-48 overflow-hidden flex items-center justify-center bg-gray-100 object-cover rounded"
                                  />
                                </figure>
                              </div>
                            </>
                          )}
                          <div className="relative">
                            {/* SOS BADGE ABSOLUTE */}
                            {page === "alert" && (
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
                                        <Folder className="w-4 h-4 text-blue-600" />
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
                                  </div>

                                  {/* Time */}
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar
                                      size={16}
                                      className="text-gray-400"
                                    />
                                    <span>{timeAgo(request.createdAt)}</span>
                                  </div>

                                  {(() => {
                                    const u = request.userId as any;
                                    let name = "Unknown";
                                    if (u && typeof u === "object") {
                                      if (u._id === user?._id) name = "You";
                                      else {
                                        const first = u.firstName ?? name;
                                        const last = u.lastName
                                          ? ` ${u.lastName}`
                                          : "";
                                        name = `${first}${last}`;
                                      }
                                    }
                                    if (name === "Unknown" || name === "You")
                                      return null;
                                    return (
                                      <>
                                        {/* Creator */}
                                        <div className="flex items-center gap-2 text-gray-600 mt-2">
                                          <User
                                            size={16}
                                            className="text-gray-400"
                                          />
                                          <span>{name}</span>
                                        </div>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Action Buttons - Only show for user's own offers */}
                              {typeof user?._id === "string" &&
                                user._id ===
                                  (typeof request.userId === "string"
                                    ? request.userId
                                    : (request.userId as any) &&
                                      (request.userId as any)._id) && (
                                  <div className="flex gap-2 mt-2 pt-2">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openModal(request, "edit");
                                      }}
                                      className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-semibold"
                                    >
                                      <Edit2 size={16} />
                                      {t("common.edit")}
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setItemToAction(request);
                                        getConfirmMsg("delete");
                                        setShowConfirm(true);
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
                        {showConfirm && (
                          <ConfirmModal
                            title={t("dashboard.confirmTitle")}
                            message={confirmMessage}
                            onConfirm={() => {
                              handleDeleteRequest(itemToAction?._id || "");
                            }}
                            onCancel={() => setShowConfirm(false)}
                          />
                        )}
                      </div>
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

      <CareModal
        dialogRef={dialogRef}
        selectedCare={selectedCare}
        option={option}
        setOption={setOption}
        page={page}
        handleAction={handleAction}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
      />
    </>
  );
};

export default Requests;
