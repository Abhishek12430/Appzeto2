import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "./api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/auth/login`, form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/chat");
    } catch (err) {
      alert(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: 30,
        maxWidth: 350,
        margin: "auto",
        marginTop: 120,
        border: "1px solid #ddd",
        borderRadius: 12,
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        background: "#fff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>Login</h2>

      {["email", "password"].map((field) => (
        <input
          key={field}
          placeholder={field}
          type={field === "password" ? "password" : "text"}
          style={{
            width: "100%",
            marginBottom: 12,
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ccc",
            outline: "none",
            fontSize: 14,
            transition: "all 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#4CAF50")}
          onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ))}

      <button
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          border: "none",
          background: "#4CAF50",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#45a049")}
        onMouseLeave={(e) => (e.target.style.background = "#4CAF50")}
        onClick={loginUser}
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <p
        style={{ marginTop: 12, textAlign: "center", cursor: "pointer", color: "#007BFF" }}
        onClick={() => navigate("/register")}
        onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
      >
        Don't have an account? Register
      </p>
    </div>
  );
}
