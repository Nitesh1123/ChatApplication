import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" })); // req.body
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: function(origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://chat-application-six-sooty.vercel.app",
        "https://chat-application-git-main-niteshs-projects-73602fbb.vercel.app",
        process.env.CLIENT_URL,
      ];

      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Also allow any vercel.app subdomain for this project
        if (origin.includes("niteshs-projects-73602fbb.vercel.app") ||
            origin.includes("chat-application")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  })
);
app.use(helmet());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}
app.use(cookieParser());

app.options("*", cors());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "Chatify",
    developer: "Nitesh Kumar",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("dirname:", __dirname);
console.log("Frontend dist path:", path.join(__dirname, "../../frontend/dist"));

if (process.env.NODE_ENV === "production") {
  const frontendDistPath = path.join(__dirname, "../../frontend/dist");

  console.log("Serving static files from:", frontendDistPath);

  app.use(express.static(frontendDistPath));

  app.get("*", (req, res) => {
    const indexPath = path.join(frontendDistPath, "index.html");
    console.log("Serving index.html from:", indexPath);
    res.sendFile(indexPath);
  });
}

server.on("error", (error) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});
