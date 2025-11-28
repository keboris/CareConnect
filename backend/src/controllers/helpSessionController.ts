import { HelpSession, Offer, Request } from "#models";
import type { helpSessionInputSchema } from "#schemas";
import type { RequestHandler } from "express";
import type z from "zod";

type HelpSessionUpdateDTO = z.infer<typeof helpSessionInputSchema>;

export const createHelpSession: RequestHandler = async (req, res) => {
  try {
    const requestBase = req.baseUrl.split("/").pop() ?? "";

    console.log("Type Request:", requestBase);
    // Implementation for creating a help session
    const {
      params: { id },
    } = req;

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

    if (resource.status === "in_progress") {
      return res
        .status(400)
        .json({ message: `${nameRequest} is already taken` });
    }

    resource.status = "in_progress";
    await resource.save();

    let requestId;
    let offerId;
    let userRequesterId;
    let userHelperId;

    if (requestBase === "offers") {
      requestId = undefined;
      offerId = id;

      userRequesterId = userId; // The user who needs help
      userHelperId = resource.userId; // The author of the offer
    } else {
      requestId = id;
      offerId = undefined;

      userRequesterId = resource.userId; // The author of the request who needs help
      userHelperId = userId; // The user who is helping
    }

    const helpSession = await HelpSession.create({
      requestId: requestId,
      offerId: offerId,

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
      .populate("requestId", "title description typeRequest")
      .populate("offerId", "title description typeRequest")
      .populate("userRequesterId", "firstName lastName email")
      .populate("userHelperId", "firstName lastName email");
    if (!helpSessions.length) {
      return res
        .status(404)
        .json({ message: "No help sessions found for this user" });
    }
    // Determine the option based on the first help session (avoid accessing property on the array)

    const sessionsWithOption = helpSessions.map((session) => {
      const option =
        session.requestId === null
          ? "You are accepting an offer"
          : "You are requesting help";

      const etat =
        session.status === "active"
          ? "In Progress"
          : session.status === "completed"
          ? "Completed"
          : "Cancelled";

      return {
        option,
        etat,
        ...session.toObject(), // Convert Mongoose document to plain object
      };
    });

    res.status(200).json({
      message: "Help Sessions found",
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
      return res
        .status(400)
        .json({ message: "Only active help sessions can be updated" });
    }

    helpSession.status = status || helpSession.status;
    helpSession.result = result || helpSession.result;
    helpSession.notes = notes || helpSession.notes;
    helpSession.rating = rating || helpSession.rating;

    helpSession.endedAt = new Date();
    if (req.user?.id === helpSession.userRequesterId.toString())
      helpSession.finalizedBy = "requester";
    else if (req.user?.id === helpSession.userHelperId.toString())
      helpSession.finalizedBy = "helper";

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

    res.status(200).json({ message: "Help session updated", helpSession });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while updating the help session" });
  }
};
