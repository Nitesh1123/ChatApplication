import {
  ArrowLeftIcon,
  VideoIcon,
  PhoneIcon,
  SearchIcon,
  MoreVerticalIcon,
} from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";

function ChatHeader({ onVideoCall, onVoiceCall }) {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const isOnline = onlineUsers.includes(selectedUser._id);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") setSelectedUser(null);
    };

    window.addEventListener("keydown", handleEscKey);

    // cleanup function
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [setSelectedUser]);

  return (
    <div className="flex items-center justify-between h-14 px-4 bg-surface border-b border-[#1e1f22] flex-shrink-0">
      {/* LEFT SIDE - Back button (mobile) + Avatar + Contact Info */}
      <div className="flex items-center gap-3">
        {/* Mobile Back Button */}
        <button
          onClick={() => setSelectedUser(null)}
          className="md:hidden p-1.5 -ml-1 text-muted hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5" />
        </button>

        {/* Avatar with status indicator */}
        <div className="relative flex-shrink-0">
          <img
            src={selectedUser.profilePic || "/avatar.png"}
            alt={selectedUser.fullName}
            className="w-9 h-9 rounded-full object-cover bg-[#36393f]"
          />
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-surface ${
              isOnline ? "bg-[#23a55a]" : "bg-[#80848e]"
            }`}
          />
        </div>

        {/* Contact Info */}
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">
            {selectedUser.fullName}
          </h3>
          <p
            className={`text-xs ${
              isOnline ? "text-[#23a55a]" : "text-muted"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - Action Icons */}
      <div className="flex items-center gap-1">
        <button
          onClick={onVideoCall}
          className="p-2 text-muted hover:text-white transition-colors rounded-md hover:bg-[#35373c]"
        >
          <VideoIcon className="w-5 h-5" />
        </button>
        <button
          onClick={onVoiceCall}
          className="p-2 text-muted hover:text-white transition-colors rounded-md hover:bg-[#35373c]"
        >
          <PhoneIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-muted hover:text-white transition-colors rounded-md hover:bg-[#35373c]">
          <SearchIcon className="w-5 h-5" />
        </button>
        <button className="p-2 text-muted hover:text-white transition-colors rounded-md hover:bg-[#35373c]">
          <MoreVerticalIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
