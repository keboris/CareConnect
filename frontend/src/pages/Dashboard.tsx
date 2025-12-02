import { useEffect, useState } from "react";
import { useAuth, useLanguage } from "../contexts";
import { Card, CardContent, Loading } from "../components";
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
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Category, NotificationProps, StatsProps } from "../types";
import {
  CAT_USER_API_URL,
  NOTIFICATION_API_URL,
  STAT_USER_API_URL,
} from "../config";
import { timeAgo } from "../lib";

const Dashboard = () => {
  const { user, loading, refreshUser, signOut } = useAuth();

  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const successMessage = location.state?.successMessage || null;

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<StatsProps>({
    offers: 0,
    requests: 0,
    chats: 0,
    notifications: 0,
  });
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (loading) return;

    const fetchCategories = async () => {
      try {
        const response = await refreshUser(`${CAT_USER_API_URL}`);
        const data = await response.json();

        const sortedCategories = data.categories
          .sort(
            (a: Category, b: Category) =>
              (b.offersCount || 0) +
              (b.requestsCount || 0) -
              ((a.offersCount || 0) + (a.requestsCount || 0))
          )
          .slice(0, 8);

        setCategories(sortedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    const fetchStats = async () => {
      try {
        const response = await refreshUser(`${STAT_USER_API_URL}`);
        const data = await response.json();

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
    const fetchNotifications = async () => {
      try {
        const response = await refreshUser(`${NOTIFICATION_API_URL}`);
        const data = await response.json();

        setNotifications(data.notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [loading]);

  useEffect(() => {
    document.title = `${t("nav.dashboard")} - CareConnect`;
    window.scrollTo(0, 0);
  }, [t]);

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
      title: t("dashboard.chat"),
      icon: MessageCircle,
      description: t("dashboard.manageChat"),
      link: "/app/chat",
      count: stats ? stats.chats : 0,
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
      label: "Settings",
      path: "/app/settings",
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      path: "/app/help",
    },
  ];

  // Quick action cards
  const quickActions = [
    {
      title: "Create New Offer",
      description: "Share your skills and help others in your community",
      icon: Handshake,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/app/offers/create"),
    },
    {
      title: "Post a Request",
      description: "Ask for help from your neighbors",
      icon: FilePlus2,
      color: "from-green-500 to-green-600",
      action: () => navigate("/app/requests/create"),
    },
    {
      title: "Browse Map",
      description: "Explore help offers and requests near you",
      icon: MapPin,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/app/map"),
    },
    {
      title: "View Messages",
      description: "Check your conversations and respond to messages",
      icon: MessageCircle,
      color: "from-orange-500 to-orange-600",
      action: () => navigate("/app/messages"),
    },
  ];

  // Check if navigation path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  if (loading || loadingCategories || loadingStats) return <Loading />;

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
                    {user?.firstName?.charAt(0)}
                    {user?.lastName?.charAt(0)}
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                        isActivePath(item.link)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "hover:bg-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium">
                        {item.title}
                      </span>
                      {item.count && (
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
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={signOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
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
                className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white shadow-2xl z-50 lg:hidden overflow-y-auto"
              >
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
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
                        onClick={() => navigate(item.link)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                          isActivePath(item.link)
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                            : "hover:bg-white/10 text-gray-300 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left font-medium">
                          {item.title}
                        </span>
                        {item.count !== null && item.count && (
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
                        onClick={() => navigate(item.path)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="flex-1 text-left font-medium">
                          {item.label}
                        </span>
                      </button>
                    ))}
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-all"
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
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>

              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-all"
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
                    <>Welcome back, {user?.firstName}!</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/app/notifications")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <Bell className="w-6 h-6 text-gray-700" />
                {stats.notifications > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {stats.notifications}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 p-6">
            {/* Overview Statistics */}

            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 text-center"
            >
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">Total Offers</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.offers}
                    </p>
                  </div>
                  <Handshake className="h-8 w-8 text-blue-600" />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">Total Requests</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.requests}
                    </p>
                  </div>
                  <FilePlus2 className="h-8 w-8 text-green-500" />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">Active Chats</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.chats}
                    </p>
                  </div>
                  <MessageCircle className="h-8 w-8 text-purple-500" />
                </div>
                <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
                  <div>
                    <h3 className="text-gray-500 text-sm">Notifications</h3>
                    <p className="text-2xl font-bold text-gray-800">
                      {stats.notifications}
                    </p>
                  </div>
                  <Bell className="h-8 w-8 text-red-500" />
                </div>
              </div>
            </motion.h1>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                    onClick={action.action}
                    className="cursor-pointer group"
                  >
                    <Card
                      className={`rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br ${action.color} border-0 overflow-hidden transform group-hover:scale-105`}
                    >
                      <CardContent className="p-6 text-white">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl w-fit mb-4">
                          <action.icon className="h-8 w-8" />
                        </div>
                        <h4 className="text-lg font-bold mb-2">
                          {action.title}
                        </h4>
                        <p className="text-white/90 text-sm">
                          {action.description}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Graph */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("dashboard.offersRequestsByCategory")}
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={categories}>
                    <XAxis dataKey={language === "de" ? "nameDE" : "name"} />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="offersCount"
                      name={t("dashboard.offers")}
                      fill="#3b82f6"
                    />
                    <Bar
                      dataKey="requestsCount"
                      name={t("dashboard.requests")}
                      fill="#10b981"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {/* Recent Notifications */}
              <div className="bg-white rounded-2xl shadow p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Notifications
                </h3>
                <ul className="divide-y divide-gray-200">
                  {notifications &&
                    notifications.map((notif) => (
                      <li
                        key={notif._id}
                        className="py-3 hover:bg-blue-50 px-4 cursor-pointer flex justify-between"
                      >
                        <span>
                          {notif.title}{" "}
                          <span className="text-gray-600 text-sm">
                            ({notif.message})
                          </span>
                        </span>
                        <span className="text-gray-400 text-xs">
                          {timeAgo(notif.createdAt)}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </motion.div>

            {/* Help Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="rounded-xl shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 border-0">
                <CardContent className="p-8 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        Need Help Getting Started?
                      </h3>
                      <p className="text-white/90 text-lg">
                        Check out our guide or contact support for assistance.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate("/app/help")}
                      className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
                    >
                      Get Support
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
