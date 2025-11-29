import {
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

chatMsgRoutes.patch(
  "/:id/read",
  authenticate,
  authorize(ChatMessage),
  markMessageAsRead
);
chatMsgRoutes.patch(
  "/:sessionId/read-all",
  authenticate,
  authorize(ChatMessage),
  markAllMessagesAsRead
);

chatMsgRoutes.put("/:id", authenticate, authorize(ChatMessage), updateMessage);

export default chatMsgRoutes;
