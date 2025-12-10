import { useState, useEffect, useRef } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, OFFER_API_URL } from "../../config";
import type { Category, OfferProps } from "../../types";
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
  Handshake,
  Search,
  Clock,
  List,
  Folder,
  FilePlus2,
  PauseCircle,
  Archive,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { timeAgo } from "../../lib";
import { useLocation } from "react-router";

/**
 * Offers Component
 * Displays all available offers with filtering, sorting, and management features
 * Includes inline modal for creating new offers
 */
const Offers = () => {
  const { user, refreshUser, loading } = useAuth();
  const { t, language } = useLanguage();

  const location = useLocation();
  const selectedId = location.state?.selectedOfferId || null;
  const id = selectedId;

  console.log("je recois ", id);
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.successMessage
  );
  const [selectedCare, setSelectedCare] = useState<OfferProps | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [option, setOption] = useState<"show" | "create" | "edit">("show");

  // State management
  const [offers, setOffers] = useState<OfferProps[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [titleSet, setTitleSet] = useState<string>(t("dashboard.offers"));
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [chooseOffers, setChooseOffers] = useState<string>("all");

  const [, setSelectedOffer] = useState<OfferProps | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [itemToAction, setItemToAction] = useState<OfferProps | null>(null);
  /**
   * Fetch all offers from the API
   * Called on component mount and when user data is loaded
   */
  useEffect(() => {
    if (loading) return;

    const fetchOffers = async () => {
      try {
        // Make API request to get all offers
        const response = await fetch(`${OFFER_API_URL}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();

        // Update state with fetched offers
        if (data.offers) {
          setOffers(data.offers);
        }
      } catch (error) {
        console.error("Error fetching offers:", error);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
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
    let filtered = offers;
    if (chooseOffers === "all") {
      filtered = filtered.filter((offer: OfferProps) => {
        const offerUserId =
          typeof offer.userId === "string"
            ? offer.userId
            : (offer.userId as any)?._id;
        return offer.status === "active" && offerUserId !== user?._id;
      });
    } else {
      filtered = filtered.filter((offer: OfferProps) => {
        const offerUserId =
          typeof offer.userId === "string"
            ? offer.userId
            : (offer.userId as any)?._id;
        return offerUserId === user?._id;
      });
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((offer) => {
        const cat = offer.category;
        if (!cat) return false;
        if (typeof cat === "string") return cat === selectedCategory;
        return (cat as Category)._id === selectedCategory;
      });
    }

    if (chooseOffers === "my") {
      filtered = filtered.filter((offer) => {
        const offerUserId =
          typeof offer.userId === "string"
            ? offer.userId
            : (offer.userId as any)?._id;
        return offerUserId === user?._id;
      });
    } else {
      filtered = filtered.filter((offer) => {
        const offerStatus = offer.status;
        return ["active"].includes(offerStatus);
      });
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((offer) => offer.status === selectedStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          offer.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredOffers(filtered);
  }, [offers, chooseOffers, selectedCategory, selectedStatus, searchTerm]);

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

  useEffect(() => {
    if (!id || offers.length === 0) return;
    console.log("Looking for offer with ID from URL:", id);
    const found = offers.find((offer) => offer._id === id);
    if (!found) return;

    console.log("Found offer for ID from URL:", found);
    setSelectedCare(found);
    setOption("show");
    setIsModalOpen(true);

    // ✅ FORCE l'ouverture du dialog
    setTimeout(() => {
      dialogRef.current?.showModal();
    }, 0);
  }, [id, offers]);

  const openModal = (
    e: OfferProps | null = null,
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

  const handleAction = (newCare: OfferProps | any, option?: string | null) => {
    if (option === "edit") {
      setOffers((prev) =>
        prev.map((offer) =>
          offer._id === newCare._id ? (newCare as OfferProps) : offer
        )
      );
      setSuccessMessage(t("dashboard.updateOfferConfirm"));
      setChooseOffers("my");

      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    } else {
      if ("isPaid" in newCare) {
        setOffers((prev) => [newCare as OfferProps, ...prev]);
      }
      setSuccessMessage(t("dashboard.updateOfferConfirm"));
      setChooseOffers("my");

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
   * Filter offers based on selected status
   * Returns filtered array of offers
   */
  /*const filteredOffers_ = offers.filter((offer) => {
    if (filterStatus === "all") return true;
    return offer.status === filterStatus;
  });*/

  /**
   * Delete an offer by ID
   * Removes the offer from the database and updates UI
   */

  const getConfirmMsg = (action: string) => {
    if (action === "delete") {
      setConfirmMessage(t("alert.deleteOfferMessage"));
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    // Confirm deletion with user

    try {
      setDeleting(offerId);

      // Send DELETE request to API
      const response = await refreshUser(`${OFFER_API_URL}/${offerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete offer");
      }

      // Update state by removing deleted offer
      setOffers((prev) => prev.filter((offer) => offer._id !== offerId));
      setSelectedOffer(null);

      setSuccessMessage(t("dashboard.confirmDeleteOffer"));

      setChooseOffers("my");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("Failed to delete offer. Please try again.");
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

  // Show loading spinner while fetching data
  if (loading || loadingOffers) return <Loading />;

  console.log("Rendered Offers Component with offers:", offers);

  return (
    <>
      {successMessage && (
        <div
          role="alert"
          className="alert alert-info cursor-pointer hover:opacity-80 mb-4 transition"
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
                    <Handshake className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                      {titleSet}
                      <span className="ml-2 text-sm font-medium text-gray-500">
                        ({filteredOffers.length})
                      </span>
                    </h1>
                    <p className="text-sm md:text-md lg:text-lg text-gray-600">
                      {t("dashboard.msgOffers")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setChooseOffers("all");
                      setTitleSet(t("dashboard.offers"));
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm ${
                      chooseOffers === "all"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gradient-to-r from-gray-500 to-blue-500 text-white hover:shadow-lg"
                    }`}
                  >
                    <List className="w-5 h-5" />
                    {t("dashboard.allOffers")}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setChooseOffers("my");
                      setTitleSet(t("dashboard.myOffers"));
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm
            ${
              chooseOffers === "my"
                ? "bg-purple-600 text-white shadow-lg"
                : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-xl"
            }`}
                  >
                    <Folder className="w-5 h-5" />
                    {t("dashboard.myOffers")}
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
                  className="px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-semibold transition-all flex items-center gap-2 text-sm md:text-md lg:text-lg
                bg-linear-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  {t("dashboard.createOffer")}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 mb-6">
            {/* Filter Controls */}
            {chooseOffers === "my" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="col-span-3 lg:col-span-4 w-full"
              >
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
            {filteredOffers.length > 0 && (
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
        </div>

        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
          {/* Offers List - Takes 3/4 of space */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="lg:col-span-3 flex flex-col gap-4 min-h-0"
          >
            {/* Offers Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 overflow-y-auto"
            >
              <AnimatePresence>
                {filteredOffers.length === 0 ? (
                  // Empty State
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12"
                  >
                    {chooseOffers &&
                    selectedCategory === "all" &&
                    selectedStatus === "all" &&
                    !searchTerm ? (
                      <p className="text-gray-600">{t("dashboard.noOffers")}</p>
                    ) : (
                      <p className="text-gray-600">
                        {t("dashboard.noOffersCriteria")}
                      </p>
                    )}
                  </motion.div>
                ) : (
                  // Offer Cards
                  filteredOffers.map((offer) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="relative">
                        {getAuthorId(offer?.userId) === user?._id && (
                          <>
                            {/* BADGE STATUS */}
                            <span
                              className={`absolute top-2 right-2 z-20 px-2 py-1 bg-${
                                getFarbe(offer?.status).color
                              }-600 text-white text-xs font-bold rounded shadow-md`}
                            >
                              {getFarbe(offer?.status).icon}{" "}
                              {getFarbe(offer?.status).text}
                            </span>
                          </>
                        )}
                        <Card
                          className="h-full cursor-pointer hover:shadow-lg transition-all pt-0 pb-6"
                          onClick={() => openModal(offer)}
                        >
                          {offer.images && offer.images.length > 0 ? (
                            <div className="">
                              <figure>
                                <img
                                  src={offer.images[0]}
                                  alt={offer.title}
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
                                    alt={offer.title}
                                    className="w-full h-48 overflow-hidden flex items-center justify-center bg-gray-100 object-cover rounded"
                                  />
                                </figure>
                              </div>
                            </>
                          )}
                          <CardContent className="px-4 md:px-6">
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                              <div className="flex-1 w-full">
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {offer.title}
                                  </h3>
                                </div>
                                <p className="text-gray-600 mb-3">
                                  {offer.description}
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
                                        {offer.category
                                          ? language === "de"
                                            ? offer.category.nameDE ||
                                              offer.category.name
                                            : offer.category.name ||
                                              offer.category.nameDE
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
                                        {offer.isPaid
                                          ? `$${offer.price}`
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
                                        {offer.location}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Time */}
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <Clock size={16} className="text-gray-400" />
                                  <span>{timeAgo(offer.createdAt)}</span>
                                </div>

                                {(() => {
                                  const u = offer.userId as any;
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
                                (typeof offer.userId === "string"
                                  ? offer.userId
                                  : (offer.userId as any) &&
                                    (offer.userId as any)._id) && (
                                <div className="flex gap-2 mt-2 pt-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openModal(offer, "edit");
                                    }}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-semibold"
                                  >
                                    <Edit2 size={16} />
                                    {t("common.edit")}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setItemToAction(offer);
                                      getConfirmMsg("delete");
                                      setShowConfirm(true);
                                    }}
                                    disabled={deleting === offer._id}
                                    className="flex-1 flex cursor-pointer items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold disabled:opacity-50"
                                  >
                                    <Trash2 size={16} />
                                    {deleting === offer._id
                                      ? t("common.deleting")
                                      : t("common.delete")}
                                  </button>
                                </div>
                              )}
                          </CardContent>
                        </Card>
                        {showConfirm && (
                          <ConfirmModal
                            title={t("dashboard.confirmTitle")}
                            message={confirmMessage}
                            onConfirm={() => {
                              handleDeleteOffer(itemToAction?._id || "");
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
        </div>
      </div>

      <CareModal
        dialogRef={dialogRef}
        selectedCare={selectedCare}
        option={option}
        setOption={setOption}
        handleAction={handleAction}
        isModalOpen={isModalOpen}
        closeModal={closeModal}
      />
    </>
  );
};

export default Offers;
