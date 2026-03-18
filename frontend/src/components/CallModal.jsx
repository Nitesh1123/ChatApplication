import {
  PhoneIcon,
  PhoneOffIcon,
  VideoIcon,
  VideoOffIcon,
  MicIcon,
  MicOffIcon,
  XIcon,
  Maximize2Icon,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";

function CallModal({
  callState,
  callType,
  remoteUser,
  callDuration,
  isMuted,
  isVideoOff,
  localVideoRef,
  remoteVideoRef,
  isIdle,
  isCalling,
  isRinging,
  isConnected,
  startCall,
  answerCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleVideo,
  formatDuration,
  incomingCallData,
}) {
  const { allContacts, chats } = useChatStore();
  const [localVideoPosition, setLocalVideoPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  // Find remote user details
  const remoteUserDetails = remoteUser
    ? [...allContacts, ...chats].find((u) => u._id === remoteUser._id)
    : incomingCallData
      ? [...allContacts, ...chats].find((u) => u._id === incomingCallData.from)
      : null;

  // Hide modal when idle
  if (isIdle) return null;

  // Handle drag for local video
  const handleLocalVideoMouseDown = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - localVideoPosition.x,
      y: e.clientY - localVideoPosition.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setLocalVideoPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Outgoing call - CALLING state
  if (isCalling) {
    return (
      <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <img
              src={remoteUserDetails?.profilePic || "/avatar.png"}
              alt={remoteUserDetails?.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#3f4147]"
            />
            <div className="absolute inset-0 rounded-full border-4 border-brand animate-ping opacity-30" />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {remoteUserDetails?.fullName || "Calling..."}
          </h2>
          <p className="text-muted animate-pulse">Calling...</p>
        </div>

        <button
          onClick={endCall}
          className="mt-12 w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <PhoneOffIcon className="w-7 h-7 text-white" />
        </button>
      </div>
    );
  }

  // Incoming call - RINGING state
  if (isRinging) {
    return (
      <div className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col items-center justify-center">
        <div className="text-center">
          <div className="mb-8">
            <img
              src={remoteUserDetails?.profilePic || "/avatar.png"}
              alt={remoteUserDetails?.fullName}
              className="w-32 h-32 rounded-full object-cover border-4 border-[#3f4147]"
            />
          </div>
          <h2 className="text-2xl font-semibold text-white mb-2">
            {remoteUserDetails?.fullName || "Incoming Call"}
          </h2>
          <p className="text-muted">
            Incoming {incomingCallData?.type} call...
          </p>
        </div>

        <div className="mt-12 flex gap-6">
          <button
            onClick={rejectCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
          >
            <PhoneOffIcon className="w-7 h-7 text-white" />
          </button>
          <button
            onClick={answerCall}
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition-colors"
          >
            <PhoneIcon className="w-7 h-7 text-white" />
          </button>
        </div>
      </div>
    );
  }

  // Connected call state
  if (isConnected) {
    return (
      <div
        ref={modalRef}
        className="fixed inset-0 bg-[#1a1b1e] z-50 flex flex-col"
      >
        {/* Remote Video (Full Screen) */}
        <div className="flex-1 relative">
          {callType === "video" ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2b2d31]">
              <div className="text-center">
                <img
                  src={remoteUserDetails?.profilePic || "/avatar.png"}
                  alt={remoteUserDetails?.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#3f4147] mb-4 mx-auto"
                />
                <h2 className="text-xl font-semibold text-white">
                  {remoteUserDetails?.fullName}
                </h2>
                <p className="text-muted">Voice Call</p>
              </div>
            </div>
          )}

          {/* Call Duration */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-4 py-2 rounded-full">
            <span className="text-white font-medium">
              {formatDuration(callDuration)}
            </span>
          </div>

          {/* Local Video (Picture in Picture) */}
          {callType === "video" && (
            <div
              className="absolute w-48 h-36 rounded-xl overflow-hidden border-2 border-[#3f4147] cursor-move shadow-lg"
              style={{
                right: `${localVideoPosition.x}px`,
                bottom: `${localVideoPosition.y}px`,
              }}
              onMouseDown={handleLocalVideoMouseDown}
            >
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isVideoOff ? "hidden" : ""}`}
              />
              {isVideoOff && (
                <div className="w-full h-full bg-[#2b2d31] flex items-center justify-center">
                  <VideoOffIcon className="w-8 h-8 text-muted" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Control Bar */}
        <div className="p-6 flex items-center justify-center gap-4">
          <div className="bg-[#2b2d31] rounded-full px-6 py-3 flex items-center gap-4">
            {/* Mute Button */}
            <button
              onClick={toggleMute}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? "bg-red-500/20 text-red-400"
                  : "bg-[#35373c] text-white hover:bg-[#404249]"
              }`}
            >
              {isMuted ? (
                <MicOffIcon className="w-5 h-5" />
              ) : (
                <MicIcon className="w-5 h-5" />
              )}
            </button>

            {/* Video Toggle (only for video calls) */}
            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff
                    ? "bg-red-500/20 text-red-400"
                    : "bg-[#35373c] text-white hover:bg-[#404249]"
                }`}
              >
                {isVideoOff ? (
                  <VideoOffIcon className="w-5 h-5" />
                ) : (
                  <VideoIcon className="w-5 h-5" />
                )}
              </button>
            )}

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
            >
              <PhoneOffIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default CallModal;
