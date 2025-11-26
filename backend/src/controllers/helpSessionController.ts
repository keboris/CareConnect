import { HelpSession, Offer, Request } from "#models";
import type { RequestHandler } from "express";

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
