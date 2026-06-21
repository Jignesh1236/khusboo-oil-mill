import { Router } from "express";
import { Review } from "../models/Review";
import { User } from "../models/User";
import { Order } from "../models/Order";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/reviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    const reviewsWithUser = await Promise.all(
      reviews.map(async (r) => {
        const user = await User.findById(r.userId);
        return { ...r.toObject(), userName: user?.name || null };
      })
    );
    res.json(reviewsWithUser);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/reviews", async (req, res) => {
  try {
    const { userId, productId, orderId, rating, comment } = req.body;
    // Verify order is delivered
    const order = await Order.findById(orderId);
    if (!order || order.status !== "Delivered") {
      res.status(400).json({ error: "Can only review delivered orders" });
      return;
    }
    const existing = await Review.findOne({ userId, productId, orderId });
    if (existing) {
      res.status(400).json({ error: "Already reviewed this order" });
      return;
    }
    const review = new Review({ userId, productId, orderId, rating, comment });
    await review.save();
    const user = await User.findById(userId);
    res.status(201).json({ ...review.toObject(), userName: user?.name || null });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/reviews", adminAuth, async (_req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    const reviewsWithUser = await Promise.all(
      reviews.map(async (r) => {
        const user = await User.findById(r.userId);
        return { ...r.toObject(), userName: user?.name || null };
      })
    );
    res.json(reviewsWithUser);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/reviews/:reviewId", adminAuth, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ success: true, message: "Review deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
