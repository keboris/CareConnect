import {
  createOffer,
  deleteOffer,
  getOfferById,
  getOffers,
  myOffers,
  updateOffer,
} from "#controllers";
import { Offer } from "#models";
import { authenticate, authorize, upload, validateBodyZod } from "#middlewares";
import { offerInputSchema, offerUpdateSchema } from "#schemas";
import { Router } from "express";

const offerRoutes = Router();

offerRoutes.get("/", getOffers);

offerRoutes.post(
  "/",
  authenticate,
  validateBodyZod(offerInputSchema),
  upload.array("image", 5),
  createOffer
);

offerRoutes.get("/myOffers", authenticate, myOffers);

offerRoutes.get("/:id", getOfferById);

offerRoutes.put(
  "/:id",
  authenticate,
  authorize(Offer),
  upload.array("image", 5),
  validateBodyZod(offerUpdateSchema),
  updateOffer
);

offerRoutes.delete("/:id", authenticate, authorize(Offer), deleteOffer);

export default offerRoutes;
