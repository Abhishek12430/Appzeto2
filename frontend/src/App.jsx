import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Chat from "./Chat";

const App = () => {
  const isLoggedIn = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
          background: "#f4f6f8",
          padding: 10,
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "960px",
            minHeight: "600px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
            padding: 20,
          }}
        >
          <Routes>
            <Route
              path="/"
              element={isLoggedIn ? <Navigate to="/chat" /> : <Login />}
            />
            <Route path="/register" element={<Register />} />
            <Route
              path="/chat"
              element={isLoggedIn ? <Chat /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default App;
