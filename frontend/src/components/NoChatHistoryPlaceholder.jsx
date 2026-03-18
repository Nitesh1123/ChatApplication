import { useState } from "react";
import { MessageCircleIcon, HandIcon, UserIcon, CalendarIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

const NoChatHistoryPlaceholder = ({ name }) => {
  const { sendMessage } = useChatStore();
  const [isSending, setIsSending] = useState(false);

  const handleQuickReply = async (text) => {
    if (isSending) return;
    setIsSending(true);
    try {
      await sendMessage({ text });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-border mb-5">
        <MessageCircleIcon className="w-8 h-8 text-brand" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">
        Start your conversation with {name}
      </h3>
      <p className="text-muted text-sm max-w-md mb-6">
        This is the beginning of your conversation. Send a message to start chatting!
      </p>
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleQuickReply("👋 Say Hello!")}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-surface border border-border rounded-lg hover:bg-[#35373c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <HandIcon className="w-4 h-4" />
          Say Hello
        </button>
        <button
          onClick={() => handleQuickReply("How are you? 😊")}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-surface border border-border rounded-lg hover:bg-[#35373c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserIcon className="w-4 h-4" />
          How are you?
        </button>
        <button
          onClick={() => handleQuickReply("Meet up soon? 📅")}
          disabled={isSending}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-surface border border-border rounded-lg hover:bg-[#35373c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CalendarIcon className="w-4 h-4" />
          Meet up soon?
        </button>
      </div>
    </div>
  );
};

export default NoChatHistoryPlaceholder;
