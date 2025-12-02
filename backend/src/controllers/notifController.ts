import { Notification, User } from "#models";
import type { RequestHandler } from "express";

// Haversine formula to calculate distance between two coordinates
const getDistanceInKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const createNotification = async (
  userId: string,
  option: string,
  resourceId: string,
  location?: { latitude: number; longitude: number }
) => {
  try {
    // Implementation for creating a notification
    let title = "";
    let message = "";
    let model = "";
    let usersToNotify: string[] = [];

    if (option === "request") {
      title = "Request Accepted";
      message = "Your request has been accepted by a helper.";
      usersToNotify = [userId];
      model = "Request";
    } else if (option === "offer") {
      title = "Offer Accepted";
      message = "Your offer has been accepted by a requester.";
      usersToNotify = [userId];
      model = "Offer";
    } else if (option === "sos") {
      if (!location) {
        throw new Error("Location is required for SOS notifications");
      }
      title = "SOS Alert";
      message = `An SOS alert has been triggered near you. Please respond immediately.`;

      const users = await User.find({
        _id: { $ne: userId },
      });

      // Filter users within a 5 km radius
      usersToNotify = users
        .filter((user) => {
          if (!user.latitude || !user.longitude) return false;

          const distance = getDistanceInKm(
            location.latitude,
            location.longitude,
            user.latitude,
            user.longitude
          );
          return distance <= 5; // within 5 km
        })
        .map((user) => user._id.toString());
      model = "Request";
    }

    await Promise.all(
      usersToNotify.map(async (uid) => {
        await Notification.create({
          userId: uid,
          resourceModel: model,
          resourceId: resourceId,
          title,
          message,
          type: option,
          isRead: false,
          createdAt: new Date(),
        });
      })
    );

    return true;
  } catch (error) {
    console.error("Error creating notification:", error);
    return false;
  }
};

export const getNotifications: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const notifications = await Notification.find({ userId }).sort({
      createdAt: -1,
    });

    /*const populatedNotifications = await Promise.all(
  notifications.map(async (notif) => {
    const Model = notif.resourceModel === "Request"
      ? notif.resourceModel === "Request"
      : (notif.resourceModel === "Offer" ? notif.resourceModel === "Offer"
        : notif.resourceModel === "HelpSession");

    const resource = await Model.findById(notif.resourceId);

    return {
      ...notif.toObject(),
      resource,
    };
  })
);*/

    res.status(200).json({
      message: `You have ${notifications.length} notifications`,
      notifications,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching notifications" });
  }
};

export const markNotificationAsRead: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const {
      params: { id },
    } = req;
    const notification = await Notification.findById(id);
    if (!notification) {
      return res
        .status(404)
        .json({ message: `Notification with id:${id} not found` });
    }
    notification.isRead = true;
    await notification.save();
    res
      .status(200)
      .json({ message: "Notification marked as read", notification });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the notification" });
  }
};

export const markAllNotificationsAsRead: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating notifications" });
  }
};

export const deleteNotification: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const {
      params: { id },
    } = req;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification)
      return res
        .status(404)
        .json({ message: `Notification with id:${id} not found` });

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the notification" });
  }
};
export const deleteAllNotifications: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Notification.deleteMany({ userId });
    res.status(200).json({ message: "All notifications deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting notifications" });
  }
};
