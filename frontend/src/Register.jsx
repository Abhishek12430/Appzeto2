import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "./api";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const registerUser = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, form);
      alert("Registration successful!");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Error occurred");
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
      <h2 style={{ textAlign: "center", marginBottom: 20, color: "#333" }}>Register</h2>

      {["username", "email", "password"].map((field) => (
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
        onClick={registerUser}
      >
        Register
      </button>

      <p
        style={{ marginTop: 12, textAlign: "center", cursor: "pointer", color: "#007BFF" }}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
        onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
      >
        Already have an account? Login
      </p>
    </div>
  );
}
