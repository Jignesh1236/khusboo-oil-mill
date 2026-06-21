import { Router } from "express";
import { User } from "../models/User";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

router.post("/users/check-ip", async (req, res) => {
  try {
    const { ip } = req.body;
    const user = await User.findOne({ ip });
    if (user) {
      res.json({ exists: true, user });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.post("/users/onboard", async (req, res) => {
  try {
    const { name, ip, source, address, phone } = req.body;
    const existing = await User.findOne({ ip });
    if (existing) {
      // Update existing user
      existing.name = name || existing.name;
      existing.address = address || existing.address;
      existing.phone = phone || existing.phone;
      const updatedUser = await existing.save();
      res.status(200).json(updatedUser);
      return;
    }
    const user = new User({ name, ip, source, address, phone });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/users", adminAuth, async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/users/:id", adminAuth, async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
