import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
  icon?: string;
  order: number;
  active: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true },
  icon: { type: String },
  order: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
});

export const Category = mongoose.model<ICategory>("Category", CategorySchema);
