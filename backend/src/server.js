import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { existsSync } from "fs";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { app, server } from "./lib/socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("=== STARTUP PATHS ===");
console.log("process.cwd():", process.cwd());
console.log("__dirname:", __dirname);

const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" })); // req.body
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: true,
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

app.options("*", cors({ origin: true, credentials: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    app: "Chatify",
    developer: "Nitesh Kumar",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  let frontendDist = path.join(process.cwd(), "../frontend/dist");
  if (!existsSync(frontendDist)) {
    frontendDist = path.join(process.cwd(), "frontend/dist");
  }
  if (!existsSync(frontendDist)) {
    frontendDist = path.join(__dirname, "../../frontend/dist");
  }

  console.log("Serving static from:", frontendDist);

  app.use(
    express.static(frontendDist, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".js")) {
          res.setHeader("Content-Type", "application/javascript");
        }
        if (filePath.endsWith(".css")) {
          res.setHeader("Content-Type", "text/css");
        }
      },
    })
  );

  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
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
