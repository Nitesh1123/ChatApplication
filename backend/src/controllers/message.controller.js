import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const formatPreviewText = (message) => {
  const previewText = message.text?.trim()
    ? message.text.trim()
    : message.image
      ? "\u{1F4F7} Image"
      : "";

  return previewText.length > 35 ? `${previewText.slice(0, 35)}...` : previewText;
};

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getAllContacts:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessagePreviews = async (req, res) => {
  try {
    const loggedInUserId = req.user._id.toString();

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).sort({ createdAt: -1 });

    const previewsMap = new Map();

    for (const message of messages) {
      const partnerId =
        message.senderId.toString() === loggedInUserId
          ? message.receiverId.toString()
          : message.senderId.toString();

      if (previewsMap.has(partnerId)) continue;

      previewsMap.set(partnerId, {
        userId: partnerId,
        lastMessage: {
          text: formatPreviewText(message),
          image: message.image || null,
          createdAt: message.createdAt,
        },
      });
    }

    res.status(200).json(Array.from(previewsMap.values()));
  } catch (error) {
    console.log("Error in getMessagePreviews:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    
    // Text length validation
    if (text && text.length > 2000) {
      return res.status(400).json({ error: "Message too long. Max 2000 characters." });
    }
    
    // Image size validation
    if (image && Buffer.byteLength(image, "base64") > 5 * 1024 * 1024) {
      return res.status(400).json({ error: "Image too large. Max 5MB." });
    }
    
    // Sanitize text input
    const sanitizedText = text?.trim().replace(/<[^>]*>/g, "");
    
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      // upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text: sanitizedText,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // find all the messages where the logged-in user is either sender or receiver
    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    });

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    console.error("Error in getChatPartners: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.senderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own messages" });
    }

    await Message.findByIdAndDelete(messageId);

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", {
        messageId,
        receiverId: message.receiverId.toString(),
      });
    }

    res.status(200).json({ success: true, messageId });
  } catch (error) {
    console.log("Error in deleteMessage:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
