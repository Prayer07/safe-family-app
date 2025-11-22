// backend/src/controllers/locationController.ts
import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Location } from "../models/Location.js";
import { Family } from "../models/Family.js";
import { User } from "../models/User.js";

export const pushLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { lat, lng, accuracy, speed, heading } = req.body as {
      lat: number;
      lng: number;
      accuracy?: number;
      speed?: number;
      heading?: number;
    };

    if (typeof lat !== "number" || typeof lng !== "number") {
      return res.status(400).json({ message: "lat and lng required" });
    }

    const loc = await Location.create({
      user: new mongoose.Types.ObjectId(userId),
      coords: { lat, lng },
      accuracy: accuracy ?? 0,
      speed: speed ?? 0,
      heading: heading ?? 0,
      timestamp: new Date(),
    });

    return res.status(201).json(loc);
  } catch (err) {
    console.error("pushLocation error:", err);
    return res.status(500).json({ message: "Server error", detail: (err as Error).message });
  }
};

export const getFamilyLastLocations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // Find the family that contains this user
    const family = await Family.findOne({ members: userId }).lean();
    if (!family) return res.status(404).json({ message: "No family found for user" });

    // Ensure we have ObjectId array
    const memberIds: mongoose.Types.ObjectId[] = (family.members || []).map((m: any) =>
      typeof m === "string" ? new mongoose.Types.ObjectId(m) : (m as mongoose.Types.ObjectId)
    );

    if (memberIds.length === 0) return res.json([]);

    // Aggregation: latest location per user
    const locations = await Location.aggregate([
      { $match: { user: { $in: memberIds } } },
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$user",
          coords: { $first: "$coords" },
          timestamp: { $first: "$timestamp" },
        },
      },
    ]);

    // Fetch user names/emails for display
    const users = await User.find({ _id: { $in: memberIds } }).select("fullname").lean();

    const mapped = locations.map((loc: any) => {
      const uid = loc._id.toString();
      const found = users.find((u: any) => u._id.toString() === uid);
      return {
        userId: uid,
        name: found?.fullname ?? "Unknown",
        lat: loc.coords?.lat ?? 0,
        lng: loc.coords?.lng ?? 0,
        lastActiveAt: loc.timestamp ?? null,
      };
    });

    return res.json(mapped);
  } catch (err) {
    console.error("getFamilyLastLocations error:", err);
    // include detail while developing, remove in production
    return res.status(500).json({
      message: "Server error",
      detail: process.env.NODE_ENV === "production" ? undefined : (err as Error).message,
    });
  }
};