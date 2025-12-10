import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth, useLanguage } from "../contexts";

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bell,
  Handshake,
  FilePlus2,
  LayoutDashboard,
  MapPin,
  User,
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight,
  Menu,
  ChevronDown,
  CalendarClock,
  Zap,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";

import type { LocationProps, StatsProps } from "../types";
import { STAT_USER_API_URL, USER_API_URL } from "../config";
import {
  ChatPage,
  CreateCare,
  Loading,
  MapList,
  Me,
  Notifications,
  Offers,
  Requests,
  Sessions,
  Start,
} from "../components";
import { extractPostalAndCity } from "../lib";
import OldOff from "../components/Care/OldOff";

const Dashboard = () => {
  const { user, loading, refreshUser, isAuthenticated, signOut } = useAuth();

  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const { id } = useParams();

  console.log("Looking for offer with ID from URL:", id);
  const successMessage = location.state?.successMessage || null;

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingOtherLocations, setLoadingOtherLocations] = useState(true);

  const [stats, setStats] = useState<StatsProps | null>(null);

  const [otherLocations, setOtherLocations] = useState<LocationProps[]>([]);

  const [imageError, setImageError] = useState(false);
  const profileImage = user?.profileImage;
  //const [permission, setPermission] = useState(Notification.permission);

  //const { sendNotification } = UseNotifications();

  useEffect(() => {
    if (loading) return;

    const fetchStats = async () => {
      try {
        const response = await refreshUser(`${STAT_USER_API_URL}`);
        const data = await response.json();

        const lastOffersCount = localStorage.getItem("lastVisit_offers") ?? 0;
        console.log("LAST OFFERS COUNT:", lastOffersCount);
        if (lastOffersCount && data.stats.offers > Number(lastOffersCount)) {
          if (stats) {
            console.log("NEW OFFERS :", data.stats.offers);
            localStorage.setItem("lastVisit_offers", data.stats.offers);
            data.stats.offers = data.stats.offers - Number(lastOffersCount);
            console.log("NEW OFFERS AFTER CALC:", data.stats.offers);
          }
        } else localStorage.setItem("lastVisit_offers", data.stats.offers);

        setStats(data.stats);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    const fetchOtherLocations = async () => {
      try {
        if (!user?._id) return;

        const response = await refreshUser(
          `${USER_API_URL}/${user._id}/locations`
        );
        const data = await response.json();

        setOtherLocations(data.locations);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoadingOtherLocations(false);
      }
    };

    fetchOtherLocations();
  }, [loading]);

  useEffect(() => {
    document.title = `${t("nav.dashboard")} - CareConnect`;
    window.scrollTo(0, 0);
  }, [t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allLocations = useMemo(() => {
    if (!user || loadingOtherLocations) return [];
    const main =
      typeof user.location === "object" && user.location !== null
        ? {
            ...(user.location as LocationProps),
            type: t("dashboard.mainAddress"),
          }
        : { location: user.location, type: t("dashboard.mainAddress") };

    const others =
      otherLocations?.map((loc) =>
        typeof loc === "object" && loc !== null
          ? { ...(loc as LocationProps), type: t("dashboard.otherAddress") }
          : { location: loc, type: t("dashboard.otherAddress") }
      ) || [];

    console.log("ALL LOCATIONS:", [main, ...others]);

    return [main, ...others];
  }, [user, loadingOtherLocations]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const current = allLocations[currentIndex];

  const next = () => {
    if (currentIndex < allLocations.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Navigation items configuration
  const navigationItems = [
    {
      icon: LayoutDashboard,
      title: t("nav.dashboard"),
      link: "/app",
      count: null,
    },
    {
      title: t("dashboard.offers"),
      icon: Handshake,
      description: t("dashboard.manageOffers"),
      link: "/app/offers",
      count: stats ? stats.offers : 0,
    },
    {
      title: t("dashboard.requests"),
      icon: FilePlus2,
      description: t("dashboard.manageRequests"),
      link: "/app/requests",
      count: stats ? stats.requests : 0,
    },
    {
      title: t("dashboard.alerts"),
      icon: Zap,
      description: t("dashboard.manageAlerts"),
      link: "/app/alerts",
      count: stats ? stats.alerts : 0,
    },
    {
      title: t("dashboard.sessions"),
      icon: CalendarClock,
      description: t("dashboard.manageSessions"),
      link: "/app/sessions",
      count: stats ? stats.sessions : 0,
    },
    {
      title: t("dashboard.chat"),
      icon: MessageCircle,
      description: t("dashboard.manageChat"),
      link: "/app/chat",
      count: stats ? stats.unRead : 0,
    },
    {
      title: t("dashboard.notifications"),
      icon: Bell,
      description: t("dashboard.stayInformed"),
      link: "/app/notifications",
      count: stats ? stats.notifications : 0,
    },
    {
      icon: MapPin,
      title: "Map",
      link: "/app/map",
      count: null,
    },
    {
      icon: User,
      title: t("nav.profile"),
      link: "/app/profile",
      count: null,
    },
  ];

  // Bottom navigation items
  const bottomNavigationItems = [
    {
      icon: Settings,
      label: t("nav.settings"),
      path: "/app/settings",
    },
    {
      icon: HelpCircle,
      label: t("nav.support"),
      path: "/app/support",
    },
  ];

  // Check if navigation path is active
  const isActivePath = (path: string) => {
    //console.log("Current path:", location.pathname, "Checking against:", path);
    return location.pathname === path;
  };

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (loading && loadingStats && loadingOtherLocations) return <Loading />;

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Desktop Sidebar */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ duration: 0.3 }}
              className="hidden lg:flex flex-col w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl"
            >
              {/* User Profile Section */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    <Link to="/app/profile">
                      {profileImage && !imageError ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={() => setImageError(true)}
                        />
                      ) : (
                        <>
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </>
                      )}
                    </Link>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Navigation */}
              <nav className="flex-1 overflow-y-auto p-4">
                <div className="space-y-1">
                  {navigationItems.map((item, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      onClick={() => navigate(item.link)}
                      className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActivePath(item.link)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "hover:bg-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium">
                        {item.title}
                      </span>
                      {item.count !== null && item.count > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.count}
                        </span>
                      )}
                      {isActivePath(item.link) && (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Bottom Navigation */}
                <div className="mt-8 pt-4 border-t border-gray-700 space-y-1">
                  {bottomNavigationItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => navigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={signOut}
                    className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="flex-1 text-left font-medium">
                      {t("nav.logout")}
                    </span>
                  </button>
                </div>
              </nav>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />

              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-[9999] lg:hidden overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <>
                          {user?.firstName?.charAt(0)}
                          {user?.lastName?.charAt(0)}
                        </>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <nav className="p-4">
                  <div className="space-y-1">
                    {navigationItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.link);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActivePath(item.link)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "hover:bg-white/10 text-gray-300 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left font-medium">
                          {item.title}
                        </span>
                        {item.count !== null && item.count > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="mt-8 pt-4 border-t border-gray-700 space-y-1">
                    {bottomNavigationItems.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          navigate(item.path);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center curor-pointer gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-left font-medium">
                          {item.label}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={signOut}
                      className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">
                        {t("nav.logout")}
                      </span>
                    </button>
                  </div>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-all"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:block p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-all"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {t("nav.dashboard")}
                </h2>
                <p className="text-sm text-gray-600">
                  {successMessage ? (
                    <div className="bg-green-50 text-green-600 text-center font-semibold p-3 rounded-md text-md mb-6">
                      {user?.firstName + ", " + t(successMessage)}
                    </div>
                  ) : (
                    <>
                      {t("dashboard.welcomeBack")} {user?.firstName}!
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="relative inline-block" ref={dropdownRef}>
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 1 * 0.05 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-xl transition-all group
                       ${
                         isOpen
                           ? "bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-lg"
                           : "hover:bg-gradient-to-b hover:from-gray-900 hover:via-gray-800 hover:to-gray-900 hover:text-white hover:shadow-lg"
                       }`}
              >
                <MapPin className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="flex-1 text-left font-medium">
                  {user?.location ? extractPostalAndCity(user.location) : "N/A"}
                </span>

                <ChevronDown className="w-4 h-4" />
              </motion.button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4"
                  >
                    <p className="font-semibold text-gray-800">
                      {t("dashboard.yourLocations")}
                    </p>

                    {/* LOCATION CARD */}
                    {current && (
                      <div className="mt-3 border rounded-lg p-3 bg-gray-50">
                        <p className="font-bold text-gray-800 mb-4">
                          {user && user.firstName} {user && user.lastName}
                        </p>

                        <p className="text-gray-700 mt-1 text-sm mb-4">
                          {current.location}
                        </p>

                        <p className="font-semibold text-gray-700 mt-1 text-sm">
                          {current.type}
                        </p>

                        {/* Pagination */}
                        {allLocations.length > 1 && (
                          <div className="flex justify-between items-center mt-3">
                            <button
                              onClick={prev}
                              disabled={currentIndex === 0}
                              className="px-3 py-1 bg-gray-200 cursor-pointer rounded disabled:opacity-30"
                            >
                              {t("dashboard.previous")}
                            </button>

                            <p className="text-sm text-gray-600">
                              {currentIndex + 1} / {allLocations.length}
                            </p>

                            <button
                              onClick={next}
                              disabled={
                                currentIndex === allLocations.length - 1
                              }
                              className="px-3 py-1 bg-gray-200 cursor-pointer rounded disabled:opacity-30"
                            >
                              {t("dashboard.next")}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/notifications")}
                className="relative p-2 hover:bg-gray-100 cursor-pointer rounded-lg transition-all"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {stats && stats.notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {stats.notifications}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {isActivePath("/app") && stats && <Start stats={stats} />}
            {isActivePath("/app/chat") && <ChatPage />}
            {isActivePath("/app/offers") && <Offers />}
            {isActivePath("/app/requests") && <Requests page="request" />}
            {isActivePath("/app/alerts") && <Requests page="alert" />}
            {isActivePath("/app/sessions") && <Sessions />}
            {isActivePath("/app/offers2") && <OldOff />}
            {isActivePath("/app/offers/create") && (
              <CreateCare
                option="create"
                closeModal={() => navigate("/app/offers")}
              />
            )}
            {isActivePath("/app/requests/create") && (
              <CreateCare
                page="request"
                option="create"
                closeModal={() => navigate("/app/requests")}
              />
            )}
            {isActivePath("/app/notifications") && <Notifications />}
            {isActivePath("/app/map") && <MapList />}
            {isActivePath("/app/profile") && <Me />}
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
