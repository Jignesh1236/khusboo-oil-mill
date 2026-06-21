import mongoose, { Schema, Document } from "mongoose";

export interface IWishlist extends Document {
  userId: mongoose.Types.ObjectId | string;
  productIds: (mongoose.Types.ObjectId | string)[];
}

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  productIds: [{ type: Schema.Types.ObjectId, ref: "Product" }],
});

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
