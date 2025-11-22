// backend/src/models/Location.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ILocation extends Document {
  user: mongoose.Types.ObjectId;
  coords: { lat: number; lng: number };
  accuracy?: number;
  speed?: number;
  heading?: number;
  timestamp: Date;
}

const LocationSchema = new Schema<ILocation>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  coords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  accuracy: Number,
  speed: Number,
  heading: Number,
  timestamp: { type: Date, default: Date.now },
});

LocationSchema.index({ "timestamp": -1 });

export const Location = mongoose.model<ILocation>("Location", LocationSchema);