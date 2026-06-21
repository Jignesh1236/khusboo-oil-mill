import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  ip: string;
  source?: string;
  address?: string;
  phone?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    ip: { type: String, required: true, unique: true, index: true },
    source: { type: String },
    address: { type: String },
    phone: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
