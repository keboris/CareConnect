import { AlertCircle, Bell, LayoutDashboard, LogOut } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useAuth, useLanguage } from "../../contexts";
import { useEffect, useState } from "react";
import type { NotificationProps } from "../../types";
import { NOTIFICATION_API_URL } from "../../config";
import { useNavigate } from "react-router";

const UserNav = () => {
  const { user, signOut, loading, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navigate = useNavigate();

  const [sosActive, setSosActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const isDashboardActive = location.pathname === "/app";

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

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate("/app")}
          className={`inline-flex px-4 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out items-center space-x-2
        ${
          isDashboardActive
            ? "bg-white text-blue-700 font-medium shadow-lg"
            : "text-white hover:bg-blue-500"
        }`}
        >
          <LayoutDashboard size={18} />
          <span>{t("nav.dashboard")}</span>
        </button>

        {/* MESSAGES }
        <button
          onClick={() => navigate("/app/chat")}
          className={`inline-flex px-4 py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out items-center space-x-2
        ${
          isChatActive
            ? "bg-white text-blue-700 font-medium shadow-lg"
            : "text-white hover:bg-blue-500"
        }`}
        >
          <MessageSquare size={18} />
          <span>{t("nav.messages")}</span>
        </button>*/}

        {/* NOTIFICATIONS */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${
              showNotifications
                ? "bg-white text-blue-700 shadow-lg"
                : "text-white hover:bg-blue-500"
            }`}
          >
            <div className="relative cursor-pointer">
              <Bell
                size={24}
                className="text-white hover:text-gray-900 transition active:text-gray-700 transition"
              />

              {notifications && notifications.length > 0 ? (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {notifications.length}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  0
                </span>
              )}
            </div>
          </button>

          {/* DROPDOWN LIST */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 z-50">
              <div className="p-3 font-semibold text-gray-700 border-b">
                {t("dashboard.notifications")}
              </div>

              {notifications && notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {t("nav.noNotifications")}
                </div>
              ) : (
                <ul>
                  {notifications &&
                    notifications.map((n) => (
                      <li
                        key={n._id}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b last:border-none"
                      >
                        {n.title}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* USER + SOS + LANGUAGE + LOGOUT */}
        <div className="ml-4 flex items-center space-x-2 border-l border-white/20 pl-4">
          <div className="text-white text-sm font-medium px-3">
            {user?.firstName} {user?.lastName}
          </div>
          <button
            onClick={() => setSosActive(!sosActive)}
            className={`px-4 py-2 rounded-lg cursor-pointer font-bold transition-all flex items-center space-x-2 ${
              sosActive
                ? "bg-red-600 text-white animate-pulse shadow-xl"
                : "bg-red-500 text-white hover:bg-red-600"
            }`}
            title={t("sos.toggle")}
          >
            <AlertCircle size={18} />
            <span>{sosActive ? t("sos.active") : t("sos.inactive")}</span>
          </button>

          <button
            onClick={() => setLanguage(language === "en" ? "de" : "en")}
            className="p-2.5 rounded-lg cursor-pointer text-white hover:bg-white/10 transition-all flex items-center space-x-1"
            title="Change Language"
          >
            <ReactCountryFlag
              countryCode={language === "en" ? "GB" : "DE"}
              svg
              style={{
                width: "0.9em",
                height: "0.9em",
                borderRadius: "3px",
                marginRight: "6px",
              }}
            />
            <span className="text-sm font-medium uppercase">{language}</span>
          </button>

          <button
            onClick={signOut}
            className="p-2 rounded-lg cursor-pointer text-white hover:bg-red-500 transition-all"
            title={t("nav.logout")}
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </>
  );
};

export default UserNav;
