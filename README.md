# Chatify

Full-stack real-time chat application with separate `backend/` and `frontend/` apps.

## Features

- JWT-based authentication
- Real-time messaging with Socket.IO
- Online and offline presence indicators
- Notification and typing sounds
- Welcome emails on signup
- Image uploads with Cloudinary
- REST API with Node.js and Express
- MongoDB persistence
- Rate limiting with Arcjet
- React frontend with Tailwind CSS and DaisyUI
- Zustand state management

## Project Structure

- `backend/` - Express API, Socket.IO server, database, auth, and integrations
- `frontend/` - React client application

## Environment Setup

Create local `.env` files in `backend/` and `frontend/`. These files are ignored by git and are not committed.

### Backend

```bash
PORT=3000
MONGO_URI=your_mongo_uri_here
NODE_ENV=development
JWT_SECRET=your_jwt_secret
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_email_from_address
EMAIL_FROM_NAME=your_email_from_name
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ARCJET_KEY=your_arcjet_key
ARCJET_ENV=development
```

### Frontend

```bash
VITE_API_URL=http://localhost:3000
```

## Run Locally

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
