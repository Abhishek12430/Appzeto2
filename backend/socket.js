// backend/socket.js
import { v4 as uuidv4 } from "uuid";
import Message from "./models/Message.js";
import User from "./models/User.js";

/**
 * initSocket(io)
 * - manages online users map
 * - handles events:
 *    - join: register user's socket (payload: { userId })
 *    - sendMessage: saves message and forwards to receiver
 *    - typing / stopTyping
 *    - deleteMessage: sets isDeleted and notifies participants
 *    - messageRead: marks readAt and notifies sender
 *    - disconnect: cleanup and update user's online status
 */
export function initSocket(io) {
  // Map userId -> Set of socketIds
  const onlineUsers = new Map();

  io.on("connection", (socket) => {
    // When client calls: socket.emit("join", { userId })
    socket.on("join", async ({ userId }) => {
      if (!userId) return;
      // add socket to the user's socket set
      const set = onlineUsers.get(String(userId)) || new Set();
      set.add(socket.id);
      onlineUsers.set(String(userId), set);

      // update user's online status in DB
      try {
        await User.findByIdAndUpdate(userId, { isOnline: true, lastSeen: new Date() });
      } catch (err) {
        console.error("Error updating user online:", err);
      }

      // Optionally broadcast updated online list (simple broadcast)
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // sendMessage: payload { senderId, receiverId, content, messageType }
    socket.on("sendMessage", async (payload) => {
      try {
        if (!payload?.senderId || !payload?.receiverId) return;

        const msg = new Message({
          messageId: uuidv4(),
          senderId: payload.senderId,
          receiverId: payload.receiverId,
          messageType: payload.messageType ?? "text",
          content: payload.content,
          timestamp: new Date(),
        });

        await msg.save();

        // send to receiver sockets
        const receiverSockets = onlineUsers.get(String(payload.receiverId));
        if (receiverSockets) {
          receiverSockets.forEach((sid) => {
            io.to(sid).emit("receiveMessage", msg);
          });
        }

        // also send back to sender (so they get the saved message _id/timestamps)
        socket.emit("receiveMessage", msg);
      } catch (err) {
        console.error("sendMessage error:", err);
      }
    });

    // typing indicator
    // payload { senderId, receiverId }
    socket.on("typing", (payload) => {
      if (!payload?.senderId || !payload?.receiverId) return;
      const receiverSockets = onlineUsers.get(String(payload.receiverId));
      if (receiverSockets) {
        receiverSockets.forEach((sid) => io.to(sid).emit("typing", { senderId: payload.senderId }));
      }
    });

    socket.on("stopTyping", (payload) => {
      if (!payload?.senderId || !payload?.receiverId) return;
      const receiverSockets = onlineUsers.get(String(payload.receiverId));
      if (receiverSockets) {
        receiverSockets.forEach((sid) => io.to(sid).emit("stopTyping", { senderId: payload.senderId }));
      }
    });

    // deleteMessage (payload: { messageId or _id, senderId, receiverId })
    socket.on("deleteMessage", async (payload) => {
      try {
        const id = payload?.id || payload?.messageId;
        if (!id) return;
        const msg = await Message.findById(id);
        if (!msg) return;
        // ensure only sender can delete
        if (String(msg.senderId) !== String(payload.senderId)) return;
        msg.isDeleted = true;
        await msg.save();

        // notify both participants
        const participants = [String(msg.senderId), String(msg.receiverId)];
        participants.forEach((uid) => {
          const sockets = onlineUsers.get(uid);
          if (sockets) {
            sockets.forEach((sid) => io.to(sid).emit("messageDeleted", { id: msg._id }));
          }
        });
      } catch (err) {
        console.error("deleteMessage error:", err);
      }
    });

    // messageRead: payload { messageId, readerId }
    socket.on("messageRead", async (payload) => {
      try {
        const { messageId, readerId } = payload || {};
        if (!messageId || !readerId) return;
        const msg = await Message.findById(messageId);
        if (!msg) return;
        msg.readAt = new Date();
        await msg.save();

        // notify sender
        const senderSockets = onlineUsers.get(String(msg.senderId));
        if (senderSockets) {
          senderSockets.forEach((sid) => io.to(sid).emit("messageRead", { id: msg._id, readerId }));
        }
      } catch (err) {
        console.error("messageRead error:", err);
      }
    });

    // on disconnect cleanup
    socket.on("disconnect", async () => {
      try {
        // remove socket id from any user sets
        for (const [userId, sset] of onlineUsers.entries()) {
          if (sset.has(socket.id)) {
            sset.delete(socket.id);
            if (sset.size === 0) {
              onlineUsers.delete(userId);
              // update DB to set offline and lastSeen
              try {
                await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen: new Date() });
              } catch (err) {
                console.error("Error updating user offline:", err);
              }
            } else {
              onlineUsers.set(userId, sset);
            }
            // break once found
            break;
          }
        }
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
      } catch (err) {
        console.error("disconnect error:", err);
      }
    });
  });
}
