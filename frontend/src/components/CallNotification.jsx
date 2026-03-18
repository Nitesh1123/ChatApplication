import { useEffect, useRef } from "react";
import { PhoneIcon, PhoneOffIcon, UserIcon } from "lucide-react";
import { useChatStore } from "../store/useChatStore";

// Ringtone sound (using a simple beep pattern until a real ringtone file is available)
const RINGTONE_URL = "/ringtone.mp3";

function CallNotification({
  isRinging,
  incomingCallData,
  answerCall,
  rejectCall,
}) {
  const { allContacts, chats } = useChatStore();
  const audioRef = useRef(null);

  // Find caller details
  const caller = incomingCallData
    ? [...allContacts, ...chats].find((u) => u._id === incomingCallData.from)
    : null;

  // Play ringtone when ringing
  useEffect(() => {
    if (isRinging) {
      // Try to play ringtone if available
      const audio = new Audio(RINGTONE_URL);
      audio.loop = true;
      audioRef.current = audio;

      audio.play().catch((err) => {
        // Ringtone file might not exist, fallback to silent
        console.log("Ringtone not available:", err);
      });

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isRinging]);

  // Hide when not ringing
  if (!isRinging || !caller) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-surface border border-border rounded-xl p-4 shadow-2xl min-w-[280px] animate-slideIn">
        {/* Header with ringing indicator */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <img
              src={caller.profilePic || "/avatar.png"}
              alt={caller.fullName}
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <p className="text-white font-semibold">{caller.fullName}</p>
            <p className="text-muted text-sm flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Incoming {incomingCallData?.type} call...
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={rejectCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
          >
            <PhoneOffIcon className="w-4 h-4" />
            Decline
          </button>
          <button
            onClick={answerCall}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 transition-colors"
          >
            <PhoneIcon className="w-4 h-4" />
            Answer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CallNotification;
