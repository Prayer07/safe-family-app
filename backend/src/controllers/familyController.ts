// backend/src/controllers/familyController.ts
import type { Request, Response } from "express";
import crypto from "crypto";
import { Family } from "../models/Family.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";


export const createFamily = async (req: Request, res: Response) => {
  try {
    const { name } = req.body as { name?: string };
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!name) return res.status(400).json({ message: "Name required" });

    const inviteCode = crypto.randomBytes(4).toString("hex");

    const family = await Family.create({
      name,
      owner: userId,
      members: [userId],
      inviteCode,
    });

    await User.findByIdAndUpdate(userId, { family: family._id });

    res.status(201).json(family);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const joinFamily = async (req: Request, res: Response) => {
  try {
    const { inviteCode } = req.body as { inviteCode?: string };
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!inviteCode) return res.status(400).json({ message: "Invite code required" });

    const family = await Family.findOne({ inviteCode });
    if (!family) return res.status(404).json({ message: "Invalid invite code" });

    if (family.members.find((m: any) => m.toString() === userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    family.members.push(userId as mongoose.Types.ObjectId);
    await family.save();

    await User.findByIdAndUpdate(userId, { family: family._id });

    res.json(family);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyFamily = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const family = await Family.findOne({ members: userId })
      .populate("members", "fullname email phone avatarUrl lastActiveAt")
      .select("fullname inviteCode members")
      .lean();
    if (!family) return res.status(404).json({ message: "No family" });

    res.json(family);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};