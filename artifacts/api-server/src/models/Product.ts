import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  price: number;
  discountPercent?: number;
  category: string;
  images: string[];
  stock: number;
  deliveryTime?: string;
  freeDelivery: boolean;
  description?: string;
  featured: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, index: "text" },
    price: { type: Number, required: true },
    discountPercent: { type: Number, default: 0 },
    category: { type: String, required: true, index: true },
    images: [{ type: String }],
    stock: { type: Number, default: 0 },
    deliveryTime: { type: String },
    freeDelivery: { type: Boolean, default: false },
    description: { type: String },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>("Product", ProductSchema);
