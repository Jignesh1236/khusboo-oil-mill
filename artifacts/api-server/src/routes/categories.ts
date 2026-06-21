import { Router } from "express";
import { Category } from "../models/Category";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/categories", async (_req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json(categories);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/categories", adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/categories/:categoryId", adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.categoryId, req.body, { new: true });
    if (!category) {
      res.status(404).json({ error: "Category not found" });
      return;
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/categories/:categoryId", adminAuth, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.categoryId);
    res.json({ success: true, message: "Category deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
