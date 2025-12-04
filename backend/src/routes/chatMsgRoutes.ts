import {
  deleteMessage,
  getMessagesBySession,
  markAllMessagesAsRead,
  markMessageAsRead,
  sendMessage,
  updateMessage,
} from "#controllers";
import { authenticate, authorize } from "#middlewares";
import { ChatMessage } from "#models";
import { Router } from "express";

const chatMsgRoutes = Router();

chatMsgRoutes.post("/:sessionId", authenticate, sendMessage);

chatMsgRoutes.get("/:sessionId", authenticate, getMessagesBySession);

chatMsgRoutes.patch("/:id/read", authenticate, markMessageAsRead);

chatMsgRoutes.patch("/:sessionId/readAll", authenticate, markAllMessagesAsRead);

chatMsgRoutes.put("/:id", authenticate, authorize(ChatMessage), updateMessage);

chatMsgRoutes.delete(
  "/:id",
  authenticate,
  authorize(ChatMessage),
  deleteMessage
);

export default chatMsgRoutes;
