import mongoose, { Schema, Document } from "mongoose";

export interface IConfig extends Document {
  storeName: string;
  logoUrl?: string;
  whatsappNumber: string;
  currencySymbol: string;
  deliveryCharge: number;
  freeDeliveryAbove: number;
  storeTimingOpen: string;
  storeTimingClose: string;
  storeTimingDays: string;
  instagramUrl?: string;
  facebookUrl?: string;
  aboutUs?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  mapEmbedUrl?: string;
  adminPin: string;
}

const ConfigSchema = new Schema<IConfig>({
  storeName: { type: String, default: "MyStore" },
  logoUrl: { type: String },
  whatsappNumber: { type: String, default: "919999999999" },
  currencySymbol: { type: String, default: "₹" },
  deliveryCharge: { type: Number, default: 20 },
  freeDeliveryAbove: { type: Number, default: 500 },
  storeTimingOpen: { type: String, default: "08:00 AM" },
  storeTimingClose: { type: String, default: "09:00 PM" },
  storeTimingDays: { type: String, default: "Monday - Saturday" },
  instagramUrl: { type: String },
  facebookUrl: { type: String },
  aboutUs: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  contactAddress: { type: String },
  mapEmbedUrl: { type: String },
  adminPin: { type: String, default: process.env.ADMIN_PIN || "1234" },
});

export const Config = mongoose.model<IConfig>("Config", ConfigSchema);
