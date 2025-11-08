// backend/routes/messages.js
import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import { authMiddleware } from "../middleware/auth.js";


import cloudinary from "../utils/cloudinary.js";


const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET chat history with another user (protected)
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // ✅ Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const meId = mongoose.Types.ObjectId(req.user.userId);
    const otherId = mongoose.Types.ObjectId(userId);

    const messages = await Message.find({
      $or: [
        { senderId: meId, receiverId: otherId },
        { senderId: otherId, receiverId: meId },
      ],
    })
      .sort({ timestamp: 1 })
      .lean();

    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Image upload
router.post("/image", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file" });

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "realtime-chat",
    });

    res.json({ url: result.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

// Delete message
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    if (String(msg.senderId) !== String(req.user.userId))
      return res.status(403).json({ message: "Not allowed" });

    msg.isDeleted = true;
    await msg.save();
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
