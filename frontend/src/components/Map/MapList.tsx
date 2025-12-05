import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import type { mapcenterProps, OfferProps, RequestProps } from "../../types";
import OrtMap from "./OrtMap";
import { useAuth, useLanguage } from "../../contexts";
import { OFFER_API_URL, REQUEST_API_URL } from "../../config";
import Loading from "../Landing/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FilePlus2,
  Handshake,
  MapPin,
  Search,
  SearchX,
  Users,
  Zap,
} from "lucide-react";
import MarkerLegend from "./MarkerLegend";

const MapList = () => {
  const { t } = useLanguage();
  const { user, refreshUser, loading } = useAuth();

  const [currentOrt, setCurrentOrt] = useState<
    OfferProps | RequestProps | null
  >(null);

  const [loadingData, setLoadingData] = useState(true);
  const [filterType, setFilterType] = useState<
    | "allActive"
    | "offers"
    | "requests"
    | "alerts"
    | "allUsers"
    | "myOffers"
    | "myRequests"
    | "myAlerts"
  >("allActive");

  const [mapCenter, setMapCenter] = useState<mapcenterProps | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [initialActiveOrts, setInitialActiveOrts] = useState<
    (OfferProps | RequestProps)[]
  >([]);

  const [allActiveOrts, setAllActiveOrts] = useState<
    (OfferProps | RequestProps)[]
  >([]);
  const [allUserOrts, setAllUserOrts] = useState<(OfferProps | RequestProps)[]>(
    []
  );

  const [ortsToSend, setOrtsToSend] = useState<(OfferProps | RequestProps)[]>(
    []
  );

  const [isClickedZoom, setIsClickedZoom] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    if (loading) return;

    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [offersRes, requestsRes] = await Promise.all([
          refreshUser(`${OFFER_API_URL}`),
          refreshUser(`${REQUEST_API_URL}`),
        ]);

        const dataO = await offersRes.json();
        const dataR = await requestsRes.json();

        // Normalize responses to arrays whether the API returns { offers: [...] } / { requests: [...] } or a plain array
        const offersArray: OfferProps[] =
          (dataO && (dataO as any).offers) ??
          (Array.isArray(dataO) ? (dataO as OfferProps[]) : []);

        const requestsArray: RequestProps[] =
          (dataR && (dataR as any).requests) ??
          (Array.isArray(dataR) ? (dataR as RequestProps[]) : []);

        // =============== USER OWN LISTS ===============
        const userDataO = offersArray.filter(
          (offer) => offer.userId._id === user?._id
        );
        const userDataR = requestsArray.filter(
          (request) => request.userId._id === user?._id
        );

        //setUserOffers(userDataO);
        //setUserRequests(userDataR);

        // =============== ACTIVE PUBLIC LISTS ===============
        const activeDataO = offersArray.filter(
          (item: OfferProps) =>
            item.status === "active" && item.userId._id !== user?._id
        );
        const activeDataR = requestsArray.filter(
          (item: RequestProps) =>
            item.status === "active" && item.userId._id !== user?._id
        );

        //setOffersActive(activeDataO);
        //setRequestsActive(activeDataR);

        // =============== MERGED LISTS ===============
        const mergedList = [
          ...userDataO,
          ...userDataR,
          ...activeDataO,
          ...activeDataR,
        ];

        const mergedActiveList = [...activeDataO, ...activeDataR];
        const mergeUserList = [...userDataO, ...userDataR];

        console.log("Merged List:", mergedList);
        setSearchQuery("");

        setAllActiveOrts(mergedActiveList);
        setInitialActiveOrts(mergedActiveList);
        setOrtsToSend(mergedActiveList);

        setAllUserOrts(mergeUserList);

        if (mergedList.length > 0) {
          setCurrentOrt(mergedActiveList[0]);

          setMapCenter({
            lat: (mergedActiveList[0] as any).latitude ?? 0,
            lng: (mergedActiveList[0] as any).longitude ?? 0,
          });
        } else {
          setCurrentOrt(null);
          setMapCenter(null);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [loading]);

  useEffect(() => {
    setIsClickedZoom(false);
    const filteredItems = getFilteredItems();
    setOrtsToSend(filteredItems);
  }, [filterType, searchQuery]);

  // Filter items
  const getFilteredItems = () => {
    let items: (OfferProps | RequestProps)[] = [];

    if (filterType === "allActive") items = [...items, ...allActiveOrts];
    else if (filterType === "offers") {
      items = [...items, ...allActiveOrts.filter((item) => "isPaid" in item)];
    } else if (filterType === "requests") {
      items = [
        ...items,
        ...allActiveOrts.filter(
          (item) => "typeRequest" in item && item.typeRequest === "request"
        ),
      ];
    } else if (filterType === "alerts") {
      items = [
        ...items,
        ...allActiveOrts.filter(
          (item) => "typeRequest" in item && item.typeRequest === "alert"
        ),
      ];
    } else if (filterType === "allUsers") items = [...items, ...allUserOrts];
    else if (filterType === "myOffers") {
      items = [...items, ...allUserOrts.filter((item) => "isPaid" in item)];
    } else if (filterType === "myRequests") {
      items = [
        ...items,
        ...allUserOrts.filter(
          (item) => "typeRequest" in item && item.typeRequest === "request"
        ),
      ];
    } else if (filterType === "myAlerts") {
      items = [
        ...items,
        ...allUserOrts.filter(
          (item) => "typeRequest" in item && item.typeRequest === "alert"
        ),
      ];
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
  const getOrtType = (item: OfferProps | RequestProps) => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    return "request";
  };

  /*const handleSearch = (
    e: FormEvent<HTMLFormElement> | ChangeEvent<HTMLInputElement>
  ) => {
    const isSubmit = e.type === "submit";
    if (isSubmit) (e as FormEvent).preventDefault();

    const query = isSubmit
      ? searchQuery
      : (e as ChangeEvent<HTMLInputElement>).target.value;

    if (!query.trim()) {
      setAllActiveOrts(allActiveOrts || []);
      return;
    }

    if (allActiveOrts && allActiveOrts.length > 0) {
      console.log("Filtering Orts with query:", query);
      const q = query.toLowerCase();
      const filtered = allActiveOrts.filter(
        (ort) =>
          (((ort as any).title ?? "") as string)
            .toString()
            .toLowerCase()
            .includes(q) ||
          (((ort as any).location ?? "") as string)
            .toString()
            .toLowerCase()
            .includes(q)
      ) as (OfferProps | RequestProps)[];
      setAllActiveOrts(filtered);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setAllActiveOrts(initialActiveOrts);
  };
*/

  const showOrt = (ort: OfferProps | RequestProps) => {
    setCurrentOrt(ort);
    const lat = (ort as any).latitude ?? (ort as any).lat ?? 0;
    const lng = (ort as any).longitude ?? (ort as any).lng ?? 0;
    setMapCenter({
      lat,
      lng,
    });
    setIsClickedZoom(true);
  };

  const getStatusColor = (item: any) => {
    const status = item.status; // 'active', 'in_progress', 'completed', 'cancelled', 'archived'

    const isOffer = "isPaid" in item;
    const isRequest = "typeRequest" in item && item.typeRequest === "request";
    const isAlert = "typeRequest" in item && item.typeRequest === "alert";

    if (status === "completed") return "bg-violet-500";
    if (status === "cancelled") return "bg-black";
    if (status === "archived") return "bg-gray-400";
    if (status === "in_progress") return "bg-orange-500";

    // Active / default
    if (isOffer) return "bg-blue-500";
    if (isRequest) return "bg-green-500";
    if (isAlert) return "bg-red-500";

    return "bg-gray-400"; // fallback
  };

  if (loading || loadingData) return <Loading />;

  return (
    <>
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
            {t("dashboard.exploreHelpOffersAndRequests")} (
            {filteredItems.length})
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col gap-4 w-full"
        >
          {/* ---------------------- First Block: Search + Type Filter ---------------------- */}
          <div className="flex justify-between items-center w-full">
            <div className="flex-1 min-w-64 relative max-w-sm">
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
            <div className="flex gap-2 flex-wrap justify-end">
              {["allActive", "offers", "requests", "alerts"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type as any);

                    if (
                      type === "offers" &&
                      allActiveOrts.filter((item) => "isPaid" in item).length >
                        0
                    ) {
                      setCurrentOrt(
                        allActiveOrts.filter((item) => "isPaid" in item)[0]
                      );
                    } else if (
                      type === "requests" &&
                      allActiveOrts.filter(
                        (item) =>
                          "typeRequest" in item &&
                          item.typeRequest === "request"
                      ).length > 0
                    ) {
                      setCurrentOrt(
                        allActiveOrts.filter(
                          (item) =>
                            "typeRequest" in item &&
                            item.typeRequest === "request"
                        )[0]
                      );
                    } else if (
                      type === "alerts" &&
                      allUserOrts.filter(
                        (item) =>
                          "typeRequest" in item && item.typeRequest === "alert"
                      ).length > 0
                    ) {
                      setCurrentOrt(
                        allUserOrts.filter(
                          (item) =>
                            "typeRequest" in item &&
                            item.typeRequest === "alert"
                        )[0]
                      );
                    } else if (
                      type === "allActive" &&
                      allActiveOrts.length > 0
                    ) {
                      setCurrentOrt(allActiveOrts[0]);
                    }
                  }}
                  className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm ${
                    filterType === type
                      ? type === "allActive"
                        ? "bg-purple-600 text-white shadow-lg"
                        : type === "offers"
                        ? "bg-blue-600 text-white shadow-lg"
                        : type === "requests"
                        ? "bg-green-600 text-white shadow-lg"
                        : "bg-red-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {type === "offers" && (
                    <>
                      <Handshake className="w-4 h-4" /> Offers
                    </>
                  )}
                  {type === "requests" && (
                    <>
                      <FilePlus2 className="w-4 h-4" /> Requests
                    </>
                  )}
                  {type === "alerts" && (
                    <>
                      <Zap className="w-4 h-4" /> Alerts
                    </>
                  )}
                  {type === "allActive" && (
                    <>
                      <MapPin className="w-4 h-4" /> Active
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ---------------------- Second Block: User Filter + Toggle Details ---------------------- */}
          <div className="flex justify-between items-center w-full">
            <div></div>
            {/* User Filter */}
            <div className="flex gap-2 flex-wrap justify-end items-center">
              {["allUsers", "myOffers", "myRequests", "myAlerts"].map(
                (type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setFilterType(type as any);

                      // On choisit le premier élément correspondant au filtre
                      if (type === "allUsers" && allUserOrts.length > 0) {
                        setCurrentOrt(allUserOrts[0]);
                      } else if (
                        type === "myOffers" &&
                        allUserOrts.filter((item) => "isPaid" in item).length >
                          0
                      ) {
                        setCurrentOrt(
                          allUserOrts.filter((item) => "isPaid" in item)[0]
                        );
                      } else if (
                        type === "myRequests" &&
                        allUserOrts.filter(
                          (item) =>
                            "typeRequest" in item &&
                            item.typeRequest === "request"
                        ).length > 0
                      ) {
                        setCurrentOrt(
                          allUserOrts.filter(
                            (item) =>
                              "typeRequest" in item &&
                              item.typeRequest === "request"
                          )[0]
                        );
                      } else if (
                        type === "myAlerts" &&
                        allUserOrts.filter(
                          (item) =>
                            "typeRequest" in item &&
                            item.typeRequest === "alert"
                        ).length > 0
                      ) {
                        setCurrentOrt(
                          allUserOrts.filter(
                            (item) =>
                              "typeRequest" in item &&
                              item.typeRequest === "alert"
                          )[0]
                        );
                      }
                    }}
                    className={`px-4 py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm ${
                      filterType === type
                        ? type === "allUsers"
                          ? "bg-purple-600 text-white shadow-lg"
                          : type === "myOffers"
                          ? "bg-blue-600 text-white shadow-lg"
                          : type === "myRequests"
                          ? "bg-green-600 text-white shadow-lg"
                          : "bg-red-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type === "allUsers" && (
                      <>
                        <Users className="w-4 h-4" /> All My Items
                      </>
                    )}
                    {type === "myOffers" && (
                      <>
                        <Handshake className="w-4 h-4" /> My Offers
                      </>
                    )}
                    {type === "myRequests" && (
                      <>
                        <ClipboardList className="w-4 h-4" /> My Requests
                      </>
                    )}
                    {type === "myAlerts" && (
                      <>
                        <Bell className="w-4 h-4" /> My Alerts
                      </>
                    )}
                  </button>
                )
              )}

              {/* Toggle Details */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className={`px-4 cursor-pointer py-2 rounded-lg flex items-center gap-2 font-medium transition-all ${
                  showDetails
                    ? "bg-gray-500 text-white"
                    : "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg"
                }`}
              >
                {showDetails ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
                {showDetails ? "Hide Details" : "Show Details"}
              </button>
            </div>
          </div>
        </motion.div>
        {["all", "allUsers", "myOffers", "myRequests", "myAlerts"].includes(
          filterType
        ) && (
          <div className="flex items-center gap-4 mb-4 p-2 bg-gray-50 rounded-lg shadow-sm">
            <MarkerLegend />
          </div>
        )}
        {/* Map and Details Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
          {/* Map - Takes 3/4 of space */}

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`rounded-xl overflow-hidden shadow-lg h-full`}
            style={{ gridColumn: showDetails ? "span 3" : "span 4" }}
          >
            <Card className="h-full">
              {/* Map centered on the event position */}
              {mapCenter &&
                (console.log("Zoom State:", isClickedZoom),
                (
                  <OrtMap
                    orts={ortsToSend}
                    mapCenter={mapCenter}
                    onMarkerClick={(o: OfferProps | RequestProps) =>
                      setCurrentOrt(o)
                    }
                    zoom={isClickedZoom ? 18 : 10}
                  />
                ))}
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
              {filteredItems.length > 0 && currentOrt ? (
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardContent className="p-4 flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          getOrtType(currentOrt) === "offer"
                            ? "bg-blue-100"
                            : getOrtType(currentOrt) === "request"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {getOrtType(currentOrt) === "offer" ? (
                          <Handshake className="w-5 h-5 text-blue-600" />
                        ) : getOrtType(currentOrt) === "request" ? (
                          <FilePlus2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Zap className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {getOrtType(currentOrt) === "offer" ||
                          getOrtType(currentOrt) === "request"
                            ? currentOrt.title
                            : "SOS Alert"}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {getOrtType(currentOrt) === "offer"
                            ? "Offer"
                            : getOrtType(currentOrt) === "request"
                            ? "Request"
                            : "Alert"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-xs mb-4 line-clamp-3">
                      📖 {currentOrt.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 border-t pt-3">
                      {/* Location */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Location
                        </p>
                        <p className="text-xs text-gray-800 line-clamp-2">
                          📍 {currentOrt.location}
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          Category
                        </p>
                        <p className="text-xs text-gray-800">
                          {currentOrt.category?.name || "N/A"}
                        </p>
                      </div>

                      {/* Price */}
                      {(currentOrt &&
                        "isPaid" in currentOrt &&
                        getOrtType(currentOrt) === "offer" &&
                        (currentOrt as OfferProps).isPaid) ||
                        (currentOrt &&
                          "rewardType" in currentOrt &&
                          getOrtType(currentOrt) === "request" &&
                          (currentOrt as RequestProps).rewardType ===
                            "paid" && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">
                                Price
                              </p>
                              <p className="text-xs font-bold text-green-600">
                                ${currentOrt.price}
                              </p>
                            </div>
                          ))}

                      {/* SOS Badge */}
                      {getOrtType(currentOrt) === "alert" && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          SOS Alert
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    {currentOrt.images && currentOrt.images.length > 0 && (
                      <div className="mt-3 border-t pt-3">
                        <p className="text-xs font-medium text-gray-600 mb-2">
                          Images
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {currentOrt.images.slice(0, 4).map((img, i) => (
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
                    <SearchX className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">No Item Found</p>
                  </CardContent>
                </Card>
              )}

              {/* Items List */}
              <Card className="flex-1 overflow-hidden flex flex-col">
                <CardContent className="p-3 flex-1 overflow-y-auto">
                  <p className="text-xs font-medium text-gray-600 mb-2">
                    {filterType === "allActive"
                      ? "Active Items"
                      : filterType === "offers"
                      ? "Offers"
                      : filterType === "requests"
                      ? "Requests"
                      : filterType === "alerts"
                      ? "Alerts"
                      : filterType === "allUsers"
                      ? "All My Items"
                      : filterType === "myOffers"
                      ? "My Offers"
                      : filterType === "myRequests"
                      ? "My Requests"
                      : "My Alerts"}{" "}
                    ({filteredItems.length})
                  </p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {filteredItems.length > 0 ? (
                        filteredItems.slice(0, 10).map((item) => {
                          const title =
                            getOrtType(item) !== "alert"
                              ? item.title
                              : "SOS Alert";

                          const isActive = currentOrt?._id === item._id;

                          const statusColor = getStatusColor(item);
                          return (
                            <motion.button
                              key={item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              onClick={() => {
                                showOrt(item);
                                console.log("Clicked item:", item);
                              }}
                              className={`relative w-full text-left cursor-pointer p-2 rounded-lg transition-all text-xs ${
                                isActive
                                  ? "bg-blue-100 border-2 border-blue-600"
                                  : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              <div
                                className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${statusColor}`}
                              />
                              <p className="font-semibold text-gray-800 truncate">
                                {title}
                              </p>
                              <p className="text-gray-600 truncate">
                                {item.location}
                              </p>
                              <p className="text-gray-600 truncate">
                                {item.status}
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

      {/*<div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto flex gap-6"></div>

      <div className="modal-box w-11/12 max-w-5xl">
        <div className="card bg-base-100 w-full shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 md:basis-[30%]">
              <h2 className="flex items-center justify-start gap-2 text-xl font-bold mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
                  />
                </svg>
                Map
              </h2>

              <div className="flex items-center gap-2 mb-4">
                {/ Search Bar }
                <form onSubmit={handleSearch} className="form-control">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="input input-bordered input-sm w-48"
                      value={searchQuery}
                      onChange={handleSearch}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="btn btn-ghost btn-sm"
                        aria-label="Clear search"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    ) : null}

                    <button type="submit" className="btn btn-square btn-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </button>
                  </div>
                </form>
              </div>

              <div className="hidden md:flex flex-col gap-2 carousel carousel-vertical h-108">
                {allOrts &&
                  allOrts.map((ort) => (
                    <div
                      key={(ort as any).id ?? JSON.stringify(ort)}
                      onClick={() => showOrt(ort)}
                      className={`card carousel-item w-full shadow-sm cursor-pointer overflow-hidden hover:shadow-2xl hover:scale-105 transition-transform ${
                        (ort as any).id === (currentOrt as any)?.id
                          ? "bg-primary text-primary-content"
                          : "bg-base-100"
                      }`}
                    >
                      <div className="px-4 py-4">
                        <h2 className="card-title">{(ort as any).title}</h2>
                        <p>📍 {(ort as any).location}</p>
                      </div>
                    </div>
                  ))}
              </div>

              <div className="relative md:hidden">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 px-2">
                  <span className="text-2xl opacity-50">❮</span>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 px-2">
                  <span className="text-2xl opacity-50">❯</span>
                </div>
                <div className="carousel rounded-box w-full">
                  {allOrts &&
                    allOrts.map((ort) => (
                      <div
                        key={(ort as any).id ?? JSON.stringify(ort)}
                        onClick={() => showOrt(ort)}
                        className={`carousel-item w-1/2 card shadow-sm cursor-pointer overflow-hidden transition-transform ${
                          (ort as any).id === (currentOrt as any)?.id
                            ? "bg-primary text-primary-content"
                            : "bg-base-100"
                        }`}
                      >
                        <div className="px-4 py-4 text-sm">
                          <h2 className="card-title text-md">
                            {(ort as any).title}
                          </h2>
                          <p>📍 {(ort as any).location}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            <div className="flex-1 md:basis-[70%]">
              <h2 className="text-2xl font-bold mb-4">
                {(currentOrt as any)?.title ?? "Select an event"}
              </h2>
              {currentOrt ? (
                <>
                  <p className="text-base-content/70 mb-2">
                    📅{" "}
                    {(currentOrt as any).date
                      ? new Date((currentOrt as any).date).toLocaleDateString()
                      : "—"}
                  </p>
                  <p className="text-base-content/70 mb-2">
                    📍 {(currentOrt as any).location}
                  </p>
                  <p className="text-base-content/70 mb-4">
                    📖 {(currentOrt as any).description ?? "—"}
                  </p>
                </>
              ) : (
                <p className="text-base-content/70 mb-4">No event selected</p>
              )}

              
            </div>
          </div>
        </div>
      </div>
    </div>*/}
    </>
  );
};

export default MapList;
