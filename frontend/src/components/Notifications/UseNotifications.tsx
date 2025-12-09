import { useEffect, useRef, useState } from "react";
import { NOTIFICATION_API_URL } from "../../config";

const UseNotifications = ({ userId }: { userId: string }) => {
  const [permission, setPermission] = useState(
    localStorage.getItem("notificationsAccepted") === "true"
      ? "granted"
      : Notification.permission
  );

  const seenNotifications = useRef(new Set());

  useEffect(() => {
    // Vérifie localStorage au chargement
    const stored = localStorage.getItem("notificationsAccepted");
    if (stored === "true" && Notification.permission !== "granted") {
      // On peut ré-demander la permission si besoin
      Notification.requestPermission().then((result) => setPermission(result));
    }
  }, []);

  // Demande la permission à l'utilisateur
  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Votre navigateur ne supporte pas les notifications");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      localStorage.setItem("notificationsAccepted", "true");
    }
    return result;
  };

  useEffect(() => {
    if (permission !== "granted") return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${NOTIFICATION_API_URL}`);
        const notifications = (await res.json()) as Array<{
          _id: string;
          title?: string;
          message?: string;
          icon?: string;
        }>;

        if (!Array.isArray(notifications)) return;

        notifications.forEach((notif) => {
          if (!notif || typeof notif._id !== "string") return;
          if (!seenNotifications.current.has(notif._id)) {
            new Notification(notif.title || "New Notification", {
              body: notif.message,
              icon:
                notif.icon ||
                "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            });
            seenNotifications.current.add(notif._id);
          }
        });
      } catch (err) {
        console.error("Erreur notification polling:", err);
      }
    };

    // Premier fetch immédiatement
    fetchNotifications();

    // Puis fetch toutes les X secondes
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [permission, userId]);

  return { permission, requestPermission };
};

export default UseNotifications;
