import express from "express";
import "#db";
import swaggerUI from "swagger-ui-express";
import { errorHandler } from "#middlewares";
import cookieParser from "cookie-parser";
import {
  authRoutes,
  categoryRoutes,
  offerRoutes,
  requestRoutes,
  userRoutes,
  helpSessionRoutes,
  langRoutes,
} from "#routes";

import { spec } from "#docs";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "https://careconnect-frontend-5jih.onrender.com/", // Frontend URL
    //"http://localhost:5173", // Frontend URL
    credentials: true, // to send cookies (refreshToken)
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes

// Categories
app.use("/categories", categoryRoutes);

// Languages and Skills
app.use("/languages", langRoutes);
app.use("/skills", langRoutes);

// Authentication
app.use("/auth", authRoutes);

// Users
app.use("/users", userRoutes);

// Offers
app.use("/offers", offerRoutes);

// Requests
app.use("/requests", requestRoutes);

// Help Sessions
app.use("/help-sessions", helpSessionRoutes);

// Docs
app.use("/docs", swaggerUI.serve, swaggerUI.setup(spec));

app.use(errorHandler);

app.listen(port, () => {
  console.log(`\x1b[34mMain app listening at http://localhost:${port}\x1b[0m`);
  console.log(
    `\x1b[34mSwagger docs available at http://localhost:${port}/docs\x1b[0m`
  );
});
