# Appzepto – Real-Time Messaging Application

## Project Overview
**Appzepto** is a real-time chat application built using the MERN stack and Socket.io. It allows users to send text messages and images instantly, providing a seamless messaging experience. This project was developed to understand the challenges of real-time communication in web applications and to improve full-stack development skills.

---
#  there at time of login click the refresh button of browser (it taking time )

## Problem Statement
During development, I faced several key challenges:
1. **Real-time communication** – Implementing instant messaging required learning and integrating **Socket.io** for bi-directional communication.
2. **Authentication & Security** – Ensuring secure login with **JWT** and password hashing using **bcrypt**.
3. **File Uploads** – Handling user profile images and chat image uploads with **Multer** and **Cloudinary**.
4. **CORS Issues** – Managing cross-origin requests between frontend (React) and backend (Node.js/Express).
5. **State Management in Frontend** – Updating chat messages in real-time without page reloads.

These challenges helped me understand backend routing, database modeling, and frontend integration in a MERN stack environment.

---

## Technologies Used
- **Frontend**: React.js, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **Real-Time Communication**: Socket.io
- **File Uploads**: Multer, Cloudinary
- **Other Tools**: VS Code, Postman, Git, GitHub

---

## Features
- User registration and login with JWT authentication
- Real-time messaging with Socket.io
- Profile image upload and display
- Sending and receiving text and image messages
- Persistent chat history using MongoDB
- Responsive and user-friendly interface

---

## Installation

### **Backend**
1. Navigate to the backend folder:
   ```bash
   cd backend
npm install


Appzepto/
│
├── backend/       # Node.js + Express + MongoDB backend
│   ├── models/    # Mongoose models (User, Message)
│   ├── routes/    # API routes
│   ├── controllers/
│   ├── middleware/
│   └── server.js
│
├── frontend/      # React.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.jsx
│   └── package.json
│
└── .gitignore
