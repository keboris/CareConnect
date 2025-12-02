import { useEffect, useState } from "react";
import { useAuth, useLanguage } from "../contexts";
import { Card, CardContent } from "../components";
import { motion } from "framer-motion";
import { MessageCircle, Bell, Handshake, FilePlus2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Category, StatsProps } from "../types";
import { CAT_USER_API_URL, STAT_USER_API_URL } from "../config";

const Dashboard = () => {
  const { loading, refreshUser } = useAuth();

  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.successMessage || null;

  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<StatsProps>({
    offers: 0,
    requests: 0,
    chats: 0,
    notifications: 0,
  });

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
      }
    };

    fetchStats();
  }, [loading]);

  const recentNotifications = [
    { message: "New offer from John", time: "2h ago" },
    { message: "New request posted", time: "4h ago" },
    { message: "Chat message from Anna", time: "6h ago" },
  ];

  useEffect(() => {
    document.title = `${t("nav.dashboard")} - CareConnect`;
    window.scrollTo(0, 0);
  }, [t]);

  const items = [
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
  ];

  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
      {successMessage && (
        <div className="bg-green-50 text-green-600 text-center font-semibold p-3 rounded-md text-md mb-6">
          {t(successMessage)}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
        >
          Dashboard
        </motion.h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm">Total Offers</h3>
              <p className="text-2xl font-bold text-gray-800">{stats.offers}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.chats}</p>
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

        {/* Principal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              onClick={() => navigate(item.link)}
            >
              <Card className="rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer bg-white/70 backdrop-blur-md border border-white/40">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4 relative">
                    <item.icon className="h-10 w-10 text-blue-600" />
                    {item.count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {item.count}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Graph */}
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

        {/* Recent Notifications */}
        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Recent Notifications
          </h3>
          <ul className="divide-y divide-gray-200">
            {recentNotifications.map((notif, idx) => (
              <li
                key={idx}
                className="py-3 hover:bg-blue-50 px-4 cursor-pointer flex justify-between"
              >
                <span>{notif.message}</span>
                <span className="text-gray-400 text-xs">{notif.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-4 mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl shadow hover:bg-blue-700 transition">
            New Offer
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded-xl shadow hover:bg-green-600 transition">
            New Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
