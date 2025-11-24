import express from "express";
import "#db";
import swaggerUI from "swagger-ui-express";
import { errorHandler } from "#middlewares";
import cookieParser from "cookie-parser";

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

// Routes

// Docs

app.use(errorHandler);

app.listen(port, () => {
  console.log(`\x1b[34mMain app listening at http://localhost:${port}\x1b[0m`);
  console.log(
    `\x1b[34mSwagger docs available at http://localhost:${port}/docs\x1b[0m`
  );
});
