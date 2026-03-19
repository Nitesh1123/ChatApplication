import { useChatStore } from "../store/useChatStore";
import { SearchIcon, PlusIcon, SettingsIcon, XIcon } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useState } from "react";
import { Link } from "react-router";
import useThemeStore from "../store/useThemeStore";

import ContactList from "../components/ContactList";
import ChatsList from "../components/ChatsList";
import ChatContainer from "../components/ChatContainer";
import NoConversationPlaceholder from "../components/NoConversationPlaceholder";

function ChatPage() {
  const { activeTab, setActiveTab, selectedUser } = useChatStore();
  const { authUser } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-screen w-full flex bg-dark-base overflow-hidden">
      {/* SIDEBAR */}
      <div className={`${selectedUser ? 'hidden' : 'flex'} md:flex w-full md:w-80 bg-surface flex-col`}>
        {/* SEARCH BAR */}
        <div className="p-3 border-b border-border">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find or start a conversation"
              className="w-full bg-[#1e1f22] border border-border rounded-lg py-2 pl-9 pr-10 text-sm text-white placeholder-muted focus:outline-none focus:border-muted transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-white"
              >
                <XIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex p-2 gap-1">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === "chats"
                ? "bg-[#404249] text-white"
                : "text-muted hover:bg-[#35373c] hover:text-text-secondary"
            }`}
          >
            Chats
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all ${
              activeTab === "contacts"
                ? "bg-[#404249] text-white"
                : "text-muted hover:bg-[#35373c] hover:text-text-secondary"
            }`}
          >
            Contacts
          </button>
        </div>

        {/* SECTION HEADER */}
        <div className="px-4 py-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wide">
            {activeTab === "chats" ? "Direct Messages" : "All Contacts"}
          </span>
          <button className="text-muted hover:text-text-secondary transition-colors">
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* CONTACT LIST */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          {activeTab === "chats" ? (
            <ChatsList searchQuery={searchQuery} onSelectChat={() => setSearchQuery("")} />
          ) : (
            <ContactList searchQuery={searchQuery} onSelectContact={() => setSearchQuery("")} />
          )}
        </div>

        {/* BOTTOM USER BAR */}
        <div className="p-3 bg-[#232428] flex items-center gap-3">
          <div className="relative">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt={authUser?.fullName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#23a55a] rounded-full border-2 border-[#232428]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{authUser?.fullName}</p>
            <p className="text-xs text-muted">Online</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[#35373c] text-[#949ba4] hover:text-white transition-colors"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>
          <Link
            to="/settings"
            className="text-muted hover:text-text-secondary transition-colors p-1.5 hover:bg-[#35373c] rounded-md"
          >
            <SettingsIcon className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* CHAT AREA */}
      <div className={`${selectedUser ? 'flex' : 'hidden'} md:flex flex-1 bg-chat-bg flex-col`}>
        {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
      </div>
    </div>
  );
}

export default ChatPage;
