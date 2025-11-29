import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "#controllers";
import { authenticate, authorize } from "#middlewares";
import { Notification } from "#models";
import { Router } from "express";

const notifRoutes = Router();

notifRoutes.get("/", authenticate, getNotifications);

notifRoutes.patch(
  "/:id/read",
  authenticate,
  authorize(Notification),
  markNotificationAsRead
);
notifRoutes.patch(
  "/read-all",
  authenticate,
  authorize(Notification),
  markAllNotificationsAsRead
);

notifRoutes.delete(
  "/:id",
  authenticate,
  authorize(Notification),
  deleteNotification
);
notifRoutes.delete(
  "/delete-all",
  authenticate,
  authorize(Notification),
  deleteAllNotifications
);

export default notifRoutes;
