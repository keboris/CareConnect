import { Card, CardContent, Loading, MapList } from "../../components";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Category, NotificationProps, StatsProps } from "../../types";

import { timeAgo } from "../../lib";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, useLanguage } from "../../contexts";
import { CAT_USER_API_URL, NOTIFICATION_API_URL } from "../../config";
import {
  CheckCircle,
  Clock,
  FilePlus2,
  Handshake,
  MapPin,
  MessageCircle,
  TrendingUp,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";

const Start = ({ stats }: { stats: StatsProps }) => {
  const { t, language } = useLanguage();
  const { refreshUser, loading } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

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

  // Quick action cards
  const quickActions = [
    {
      title: t("dashboard.createOffer"),
      description: t("dashboard.helpYourNeighbors"),
      icon: Handshake,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/app/offers/create"),
    },
    {
      title: t("dashboard.postRequest"),
      description: t("dashboard.getHelpFromCommunity"),
      icon: FilePlus2,
      color: "from-green-500 to-green-600",
      action: () => navigate("/app/requests/create"),
    },
    {
      title: t("dashboard.browseMap"),
      description: t("dashboard.exploreHelpOffers"),
      icon: MapPin,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/app/map"),
    },
    {
      title: t("dashboard.viewMessages"),
      description: t("dashboard.stayConnected"),
      icon: MessageCircle,
      color: "from-orange-500 to-orange-600",
      action: () => navigate("/app/messages"),
    },
  ];

  if (loading || loadingCategories) return <Loading />;

  return (
    <>
      {/* Overview Statistics */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
      >
        {/* --- Map --- */}

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {t("dashboard.map")}
          </h3>
          <div className="grid grid-cols-1 p-2">
            <MapList overview={true} />
          </div>
        </div>

        {/* --- Stats Cards --- */}
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            {t("dashboard.overview")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div
              key="total-activity"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 1 * 0.05 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all bg-white border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent`}
                    >
                      {stats.offers + stats.requests}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t("dashboard.totalActivity")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="active-chats"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 2 * 0.05 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all bg-white border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-green-100 text-green-600 p-3 rounded-lg">
                      <Users className="h-6 w-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent`}
                    >
                      {stats.chats}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t("dashboard.activeChats")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="active-requests"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 3 * 0.05 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all bg-white border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-100 text-yellow-600 p-3 rounded-lg">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div
                      className={`text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent`}
                    >
                      {stats.requests}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t("dashboard.pendingRequests")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              key="active-offers"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 4 * 0.05 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all bg-white border-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-100 text-purple-600 p-3 rounded-lg">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                      {stats.offers}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {t("dashboard.activeOffers")}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
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
          {t("dashboard.quickActions")}
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
                  <p className="text-white/90 text-sm">{action.description}</p>
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
            {t("dashboard.recentNotifications")}
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
                  {t("dashboard.needHelpGettingStarted")}
                </h3>
                <p className="text-white/90 text-lg">
                  {t("dashboard.helpGettingStartedDescription")}
                </p>
              </div>
              <button
                onClick={() => navigate("/app/help")}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
              >
                {t("dashboard.getSupport")}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default Start;
