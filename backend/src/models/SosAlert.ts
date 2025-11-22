// backend/src/models/SosAlert.ts
import mongoose, { Document, Schema } from "mongoose";

export type SosStatus = "triggered" | "acknowledged" | "resolved";

export interface ISosAlert extends Document {
  _id: mongoose.Types.ObjectId;
  family?: mongoose.Types.ObjectId | null;
  triggeredBy: mongoose.Types.ObjectId;
  coords?: { lat: number; lng: number };
  timestamp: Date;
  status: SosStatus;
  responders: mongoose.Types.ObjectId[];
}

const SosSchema = new Schema<ISosAlert>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  family: { type: Schema.Types.ObjectId, ref: "Family", required: true },
  triggeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coords: {
    lat: Number,
    lng: Number,
  },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["triggered", "acknowledged", "resolved"], default: "triggered" },
  responders: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export const SosAlert = mongoose.model<ISosAlert>("SosAlert", SosSchema);