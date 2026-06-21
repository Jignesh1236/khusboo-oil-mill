import { Router } from "express";
import jwt from "jsonwebtoken";
import { Config } from "../models/Config";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import { uploadImage } from "../lib/cloudinary";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

router.post("/admin/login", async (req, res) => {
  try {
    const { pin } = req.body;
    const config = await Config.findOne();
    const correctPin = config?.adminPin || process.env.ADMIN_PIN || "1234";
    if (pin !== correctPin) {
      res.status(401).json({ error: "Invalid PIN" });
      return;
    }
    const token = jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ success: true, token });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/admin/dashboard", adminAuth, async (_req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);

    const [
      totalOrders,
      totalRevenueAgg,
      newUsersToday,
      newUsersThisWeek,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ["Confirmed", "Out for Delivery", "Delivered"] } } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      User.countDocuments({ createdAt: { $gte: startOfDay } }),
      User.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Product.find({ stock: { $gt: 0, $lte: 5 } }).limit(10),
      Order.find().sort({ createdAt: -1 }).limit(10),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", totalQty: { $sum: "$items.qty" } } },
      { $sort: { totalQty: -1 } },
      { $limit: 5 },
    ]);
    const topProductIds = topProducts.map((p) => p._id);
    const topProductDocs = await Product.find({ _id: { $in: topProductIds } });

    const ordersByStatusAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const ordersByStatus = ordersByStatusAgg.map((s) => ({
      status: s._id,
      count: s.count,
    }));

    res.json({
      totalOrders,
      totalRevenue,
      newUsersToday,
      newUsersThisWeek,
      lowStockProducts,
      topProducts: topProductDocs,
      recentOrders,
      ordersByStatus,
    });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/admin/upload", adminAuth, async (req, res) => {
  try {
    const { imageData, folder } = req.body;
    if (!imageData) {
      res.status(400).json({ error: "imageData is required" });
      return;
    }
    const result = await uploadImage(imageData, folder || "store");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
