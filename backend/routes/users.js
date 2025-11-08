import express from "express";
import { authMiddleware } from "../middleware/auth.js"; // ✅ Correct named import
import User from "../models/User.js";

const router = express.Router();

// Protected route example
router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.userId } });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
