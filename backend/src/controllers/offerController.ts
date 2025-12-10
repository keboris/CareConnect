import { Category, HelpSession, Offer, User } from "#models";
import type { offerInputSchema, offerUpdateSchema } from "#schemas";
import type z from "zod";

import type { RequestHandler } from "express";
import { v2 as cloudinary } from "cloudinary";

type OfferDTO = z.infer<typeof offerInputSchema>;
type OfferUpdateDTO = z.infer<typeof offerUpdateSchema>;

export const createOffer: RequestHandler<
  unknown,
  { field?: string; message: string; offer?: any },
  OfferDTO
> = async (req, res) => {
  try {
    if (req.body.price) {
      req.body.price = Number(req.body.price);
    }

    const userId = req.user?.id;

    const infosUser = await User.findOne({ _id: userId });
    if (!infosUser) {
      return res
        .status(404)
        .json({ message: "User information not found for creating offer" });
    }

    const {
      title,
      description,
      category,
      isPaid,
      price,
      location,
      longitude,
      latitude,
    } = req.body;

    const files = req.files as Express.Multer.File[] | undefined;
    const images = files ? files.map((file) => file.path) : [];
    const imagesPublicIds = files ? files.map((file) => file.filename) : [];

    if (isPaid && (price === undefined || price <= 0)) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
      return res.status(400).json({
        field: "price",
        message: "Price must be greater than 0 for paid offers",
      });
    }

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

    const offer = await Offer.create({
      userId: userId,
      title,
      description,
      category,
      isPaid,
      price,
      location: location || infosUser.location,
      longitude: longitude || infosUser.longitude,
      latitude: latitude || infosUser.latitude,
      images: images,
      imagesPublicIds: imagesPublicIds,
    });
    res.status(201).json({
      message: "Offer created successfully",
      offer: await offer.populate("category", "name"),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while creating the offer" });
  }
};

export const getOffers: RequestHandler = async (req, res) => {
  try {
    /*const offers = await Offer.find({
      status: { $in: ["active", "in_progress", "completed"] },
    })*/
    const offers = await Offer.find()
      .sort({ createdAt: -1 })
      .populate("category", "name nameDE")
      .populate("userId", "firstName lastName rating location")
      .lean();

    if (!offers.length) {
      return res.status(404).json({ message: "No Offer found" });
    }
    const total = offers.length;
    res.status(200).json({ message: `Found ${total} offers`, offers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching offers" });
  }
};

export const getOfferById: RequestHandler = async (req, res) => {
  try {
    const {
      params: { id },
    } = req;
    const offer = await Offer.findById(id).populate("category", "name");

    if (!offer) {
      return res.status(404).json({ error: `Offer with id:${id} not found` });
    }
    res.status(200).json({ message: `Offer with id:${id} found`, offer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const myOffers: RequestHandler = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const offers = await Offer.find({ userId })
      .sort({ createdAt: -1 })
      .populate("category", "name nameDE")
      .populate("userId", "rating");

    if (!offers.length) {
      return res.status(404).json({ message: "No offers found for this user" });
    }

    const total = offers.length;
    res.status(200).json({ message: "My Offers", total, offers });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while fetching user's offers" });
  }
};

export const updateOffer: RequestHandler<
  { id: string },
  { field?: string; message: string; offer: OfferDTO | any },
  OfferUpdateDTO
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
        isPaid,
        price,
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

    if (isPaid && (price === undefined || price <= 0)) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res.status(400).json({
        field: "price",
        message: "Price (if isPaid is true) is required",
        offer: undefined,
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

      return res
        .status(400)
        .json({ message: "Invalid status value for offer", offer: undefined });
    }

    const offer = await Offer.findById(id);
    if (!offer) {
      if (imagesPublicIds.length > 0) {
        for (const publicId of imagesPublicIds) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      return res
        .status(404)
        .json({ message: "Offer not found", offer: undefined });
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
          offer: undefined,
        });
      }
    }

    if (offer.status === "completed" || offer.status === "cancelled") {
      return res.status(400).json({
        field: "status",
        message: "Cannot update a completed or cancelled offer",
        offer: undefined,
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
        offer.images = offer.images.filter(
          (_, i) => !removedIndexes.includes(String(i))
        );
        offer.imagesPublicIds = offer.imagesPublicIds.filter(
          (_, i) => !removedIndexes.includes(String(i))
        );
        await offer.save();
      }
    }
    const priceToUpdate = isPaid ? price : 0;

    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      {
        title,
        description,
        category: category || offer.category,
        isPaid: typeof isPaid === "boolean" ? isPaid : offer.isPaid,
        price: priceToUpdate,
        location: location || offer.location,
        longitude: longitude || offer.longitude,
        latitude: latitude || offer.latitude,
        status: status ?? offer.status,
        images: images.length > 0 ? [...offer.images, ...images] : offer.images,
        imagesPublicIds:
          imagesPublicIds.length > 0
            ? [...offer.imagesPublicIds, ...imagesPublicIds]
            : offer.imagesPublicIds,
      },
      { new: true }
    ).populate("category", "name");

    if (status && ["completed", "cancelled"].includes(status as string)) {
      await HelpSession.updateMany(
        { offerId: offer._id, status: { $in: ["active"] } },
        {
          status: status,
          finalizedBy: "helper",
          endedAt: new Date(),
        }
      );
    }

    res.json({ message: "Offer updated successfully", offer: updatedOffer });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message, offer: undefined });
    } else {
      res
        .status(500)
        .json({ message: "An unknown error occurred", offer: undefined });
    }
  }
};

export const deleteOffer: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const { id } = req.params;

    const imagesToDelete = await Offer.findById(id).select("imagesPublicIds");
    if (imagesToDelete) {
      for (const publicId of imagesToDelete.imagesPublicIds) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    const offer = await Offer.findByIdAndDelete(id);
    if (!offer) {
      return res.status(404).json({ error: "Offer not found" });
    }
    res.status(200).json({ message: "Offer deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "An error occurred while deleting the offer" });
  }
};
