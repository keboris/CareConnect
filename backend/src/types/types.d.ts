import type { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        roles: string[];
        ver?: number;
      };
    }
  }
}
