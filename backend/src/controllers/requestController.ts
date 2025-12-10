import { Category, HelpSession, Notification, Request, User } from "#models";
import type { requestInputSchema, requestUpdateSchema } from "#schemas";
import type z from "zod";

import type { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";
import { createNotification } from "#controllers";

type RequestDTO = z.infer<typeof requestInputSchema>;
type RequestUpdateDTO = z.infer<typeof requestUpdateSchema>;

export const createRequest: RequestHandler<
  unknown,
  { field?: string; message: string; request?: any },
  RequestDTO
> = async (req, res) => {
  try {
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }

    if (req.body.radius) {
      req.body.radius = Number(req.body.radius);
    }

    const userId = req.user?.id;

    const infosUser = await User.findOne({ _id: userId });
    if (!infosUser) {
      return res
        .status(404)
        .json({ message: "User information not found for creating Request" });
    }

    const {
      typeRequest,
      title,
      description,
      category,
      rewardType,
      price,
      radius,
      urgency,
      typeAlert,
      location,
      longitude,
      latitude,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((file) => file.path) : [];
    const imagesPublicIds = files ? files.map((file) => file.filename) : [];

    if (rewardType === "paid" && (price === undefined || price <= 0)) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res.status(400).json({
        field: "price",
        message: "Price must be greater than 0 for paid requests",
      });
    }

    /*if (typeRequest === "alert") {
      const existingActiveAlert = await Request.findOne({
        userId: userId,
        typeRequest: "alert",
        status: { $in: ["active", "in_progress"] },
      });
      if (existingActiveAlert) {
        if (imagesPublicIds.length > 0) {
          for (const publicId of imagesPublicIds) {
            await cloudinary.uploader.destroy(publicId);
          }
        }

        return res.status(400).json({
          message:
            "You already have an active alert. Please resolve it before creating a new one.",
        });
      }
    }*/

    if (location !== undefined) {
      const regex = /^.+\s\d+\s*,?\s*\d{3,}\s+[A-Za-zÀ-ÖØ-öø-ÿ\s-]+$/;

      if (!regex.test(location)) {
        if (imagesPublicIds.length > 0) {
          for (const publicId of imagesPublicIds) {
            await cloudinary.uploader.destroy(publicId);
          }
        }

        return res.status(400).json({
          field: "location",
          message:
            "Address must contain a street with number, a postal code, and a city",
        });
      }
    }

    console.log("Created Request:", userId);
    const request = await Request.create({
      userId: userId,
      typeRequest,
      title,
      description,
      category,
      rewardType,
      price: rewardType === "paid" ? price : 0,
      radius: typeRequest === "alert" ? radius : 0,
      urgency,
      typeAlert,
      location: location || infosUser.location,
      longitude: longitude || infosUser.longitude,
      latitude: latitude || infosUser.latitude,
      images: images,
      imagesPublicIds: imagesPublicIds,
    });

    // If the request is an alert, create a notification for nearby users
    if (typeRequest === "alert") {
      await createNotification(userId!, "sos", request._id.toString(), {
        latitude: request.latitude,
        longitude: request.longitude,
      });
    }
    //---------------------------------------------

    console.log("Next Request:", userId);
    res.status(201).json({
      message: "Request created successfully",
      request: await request.populate("category", "name"),
    });
  } catch (error) {
    res.status(500).json({
      message: `An error occurred while creating the Request: ${error}`,
    });
  }
};

export const getRequests: RequestHandler = async (req, res) => {
  try {
    /*const requests = await Request.find({
      status: { $in: ["active", "in_progress", "completed"] },
    })*/
    const requests = await Request.find()
      .sort({ createdAt: -1 })
      .populate("category", "name nameDE")
      .populate("userId", "firstName lastName")
      .lean();

    if (!requests.length) {
      return res.status(404).json({ message: "No Request found" });
    }
    const total = requests.length;
    res.status(200).json({ message: `Found ${total} requests`, requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching Requests" });
  }
};

export const getRequestById: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const request = await Request.findById(id)
      .sort({ createdAt: -1 })
      .populate("category", "name nameDE");

    if (!request) {
      return res.status(404).json({ error: `Request with id:${id} not found` });
    }
    res.status(200).json({ message: `Request with id:${id} found`, request });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const myRequests: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const page = req.path;
    let requests;
    let nameReq;
    let total;
    if (page === "/myAlerts") {
      nameReq = "Alerts";
      requests = await Request.find({ userId, typeRequest: "alert" }).populate(
        "category",
        "name nameDE"
      );
      total = await Request.countDocuments({ userId, typeRequest: "alert" });
    } else {
      nameReq = "Requests";
      requests = await Request.find({ userId })
        .sort({ createdAt: -1 })
        .populate("category", "name nameDE");

      total = await Request.countDocuments({ userId });
    }
    if (!requests.length) {
      return res
        .status(404)
        .json({ message: `No ${nameReq} found for this user` });
    }

    res.status(200).json({ message: `My ${nameReq}`, total, requests });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching user's Requests" });
  }
};

export const updateRequest: RequestHandler<
  { id: string },
  { field?: string; message: string; request: RequestDTO | any },
  RequestUpdateDTO
> = async (req, res) => {
  try {
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }

    const {
      body: {
        title,
        description,
        category,
        rewardType,
        price,
        radius,
        urgency,
        typeAlert,
        location,
        longitude,
        latitude,
        status,
        removedImages,
        removedIndexes,
      },
      params: { id },
    } = req;

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((file) => file.path) : [];
    const imagesPublicIds = files ? files.map((file) => file.filename) : [];

    if (rewardType === "paid" && (price === undefined || price <= 0)) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res.status(400).json({
        field: "price",
        message: "Price (if rewardType is 'paid') is required",
        request: undefined,
      });
    }

    if (
      status &&
      !["active", "in_progress", "completed", "inactive", "cancelled"].includes(
        status
      )
    ) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res.status(400).json({
        message: "Invalid status value for request",
        request: undefined,
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res
        .status(404)
        .json({ message: "Request not found", request: undefined });
    }

    if (category) {
      const searchCategory = await Category.findById(category);
      if (!searchCategory) {
        if (imagesPublicIds.length > 0) {
          for (const publicId of imagesPublicIds) {
            await cloudinary.uploader.destroy(publicId);
          }
        }

        return res.status(404).json({
          field: "category",
          message: "Category not found",
          request: undefined,
        });
      }
    }

    if (request.status === "completed" || request.status === "cancelled") {
      return res.status(400).json({
        field: "status",
        message: "Cannot update a completed or cancelled request",
        request: undefined,
      });
    }

    if (removedImages && removedImages.length > 0) {
      const publicIds = Array.isArray(removedImages)
        ? removedImages
        : removedImages
        ? [removedImages]
        : [];

      console.log("Removing images with public IDs:", publicIds);

      for (const publicId of publicIds) {
        console.log("Deleting image with public ID:", publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("Cloudinary deletion result:", result);
      }

      if (removedIndexes && removedIndexes.length > 0) {
        request.images = request.images.filter(
          (_, i) => !removedIndexes.includes(String(i))
        );
        request.imagesPublicIds = request.imagesPublicIds.filter(
          (_, i) => !removedIndexes.includes(String(i))
        );
        await request.save();
      }
    }

    const priceToUpdate = rewardType === "paid" ? price : 0;

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category: category || request.category,
        rewardType: rewardType ? rewardType : request.rewardType,
        price: priceToUpdate,
        radius: radius ? radius : request.radius,
        urgency: urgency ? urgency : request.urgency,
        typeAlert: typeAlert ? typeAlert : request.typeAlert,
        location: location || request.location,
        longitude: longitude || request.longitude,
        latitude: latitude || request.latitude,
        status: status ?? request.status,
        images:
          images.length > 0 ? [...request.images, ...images] : request.images,
        imagesPublicIds:
          imagesPublicIds.length > 0
            ? [...request.imagesPublicIds, ...imagesPublicIds]
            : request.imagesPublicIds,
      },
      { new: true }
    ).populate("category", "name");

    if (status && ["completed", "cancelled"].includes(status as string)) {
      await HelpSession.updateMany(
        { requestId: request._id, status: { $in: ["active"] } },
        {
          status: status,
          finalizedBy: "requester",
          endedAt: new Date(),
        }
      );
    }

    res.json({
      message: "Request updated successfully",
      request: updatedRequest,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message, request: undefined });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred", request: undefined });
    }
  }
};

export const deleteRequest: RequestHandler<{ id: string }> = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const searchAlert = await Request.findById(id).select("typeRequest");
    if (searchAlert?.typeRequest === "alert") {
      await Notification.updateMany(
        { resourceModel: "Request", resourceId: searchAlert._id },
        { status: "cancelled" }
      );
    }

    const imagesToDelete = await Request.findById(id).select("imagesPublicIds");
    if (imagesToDelete) {
      for (const publicId of imagesToDelete.imagesPublicIds) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const request = await Request.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    res.status(200).json({ message: "Request deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the Request" });
  }
};
