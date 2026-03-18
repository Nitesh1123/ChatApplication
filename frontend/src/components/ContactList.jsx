import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import UsersLoadingSkeleton from "./UsersLoadingSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { SearchIcon } from "lucide-react";

function formatMessageTime(date) {
  if (!date) return "";

  const messageDate = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (messageDate.toDateString() === today.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  return messageDate.toLocaleDateString([], { weekday: "short" });
}

function ContactList({ searchQuery, onSelectContact }) {
  const {
    getAllContacts,
    allContacts,
    setSelectedUser,
    isUsersLoading,
    selectedUser,
    messagePreviews,
  } = useChatStore();
  const { onlineUsers } = useAuthStore();

  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  const filteredContacts = searchQuery
    ? allContacts.filter((contact) =>
        contact.fullName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allContacts;

  if (isUsersLoading) return <UsersLoadingSkeleton />;
  if (filteredContacts.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <SearchIcon className="mb-3 h-5 w-5 text-[#949ba4]" />
        <p className="text-sm text-[#949ba4]">No contacts found</p>
      </div>
    );
  }

  return (
    <div className="px-2 py-1 space-y-0.5">
      {filteredContacts.map((contact) => {
        const isOnline = onlineUsers.includes(contact._id);
        const isSelected = selectedUser?._id === contact._id;
        const preview = messagePreviews[contact._id];

        return (
          <div
            key={contact._id}
            onClick={() => {
              setSelectedUser(contact);
              onSelectContact?.();
            }}
            className={`mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-all duration-150 cursor-pointer ${
              isSelected
                ? "bg-[#404249]"
                : "hover:bg-[#35373c]"
            }`}
          >
            {/* Avatar with status indicator */}
            <div className="relative flex-shrink-0">
              <img
                src={contact.profilePic || "/avatar.png"}
                alt={contact.fullName}
                className="w-10 h-10 rounded-full object-cover bg-[#36393f]"
              />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-surface ${
                  isOnline ? "bg-[#23a55a]" : "bg-[#80848e]"
                }`}
              />
            </div>

            {/* Contact info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <h4 className="truncate text-sm font-medium text-white">
                  {contact.fullName}
                </h4>
                {preview?.createdAt && (
                  <span className="shrink-0 text-[11px] text-[#949ba4]">
                    {formatMessageTime(preview.createdAt)}
                  </span>
                )}
              </div>
              <p className="max-w-[160px] truncate text-xs text-[#949ba4]">
                {preview?.text || "Start a conversation"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ContactList;
