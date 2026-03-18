import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const formatPreviewText = ({ text, image }) => {
  const previewText = text?.trim() ? text.trim() : image ? "\u{1F4F7} Image" : "";
  return previewText.length > 35 ? `${previewText.slice(0, 35)}...` : previewText;
};

const buildPreviewEntry = (message) => ({
  text: formatPreviewText(message),
  createdAt: message.createdAt,
});

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  messagePreviews: {},
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  isTyping: false,

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser }),
  setIsTyping: (value) => set({ isTyping: value }),

  fetchMessagePreviews: async () => {
    try {
      const res = await axiosInstance.get("/messages/previews");
      const messagePreviews = res.data.reduce((acc, preview) => {
        acc[preview.userId] = {
          text: preview.lastMessage.text,
          createdAt: preview.lastMessage.createdAt,
        };
        return acc;
      }, {});
      set({ messagePreviews });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load message previews");
    }
  },

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
      await get().fetchMessagePreviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },
  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
      await get().fetchMessagePreviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true, // flag to identify optimistic messages (optional)
    };
    // immidetaly update the ui by adding the message
    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set((state) => ({
        messages: state.messages
          .filter((message) => message._id !== tempId)
          .concat(res.data),
        messagePreviews: {
          ...state.messagePreviews,
          [selectedUser._id]: buildPreviewEntry(res.data),
        },
      }));
    } catch (error) {
      // remove optimistic message on failure
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
      await get().fetchMessagePreviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete message");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    const authUserId = useAuthStore.getState().authUser?._id;

    socket.on("newMessage", (newMessage) => {
      const previewUserId =
        newMessage.senderId === authUserId ? newMessage.receiverId : newMessage.senderId;
      set((state) => ({
        messagePreviews: {
          ...state.messagePreviews,
          [previewUserId]: buildPreviewEntry(newMessage),
        },
      }));

      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) {
        if (isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");

          notificationSound.currentTime = 0;
          notificationSound.play().catch((e) => console.log("Audio play failed:", e));
        }
        return;
      }

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");

        notificationSound.currentTime = 0; // reset to start
        notificationSound.play().catch((e) => console.log("Audio play failed:", e));
      }
    });

    socket.on("messageDeleted", async ({ messageId }) => {
      set((state) => ({
        messages: state.messages.filter((message) => message._id !== messageId),
      }));
      await get().fetchMessagePreviews();
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === get().selectedUser?._id) {
        set({ isTyping: true });
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === get().selectedUser?._id) {
        set({ isTyping: false });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("typing");
    socket.off("stopTyping");
  },
}));
