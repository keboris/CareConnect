import type { RequestHandler } from "express";
import type { ZodObject } from "zod/v4";

const validateBodyZod =
  (zodSchema: ZodObject): RequestHandler =>
  (req, res, next) => {
    console.log("Body :", req.body);
    const parsed = zodSchema.safeParse(req.body);
    console.log("Parsed result:", parsed);
    console.log(parsed?.error?.issues);

    if (!parsed.success) {
      const issues = parsed.error?.issues.map((issue) => ({
        field: issue.path.join(),
        message: issue.message,
      }));

      console.log("Validation issues:", issues);
      return res.status(400).json({
        message: "Validation failed",
        issues,
      });
    }

    req.body = parsed.data;
    next();
  };

export default validateBodyZod;
