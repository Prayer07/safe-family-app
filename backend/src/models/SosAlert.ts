// backend/src/models/SosAlert.ts
import mongoose, { Document, Schema } from "mongoose";

export type SosStatus = "triggered" | "acknowledged" | "resolved";

export interface ISosAlert extends Document {
  _id: mongoose.Types.ObjectId;
  family?: mongoose.Types.ObjectId | null;
  triggeredBy: mongoose.Types.ObjectId;
  location?: mongoose.Types.ObjectId;
  // coords: { lat: number; lng: number };
  timestamp: Date;
  status: SosStatus;
  responders?: mongoose.Types.ObjectId[];
  resolvedBy?: mongoose.Types.ObjectId; // ✅ Add this
  resolvedAt?: Date; // ✅ Add this
}

const SosSchema = new Schema<ISosAlert>({
  _id: { type: Schema.Types.ObjectId, auto: true },
  family: { type: Schema.Types.ObjectId, ref: "Family", required: true },
  triggeredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  location: { type: Schema.Types.ObjectId, ref: "Location", required: true},
  // coords: {
  //   lat: { type: Number, required: true },
  //   lng: { type: Number, required: true },
  // },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ["triggered", "acknowledged", "resolved"], default: "triggered" },
  responders: [{ type: Schema.Types.ObjectId, ref: "User" }],
  resolvedBy: { type: Schema.Types.ObjectId, ref: "User" }, // ✅ Add this
  resolvedAt: { type: Date }, // ✅ Add this
});

export const SosAlert = mongoose.model<ISosAlert>("SosAlert", SosSchema);