import { Router } from "express";
import { Order } from "../models/Order";
import { User } from "../models/User";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.post("/orders", async (req, res) => {
  try {
    const { userId, items, address, totalAmount, deliveryCharge } = req.body;
    const order = new Order({
      userId,
      items,
      address,
      totalAmount,
      deliveryCharge: deliveryCharge || 0,
      status: "Pending",
      statusHistory: [{ status: "Pending", timestamp: new Date() }],
    });
    await order.save();
    res.status(201).json(order);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/orders", adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query: Record<string, unknown> = {};
    if (status) query.status = status;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Order.countDocuments(query),
    ]);

    const ordersWithUser = await Promise.all(
      orders.map(async (o) => {
        const user = await User.findById(o.userId);
        return { ...o.toObject(), userName: user?.name || null };
      })
    );

    res.json({ orders: ordersWithUser, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/orders/user/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/orders/:orderId/status", adminAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        status,
        $push: { statusHistory: { status, timestamp: new Date() } },
      },
      { new: true }
    );
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/orders/:orderId", adminAuth, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.orderId);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
