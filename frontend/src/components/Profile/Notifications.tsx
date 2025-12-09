import { useEffect, useState } from "react";
import { useAuth, useLanguage } from "../../contexts";
import { NOTIFICATION_API_URL } from "../../config";
import type { NotificationProps } from "../../types";
import { Card, CardContent, Loading } from "../../components";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  CheckCircle,
  Bell,
  AlertCircle,
  MessageCircle,
  Zap,
  Calendar,
  Inbox,
} from "lucide-react";
import { timeAgo } from "../../lib";

const Notifications = () => {
  const { refreshUser, loading } = useAuth();
  const { t } = useLanguage();

  const [notifications, setNotifications] = useState<NotificationProps[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRead, setFilterRead] = useState<string>("unread");

  // Fetch notifications
  useEffect(() => {
    if (loading) return;

    const fetchNotifications = async () => {
      try {
        const response = await refreshUser(`${NOTIFICATION_API_URL}`);
        const data = await response.json();

        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [loading]);

  // Filter notifications
  const filteredNotifications = notifications.filter((notif) => {
    let typeMatch = true;
    let readMatch = true;

    if (filterType !== "all") {
      typeMatch = notif.type === filterType;
    }

    if (filterRead === "unread") {
      readMatch = !notif.isRead;
    } else if (filterRead === "read") {
      readMatch = notif.isRead;
    }

    return typeMatch && readMatch;
  });

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await refreshUser(
        `${NOTIFICATION_API_URL}/${notificationId}/read`,
        {
          method: "PATCH",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      const response = await refreshUser(`${NOTIFICATION_API_URL}/readAll`, {
        method: "PATCH",
      });

      if (response.ok) {
        setNotifications(
          notifications.map((notif) => ({ ...notif, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const response = await refreshUser(
        `${NOTIFICATION_API_URL}/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.filter((notif) => notif._id !== notificationId)
        );
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?"))
      return;

    try {
      const response = await refreshUser(`${NOTIFICATION_API_URL}/deleteAll`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "request":
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
      case "offer":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "sos":
        return <Zap className="w-5 h-5 text-red-600" />;
      case "session":
        return <MessageCircle className="w-5 h-5 text-purple-600" />;
      case "chat":
        return <MessageCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case "request":
        return "bg-blue-50 border-l-4 border-blue-600";
      case "offer":
        return "bg-green-50 border-l-4 border-green-600";
      case "sos":
        return "bg-red-50 border-l-4 border-red-600";
      case "session":
        return "bg-purple-50 border-l-4 border-purple-600";
      case "chat":
        return "bg-orange-50 border-l-4 border-orange-600";
      default:
        return "bg-gray-50 border-l-4 border-gray-600";
    }
  };

  if (loading || loadingNotifications) return <Loading />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t("dashboard.notifications")}
          </h2>
          <p className="text-gray-600 mt-1">
            {unreadCount} unread • {notifications.length} total
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              Mark all as read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotifications}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all text-sm font-medium"
            >
              Clear all
            </button>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="space-y-3"
      >
        {/* Type Filter */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 self-center">
            Type:
          </span>
          {["all", "request", "offer", "sos", "session", "chat", "system"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg transition-all text-sm ${
                  filterType === type
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Read Status Filter */}
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700 self-center">
            Status:
          </span>
          {["unread", "read", "all"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterRead(status)}
              className={`px-4 py-2 rounded-lg transition-all text-sm ${
                filterRead === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Notifications List */}
      <AnimatePresence>
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <Inbox className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {notifications.length === 0
                ? "No notifications yet"
                : "No notifications match your filters"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notif, idx) => (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <Card
                  className={`rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden border-0 cursor-pointer ${getNotificationColor(
                    notif.type
                  )}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notif.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h3
                              className={`font-semibold text-gray-800 ${
                                notif.isRead
                                  ? "font-normal text-gray-600"
                                  : "font-bold"
                              }`}
                            >
                              {notif.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {notif.message}
                            </p>
                          </div>

                          {/* Unread Badge */}
                          {!notif.isRead && (
                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2"></span>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-gray-500 text-xs mt-3">
                          <Calendar size={12} />
                          <span>{timeAgo(notif.createdAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex-shrink-0 flex gap-2">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif._id)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-all"
                            title="Mark as read"
                          >
                            <CheckCircle size={18} className="text-gray-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notif._id)}
                          className="p-2 hover:bg-red-200 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
