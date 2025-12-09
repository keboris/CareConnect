import { useEffect, useRef, useState } from "react";
import type {
  CountProps,
  mapcenterProps,
  OfferProps,
  RequestProps,
  User,
} from "../../types";
import OrtMap from "./OrtMap";
import { useAuth, useLanguage } from "../../contexts";
import { OFFER_API_URL, REQUEST_API_URL } from "../../config";
import Loading from "../Landing/Loading";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import {
  Archive,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FilePlus2,
  Handshake,
  Loader2,
  MapPin,
  PauseCircle,
  Search,
  SearchX,
  XCircle,
  Zap,
} from "lucide-react";
import ConfirmModal from "../Landing/ConfirmModal";

const MapList = ({ overview }: { overview?: boolean }) => {
  const { t } = useLanguage();
  const { user, refreshUser, loading } = useAuth();

  const [, setUserLocation] = useState<User | mapcenterProps | null>(user);

  const [, setCurrentOrt] = useState<OfferProps | RequestProps | User | null>(
    null
  );
  const [ortToSelect, setOrtToSelect] = useState<
    OfferProps | RequestProps | User | null
  >(null);

  const [loadingData, setLoadingData] = useState(true);
  const [filterType, setFilterType] = useState<
    | "allActive"
    | "offers_active"
    | "offers_in_progress"
    | "offers_completed"
    | "offers_cancelled"
    | "offers_inactive"
    | "offers_archived"
    | "requests_active"
    | "requests_in_progress"
    | "requests_completed"
    | "requests_cancelled"
    | "requests_inactive"
    | "requests_archived"
    | "alerts_active"
    | "alerts_in_progress"
    | "alerts_completed"
    | "alerts_cancelled"
    | "alerts_inactive"
    | "alerts_archived"
  >("allActive");

  const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
  const mapRef = useRef<L.Map | null>(null);

  const [isClick, setIsClick] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");

  const [allOrts, setAllOrts] = useState<(OfferProps | RequestProps | User)[]>(
    []
  );
  const [allEnreg, setAllEnreg] = useState<(OfferProps | RequestProps)[]>([]);

  const [counts, setCounts] = useState<CountProps>({
    offers: 0,
    requests: 0,
    alerts: 0,
    statuses: {},
    allActive: 0,
  });

  const [ortsToSend, setOrtsToSend] = useState<
    (OfferProps | RequestProps | User)[]
  >([]);
  const [ortsToClick, setOrtsToClick] = useState<
    (OfferProps | RequestProps | User)[]
  >([]);

  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const [isClickedZoom, setIsClickedZoom] = useState(false);
  const [showDetails, setShowDetails] = useState(true);

  const [selectedOrtToConfirm, setSelectedOrtToConfirm] = useState<
    OfferProps | RequestProps | User | null
  >(null);

  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [acceptLoading, setAcceptLoading] = useState<boolean>(false);

  const [activeStatus, setActiveStatus] = useState<string | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: user?.latitude ?? pos.coords.latitude,
          lng: user?.longitude ?? pos.coords.longitude,
        });
      },
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );
  }, []);

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
        // =============== MERGED LISTS ===============
        const offerData = offersArray || [];
        const requestData = requestsArray || [];

        const activeDataO = offersArray.filter(
          (item: OfferProps) =>
            item.status === "active" && item.userId._id !== user?._id
        );

        const activeDataR = requestsArray.filter(
          (item: RequestProps) =>
            item.status === "active" && item.userId._id !== user?._id
        );

        const mergedActiveList = [...activeDataO, ...activeDataR];

        const mergedList = [...offerData, ...requestData];

        const mergedAllList = [
          ...(user ? [user] : []),
          ...offerData,
          ...requestData,
        ];

        const mergedAllActiveList = [
          ...(user ? [user] : []),
          ...activeDataO,
          ...activeDataR,
        ];

        setSearchQuery("");

        setAllOrts(mergedAllList);
        setAllEnreg(mergedList);

        setOrtsToSend(mergedAllActiveList);

        setOrtsToClick(mergedActiveList);

        if (mergedAllActiveList.length > 0) {
          setCurrentOrt(user);
          setOrtToSelect(mergedActiveList[0] as OfferProps | RequestProps);

          setMapCenter([user?.latitude ?? 0, user?.longitude ?? 0]);
        } else {
          setCurrentOrt(null);
          setOrtToSelect(null);
          setMapCenter([0, 0]);
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
    calculateCounts();
    if (loading) return;

    const interval = setInterval(() => {
      calculateCounts();
    }, 60_000); // All 60 seconds

    return () => clearInterval(interval);
  }, [loading, allEnreg]);

  useEffect(() => {
    setIsClickedZoom(false);
    const filteredItems = getFilteredItems();

    setOrtsToSend(filteredItems);

    const filteredItemsWithoutUser = filteredItems.filter(
      (item) => item._id !== user?._id
    );
    setOrtsToClick(filteredItemsWithoutUser);

    if (filteredItemsWithoutUser.length > 0) {
      setOrtToSelect(filteredItemsWithoutUser[0]);
    } else setOrtToSelect(null);
  }, [filterType, searchQuery]);

  console.log(ortsToSend);

  useEffect(() => {
    if (allOrts.length === 0) return;

    // Ensure we provide numbers to setMapCenter (no undefined)
    setMapCenter([user?.latitude ?? 0, user?.longitude ?? 0]);
    setIsClickedZoom(false);
  }, [allOrts]);

  const getItemType = (item: any): "offer" | "request" | "alert" => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "request")
      return "request";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    return "alert";
  };

  const parseFilter = (filter: string) => {
    if (filter === "allActive") {
      return { type: "all", status: "active" };
    }

    const [type, status] = filter.split(/_(.+)/);
    return { type, status };
  };

  const calculateCounts = () => {
    const newCounts: CountProps = {
      offers: 0,
      requests: 0,
      alerts: 0,
      statuses: {},
      allActive: 0,
    };

    allEnreg.forEach((o) => {
      const status = (o as any).status || "unknown";

      // Count all statuses for the submenu
      newCounts.statuses[status] = (newCounts.statuses[status] || 0) + 1;

      // Count active for allActive
      if (status === "active") {
        newCounts.allActive++;
      }

      // Count by type (total, not filtered)
      if ("isPaid" in o) newCounts.offers++;
      else if ("typeRequest" in o && o.typeRequest === "request")
        newCounts.requests++;
      else if ("typeRequest" in o && o.typeRequest === "alert")
        newCounts.alerts++;
    });

    setCounts(newCounts);
  };

  const getSubmenuCount = (parentType: string, status: string) => {
    return allEnreg.filter((o) => {
      const itemType =
        "isPaid" in o
          ? "offer"
          : "typeRequest" in o && o.typeRequest === "request"
          ? "request"
          : "typeRequest" in o && o.typeRequest === "alert"
          ? "alert"
          : null;

      if (!itemType) return false;

      // Check that the parentType matches the type of the submenu
      if (parentType === "offers_active" && itemType !== "offer") return false;
      if (parentType === "requests_active" && itemType !== "request")
        return false;
      if (parentType === "alerts_active" && itemType !== "alert") return false;

      // Check that the status matches
      return (o as any).status === status;
    }).length;
  };

  const filterItems = ({
    items,
    filterType,
  }: {
    items: (OfferProps | RequestProps)[];
    filterType: string;
  }) => {
    const { type, status } = parseFilter(filterType);

    return items.filter((item) => {
      const itemType = getItemType(item); // "offer" | "request" | "alert"

      // Filter by type
      if (type === "offers" && itemType !== "offer") return false;
      if (type === "requests" && itemType !== "request") return false;
      if (type === "alerts" && itemType !== "alert") return false;

      // Filter by status
      if (status && item.status !== status) return false;

      return true;
    });
  };

  // Filter items
  const getFilteredItems = () => {
    let items: (OfferProps | RequestProps | User)[] = [];

    const userItem = allOrts.find((item) => item._id === user?._id);
    const otherItems = allOrts.filter((item) => item._id !== user?._id);

    items = filterItems({
      items: otherItems as (OfferProps | RequestProps)[],
      filterType,
    });

    if (userItem) {
      items = [userItem, ...items];
    }

    return items.filter((item) => {
      const q = searchQuery.toLowerCase();

      if (item && item._id === user?._id) {
        // Use the authenticated user object (which has firstName/lastName) instead of the union-typed item
        const fullName = `${user?.firstName ?? ""} ${
          user?.lastName ?? ""
        }`.toLowerCase();
        return fullName.includes(q);
      }

      const title = "title" in item && item.title ? item.title : "SOS Alert";
      const description =
        "description" in item && item.description ? item.description : "";

      return (
        title.toLowerCase().includes(q) || description.toLowerCase().includes(q)
      );
    });
  };

  const filtItems = getFilteredItems();
  console.log("Filtered Items:", filtItems);
  const filteredItems = filtItems.filter((item) => item._id !== user?._id);

  const handleAccepted = (ort: OfferProps | RequestProps | User) => {
    setSelectedOrtToConfirm(ort);
    setShowConfirm(true);

    const type = getOrtType(ort);
    setConfirmMessage(t(`${type}.confirmMessage`));
  };

  const handleAccept = async () => {
    if (!selectedOrtToConfirm) return;

    setAcceptLoading(true);
    const ort = selectedOrtToConfirm;
    try {
      const url =
        "isPaid" in ort
          ? `${OFFER_API_URL}/${ort._id}`
          : "typeRequest" in ort
          ? `${REQUEST_API_URL}/${ort._id}`
          : null;

      if (!url) throw new Error("Invalid item type");

      await refreshUser(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      setAllOrts((prev) => prev.filter((item) => item._id !== ort._id));

      setOrtsToSend((prev) => prev.filter((item) => item._id !== ort._id));
      setOrtsToClick((prev) => prev.filter((item) => item._id !== ort._id));

      const type = getOrtType(ort);
      setInfoMsg(t(`${type}.accepted`));

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error accepting session:", error);
    } finally {
      setAcceptLoading(false);
      setShowConfirm(false);
      setSelectedOrtToConfirm(null);
    }
  };

  // Determine if item is offer, request or a user entry
  const getOrtType = (item: OfferProps | RequestProps | User) => {
    if ("isPaid" in item) return "offer";
    if ("typeRequest" in item && item.typeRequest === "alert") return "alert";
    if ("typeRequest" in item && item.typeRequest === "request")
      return "request";
    // If none of the request/offer discriminators are present, treat as request-like by default
    return "user";
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
  const showOrt = (
    ort: OfferProps | RequestProps | User | null,
    animationZoom: boolean
  ) => {
    if (!ort) return;

    const lat = (ort as any).latitude ?? (ort as any).lat ?? 0;
    const lng = (ort as any).longitude ?? (ort as any).lng ?? 0;
    const centerTuple: [number, number] = [lat, lng];

    // if the map is already initialized, flyTo directly
    if (mapRef.current && animationZoom) {
      try {
        mapRef.current.flyTo(centerTuple, 18, { animate: true, duration: 1.0 });
      } catch (err) {
        console.warn("mapRef.flyTo failed", err);
        // fallback
        setMapCenter([lat, lng]);
      }
    } else {
      // fallback if the map is not ready yet
      setMapCenter([lat, lng]);
    }
    setCurrentOrt(ort);
  };

  const getStatusColor = (item: any) => {
    const status = item.status; // 'active', 'in_progress', 'completed', 'cancelled', 'archived'

    const isOffer = "isPaid" in item;
    const isRequest = "typeRequest" in item && item.typeRequest === "request";
    const isAlert = "typeRequest" in item && item.typeRequest === "alert";

    if (status === "active") return "bg-green-500";
    if (status === "completed") return "bg-blue-500";
    if (status === "cancelled") return "bg-red-500";
    if (status === "archived") return "bg-purple-400";
    if (status === "in_progress") return "bg-yellow-500";
    if (status === "inactive") return "bg-gray-400";

    // Active / default
    if (isOffer) return "bg-blue-500";
    if (isRequest) return "bg-green-500";
    if (isAlert) return "bg-red-500";

    return "bg-gray-400"; // fallback
  };

  const handleMainClick = (type: string) => {
    // Open or close submenu
    if (openSubMenu === type) setOpenSubMenu(null);
    else setOpenSubMenu(type);

    if (type === "offers_active") {
      const firstOffer = allOrts.find((item: any) => "isPaid" in item);
      if (firstOffer) setCurrentOrt(firstOffer);
    } else if (type === "requests_active") {
      const firstRequest = allOrts.find(
        (item: any) => item.typeRequest === "request"
      );
      if (firstRequest) setCurrentOrt(firstRequest);
    } else if (type === "alerts_active") {
      const firstAlert = allOrts.find(
        (item: any) => item.typeRequest === "alert"
      );
      if (firstAlert) setCurrentOrt(firstAlert);
    }

    setFilterType(type as any);
    setIsClick(false);
    setIsClickedZoom(false);
  };

  const handleSubClick = (subType: string) => {
    setFilterType(subType as any);

    const ort = allOrts.find((item: any) => {
      if (subType.startsWith("offers"))
        return "isPaid" in item && item.status === subType.split("_")[1];
      if (subType.startsWith("requests"))
        return (
          item.typeRequest === "request" &&
          item.status === subType.split("_")[1]
        );
      if (subType.startsWith("alerts"))
        return (
          item.typeRequest === "alert" && item.status === subType.split("_")[1]
        );
      return false;
    });

    if (ort) setCurrentOrt(ort);

    setIsClick(false);
    setIsClickedZoom(false);
  };

  const subStatuses = [
    "active",
    "in_progress",
    "completed",
    "cancelled",
    "inactive",
    "archived",
  ];

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
  console.log("Ort To Select ", ortToSelect);
  if (loading || loadingData) return <Loading />;

  return (
    <>
      {infoMsg && (
        <div
          role="alert"
          className="alert alert-success cursor-pointer hover:opacity-80 mb-4 transition"
          onClick={() => setInfoMsg(null)}
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
          <span>{infoMsg}</span>
          <div>
            <button
              onClick={() => setInfoMsg(null)}
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

      <div className="space-y-4 h-full flex flex-col">
        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`${overview ? "hidden" : "block"} mb-2`}
        >
          <h1 className="text-3xl font-bold text-gray-800">
            {t("dashboard.browseMap")}
          </h1>
          <p className="text-gray-600">
            {t("dashboard.browseMapDesc")} ({filteredItems.length} )
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${
            overview ? "hidden" : "block"
          } mb-2 flex flex-col gap-4 w-full`}
        >
          {/* ---------------------- First Block: Search + Type Filter ---------------------- */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
            <div className="flex-1 min-w-0 md:min-w-64 relative max-w-full md:max-w-sm">
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
            <div className="flex gap-2 flex-wrap overflow-x-auto justify-end">
              {[
                "allActive",
                "offers_active",
                "requests_active",
                "alerts_active",
              ].map((type) => {
                const isMainActive = filterType.startsWith(type.split("_")[0]); // garde actif si sous-menu actif
                let mainColor = "bg-gray-100 text-gray-700 hover:bg-gray-200";
                if (isMainActive) {
                  if (type === "allActive")
                    mainColor = "bg-purple-600 text-white shadow-lg";
                  else if (type === "offers_active")
                    mainColor = "bg-blue-600 text-white shadow-lg";
                  else if (type === "requests_active")
                    mainColor = "bg-green-600 text-white shadow-lg";
                  else mainColor = "bg-red-600 text-white shadow-lg";
                }

                return (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveStatus(null);
                      handleMainClick(type as any);
                    }}
                    className={`px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-medium transition-all flex items-center gap-2 text-sm ${mainColor}`}
                  >
                    {type === "allActive" && (
                      <>
                        <MapPin className="w-4 h-4" /> {t("dashboard.active")} (
                        {counts.allActive})
                      </>
                    )}
                    {type === "offers_active" && (
                      <>
                        <Handshake className="w-4 h-4" />{" "}
                        {t("dashboard.offers")} ({counts.offers})
                      </>
                    )}
                    {type === "requests_active" && (
                      <>
                        <FilePlus2 className="w-4 h-4" />{" "}
                        {t("dashboard.requests")} ({counts.requests})
                      </>
                    )}
                    {type === "alerts_active" && (
                      <>
                        <Zap className="w-4 h-4" /> {t("dashboard.alerts")} (
                        {counts.alerts})
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          {/* ---------------------- Submenu Options ---------------------- */}
          <div className="flex justify-between items-center w-full">
            <div></div>
            {/* Options Filter */}
            {openSubMenu && openSubMenu !== "allActive" && (
              <div className="flex gap-2 flex-wrap justify-end items-center">
                {subStatuses.map((status) => {
                  const isActive = activeStatus === status;
                  const { icon, color } = getStatusProps(status, isActive);

                  return (
                    <button
                      key={status}
                      onClick={() => {
                        setActiveStatus(status);
                        handleSubClick(
                          `${openSubMenu.split("_")[0]}_${status}`
                        );
                      }}
                      className={`flex items-center gap-2 px-2 py-1 md:px-4 md:py-2 rounded-lg cursor-pointer font-medium transition-all text-sm ${color} hover:opacity-80`}
                    >
                      {icon}
                      {status.replace("_", " ")} (
                      {getSubmenuCount(openSubMenu, status)})
                    </button>
                  );
                })}

                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`px-2 py-1 md:px-4 md:py-2 cursor-pointer rounded-lg flex items-center gap-2 font-medium transition-all ${
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
            )}
          </div>
        </motion.div>

        <div
          className={`flex-1 grid grid-cols-1 ${
            overview ? "" : "min-h-0 gap-4 w-full lg:grid-cols-4"
          } `}
        >
          {/* Map - Takes 3/4 of space */}

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className={`rounded-xl overflow-hidden shadow-lg h-full`}
            style={{ gridColumn: overview ? "span 4" : "span 3" }}
          >
            <Card
              className={`${
                overview ? "py-0 pb-2 px-3 h-[380px]" : "h-[380px] md:h-full"
              }`}
            >
              {/* Map centered on the event position */}
              {mapCenter &&
                (console.log("mapCenter:", mapCenter),
                (
                  <OrtMap
                    orts={ortsToSend}
                    mapCenter={mapCenter}
                    isClick={isClick}
                    setIsClick={setIsClick}
                    currentOrt={ortToSelect}
                    onMarkerClick={(o: OfferProps | RequestProps | User) =>
                      setOrtToSelect(o)
                    }
                    isClickedZoom={isClickedZoom}
                    setIsClickedZoom={setIsClickedZoom}
                    onAccept={handleAccepted}
                    acceptLoading={acceptLoading}
                    mapRef={mapRef}
                    overview={overview}
                  />
                ))}
            </Card>
            {showConfirm && (
              <ConfirmModal
                title={t("dashboard.confirmTitle")}
                message={confirmMessage}
                onConfirm={handleAccept}
                onCancel={() => setShowConfirm(false)}
              />
            )}
          </motion.div>

          {/* Details Panel - Takes 1/4 of space */}
          {showDetails && !overview && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className={`flex flex-col gap-4 min-h-0 w-full lg:col-span-1`}
            >
              {/* Selected Item Details */}
              {filteredItems.length > 0 && ortToSelect ? (
                <Card className="flex-1 overflow-hidden flex flex-col">
                  <CardContent className="p-4 flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          getOrtType(ortToSelect) === "offer"
                            ? "bg-blue-100"
                            : getOrtType(ortToSelect) === "request"
                            ? "bg-green-100"
                            : "bg-red-100"
                        }`}
                      >
                        {getOrtType(ortToSelect) === "offer" ? (
                          <Handshake className="w-5 h-5 text-blue-600" />
                        ) : getOrtType(ortToSelect) === "request" ? (
                          <FilePlus2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <Zap className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-800 text-sm">
                          {"title" in ortToSelect && ortToSelect.title
                            ? ortToSelect.title
                            : "SOS Alert"}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {getOrtType(ortToSelect) === "offer"
                            ? "Offer"
                            : getOrtType(ortToSelect) === "request"
                            ? "Request"
                            : "Alert"}
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-xs mb-4 line-clamp-3">
                      📖{" "}
                      {"description" in ortToSelect &&
                        ortToSelect.description &&
                        ortToSelect.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-3 border-t pt-3">
                      {/* Location */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t("dashboard.location")}
                        </p>
                        <p className="text-xs text-gray-800 line-clamp-2">
                          📍 {ortToSelect.location}
                        </p>
                      </div>

                      {/* Category */}
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">
                          {t("dashboard.category")}
                        </p>
                        <p className="text-xs text-gray-800">
                          {"category" in ortToSelect &&
                          ortToSelect.category?.name
                            ? ortToSelect.category.name
                            : "N/A"}
                        </p>
                      </div>

                      {/* Price */}
                      {(ortToSelect &&
                        "isPaid" in ortToSelect &&
                        getOrtType(ortToSelect) === "offer" &&
                        (ortToSelect as OfferProps).isPaid) ||
                        (ortToSelect &&
                          "rewardType" in ortToSelect &&
                          getOrtType(ortToSelect) === "request" &&
                          (ortToSelect as RequestProps).rewardType ===
                            "paid" && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">
                                {t("dashboard.price")}
                              </p>
                              <p className="text-xs font-bold text-green-600">
                                ${ortToSelect.price}
                              </p>
                            </div>
                          ))}

                      {/* SOS Badge */}
                      {getOrtType(ortToSelect) === "alert" && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                          <Zap className="w-3 h-3" />
                          SOS Alert
                        </div>
                      )}
                    </div>

                    {/* Images */}
                    {ortToSelect &&
                      "images" in ortToSelect &&
                      ortToSelect.images &&
                      ortToSelect.images.length > 0 && (
                        <div className="mt-3 border-t pt-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Images
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {(ortToSelect as OfferProps | RequestProps).images
                              .slice(0, 4)
                              .map((img, i) => (
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
                      : filterType === "offers_active"
                      ? "Offers"
                      : filterType === "requests_active"
                      ? "Requests"
                      : filterType === "alerts_active"
                      ? "Alerts"
                      : filterType === "offers_in_progress"
                      ? "In Progress Offers"
                      : filterType === "offers_completed"
                      ? "Completed Offers"
                      : filterType === "offers_cancelled"
                      ? "Cancelled Offers"
                      : filterType === "offers_inactive"
                      ? "Inactive Offers"
                      : filterType === "offers_archived"
                      ? "Archived Offers"
                      : filterType === "requests_in_progress"
                      ? "In Progress Requests"
                      : filterType === "requests_completed"
                      ? "Completed Requests"
                      : filterType === "requests_cancelled"
                      ? "Cancelled Requests"
                      : filterType === "requests_inactive"
                      ? "Inactive Requests"
                      : filterType === "requests_archived"
                      ? "Archived Requests"
                      : filterType === "alerts_in_progress"
                      ? "In Progress Alerts"
                      : filterType === "alerts_completed"
                      ? "Completed Alerts"
                      : filterType === "alerts_cancelled"
                      ? "Cancelled Alerts"
                      : filterType === "alerts_inactive"
                      ? "Inactive Alerts"
                      : filterType === "alerts_archived"
                      ? "Archived Alerts"
                      : "Care Connect"}{" "}
                    ({ortsToClick.length})
                  </p>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {ortsToClick && ortsToClick.length > 0 ? (
                        (console.log("Rendering Filtered Items:", ortsToClick),
                        ortsToClick.slice(0, 10).map((item) => {
                          const title =
                            getOrtType(item) !== "alert"
                              ? "title" in item && item.title
                                ? item.title
                                : "Untitled"
                              : "SOS Alert";

                          const isActive =
                            (ortToSelect?._id || ortsToClick[0]?._id) ===
                            item._id;

                          const statusColor = getStatusColor(item);
                          return (
                            <motion.button
                              key={item._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              onClick={() => {
                                if (
                                  ortToSelect &&
                                  ortToSelect._id !== user?._id
                                ) {
                                  setOrtToSelect(item);
                                  setCurrentOrt(item);
                                  showOrt(item, true);
                                  setIsClickedZoom(true);
                                  setIsClick(true);
                                }
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
                                {"location" in item && item.location
                                  ? item.location
                                  : ""}
                              </p>
                            </motion.button>
                          );
                        }))
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
    </>
  );
};

export default MapList;
