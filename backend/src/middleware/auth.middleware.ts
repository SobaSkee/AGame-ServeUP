import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { extractBearerOrCookieToken } from "../services/session.service";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = extractBearerOrCookieToken(req);

  if (!token) {
    return res.status(401).json({ message: "Not logged in" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    req.userId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};