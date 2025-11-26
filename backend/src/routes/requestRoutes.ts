import {
  createRequest,
  deleteRequest,
  getRequestById,
  getRequests,
  myRequests,
  updateRequest,
} from "#controllers";
import { Request } from "#models";
import { authenticate, authorize, upload, validateBodyZod } from "#middlewares";
import { requestInputSchema, requestUpdateSchema } from "#schemas";
import { Router } from "express";

const requestRoutes = Router();

requestRoutes.get("/", getRequests);

requestRoutes.post(
  "/",
  authenticate,
  validateBodyZod(requestInputSchema),
  upload.array("image", 5),
  createRequest
);

requestRoutes.get("/myRequests", authenticate, myRequests);
requestRoutes.get("/myAlerts", authenticate, myRequests);

requestRoutes.get("/:id", getRequestById);

requestRoutes.put(
  "/:id",
  authenticate,
  authorize(Request),
  upload.array("image", 5),
  validateBodyZod(requestUpdateSchema),
  updateRequest
);

requestRoutes.delete("/:id", authenticate, authorize(Request), deleteRequest);

export default requestRoutes;
