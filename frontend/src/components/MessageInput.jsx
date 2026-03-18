import { useRef, useState, useEffect } from "react";
import useKeyboardSound from "../hooks/useKeyboardSound";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import {
  ImageIcon,
  SendIcon,
  XIcon,
  SmileIcon,
  PaperclipIcon,
} from "lucide-react";

function MessageInput() {
  const { playRandomKeyStrokeSound } = useKeyboardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [isFocused, setIsFocused] = useState(false);

  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const { sendMessage, isSoundEnabled, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (isSoundEnabled) playRandomKeyStrokeSound();

    sendMessage({
      text: text.trim(),
      image: imagePreview,
    });

    // Stop typing indicator when message is sent
    if (socket && selectedUser) {
      socket.emit("stopTyping", { receiverId: selectedUser._id });
    }

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    // Clear typing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasContent = text.trim() || imagePreview;

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    isSoundEnabled && playRandomKeyStrokeSound();

    // Emit typing event
    if (socket && selectedUser) {
      socket.emit("typing", { receiverId: selectedUser._id });

      // Clear previous timeout
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      // Stop typing after 2 seconds of no input
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  return (
    <div className="p-4 bg-[#313338]">
      {/* Image Preview */}
      {imagePreview && (
        <div className="mb-3 px-4">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl border border-[#3f4147]"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#2b2d31] border border-border flex items-center justify-center text-muted hover:text-white hover:bg-[#35373c] transition-colors"
              type="button"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className={`mx-4 mb-4 bg-[#383a40] rounded-xl flex items-center gap-2 px-4 py-2 transition-shadow duration-200 ${
          isFocused ? "shadow-[0_0_0_2px_rgba(88,101,242,0.3)]" : ""
        }`}
      >
        {/* Left Icons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-[#404249]"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 text-muted hover:text-white transition-colors rounded-lg hover:bg-[#404249]"
          >
            <SmileIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Text Input */}
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="flex-1 bg-transparent text-white placeholder-muted text-sm py-2 focus:outline-none"
          placeholder="Type a message..."
        />

        {/* Send Button (only visible when there's content) */}
        <button
          type="submit"
          disabled={!hasContent}
          className={`p-2 rounded-lg transition-all duration-200 ${
            hasContent
              ? "bg-brand text-white hover:bg-[#4752c4] cursor-pointer"
              : "text-muted cursor-default"
          }`}
        >
          <SendIcon className={`w-5 h-5 ${hasContent ? "" : "text-muted"}`} />
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
