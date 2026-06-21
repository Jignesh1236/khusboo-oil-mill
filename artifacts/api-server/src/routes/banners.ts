import { Router } from "express";
import { Banner } from "../models/Banner";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.get("/banners", async (_req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ order: 1 });
    res.json(banners);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/banners", adminAuth, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    await banner.save();
    res.status(201).json(banner);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/banners/:bannerId", adminAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.bannerId, req.body, { new: true });
    if (!banner) {
      res.status(404).json({ error: "Banner not found" });
      return;
    }
    res.json(banner);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/banners/:bannerId", adminAuth, async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.bannerId);
    res.json({ success: true, message: "Banner deleted" });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
