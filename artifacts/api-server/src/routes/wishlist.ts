import { Router } from "express";
import { Wishlist } from "../models/Wishlist";
import { Product } from "../models/Product";

const router = Router();

router.get("/wishlist/:userId", async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId });
    if (!wishlist) {
      res.json([]);
      return;
    }
    const products = await Product.find({ _id: { $in: wishlist.productIds } });
    res.json(products);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/wishlist/add", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    await Wishlist.findOneAndUpdate(
      { userId },
      { $addToSet: { productIds: productId } },
      { upsert: true, new: true }
    );
    res.json({ success: true, message: "Added to wishlist" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/wishlist/remove", async (req, res) => {
  try {
    const { userId, productId } = req.body;
    await Wishlist.findOneAndUpdate(
      { userId },
      { $pull: { productIds: productId } }
    );
    res.json({ success: true, message: "Removed from wishlist" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
