//backend/models/Messages.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  messageId: { type: String, unique: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // for 1:1
  roomId: { type: String }, // for group (bonus)
  messageType: { type: String, enum: ["text", "image"], default: "text" },
  content: { type: String }, // text or image URL
  timestamp: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  readAt: { type: Date }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
