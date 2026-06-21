import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  imageUrl?: string;
  title: string;
  link?: string;
  order: number;
  active: boolean;
}

const BannerSchema = new Schema<IBanner>({
  imageUrl: { type: String },
  title: { type: String, required: true },
  link: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export const Banner = mongoose.model<IBanner>("Banner", BannerSchema);
