import { useEffect } from "react";
import { useLanguage } from "../contexts";

import { Card, CardContent } from "../components";
import { motion } from "framer-motion";
import { MessageCircle, Bell, Handshake, FilePlus2 } from "lucide-react";
import { useLocation } from "react-router";

const Dashboard = () => {
  const { t } = useLanguage();

  const location = useLocation();
  const successMessage = location.state?.successMessage || null;

  useEffect(() => {
    document.title = `${t("nav.dashboard")} - CareConnect`;
  }, [t]);

  const items = [
    {
      title: t("dashboard.offers"),
      icon: Handshake,
      description: t("dashboard.manageOffers"),
      link: "/app/offers",
    },
    {
      title: t("dashboard.requests"),
      icon: FilePlus2,
      description: t("dashboard.manageRequests"),
      link: "/app/requests",
    },
    {
      title: t("dashboard.chat"),
      icon: MessageCircle,
      description: t("dashboard.manageChat"),
      link: "/app/chat",
    },
    {
      title: t("dashboard.notifications"),
      icon: Bell,
      description: t("dashboard.stayInformed"),
      link: "/app/notifications",
    },
  ];
  return (
    <div className="min-h-screen py-10 px-6 bg-gradient-to-br from-blue-50 to-blue-100">
      {successMessage && (
        <div className="bg-green-50 text-green-600 text-center font-semibold p-3 rounded-md text-md mb-4">
          {t(successMessage)}
        </div>
      )}
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl font-bold text-gray-800 mb-8 text-center"
        >
          Dashboard
        </motion.h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, idx) => (
            <motion.a
              key={idx}
              href={item.link}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <Card className="rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer bg-white/70 backdrop-blur-md border border-white/40">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <item.icon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
