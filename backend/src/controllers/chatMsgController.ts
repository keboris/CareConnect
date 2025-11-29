import { ChatMessage, HelpSession, Notification } from "#models";
import type { chatMessageInputSchema } from "#schemas";
import type { RequestHandler } from "express";
import z from "zod";
import { v2 as cloudinary } from "cloudinary";

type chatMessageDTO = z.infer<typeof chatMessageInputSchema>;

export const sendMessage: RequestHandler<
  { sessionId: string },
  { message: string; messageData?: any },
  chatMessageDTO
> = async (req, res) => {
  try {
    const {
      params: { sessionId },
    } = req;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { content } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const attachements = files ? files.map((file) => file.path) : [];
    const attachementsPublicIds = files
      ? files.map((file) => file.filename)
      : [];

    const sessionData = await HelpSession.findById(sessionId);
    if (!sessionData) {
      return res.status(404).json({ message: "Help session not found" });
    }

    if (sessionData.status !== "active") {
      return res
        .status(400)
        .json({ message: "Cannot send message to inactive session" });
    }

    // Determine the receiver
    let receiverId;
    if (sessionData.userRequesterId.toString() === userId) {
      receiverId = sessionData.userHelperId;
    } else if (sessionData.userHelperId.toString() === userId) {
      receiverId = sessionData.userRequesterId;
    } else {
      return res
        .status(403)
        .json({ message: "You are not part of this session" });
    }

    const newMessage = await ChatMessage.create({
      sessionId,
      senderId: userId,
      receiverId,
      content,
      attachements,
      attachementsPublicIds,
    });

    const notification = await Notification.create({
      userId: receiverId,
      resourceModel: "HelpSession",
      resourceId: sessionId,
      title: "New Message Received",
      message: newMessage.content,
      type: "chat",
    });

    await ChatMessage.findByIdAndUpdate(newMessage._id, {
      $set: { notifId: notification._id },
    });

    res
      .status(201)
      .json({ message: "Message sent successfully", messageData: newMessage });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while sending the message" });
  }
};

export const getMessagesBySession: RequestHandler<
  { sessionId: string },
  { message: string; total?: number; messages?: any[] }
> = async (req, res) => {
  try {
    const {
      params: { sessionId },
    } = req;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionData = await HelpSession.findById(sessionId);
    if (!sessionData) {
      return res.status(404).json({ message: "Help session not found" });
    }

    if (
      sessionData.userRequesterId.toString() !== userId &&
      sessionData.userHelperId.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not part of this session" });
    }

    const messages = await ChatMessage.find({ sessionId }).sort({
      createdAt: 1,
    });

    res.status(200).json({
      message: "Messages retrieved successfully",
      total: messages.length,
      messages,
    });
  } catch (error: any) {
    res.status(500).json({
      message: `An error occurred while fetching messages ${error.message}`,
    });
  }
};

export const markMessageAsRead: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const {
      params: { id },
    } = req;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const msg = await ChatMessage.findById(id);
    if (!msg) {
      return res
        .status(404)
        .json({ message: `Message with id:${id} not found` });
    }

    if (msg.receiverId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not the receiver of this message" });
    }

    await ChatMessage.updateMany(
      {
        sessionId: msg.sessionId,
        receiverId: userId,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    await Notification.updateMany(
      {
        userId,
        resourceModel: "HelpSession",
        resourceId: msg.sessionId,
        isRead: false,
      },
      { isRead: true, status: "expired" }
    );

    res
      .status(200)
      .json({ message: "Message marked as read", messageData: msg });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the message" });
  }
};

export const markAllMessagesAsRead: RequestHandler<{
  sessionId: string;
}> = async (req, res) => {
  try {
    const {
      params: { sessionId },
    } = req;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessionData = await HelpSession.findById(sessionId);
    if (!sessionData) {
      return res.status(404).json({ message: "Help session not found" });
    }

    if (
      sessionData.userRequesterId.toString() !== userId &&
      sessionData.userHelperId.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not part of this session" });
    }

    await ChatMessage.updateMany(
      { sessionId, receiverId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All messages marked as read" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating messages" });
  }
};

export const updateMessage: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const {
      params: { id },
    } = req;

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get updated content
    const { content } = req.body;

    // New files (optional)
    const files = req.files as Express.Multer.File[] | undefined;
    const attachements = files ? files.map((file) => file.path) : [];
    const attachementsPublicIds = files
      ? files.map((file) => file.filename)
      : [];

    // Find message
    const msg = await ChatMessage.findById(id);
    if (!msg) {
      return res
        .status(404)
        .json({ message: `Message with id:${id} not found` });
    }

    // Must be sender
    if (msg.senderId.toString() !== userId) {
      return res.status(403).json({
        message: "You can only edit messages you sent",
      });
    }

    // Check time window (5 minutes)
    const EDIT_WINDOW_MINUTES = 5;
    const timeSinceSent = (Date.now() - msg.createdAt.getTime()) / 1000 / 60; // in minutes

    if (timeSinceSent > EDIT_WINDOW_MINUTES) {
      return res.status(400).json({
        message: `You can only edit a message within ${EDIT_WINDOW_MINUTES} minutes after sending it`,
      });
    }

    // Prevent editing if receiver has already read it
    if (msg.isRead) {
      return res.status(400).json({
        message: "You cannot edit a message that has already been read",
      });
    }

    // Update fields
    msg.content = content ?? msg.content;

    // Replace attachments only if new files are uploaded
    if (files && files.length > 0) {
      const imagesToDelete = await ChatMessage.findById(id).select(
        "attachementsPublicIds"
      );
      if (imagesToDelete) {
        for (const publicId of imagesToDelete.attachementsPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      msg.attachements = attachements;
      msg.attachementsPublicIds = attachementsPublicIds;
    }

    msg.edited = true;
    msg.updatedAt = new Date();

    await msg.save();

    await Notification.findByIdAndUpdate(msg.notifId, {
      message: msg.content,
    });

    res.status(200).json({
      message: "Message updated successfully",
      messageData: msg,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while updating the message",
    });
  }
};
