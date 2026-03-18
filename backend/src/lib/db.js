import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDB = async () => {
  const retries = 3;
  const delay = 3000;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`✅ MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `❌ MongoDB connection attempt ${attempt}/${retries} failed:`,
        error.message
      );
      if (attempt === retries) {
        console.error("❌ All MongoDB connection attempts failed. Exiting.");
        process.exit(1);
      }
      console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};
