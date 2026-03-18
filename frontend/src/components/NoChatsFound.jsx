import { MessageCircleIcon, UsersIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

function NoChatsFound() {
  const { setActiveTab } = useChatStore();

  return (
    <div className="flex flex-col items-center justify-center py-10 text-center px-4">
      <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center border border-border mb-4">
        <MessageCircleIcon className="w-8 h-8 text-brand" />
      </div>
      <div className="mb-4">
        <h4 className="text-white font-medium mb-1">No conversations yet</h4>
        <p className="text-muted text-sm">
          Start a new chat by selecting a contact
        </p>
      </div>
      <button
        onClick={() => setActiveTab("contacts")}
        className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-brand hover:bg-[#4752c4] rounded-lg transition-colors font-medium"
      >
        <UsersIcon className="w-4 h-4" />
        Find contacts
      </button>
    </div>
  );
}

export default NoChatsFound;
