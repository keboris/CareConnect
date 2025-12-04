import { useState, useEffect } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, OFFER_API_URL } from "../../config";
import type { Category, OfferProps } from "../../types";
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
  Clock,
  Star,
} from "lucide-react";
import { timeAgo } from "../../lib";
import { useNavigate } from "react-router";

/**
 * Offers Component
 * Displays all available offers with filtering, sorting, and management features
 * Includes inline modal for creating new offers
 */
const Offers = () => {
  const { user, refreshUser, loading } = useAuth();
  const { t, language } = useLanguage();

  const navigate = useNavigate();
  // State management
  const [offers, setOffers] = useState<OfferProps[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [selectedOffer, setSelectedOffer] = useState<OfferProps | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

    if (selectedCategory !== "all") {
      filtered = filtered.filter((offer) => {
        const cat = offer.category;
        if (!cat) return false;
        if (typeof cat === "string") return cat === selectedCategory;
        return (cat as Category)._id === selectedCategory;
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
  }, [offers, selectedCategory, selectedStatus, searchTerm]);

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
  const handleDeleteOffer = async (offerId: string) => {
    // Confirm deletion with user
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

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

      console.log("Offer deleted successfully");
    } catch (error) {
      console.error("Error deleting offer:", error);
      alert("Failed to delete offer. Please try again.");
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
  if (loading || loadingOffers) return <Loading />;

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
                  {t("dashboard.offers")}
                  <span className="ml-2 text-sm font-medium text-gray-500">
                    ({filteredOffers.length})
                  </span>
                </h1>
                <p className="text-gray-600">
                  Browse and manage available offers in your community
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/app/offers/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full md:w-auto justify-center md:justify-start"
            >
              <Plus className="w-5 h-5" />
              Create Offer
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
              {["all", "active", "in_progress", "completed", "cancelled"].map(
                (status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-2 rounded-lg font-semibold transition-all text-sm ${
                      selectedStatus === status
                        ? "bg-blue-600 text-white shadow-lg"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace(/_/g, " ")}
                  </button>
                )
              )}
            </motion.div>
            {/* Search */}
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
          </div>
        </motion.div>

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
                  ></motion.div>
                ) : (
                  // Offer Cards
                  filteredOffers.map((offer) => (
                    <motion.div
                      key={offer._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card
                        className="h-full cursor-pointer hover:shadow-lg transition-all"
                        onClick={() => setSelectedOffer(offer)}
                      >
                        <CardContent className="p-4 md:p-6">
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
                                    <Handshake className="w-4 h-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">
                                      Category
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
                                      Price
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {offer.isPaid
                                        ? `$${offer.price}`
                                        : "Free"}
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
                                      Location
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                      {offer.location}
                                    </p>
                                  </div>
                                </div>

                                {/* Rating */}
                                {offer.userId &&
                                  typeof offer.userId !== "string" &&
                                  (offer.userId as any).rating != null && (
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 bg-yellow-100 rounded">
                                        <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-500">
                                          Rating
                                        </p>
                                        <p className="text-sm font-semibold text-gray-900">
                                          {(offer.userId as any).rating.toFixed(
                                            1
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                              </div>

                              {/* Time */}
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Clock className="w-4 h-4" />
                                {timeAgo(offer.createdAt)}
                              </div>

                              {/* Creator */}
                              <div className="flex items-center gap-2 text-gray-600 mt-2">
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
                              </div>
                            </div>
                            {/* Action Buttons - Only show for user's own offers */}
                            {user?._id === offer.userId && (
                              <div className="flex gap-2 pt-2 border-t">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all text-sm font-semibold"
                                >
                                  <Edit2 size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteOffer(offer._id);
                                  }}
                                  disabled={deleting === offer._id}
                                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all text-sm font-semibold disabled:opacity-50"
                                >
                                  <Trash2 size={16} />
                                  {deleting === offer._id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </div>
                            )}
                            {/* Actions */}
                            {typeof user?._id === "string" &&
                              user._id === offer.userId.toString() && (
                                <div className="flex gap-2 ml-0 md:ml-4 w-full md:w-auto">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() =>
                                      navigate(`/app/offers/${offer._id}/edit`)
                                    }
                                    className="flex-1 md:flex-none p-2 hover:bg-blue-100 rounded-lg transition-all"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-5 h-5 text-blue-600 mx-auto md:mx-0" />
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteOffer(offer._id)}
                                    className="flex-1 md:flex-none p-2 hover:bg-red-100 rounded-lg transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-5 h-5 text-red-600 mx-auto md:mx-0" />
                                  </motion.button>
                                </div>
                              )}
                          </div>
                          <div className="mt-4">
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(
                                offer.status
                              )}`}
                            >
                              {offer.status}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Create Form Panel - Takes 1/4 of space */}

          {/* Selected Offer Details - Takes 1/4 of space */}
          {selectedOffer && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-1 flex flex-col gap-4 min-h-0"
            >
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-bold text-gray-800">Offer Details</h3>
                  <button
                    onClick={() => setSelectedOffer(null)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Title */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Title
                    </p>
                    <p className="text-sm text-gray-800 font-semibold">
                      {selectedOffer.title}
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Description
                    </p>
                    <p className="text-sm text-gray-700">
                      {selectedOffer.description}
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Location
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedOffer.location}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Category
                    </p>
                    <p className="text-sm text-gray-800">
                      {selectedOffer.category?.name || "N/A"}
                    </p>
                  </div>

                  {/* Price */}
                  {selectedOffer.isPaid && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Price
                      </p>
                      <p className="text-sm font-bold text-green-600">
                        ${selectedOffer.price}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Status
                    </p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedOffer.status === "active"
                          ? "bg-green-100 text-green-800"
                          : selectedOffer.status === "in_progress"
                          ? "bg-blue-100 text-blue-800"
                          : selectedOffer.status === "completed"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedOffer.status}
                    </span>
                  </div>

                  {/* Created Date */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Created
                    </p>
                    <p className="text-sm text-gray-800">
                      {timeAgo(selectedOffer.createdAt)}
                    </p>
                  </div>

                  {/* Images */}
                  {selectedOffer.images && selectedOffer.images.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Images
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedOffer.images.slice(0, 4).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Offer ${i + 1}`}
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

export default Offers;
