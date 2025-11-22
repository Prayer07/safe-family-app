import mongoose, { Document, Schema } from "mongoose";

export interface IFamily extends Document {
  name: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  inviteCode: string;
  settings: {
    autoCallOnSOS: boolean;
    broadcastSMS: boolean;
  };
}

const FamilySchema = new Schema<IFamily>({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  inviteCode: { type: String, required: true, unique: true },
  settings: {
    autoCallOnSOS: { type: Boolean, default: false },
    broadcastSMS: { type: Boolean, default: false },
  },
}, { timestamps: true });

export const Family = mongoose.model<IFamily>("Family", FamilySchema);