import jwt from "jsonwebtoken";

const ACCESS_TTL_SEC = Number(process.env.ACCESS_TOKEN_TTL ?? 900);
const JWT_ISSUER = process.env.JWT_ISSUER ?? "WDG024";
const JWT_SECRET = process.env.ACCESS_JWT_SECRET!;
const REFRESH_TTL_SEC = Number(process.env.REFRESH_TOKEN_TTL ?? 1209600);
const REFRESH_SECRET = process.env.REFRESH_JWT_SECRET!;

export const signAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: `${ACCESS_TTL_SEC}s`,
    issuer: JWT_ISSUER,
  });
};

export const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: `${REFRESH_TTL_SEC}s`,
    issuer: JWT_ISSUER,
  });
};

// Cookie options
const isProd = process.env.NODE_ENV === "production";

export const accessCookieOpts = {
  httpOnly: true,
  maxAge: ACCESS_TTL_SEC * 1000,
  //sameSite: "lax" as const,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  secure: isProd,
};

export const refreshCookieOpts = {
  httpOnly: true,
  maxAge: REFRESH_TTL_SEC * 1000,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
  //sameSite: "lax" as const,
  secure: isProd,
};
