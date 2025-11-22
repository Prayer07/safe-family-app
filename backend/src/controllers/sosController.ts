import { sendPushNotification } from "../services/expoPush.js";
import type { Request, Response } from "express";
import { User } from "../models/User.js";
import { SosAlert } from "../models/SosAlert.js";
import mongoose from "mongoose";
import { connectDB } from "../db.js";
import { Family } from "../models/Family.js";


export const triggerSos = async (req: Request, res: Response) => {
  await connectDB();

  const userId = req.user?.id;
  const { coords } = req.body as { coords?: { lat: number; lng: number } };

  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Get family with push tokens
    const family = await Family.findOne({ members: userId })
      .populate("members", "fullname expoPushToken"); // ✅ Include expoPushToken
    
    if (!family) return res.status(404).json({ message: "No family" });

    // Create SOS alert (add coords if you want to save them)
    const sos = await SosAlert.create({
      family: family._id as mongoose.Types.ObjectId,
      triggeredBy: new mongoose.Types.ObjectId(userId),
      coords: { },
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