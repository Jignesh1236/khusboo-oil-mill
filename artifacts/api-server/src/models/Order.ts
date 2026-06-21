import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId | string;
  name: string;
  qty: number;
  price: number;
}

export interface IOrderAddress {
  name: string;
  phone: string;
  fullAddress: string;
  landmark?: string;
  pincode: string;
}

export interface IStatusHistory {
  status: string;
  timestamp: Date;
}

export type OrderStatus = "Pending" | "Confirmed" | "Out for Delivery" | "Delivered" | "Cancelled";

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId | string;
  items: IOrderItem[];
  address: IOrderAddress;
  totalAmount: number;
  deliveryCharge?: number;
  status: OrderStatus;
  statusHistory: IStatusHistory[];
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    address: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      fullAddress: { type: String, required: true },
      landmark: { type: String },
      pincode: { type: String, required: true },
    },
    totalAmount: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Pending",
    },
    statusHistory: [
      {
        status: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>("Order", OrderSchema);
