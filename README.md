---

# 💬 Chatify

A full-stack real-time chat application built by **Nitesh Kumar**.

🔗 **Live Demo:** https://chat-application-six-sooty.vercel.app/login

---

## ✨ Features

- 🔐 Custom JWT Authentication (no third-party auth)
- ⚡ Real-time Messaging via Socket.io
- 🟢 Online/Offline Presence Indicators
- 💬 Typing Indicator (live bouncing dots)
- 🔔 Notification & Typing Sounds (with toggle)
- 📨 Welcome Emails on Signup (Resend)
- 🖼️ Image Uploads in Chat (Cloudinary)
- 🗑️ Delete Messages (real-time for both users)
- 📋 Last Message Preview in Contact List
- 🔍 Search Contacts
- 📞 Voice & Video Calls (PeerJS - free, no account needed)
- 👤 Profile Settings (avatar, name, password change, delete account)
- 🖼️ Click-to-Enlarge Image Preview Modal
- 🚦 API Rate Limiting (Arcjet)
- 🎨 Modern Dark Discord-style UI
- 📱 Fully Mobile Responsive
- 🧠 Zustand State Management
- 🛡️ Helmet.js Security Headers
- ✅ Input Validation & Sanitization

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, DaisyUI |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Realtime | Socket.io |
| Auth | JWT (httpOnly cookies) |
| State | Zustand |
| Calls | PeerJS (WebRTC) |
| Images | Cloudinary |
| Emails | Resend |
| Security | Helmet, Arcjet |

---

## 📁 Project Structure

```
chatify/
├── backend/          # Express API + Socket.io server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── lib/
│   └── .env.example
└── frontend/         # React + Vite client
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── store/
    │   └── hooks/
    └── .env.example
```

---

## ⚙️ Environment Setup

Copy `.env.example` files and fill in your values.

### Backend (`/backend/.env`)

```
PORT=3000
MONGO_URI=your_mongo_uri
NODE_ENV=development
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email
EMAIL_FROM_NAME=Chatify
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Frontend (`/frontend/.env`)

```
VITE_API_URL=http://localhost:3000
```

---

## 🚀 Run Locally

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173
Backend runs on http://localhost:3000

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

---

## 👨‍💻 Developer

Built with ❤️ by **Nitesh Kumar**

---
