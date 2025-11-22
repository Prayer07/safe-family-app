// backend/src/models/User.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  fullname: string;
  email: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  lastActiveAt?: Date;
  expoPushToken?: string; // Add this
  family?: mongoose.Types.ObjectId | null;
}

const UserSchema = new Schema<IUser>({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  avatarUrl: { type: String },
  lastActiveAt: { type: Date },
  expoPushToken: { type: String, required: false },
  family: { type: Schema.Types.ObjectId, ref: "Family", default: null },
}, { timestamps: true });

export const User = mongoose.model<IUser>("User", UserSchema);