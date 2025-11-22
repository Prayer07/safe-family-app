import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No auth token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    const decoded = jwt.verify(token, JWT_SECRET) as { _id: string };

    if (!decoded?._id) {
      return res.status(401).json({ error: "Token invalid" });
    }

    req.user = { id: decoded._id };
    next();

  } catch (err) {
    console.log("AUTH ERROR:", err);
    return res.status(401).json({ error: "Unauthorized" });
  }
};