import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_URL } from "./api";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const socketRef = useRef(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [image, setImage] = useState(null);
  const [typingFrom, setTypingFrom] = useState(null);

  // Set Axios default headers
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.filter((u) => u._id !== user._id));
    } catch (err) {
      console.error("Fetch users error:", err);
    }
  };

  // Fetch messages with selected user
  const fetchMessages = async (receiverId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/${receiverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Fetch messages error:", err);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!selectedUser) return alert("Select a user first");
    let imageUrl = "";

    if (image) {
      const form = new FormData();
      form.append("image", image);
      const imgRes = await axios.post(`${API_URL}/messages/image`, form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      imageUrl = imgRes.data.url;
    }

    const payload = {
      senderId: user._id,
      receiverId: selectedUser._id,
      content: msg || imageUrl,
      messageType: image ? "image" : "text",
    };

    socketRef.current.emit("sendMessage", payload);
    setMsg("");
    setImage(null);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    fetchUsers();
    socketRef.current = io(API_URL, { transports: ["websocket"] });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join", { userId: user._id });
    });

    socketRef.current.on("receiveMessage", (newMessage) => {
      if (
        selectedUser &&
        (String(newMessage.senderId) === String(selectedUser._id) ||
          String(newMessage.receiverId) === String(selectedUser._id))
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    socketRef.current.on("messageDeleted", ({ id }) => {
      setMessages((prev) =>
        prev.map((m) => (String(m._id) === String(id) ? { ...m, isDeleted: true } : m))
      );
    });

    socketRef.current.on("typing", ({ senderId }) => setTypingFrom(senderId));
    socketRef.current.on("stopTyping", ({ senderId }) =>
      setTypingFrom((prev) => (prev === senderId ? null : prev))
    );
    socketRef.current.on("messageRead", ({ id }) =>
      setMessages((prev) =>
        prev.map((m) => (String(m._id) === String(id) ? { ...m, readAt: new Date() } : m))
      )
    );

    return () => socketRef.current.disconnect();
  }, [selectedUser]);

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setMessages([]);
    fetchMessages(u._id);
  };

  let typingTimerRef = useRef(null);
  const handleTyping = (text) => {
    setMsg(text);
    if (!selectedUser) return;
    socketRef.current.emit("typing", { senderId: user._id, receiverId: selectedUser._id });
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", { senderId: user._id, receiverId: selectedUser._id });
    }, 800);
  };

  const handleDelete = async (message) => {
    try {
      await axios.delete(`${API_URL}/messages/${message._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      socketRef.current.emit("deleteMessage", {
        id: message._id,
        senderId: user._id,
        receiverId: message.receiverId,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif", background: "#f4f6f8", padding: 10 }}>
      <div style={{ display: "flex", width: "900px", height: "600px", borderRadius: 12, overflow: "hidden", boxShadow: "0 8px 20px rgba(0,0,0,0.15)", background: "#fff" }}>
        
        {/* LEFT USERS LIST */}
        <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: 15, background: "#fdfdfd", overflowY: "auto" }}>
          <h3 style={{ marginBottom: 15, color: "#333", textAlign: "center" }}>Users</h3>
          {users.map((u) => (
            <div key={u._id} onClick={() => handleSelectUser(u)} style={{ padding: 12, cursor: "pointer", background: selectedUser?._id === u._id ? "#e6f7ff" : "#fff", marginBottom: 8, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s", boxShadow: selectedUser?._id === u._id ? "0 2px 6px rgba(0,0,0,0.15)" : "none" }}>
              <div>
                <strong style={{ fontSize: 14, color: "#111" }}>{u.username}</strong>
                <div style={{ fontSize: 11, color: u.isOnline ? "#28a745" : "#888" }}>
                  {u.isOnline ? "Online" : `Last seen: ${u.lastSeen ? new Date(u.lastSeen).toLocaleTimeString() : "N/A"}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* RIGHT CHAT AREA */}
        <div style={{ width: "70%", display: "flex", flexDirection: "column" }}>
          
          {/* Header */}
          <div style={{ padding: 15, borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
            <div>
              <h3 style={{ margin: 0, color: "#333" }}>{selectedUser ? selectedUser.username : "Select a user"}</h3>
              {typingFrom && selectedUser && String(typingFrom) === String(selectedUser._id) && (
                <div style={{ fontSize: 12, color: "#888" }}>Typing...</div>
              )}
            </div>
            <button onClick={handleLogout} style={{ padding: "6px 12px", cursor: "pointer", borderRadius: 6, border: "none", background: "#d9534f", color: "#fff", fontWeight: "bold", transition: "all 0.2s" }} onMouseEnter={(e) => (e.target.style.background = "#c9302c")} onMouseLeave={(e) => (e.target.style.background = "#d9534f")}>Logout</button>
          </div>

          {/* Messages */}
          <div style={{ flexGrow: 1, overflowY: "auto", padding: 15, display: "flex", flexDirection: "column", gap: 8, background: "#f9f9f9" }}>
            {messages.map((m) => (
              <div key={m._id} style={{ display: "flex", flexDirection: "column", alignItems: String(m.senderId) === String(user._id) ? "flex-end" : "flex-start", textAlign: String(m.senderId) === String(user._id) ? "right" : "left" }}>
                {m.isDeleted ? (
                  <i style={{ fontSize: 13, color: "#999" }}>Message deleted</i>
                ) : m.messageType === "image" ? (
                  <img src={m.content} alt="" style={{ maxWidth: "180px", margin: "5px", borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }} />
                ) : (
                  <p style={{ display: "inline-block", padding: "10px 14px", background: String(m.senderId) === String(user._id) ? "#DCF8C6" : "#eee", borderRadius: 12, maxWidth: "60%", wordBreak: "break-word", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", margin: 0 }}>
                    {m.content}
                  </p>
                )}
                <div style={{ fontSize: 11, color: "#666", marginTop: 2, display: "flex", alignItems: "center" }}>
                  {new Date(m.timestamp || m.createdAt).toLocaleTimeString()}
                  {String(m.senderId) === String(user._id) && (
                    <button onClick={() => handleDelete(m)} style={{ marginLeft: 8, cursor: "pointer", fontSize: 11, background: "transparent", border: "none", color: "#d9534f" }}>Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: 15, display: "flex", gap: 10, alignItems: "center", borderTop: "1px solid #eee", background: "#fff" }}>
            <input type="text" placeholder="Type message..." style={{ flex: 1, padding: 12, borderRadius: 20, border: "1px solid #ccc", outline: "none", fontSize: 14, boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)" }} value={msg} onChange={(e) => handleTyping(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
            <input type="file" style={{ cursor: "pointer", border: "1px solid #ccc", borderRadius: 8, padding: 5 }} onChange={(e) => setImage(e.target.files[0])} />
            <button style={{ padding: "10px 18px", cursor: "pointer", borderRadius: 20, border: "none", background: "#4CAF50", color: "#fff", fontWeight: "bold", boxShadow: "0 2px 6px rgba(0,0,0,0.2)", transition: "all 0.2s" }} onClick={sendMessage} onMouseEnter={(e) => (e.target.style.background = "#45a049")} onMouseLeave={(e) => (e.target.style.background = "#4CAF50")}>Send</button>
          </div>

        </div>
      </div>
    </div>
  );
}
