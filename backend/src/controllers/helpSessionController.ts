import {
  ChatMessage,
  HelpSession,
  Notification,
  Offer,
  Request,
} from "#models";
import type { helpSessionInputSchema } from "#schemas";
import type { RequestHandler } from "express";
import type z from "zod";
import { createNotification } from "#controllers";

type HelpSessionUpdateDTO = z.infer<typeof helpSessionInputSchema>;

export const createHelpSession: RequestHandler = async (req, res) => {
  try {
    const requestBase = req.baseUrl.split("/").pop() ?? "";

    console.log("Type Request:", requestBase);
    // Implementation for creating a help session
    const {
      params: { id },
    } = req;

    if (!id) {
      return res.status(400).json({ message: "Missing id parameter" });
    }

    const userId = req.user?.id;

    if (!["offers", "requests"].includes(requestBase)) {
      return res.status(400).json({
        message: "Invalid typeRequest. Must be 'offers' or 'requests'.",
      });
    }

    // Get Offer or Request details based on typeRequest
    let resource: any | null;

    resource =
      requestBase === "offers"
        ? await Offer.findById(id)
        : await Request.findById(id);

    const nameRequest = requestBase.slice(0, -1);

    if (!resource) {
      return res.status(404).json({ message: `${nameRequest} not found` });
    }

    if (resource.userId.toString() === userId) {
      return res
        .status(400)
        .json({ message: `You cannot accept your own ${nameRequest}` });
    }

    // Prevent duplicate sessions except alerts
    const isAlert =
      requestBase === "requests" && resource.typeRequest === "alert";

    if (!isAlert) {
      // Check if a session already exists between the same users
      const existingSession = await HelpSession.findOne({
        $or: [
          {
            userRequesterId: userId,
            userHelperId: resource.userId,
            status: "active",
          },
          {
            userRequesterId: resource.userId,
            userHelperId: userId,
            status: "active",
          },
        ],
      });

      if (existingSession) {
        return res.status(400).json({
          message: "You already have an active session with this user.",
        });
      }
    }

    // Expire notifications for alerts
    if (isAlert) {
      await Notification.updateMany(
        {
          userId: { $ne: userId },
          resourceModel: "Request",
          resourceId: resource._id,
          status: "active",
        },
        { status: "expired" }
      );
    }

    if (resource.status === "in_progress") {
      return res
        .status(400)
        .json({ message: `${nameRequest} is already taken` });
    }

    let userRequesterId;
    let userHelperId;

    if (requestBase === "offers") {
      userRequesterId = userId; // The user who needs help
      userHelperId = resource.userId; // The author of the offer
    } else {
      userRequesterId = resource.userId; // The author of the request who needs help
      userHelperId = userId; // The user who is helping
    }

    resource.status = "in_progress";
    await resource.save();

    const helpSession = await HelpSession.create({
      requestId: requestBase === "requests" ? id : undefined,
      offerId: requestBase === "offers" ? id : undefined,

      userRequesterId: userRequesterId,
      userHelperId: userHelperId,

      status: "active",
      startedAt: new Date(),
    });

    const fullSession = await HelpSession.findById(helpSession._id)
      .populate("requestId", "title description typeRequest")
      .populate("offerId", "title description typeRequest")
      .populate("userRequesterId", "firstName lastName email")
      .populate("userHelperId", "firstName lastName email");

    // Create notification for the resource owner
    await createNotification(resource.userId.toString(), nameRequest, id);
    //-----------------------------------------

    return res.status(201).json({
      message: "Help session created successfully",
      helpSession: fullSession,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while creating the help session" });
  }
};

export const getHelpSession: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    const helpSessions = await HelpSession.find({
      $or: [{ userRequesterId: userId }, { userHelperId: userId }],
    })
      .populate("requestId", "category title description typeRequest")
      .populate("offerId", "category title description typeRequest");

    if (!helpSessions.length) {
      return res
        .status(404)
        .json({ message: "No help sessions found for this user" });
    }

    const totalSessions = helpSessions.length;
    // Determine the option based on the first help session (avoid accessing property on the array)

    const sessionsWithOption = await Promise.all(
      helpSessions.map(async (session) => {
        if (userId === session.userRequesterId.toString()) {
          await session.populate("userHelperId", "firstName lastName email");
        } else {
          await session.populate("userRequesterId", "firstName lastName email");
        }

        const option = session.requestId
          ? "You are requesting help"
          : "You are accepting an offer";

        const unreadCount = await ChatMessage.countDocuments({
          sessionId: session._id,
          receiverId: userId,
          isRead: false,
        });

        const lastMessage = await ChatMessage.findOne({
          sessionId: session._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        const etat =
          session.status === "active"
            ? "In Progress"
            : session.status === "completed"
            ? "Completed"
            : "Cancelled";

        let final;
        if (
          session.finalizedBy === "requester" &&
          userId === session.userRequesterId.toString()
        ) {
          final = "You finalized the session";
        } else if (
          session.finalizedBy === "helper" &&
          userId === session.userHelperId.toString()
        ) {
          final = "You finalized the session";
        } else if (
          session.finalizedBy === "helper" &&
          userId !== session.userHelperId.toString()
        ) {
          final = "The helper finalized the session";
        } else if (
          session.finalizedBy === "requester" &&
          userId !== session.userRequesterId.toString()
        ) {
          final = "The requester finalized the session";
        } else if (session.finalizedBy === "system") {
          final = "The system finalized the session";
        } else {
          final = "Not finalized yet";
        }

        return {
          option,
          etat,
          final,
          unreadCount,
          lastMessage,
          ...session.toObject(), // Convert Mongoose document to plain object
        };
      })
    );

    res.status(200).json({
      message: "Help Sessions found",
      totalSessions,
      helpSessions: sessionsWithOption,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching help sessions" });
  }
};

export const updateHelpSession: RequestHandler<
  { id: string },
  { message: string; helpSession?: any },
  HelpSessionUpdateDTO
> = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const { status, result, notes, rating } = req.body;

    const helpSession = await HelpSession.findById(id);
    if (!helpSession) {
      return res.status(404).json({ message: "Help session not found" });
    }

    if (status && !["completed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ message: "Invalid status value for help session" });
    }

    if (helpSession.status !== "active") {
      return res.status(400).json({
        message:
          "This help session is already finalized (completed or cancelled)",
      });
    }

    helpSession.status = status;
    helpSession.result = result ?? helpSession.result;
    helpSession.notes = notes ?? helpSession.notes;
    helpSession.rating = rating ?? helpSession.rating;
    helpSession.endedAt = new Date();

    if (req.user?.id === helpSession.userRequesterId.toString())
      helpSession.finalizedBy = "requester";
    else helpSession.finalizedBy = "helper";

    helpSession.ratingPending = status === "completed";

    if (helpSession.requestId) {
      const request = await Request.findById(helpSession.requestId);
      if (request) {
        request.status = status === "completed" ? "completed" : "active";
        await request.save();
      }
    }
    if (helpSession.offerId) {
      const offer = await Offer.findById(helpSession.offerId);
      if (offer) {
        offer.status = status === "completed" ? "completed" : "active";
        await offer.save();
      }
    }

    await helpSession.save();

    let message = "";

    if (status === "completed") {
      message = "You have completed the help session successfully.\n";
      if (result === "successful")
        message += " The help session was successful.\n";
      else if (result === "unsuccessful")
        message += " The help session was unsuccessful.\n";
      else if (result === "partial")
        message += " The help session was partially successful.\n";

      if (rating) {
        message += ` You rated the session with ${rating} stars.`;
      }
    } else if (status === "cancelled") {
      message = "You have cancelled the help session.";
    }

    res.status(200).json({ message, helpSession });
  } catch (error: any) {
    res.status(500).json({
      message: `An error occurred while updating the help session: ${error.message}`,
    });
  }
};
