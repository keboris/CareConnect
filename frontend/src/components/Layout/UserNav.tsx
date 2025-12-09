import {
  AlertCircle,
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { useAuth, useLanguage } from "../../contexts";
import { useEffect, useRef, useState } from "react";
import type { NotificationProps } from "../../types";
import { NOTIFICATION_API_URL, REQUEST_API_URL } from "../../config";
import { Link, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const UserNav = () => {
  const { user, signOut, loading, refreshUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navigate = useNavigate();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [sosActive, setSosActive] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationProps[]>([]);

  const [sosLoading, setSosLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 640);
  const [formData, setFormData] = useState({
    description: "",
    typeAlert: "",
  });
  const isDashboardActive = location.pathname === "/app";

  useEffect(() => {
    const onResize = () => setIsMobileLayout(window.innerWidth < 640);

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (isMobileLayout) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
        setSosActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileLayout]);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setSosActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button
            className="md:hidden p-2 cursor-pointer rounded-lg hover:bg-white/10 transition"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>

          <Link
            to="/"
            className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="CareConnect Logo"
              className="h-9 lg:h-12 w-auto"
            />
            <span className="text-xl md:text-2xl font-bold text-white">
              CareConnect
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => navigate("/app")}
              className={`inline-flex px-2 py-1 lg:px-4 lg:py-2 rounded-lg cursor-pointer transition-all duration-150 ease-in-out items-center space-x-2
            ${
              isDashboardActive
                ? "bg-white text-blue-700 font-medium shadow-lg"
                : "text-white hover:bg-blue-500"
            }`}
            >
              <LayoutDashboard className="w-4 h-4 lg:w-5 md:h-5" />
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
                className={`px-2 py-1 lg:px-4 lg:py-2 rounded-lg flex items-center space-x-2 transition-all ${
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
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full shadow-md">
                      {notifications.length}
                    </span>
                  ) : (
                    <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs font-bold w-4 h-4 lg:w-5 lg:h-5 flex items-center justify-center rounded-full shadow-md">
                      0
                    </span>
                  )}
                </div>
              </button>

              {/* DROPDOWN LIST */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 z-50">
                  <div className="p-2 lg:p-3 font-semibold text-gray-700 border-b">
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
                            className="px-2 py-1 lg:px-4 lg:py-2 hover:bg-gray-100 cursor-pointer border-b last:border-none"
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
            <div className="ml-2 lg:ml-4 flex items-center space-x-2 border-l border-white/20 pl-4">
              <div className="text-white text-sm font-medium px-3">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="relative inline-block" ref={dropdownRef}>
                <button
                  onClick={() => setSosActive(!sosActive)}
                  className={`px-3 lg:px-4 py-2 rounded-lg cursor-pointer font-bold transition-all flex items-center space-x-2 ${
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
                              <option
                                value="assistance"
                                className="text-gray-900"
                              >
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
                className="p-1.5 lg:p-2.5 rounded-lg cursor-pointer text-white hover:bg-white/10 transition-all flex items-center space-x-1"
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
                <span className="text-sm font-medium uppercase">
                  {language}
                </span>
              </button>

              <button
                onClick={signOut}
                className="p-1 lg:p-2 rounded-lg cursor-pointer text-white hover:bg-red-500 transition-all"
                title={t("nav.logout")}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && !sosActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            ref={mobileMenuRef}
            className="sm:hidden absolute top-20 left-0 right-0 bg-gray-900/95 backdrop-blur-md border-t border-white/10 px-6 py-6 space-y-4 z-50"
          >
            {/* DASHBOARD */}
            <button
              onClick={() => {
                navigate("/app");
                setMobileMenuOpen(false);
              }}
              className="w-full px-4 py-3 bg-blue-600 rounded-lg text-white font-semibold"
            >
              {t("nav.dashboard")}
            </button>

            {/* NOTIFICATIONS */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white"
            >
              🔔 {t("dashboard.notifications")} ({notifications?.length || 0})
            </button>

            {/* USER */}
            <div className="text-center text-white font-medium">
              {user?.firstName} {user?.lastName}
            </div>

            {/* SOS */}
            <button
              onClick={() => {
                setSosActive(true);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg font-bold cursor-pointer bg-red-600`}
            >
              🚨 {t("sos.active")}
            </button>

            {/* LANGUAGE */}
            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="w-full px-4 py-3 bg-white/10 rounded-lg text-white cursor-pointer"
            >
              🌍 {language.toUpperCase()}
            </button>

            {/* LOGOUT */}
            <button
              onClick={signOut}
              className="w-full px-4 py-3 bg-red-500 rounded-lg text-white cursor-pointer font-semibold"
            >
              {t("nav.logout")}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sosActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="sm:hidden fixed top-20 left-0 right-0 bottom-0 bg-gray-900/95 backdrop-blur-md z-50 px-6 py-6 overflow-y-auto"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                🚨 {t("sos.active")}
              </h2>

              <button
                onClick={() => setSosActive(false)}
                className="p-2 rounded-lg bg-white/10 text-white cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>

            {/* SOS FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DESCRIPTION */}
              <div>
                <label className="block text-white mb-1">
                  {t("sos.description")}
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 rounded-md bg-white text-gray-900"
                />
              </div>

              {/* TYPE */}
              <div>
                <label className="block text-white mb-1">{t("sos.type")}</label>
                <select
                  name="typeAlert"
                  value={formData.typeAlert}
                  onChange={handleChange}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full px-3 py-2 rounded-md bg-white text-gray-900"
                >
                  <option value="">
                    {t("sos.typePlaceholder") || "Select"}
                  </option>
                  <option value="medical">
                    {" "}
                    {t("sos.medical") || "Medical"}
                  </option>
                  <option value="fire">{t("sos.fire") || "Fire"}</option>
                  <option value="police">{t("sos.police") || "Police"}</option>
                  <option value="danger">{t("sos.danger") || "Danger"}</option>
                  <option value="assistance">
                    {t("sos.assistance") || "Assistance"}
                  </option>
                  <option value="other">{t("sos.other") || "Other"}</option>
                </select>
              </div>

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSosActive(false)}
                  className="px-4 py-2 bg-gray-400 rounded-md cursor-pointer"
                >
                  {t("common.cancel")}
                </button>

                <button
                  type="submit"
                  disabled={sosLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-md font-bold cursor-pointer"
                >
                  {sosLoading ? t("sos.sending") : t("sos.send")}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserNav;
