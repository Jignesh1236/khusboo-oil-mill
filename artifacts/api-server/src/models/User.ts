import mongoose, { Schema, Document } from "mongoose";

export interface IUserAddress {
  fullName?: string;
  phone?: string;
  houseFlatBuilding?: string;
  streetArea?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  landmark?: string;
}

export interface IUser extends Document {
  name: string;
  ip: string;
  source?: string;
  address?: IUserAddress;
  phone?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    ip: { type: String, required: true, unique: true, index: true },
    source: { type: String },
    address: {
      fullName: { type: String },
      phone: { type: String },
      houseFlatBuilding: { type: String },
      streetArea: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: String },
      country: { type: String },
      landmark: { type: String },
    },
    phone: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
