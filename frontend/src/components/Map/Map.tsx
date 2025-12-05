import { useEffect, useState } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { OFFER_API_URL, REQUEST_API_URL } from "../../config";
import type { OfferProps, RequestProps } from "../../types";
import { Card, CardContent, Loading } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Handshake, FilePlus2, Zap, X, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { map } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet marker icons
/*delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});*/
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const Map = () => {
  const { user, refreshUser, loading } = useAuth();
  const { t } = useLanguage();

  // State management
  const [offers, setOffers] = useState<OfferProps[]>([]);
  const [requests, setRequests] = useState<RequestProps[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "offers" | "requests">(
    "all"
  );
  const [selectedItem, setSelectedItem] = useState<
    OfferProps | RequestProps | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number]>([51.505, -0.09]);
  const [showDetails, setShowDetails] = useState(true);

  // Fetch offers and requests
  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      try {
        const [offersRes, requestsRes] = await Promise.all([
          refreshUser(`${OFFER_API_URL}`),
          refreshUser(`${REQUEST_API_URL}`),
        ]);

        const offersData = await offersRes.json();
        const requestsData = await requestsRes.json();

        setOffers(offersData.offers || []);
        setRequests(requestsData.requests || []);

        // Set map center to user location if available
        if (user && user.latitude && user.longitude) {
          setMapCenter([user.latitude, user.longitude]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [loading]);

  // Filter items
  const getFilteredItems = () => {
    let items: (OfferProps | RequestProps)[] = [];

    if (filterType === "all" || filterType === "offers") {
      items = [...items, ...offers];
    }

    if (filterType === "all" || filterType === "requests") {
      items = [...items, ...requests];
    }

    return items.filter((item) => {
      const title = "title" in item && item.title ? item.title : "SOS Alert";
      const description =
        "description" in item && item.description ? item.description : "";
      const q = searchQuery.toLowerCase();
      return (
        title.toLowerCase().includes(q) || description.toLowerCase().includes(q)
      );
    });
  };

  const filteredItems = getFilteredItems();

  // Determine if item is offer or request
  const isOffer = (item: OfferProps | RequestProps): item is OfferProps => {
    return "rewardType" in item && !("typeRequest" in item);
  };

  // Get custom marker icon

  const getMarkerIcon = (item: OfferProps | RequestProps) => {
    const isOfferItem = isOffer(item);
    const isSOS = !isOfferItem && item.typeRequest === "alert";

    const url = isSOS
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png"
      : isOfferItem
      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png"
      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";

    return new L.Icon({
      iconUrl: url,
      shadowUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  if (loading || loadingData) return <Loading />;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-3xl font-bold text-gray-800">
          {t("dashboard.browseMap")}
        </h1>
        <p className="text-gray-600">
          {t("dashboard.exploreHelpOffersAndRequests")} ({filteredItems.length})
        </p>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex gap-3 flex-wrap items-center"
      >
        {/* Search */}
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Type Filter */}
        <div className="flex gap-2">
          {["all", "offers", "requests"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                filterType === type
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type === "offers" && <Handshake className="w-4 h-4" />}
              {type === "requests" && <FilePlus2 className="w-4 h-4" />}
              {type === "all" && "All"}
              {type !== "all" && (type === "offers" ? "Offers" : "Requests")}
            </button>
          ))}
        </div>

        {/* Toggle Details */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
        >
          {showDetails ? "Hide" : "Show"} Details
        </button>
      </motion.div>

      {/* Map and Details Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Map - Takes 3/4 of space */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-3 rounded-xl overflow-hidden shadow-lg"
        >
          <Card className="h-full">
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />

              {/* User Location */}
              {user && user.latitude && user.longitude && (
                <Marker position={[user.latitude, user.longitude]}>
                  <Popup>
                    <div className="text-sm">
                      <p className="font-bold">Your Location</p>
                      <p className="text-gray-600">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Items Markers */}
              {filteredItems.map((item) => (
                <Marker
                  key={item._id}
                  position={[item.latitude, item.longitude]}
                  icon={getMarkerIcon(item)}
                  eventHandlers={{
                    click: () => setSelectedItem(item),
                  }}
                >
                  <Popup>
                    <div className="text-sm max-w-xs">
                      <p className="font-bold">
                        {isOffer(item) ? item.title : "SOS Alert"}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {item.description.substring(0, 50)}...
                      </p>
                      {isOffer(item) &&
                        (item.isPaid || (item.price && item.price > 0)) && (
                          <p className="text-green-600 font-semibold mt-1">
                            ${item.price}
                          </p>
                        )}
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </motion.div>

        {/* Details Panel - Takes 1/4 of space */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="lg:col-span-1 flex flex-col gap-4 min-h-0"
          >
            {/* Selected Item Details */}
            {selectedItem ? (
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-4 flex-1 overflow-y-auto">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isOffer(selectedItem) ? "bg-blue-100" : "bg-green-100"
                      }`}
                    >
                      {isOffer(selectedItem) ? (
                        <Handshake className="w-5 h-5 text-blue-600" />
                      ) : (
                        <FilePlus2 className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {isOffer(selectedItem)
                          ? selectedItem.title
                          : "SOS Alert"}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        {isOffer(selectedItem) ? "Offer" : "Request"}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-xs mb-4 line-clamp-3">
                    {selectedItem.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-3 border-t pt-3">
                    {/* Location */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Location
                      </p>
                      <p className="text-xs text-gray-800 line-clamp-2">
                        {selectedItem.location}
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        Category
                      </p>
                      <p className="text-xs text-gray-800">
                        {selectedItem.category?.name || "N/A"}
                      </p>
                    </div>

                    {/* Price */}
                    {isOffer(selectedItem) &&
                      (selectedItem.isPaid ||
                        (selectedItem.price && selectedItem.price > 0)) && (
                        <div>
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            Price
                          </p>
                          <p className="text-xs font-bold text-green-600">
                            ${selectedItem.price}
                          </p>
                        </div>
                      )}

                    {/* SOS Badge */}
                    {!isOffer(selectedItem) &&
                      "typeRequest" in selectedItem &&
                      selectedItem.typeRequest === "alert" && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          SOS Alert
                        </div>
                      )}
                  </div>

                  {/* Images */}
                  {selectedItem.images && selectedItem.images.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">
                        Images
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedItem.images.slice(0, 4).map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Item ${i + 1}`}
                            className="w-full h-16 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <MapPin className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    Click on a marker to view details
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Items List */}
            <Card className="flex-1 overflow-hidden flex flex-col">
              <CardContent className="p-3 flex-1 overflow-y-auto">
                <p className="text-xs font-medium text-gray-600 mb-2">
                  Items ({filteredItems.length})
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {filteredItems.length > 0 ? (
                      filteredItems.slice(0, 10).map((item) => {
                        const isOfferItem = isOffer(item);
                        const title = isOfferItem ? item.title : "SOS Alert";

                        return (
                          <motion.button
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left p-2 rounded-lg transition-all text-xs ${
                              selectedItem?._id === item._id
                                ? "bg-blue-100 border-2 border-blue-600"
                                : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                            }`}
                          >
                            <p className="font-semibold text-gray-800 truncate">
                              {title}
                            </p>
                            <p className="text-gray-600 truncate">
                              {item.location}
                            </p>
                          </motion.button>
                        );
                      })
                    ) : (
                      <p className="text-center text-gray-500 text-xs py-4">
                        No items found
                      </p>
                    )}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Map;
