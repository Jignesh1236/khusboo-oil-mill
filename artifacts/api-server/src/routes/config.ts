import { Router } from "express";
import { Config } from "../models/Config";
import { adminAuth } from "../middleware/adminAuth";

const router = Router();

async function getOrCreateConfig() {
  let config = await Config.findOne();
  if (!config) {
    config = new Config({});
    await config.save();
  }
  return config;
}

router.get("/config", async (_req, res) => {
  try {
    const config = await getOrCreateConfig();
    const configObj = config.toObject() as Record<string, unknown>;
    delete configObj.adminPin;
    res.json(configObj);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/config", adminAuth, async (req, res) => {
  try {
    const config = await getOrCreateConfig();
    Object.assign(config, req.body);
    await config.save();
    const configObj = config.toObject() as Record<string, unknown>;
    delete configObj.adminPin;
    res.json(configObj);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
