import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useCall } from "../hooks/useCall";
import ChatHeader from "./ChatHeader";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import { ThumbsUpIcon, HeartIcon, LaughIcon, MoreVerticalIcon } from "lucide-react";

function formatDate(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const msgDate = new Date(date);

  if (msgDate.toDateString() === today.toDateString()) {
    return "Today";
  } else if (msgDate.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return msgDate.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  }
}

function shouldShowDateDivider(currentMsg, prevMsg) {
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.createdAt).toDateString();
  const prevDate = new Date(prevMsg.createdAt).toDateString();
  return currentDate !== prevDate;
}

function ChatContainer() {
  const {
    selectedUser,
    getMessagesByUserId,
    messages,
    isMessagesLoading,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const { startCall } = useCall();
  const messageEndRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [openMenuMessageId, setOpenMenuMessageId] = useState(null);
  const [confirmDeleteMessageId, setConfirmDeleteMessageId] = useState(null);
  const [deletingMessageId, setDeletingMessageId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    getMessagesByUserId(selectedUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!openMenuMessageId && !confirmDeleteMessageId) return;

      const activeMenu = event.target.closest("[data-message-menu]");
      if (activeMenu) return;

      setOpenMenuMessageId(null);
      setConfirmDeleteMessageId(null);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [openMenuMessageId, confirmDeleteMessageId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setPreviewImage(null);
    };

    if (previewImage) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [previewImage]);

  useEffect(() => {
    if (previewImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [previewImage]);

  const handleVideoCall = () => {
    startCall(selectedUser._id, "video");
  };

  const handleVoiceCall = () => {
    startCall(selectedUser._id, "audio");
  };

  const handleDeleteMessage = async (messageId) => {
    setDeletingMessageId(messageId);
    try {
      await deleteMessage(messageId);
      setOpenMenuMessageId(null);
      setConfirmDeleteMessageId(null);
    } finally {
      setDeletingMessageId(null);
    }
  };

  return (
    <>
      <ChatHeader onVideoCall={handleVideoCall} onVoiceCall={handleVoiceCall} />
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#313338] scrollbar-thin px-4 py-4">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="space-y-1">
            {messages.map((msg, index) => {
              const isMine = msg.senderId === authUser._id;
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const showDateDivider = shouldShowDateDivider(msg, prevMsg);

              return (
                <div key={msg._id}>
                  {/* Date Divider */}
                  {showDateDivider && (
                    <div className="flex items-center justify-center my-4">
                      <div className="h-px flex-1 bg-[#3f4147]" />
                      <span className="px-3 text-xs font-medium text-muted bg-[#313338]">
                        {formatDate(msg.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-[#3f4147]" />
                    </div>
                  )}

                  {/* Message Row */}
                  <div
                    className={`flex items-end gap-2 mb-1 ${
                      isMine ? "flex-row-reverse" : "flex-row"
                    }`}
                    onMouseEnter={() => setHoveredMessage(msg._id)}
                    onMouseLeave={() => setHoveredMessage(null)}
                  >
                    {/* Avatar (only for received messages) */}
                    {!isMine && (
                      <img
                        src={selectedUser.profilePic || "/avatar.png"}
                        alt={selectedUser.fullName}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                      />
                    )}

                    {/* Message Bubble Container */}
                    <div className={`relative max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                      {/* Emoji Reaction Bar (on hover) */}
                      {hoveredMessage === msg._id && (
                        <div
                          className={`absolute -top-8 ${
                            isMine ? "right-0" : "left-0"
                          } flex items-center gap-1 px-2 py-1 bg-[#2b2d31] rounded-full shadow-lg border border-border z-10`}
                        >
                          <button className="p-1 hover:scale-110 transition-transform">
                            <ThumbsUpIcon className="w-4 h-4 text-[#949ba4] hover:text-white" />
                          </button>
                          <button className="p-1 hover:scale-110 transition-transform">
                            <HeartIcon className="w-4 h-4 text-[#949ba4] hover:text-red-400" />
                          </button>
                          <button className="p-1 hover:scale-110 transition-transform">
                            <LaughIcon className="w-4 h-4 text-[#949ba4] hover:text-yellow-400" />
                          </button>
                        </div>
                      )}

                      {isMine && hoveredMessage === msg._id && (
                        <div
                          data-message-menu
                          className="absolute right-0 top-0 z-20 -translate-y-1/2 translate-x-1/2"
                        >
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setConfirmDeleteMessageId(null);
                              setOpenMenuMessageId((current) =>
                                current === msg._id ? null : msg._id
                              );
                            }}
                            className="rounded-full bg-[#2b2d31] p-1 text-[#949ba4] shadow-lg transition-colors hover:text-white"
                          >
                            <MoreVerticalIcon className="h-4 w-4" />
                          </button>

                          {openMenuMessageId === msg._id && (
                            <div className="mt-2 w-32 rounded-lg border border-[#3f4147] bg-[#2b2d31] p-1 text-sm shadow-xl">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setConfirmDeleteMessageId(msg._id);
                                }}
                                className="w-full rounded-md px-3 py-2 text-left text-red-400 transition-colors hover:bg-[#35373c]"
                              >
                                {"\u{1F5D1}\u{FE0F} Delete"}
                              </button>
                            </div>
                          )}

                          {confirmDeleteMessageId === msg._id && (
                            <div className="mt-2 w-44 rounded-lg border border-[#3f4147] bg-[#2b2d31] p-3 text-sm shadow-xl">
                              <p className="mb-3 text-[#f2f3f5]">Delete this message?</p>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setConfirmDeleteMessageId(null);
                                  }}
                                  className="rounded-md px-3 py-1.5 text-[#949ba4] transition-colors hover:bg-[#35373c] hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  disabled={deletingMessageId === msg._id}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    handleDeleteMessage(msg._id);
                                  }}
                                  className="rounded-md bg-red-500 px-3 py-1.5 text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                  {deletingMessageId === msg._id ? "Deleting..." : "Yes"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`px-4 py-2 ${
                          isMine
                            ? "bg-brand text-white rounded-2xl rounded-br-sm"
                            : "bg-[#2b2d31] text-[#f2f3f5] rounded-2xl rounded-bl-sm"
                        }`}
                      >
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Shared"
                            onClick={() => setPreviewImage(msg.image)}
                            className="mb-2 max-h-[300px] max-w-[300px] cursor-pointer rounded-xl border border-[#3f4147] object-cover transition-opacity hover:opacity-90"
                          />
                        )}
                        {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-muted mt-1 px-1">
                        {new Date(msg.createdAt).toLocaleTimeString(undefined, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 px-4 py-2">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt="typing"
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex items-center gap-1 bg-[#2b2d31] px-4 py-2 rounded-2xl rounded-bl-sm">
                  <span className="w-2 h-2 bg-[#949ba4] rounded-full animate-bounce [animation-delay:0ms]"></span>
                  <span className="w-2 h-2 bg-[#949ba4] rounded-full animate-bounce [animation-delay:150ms]"></span>
                  <span className="w-2 h-2 bg-[#949ba4] rounded-full animate-bounce [animation-delay:300ms]"></span>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        ) : isMessagesLoading ? (
          <MessagesLoadingSkeleton />
        ) : (
          <NoChatHistoryPlaceholder name={selectedUser.fullName} />
        )}
      </div>

      <MessageInput />

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -right-4 -top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-[#3f4147] bg-[#2b2d31] text-lg text-white transition-colors hover:bg-[#3f4147]"
            >
              {"\u2715"}
            </button>

            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[90vh] max-w-[90vw] rounded-xl border border-[#3f4147] object-contain shadow-2xl"
            />

            <a
              href={previewImage}
              download
              target="_blank"
              rel="noopener noreferrer"
              onClick={(event) => event.stopPropagation()}
              className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-lg bg-[#5865f2] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4752c4]"
            >
              {"\u2B07 Download Image"}
            </a>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatContainer;
