import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

const secret = process.env.ACCESS_JWT_SECRET;

if (!secret) {
  console.log("missing access token secret");
  process.exit(1);
}

const authenticate: RequestHandler = (req, res, next) => {
  const token = req.cookies.accessToken;
  console.log("✅ Authenticating user with token:", token);
  if (!token)
    return next(new Error("Not authenticated", { cause: { status: 401 } }));

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    if (!decoded.jti)
      return next(new Error("Invalid token", { cause: { status: 401 } }));

    const user = {
      id: decoded.jti,
      roles: decoded.roles,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(
        new Error("Expired access token", { cause: { status: 401 } })
      );
    }
    return next(new Error("invalid token", { cause: { status: 401 } }));
  }
};

export default authenticate;
