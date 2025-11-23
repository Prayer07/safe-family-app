import { sendPushNotification } from "../services/expoPush.js";
import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { SosAlert } from "../models/SosAlert.js";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Family } from "../models/Family.js";
import { Location } from "../models/Location.js";


export const triggerSos = async (req: Request, res: Response) => {
  await connectDB();

  const userId = req.user?.id;
  const { coords } = req.body as { coords?: { lat: number; lng: number } };

  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  if (!coords) return res.status(400).json({ error: "Missing coords" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const family = await Family.findOne({ members: userId })
      .populate("members", "fullname expoPushToken");

    if (!family) return res.status(404).json({ message: "No family" });

    // ✅ Save actual coords in Location model
    const location = await Location.create({
      user: new mongoose.Types.ObjectId(userId),
      coords: { lat: coords.lat, lng: coords.lng },
      timestamp: new Date(),
    });

    // ✅ Save SOS with Location reference
    const sos = await SosAlert.create({
      family: family._id,
      triggeredBy: userId,
      location: location._id,
      status: "triggered",
      timestamp: new Date(),
      responders: [],
    });

    // ✅ Send notifications to ALL family members EXCEPT the person in distress
    const notifications = family.members
      .filter((member: any) => 
        member._id.toString() !== userId && // Don't notify yourself
        member.expoPushToken // Only notify members with push tokens
      )
      .map((member: any) => {
        console.log(`📤 Sending SOS to ${member.fullname} (${member.expoPushToken})`);
        
        return sendPushNotification(
          member.expoPushToken,
          "🚨 EMERGENCY ALERT",
          `${user.fullname} needs help!`,
          {
            type: "sos",
            sosId: String(sos._id),
            lat: coords?.lat?.toString() || "",
            lng: coords?.lng?.toString() || "",
            userName: user.fullname,
          }
        ).catch(err => {
          console.error(`❌ Failed to notify ${member.fullname}:`, err);
          return null; // Don't let one failure stop others
        });
      });

    // Wait for all notifications (but don't fail if some fail)
    const results = await Promise.allSettled(notifications);
    
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    console.log(`✅ Sent ${successCount}/${notifications.length} notifications`);

    res.status(201).json({
      success: true,
      sos,
      notificationsSent: successCount,
    });
    
  } catch (err) {
    console.error("SOS trigger error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const resolveSos = async (req: Request, res: Response) => {
  await connectDB();

  const userId = req.user?.id;
  const { sosId } = req.params;

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const sos = await SosAlert.findById(sosId);
    if (!sos) return res.status(404).json({ error: "SOS not found" });

    // Check if user is in the family
    const family = await Family.findOne({ 
      _id: sos.family as mongoose.Types.ObjectId, 
      members: userId as mongoose.Types.ObjectId,
    });
    
    if (!family) {
      return res.status(403).json({ error: "Not authorized to resolve this SOS" });
    }

    // Update SOS status
    sos.status = "resolved";
    sos.resolvedBy = new mongoose.Types.ObjectId(userId);
    sos.resolvedAt = new Date();
    await sos.save();

    res.json({ 
      success: true, 
      message: "SOS marked as resolved",
      sos 
    });
  } catch (err) {
    console.error("Resolve SOS error:", err);
    res.status(500).json({ error: "Server error" });
  }
};