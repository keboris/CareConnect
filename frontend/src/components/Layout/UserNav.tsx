import {
  AlertCircle,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useAuth, useLanguage } from "../../contexts";
import { useEffect, useRef, useState } from "react";
import type { NotificationProps } from "../../types";
import { NOTIFICATION_API_URL, REQUEST_API_URL } from "../../config";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const UserNav = () => {
  const { user, signOut, loading, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navigate = useNavigate();

  const [sosActive, setSosActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const [sosLoading, setSosLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    description: "",
    typeAlert: "",
  });
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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value } = target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSosLoading(true);

    const form = new FormData();
    form.append("description", formData.description);
    form.append("typeAlert", formData.typeAlert);

    if (sosActive) {
      try {
        const payload = {
          typeRequest: "alert",
          category: "692599bb49a323657a269f86", // SOS Category ID
          ...formData,
        };
        await refreshUser(`${REQUEST_API_URL}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        setSosActive(false);
      } catch (error) {
        console.error("Error sending SOS alert:", error);
      } finally {
        setSosLoading(false);
      }
    }
  };

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
          <div className="relative inline-block" ref={dropdownRef}>
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

            <AnimatePresence>
              {sosActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4"
                >
                  <p className="font-semibold text-gray-800">Add Details</p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {/* DESCRIPTION */}
                      <div>
                        <label
                          htmlFor="description"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("sos.description") || "Description"}
                        </label>
                        <div className="relative">
                          <FileText
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            placeholder={
                              t("sos.descriptionPlaceholder") ||
                              "Enter description..."
                            }
                          />
                        </div>
                      </div>

                      {/* TYPE ALERT */}
                      <div>
                        <label
                          htmlFor="typeAlert"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          {t("sos.type") || "Type"}
                        </label>
                        <select
                          id="typeAlert"
                          name="typeAlert"
                          value={formData.typeAlert}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        >
                          <option value="" className="text-gray-900">
                            {t("sos.typePlaceholder") || "Select type"}
                          </option>
                          <option value="medical" className="text-gray-900">
                            {t("sos.medical") || "Medical"}
                          </option>
                          <option value="fire" className="text-gray-900">
                            {t("sos.fire") || "Fire"}
                          </option>
                          <option value="police" className="text-gray-900">
                            {t("sos.police") || "Police"}
                          </option>
                          <option value="danger" className="text-gray-900">
                            {t("sos.danger") || "Danger"}
                          </option>
                          <option value="assistance" className="text-gray-900">
                            {t("sos.assistance") || "Assistance"}
                          </option>
                          <option value="other" className="text-gray-900">
                            {t("sos.other") || "Other"}
                          </option>
                        </select>
                      </div>

                      {/* BUTTONS LINE */}
                      <div className="flex justify-end gap-3 mt-2">
                        <button
                          onClick={() => setSosActive(false)}
                          type="button"
                          className="px-4 py-2 rounded-md bg-gray-300 text-gray-800 hover:bg-gray-400 cursor-pointer"
                        >
                          {t("common.cancel") || "Cancel"}
                        </button>

                        <button
                          type="submit"
                          disabled={sosLoading}
                          className="px-6 py-2 cursor-pointer bg-red-600 text-white rounded-md hover:bg-red-700 font-bold disabled:opacity-50 hover:scale-105 transition-all shadow"
                        >
                          {sosLoading ? t("sos.sending") : t("sos.send")}
                        </button>
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
