import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import Message from "../models/Message.js";
import bcrypt from "bcryptjs";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

const isPlaceholderValue = (value) => !value || value.startsWith("PLACEHOLDER_");

const hasCloudinaryConfig =
  !isPlaceholderValue(ENV.CLOUDINARY_CLOUD_NAME) &&
  !isPlaceholderValue(ENV.CLOUDINARY_API_KEY) &&
  !isPlaceholderValue(ENV.CLOUDINARY_API_SECRET);

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  // Sanitize inputs
  const sanitizedFullName = fullName?.trim().replace(/<[^>]*>/g, "");
  const sanitizedEmail = email?.trim().toLowerCase();

  try {
    if (!sanitizedFullName || !sanitizedEmail || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // check if emailis valid: regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const user = await User.findOne({ email: sanitizedEmail });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // 123456 => $dnjasdkasj_?dmsakmk
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName: sanitizedFullName,
      email: sanitizedEmail,
      password: hashedPassword,
    });

    if (newUser) {
      // before CR:
      // generateToken(newUser._id, res);
      // await newUser.save();

      // after CR:
      // Persist user first, then issue auth cookie
      const savedUser = await newUser.save();
      generateToken(savedUser._id, res);

      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });

      try {
        await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
      } catch (error) {
        console.error("Failed to send welcome email:", error);
      }
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Sanitize inputs
  const sanitizedEmail = email?.trim().toLowerCase();

  if (!sanitizedEmail || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    // never tell the client which one is incorrect: password or email

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = (_, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic, fullName } = req.body;
    const userId = req.user._id;

    const updateFields = {};

    // Handle profile picture update
    if (profilePic) {
      if (typeof profilePic !== "string" || !profilePic.startsWith("data:image/")) {
        return res.status(400).json({ message: "Invalid profile image format" });
      }

      const base64Data = profilePic.split(",")[1] || "";
      const imageSizeInBytes = Buffer.byteLength(base64Data, "base64");
      if (imageSizeInBytes > 5 * 1024 * 1024) {
        return res.status(400).json({ message: "Profile image must be 5MB or smaller" });
      }

      if (!hasCloudinaryConfig) {
        return res.status(500).json({
          message: "Profile image uploads are not configured on the server",
        });
      }

      const uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "chatify/profile-pictures",
      });
      updateFields.profilePic = uploadResponse.secure_url;
    }

    // Handle full name update
    if (fullName && fullName.trim()) {
      updateFields.fullName = fullName.trim();
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select(
      "-password"
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.log("Error in change password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all messages sent by or received by this user
    await Message.deleteMany({
      $or: [{ senderId: userId }, { receiverId: userId }]
    });

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear the JWT cookie with the same production flags used when setting it.
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in delete account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
