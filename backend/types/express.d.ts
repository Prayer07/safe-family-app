// backend/src/types/express.d.ts
import { Request } from "express";
import mongoose from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: mongoose.Types.ObjectId | string;
        email?: string;
      };
    }
  }
}