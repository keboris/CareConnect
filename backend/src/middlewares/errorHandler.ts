import type { ErrorRequestHandler } from "express";

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error(err.stack);

  const cause = (err as any).cause;
  const status = Number(cause?.status ?? cause) || 500;

  res.status(status).json({ message: err.message });
};

export default errorHandler;
