import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useLanguage, useAuth } from "../contexts";
import { Card, CardContent } from "../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Bell,
  Handshake,
  FilePlus2,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
  MapPin,
  Settings,
  HelpCircle,
  LogOut,
  User,
} from "lucide-react";
import { API_BASE_URL } from "../config";

// Dashboard component with professional sidebar navigation
const Dashboard = () => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalOffers: 0,
    totalRequests: 0,
    activeChats: 0,
    unreadNotifications: 0,
  });

  const [isLoading, setIsLoading] = useState(true);

  // Navigation items configuration
  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: t("nav.dashboard"),
      path: "/app",
      badge: null,
    },
    {
      icon: Handshake,
      label: t("dashboard.offers"),
      path: "/app/offers",
      badge: stats.totalOffers > 0 ? stats.totalOffers : null,
    },
    {
      icon: FilePlus2,
      label: t("dashboard.requests"),
      path: "/app/requests",
      badge: stats.totalRequests > 0 ? stats.totalRequests : null,
    },
    {
      icon: MessageCircle,
      label: t("nav.messages"),
      path: "/app/chat",
      badge: stats.activeChats > 0 ? stats.activeChats : null,
    },
    {
      icon: Bell,
      label: t("dashboard.notifications"),
      path: "/app/notifications",
      badge: stats.unreadNotifications > 0 ? stats.unreadNotifications : null,
    },
    {
      icon: MapPin,
      label: "Map",
      path: "/app/map",
      badge: null,
    },
    {
      icon: User,
      label: t("nav.profile"),
      path: "/app/profile",
      badge: null,
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

  // Fetch dashboard data from backend
  useEffect(() => {
    document.title = `${t("nav.dashboard")} - CareConnect`;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch data from backend APIs
        const [offersRes, requestsRes, sessionsRes, notifsRes] =
          await Promise.all([
            fetch(`${API_BASE_URL}/offers`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/requests`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/help-sessions`, { credentials: "include" }),
            fetch(`${API_BASE_URL}/notifications`, { credentials: "include" }),
          ]);

        const [offersData, requestsData, sessionsData, notifsData] =
          await Promise.all([
            offersRes.json(),
            requestsRes.json(),
            sessionsRes.json(),
            notifsRes.json(),
          ]);

        // Update statistics
        setStats({
          totalOffers: offersData.offers?.length || 0,
          totalRequests: requestsData.requests?.length || 0,
          activeChats: sessionsData.sessions?.length || 0,
          unreadNotifications: notifsData.notifications?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // Check if navigation path is active
  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  // Handle navigation
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  // Overview statistics
  const overviewStats = [
    {
      icon: TrendingUp,
      label: "Total Activity",
      value: stats.totalOffers + stats.totalRequests,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      icon: Users,
      label: "Active Chats",
      value: stats.activeChats,
      color: "text-green-600",
      bgColor: "bg-green-100",
      gradient: "from-green-500 to-green-600",
    },
    {
      icon: Clock,
      label: "Pending Requests",
      value: stats.totalRequests,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      icon: CheckCircle,
      label: "Active Offers",
      value: stats.totalOffers,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      gradient: "from-purple-500 to-purple-600",
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
      action: () => navigate("/app/chat"),
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt="CareConnect Logo"
                  className="h-10 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold">CareConnect</h1>
                  <p className="text-xs text-gray-400">Community Platform</p>
                </div>
              </div>
            </div>

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
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
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
                    onClick={() => handleNavigate(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                      isActivePath(item.path)
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                        : "hover:bg-white/10 text-gray-300 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {isActivePath(item.path) && (
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
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="flex-1 text-left font-medium">
                      {item.label}
                    </span>
                  </button>
                ))}
                <button
                  onClick={handleLogout}
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
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="/logo.png"
                    alt="CareConnect Logo"
                    className="h-10 w-auto"
                  />
                  <div>
                    <h1 className="text-xl font-bold">CareConnect</h1>
                    <p className="text-xs text-gray-400">Community Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

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
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActivePath(item.path)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                          : "hover:bg-white/10 text-gray-300 hover:text-white"
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t border-gray-700 space-y-1">
                  {bottomNavigationItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleNavigate(item.path)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-all"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="flex-1 text-left font-medium">
                        {item.label}
                      </span>
                    </button>
                  ))}
                  <button
                    onClick={handleLogout}
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-md px-6 py-4 flex items-center justify-between">
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
                Welcome back, {user?.firstName}!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-all">
              <Bell className="w-6 h-6 text-gray-700" />
              {stats.unreadNotifications > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {stats.unreadNotifications}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4">Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {overviewStats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all bg-white border-0 overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}
                        >
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <div
                          className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                        >
                          {isLoading ? "..." : stat.value}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 font-medium">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

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
                      <h4 className="text-lg font-bold mb-2">{action.title}</h4>
                      <p className="text-white/90 text-sm">
                        {action.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
  );
};

export default Dashboard;
