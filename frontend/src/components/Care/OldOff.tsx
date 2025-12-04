import { useEffect, useState } from "react";

import { motion, AnimatePresence } from "framer-motion";
import {
  Handshake,
  MapPin,
  Clock,
  DollarSign,
  Trash2,
  Edit2,
  Star,
  Plus,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router";

import type { Category, OfferProps } from "../../types";
import { useAuth, useLanguage } from "../../contexts";
import { CATEGORIE_API_URL, OFFER_API_URL } from "../../config";
import Loading from "../Landing/Loading";
import { Card, CardContent } from "../ui/card";
import { timeAgo } from "../../lib";

const Offers = () => {
  const { loading, refreshUser } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();

  const [offers, setOffers] = useState<OfferProps[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<OfferProps[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Fetch user's offers
  useEffect(() => {
    if (loading) return;

    const fetchOffers = async () => {
      try {
        const response = await refreshUser(`${OFFER_API_URL}/myOffers`);
        if (!response.ok) throw new Error("Failed to fetch offers");
        const data = await response.json();
        setOffers(data.offers || []);
        setFilteredOffers(data.offers || []);
      } catch (error) {
        console.error("Error fetching offers:", error);
        setOffers([]);
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffers();
  }, [loading, refreshUser]);

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

  const handleDeleteOffer = async (offerId: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;

    try {
      const response = await refreshUser(`${OFFER_API_URL}/${offerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setOffers(offers.filter((offer) => offer._id !== offerId));
      }
    } catch (error) {
      console.error("Error deleting offer:", error);
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

  if (loading || loadingOffers) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Handshake className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {t("dashboard.offers")}
                </h1>
                <p className="text-gray-600">{filteredOffers.length} total</p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/app/offers/create")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full md:w-auto justify-center md:justify-start"
            >
              <Plus className="w-5 h-5" />
              Create New
            </motion.button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
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

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </motion.div>

        {/* Offers List */}
        <AnimatePresence>
          {filteredOffers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12 bg-white rounded-lg shadow"
            >
              <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No offers found</p>
            </motion.div>
          ) : (
            <div className="grid gap-4">
              {filteredOffers.map((offer, index) => (
                <motion.div
                  key={offer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-all">
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                        <div className="flex-1 w-full">
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {offer.title}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${getStatusColor(
                                offer.status
                              )}`}
                            >
                              {offer.status}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">
                            {offer.description}
                          </p>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
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

                              {/* Price */}
                              <div className="flex items-center gap-2">
                                <div className="p-2 bg-green-100 rounded">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Price</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {offer.isPaid ? `$${offer.price}` : "Free"}
                                  </p>
                                </div>
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
                                      {(offer.userId as any).rating.toFixed(1)}
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
                        </div>

                        {/* Actions */}
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Offers;
