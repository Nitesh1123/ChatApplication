import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore";

const CALL_STATES = {
  IDLE: "idle",
  CALLING: "calling",
  RINGING: "ringing",
  CONNECTED: "connected",
  ENDED: "ended",
};

// Lazy load PeerJS to avoid import errors
let Peer = null;

export function useCall() {
  const { authUser, socket } = useAuthStore();
  const [callState, setCallState] = useState(CALL_STATES.IDLE);
  const [callType, setCallType] = useState(null);
  const [remoteUser, setRemoteUser] = useState(null);
  const [peerId, setPeerId] = useState(null);
  const [incomingCallData, setIncomingCallData] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const currentCallRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Initialize PeerJS
  useEffect(() => {
    if (!authUser?._id) return;

    let peer = null;

    const initPeer = async () => {
      try {
        // Dynamically import PeerJS
        if (!Peer) {
          const peerModule = await import("peerjs");
          Peer = peerModule.default || peerModule.Peer;
        }

        peer = new Peer(authUser._id, {
          host: "peerjs-server.herokuapp.com",
          secure: true,
          port: 443,
          config: {
            iceServers: [
              { urls: "stun:stun.l.google.com:19302" },
              { urls: "stun:stun1.l.google.com:19302" },
            ],
          },
        });

        peer.on("open", (id) => {
          console.log("PeerJS connected:", id);
          setPeerId(id);
        });

        peer.on("call", (call) => {
          console.log("Incoming PeerJS call");
          currentCallRef.current = call;
          
          call.on("stream", (remoteStream) => {
            remoteStreamRef.current = remoteStream;
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on("close", () => {
            cleanupCall();
          });

          call.on("error", (err) => {
            console.error("Call error:", err);
            cleanupCall();
          });
        });

        peer.on("error", (err) => {
          console.error("PeerJS error:", err);
        });

        peerRef.current = peer;
      } catch (err) {
        console.error("Failed to initialize PeerJS:", err);
      }
    };

    initPeer();

    return () => {
      if (peer) {
        peer.destroy();
      }
    };
  }, [authUser?._id]);

  // Handle socket events
  useEffect(() => {
    if (!socket) return;

    const handleIncoming = ({ from, type, peerId: callerPeerId }) => {
      console.log("Incoming call:", from, type);
      setIncomingCallData({ from, type, peerId: callerPeerId });
      setCallState(CALL_STATES.RINGING);
      setCallType(type);
    };

    const handleAccepted = ({ peerId: recipientPeerId }) => {
      console.log("Call accepted, connecting to:", recipientPeerId);
      connectToPeer(recipientPeerId);
    };

    const handleRejected = () => {
      cleanupCall();
    };

    const handleEnded = () => {
      cleanupCall();
    };

    socket.on("call:incoming", handleIncoming);
    socket.on("call:accepted", handleAccepted);
    socket.on("call:rejected", handleRejected);
    socket.on("call:ended", handleEnded);

    return () => {
      socket.off("call:incoming", handleIncoming);
      socket.off("call:accepted", handleAccepted);
      socket.off("call:rejected", handleRejected);
      socket.off("call:ended", handleEnded);
    };
  }, [socket]);

  // Duration timer
  useEffect(() => {
    if (callState === CALL_STATES.CONNECTED) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(durationIntervalRef.current);
    }
    return () => clearInterval(durationIntervalRef.current);
  }, [callState]);

  const connectToPeer = useCallback(async (targetPeerId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === "video",
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = peerRef.current.call(targetPeerId, stream);
      currentCallRef.current = call;

      call.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      call.on("close", cleanupCall);
      call.on("error", cleanupCall);

      setCallState(CALL_STATES.CONNECTED);
    } catch (err) {
      console.error("Media error:", err);
      cleanupCall();
    }
  }, [callType]);

  const startCall = useCallback(async (userId, type) => {
    if (!socket || !peerId) {
      console.error("Not ready");
      return;
    }

    setCallType(type);
    setCallState(CALL_STATES.CALLING);
    setRemoteUser({ _id: userId });

    socket.emit("call:initiate", {
      to: userId,
      from: authUser._id,
      type,
      peerId,
    });
  }, [socket, peerId, authUser?._id]);

  const answerCall = useCallback(async () => {
    if (!socket || !incomingCallData || !peerRef.current) return;

    const { from, type, peerId: callerPeerId } = incomingCallData;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const call = peerRef.current.call(callerPeerId, stream);
      currentCallRef.current = call;

      call.on("stream", (remoteStream) => {
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      call.on("close", cleanupCall);
      call.on("error", cleanupCall);

      setRemoteUser({ _id: from });
      setCallState(CALL_STATES.CONNECTED);

      socket.emit("call:accepted", { to: from, peerId });
    } catch (err) {
      console.error("Answer error:", err);
      rejectCall();
    }
  }, [socket, incomingCallData, peerId]);

  const rejectCall = useCallback(() => {
    if (!socket || !incomingCallData) return;
    socket.emit("call:rejected", { to: incomingCallData.from });
    cleanupCall();
  }, [socket, incomingCallData]);

  const endCall = useCallback(() => {
    if (!socket || !remoteUser) return;
    socket.emit("call:ended", { to: remoteUser._id });
    cleanupCall();
  }, [socket, remoteUser]);

  const cleanupCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (currentCallRef.current) {
      try {
        currentCallRef.current.close();
      } catch (e) {}
      currentCallRef.current = null;
    }

    remoteStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    setCallState(CALL_STATES.IDLE);
    setCallType(null);
    setRemoteUser(null);
    setCallDuration(0);
    setIsMuted(false);
    setIsVideoOff(false);
    setIncomingCallData(null);
    clearInterval(durationIntervalRef.current);
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audio = localStreamRef.current.getAudioTracks()[0];
      if (audio) {
        audio.enabled = !audio.enabled;
        setIsMuted(!audio.enabled);
      }
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const video = localStreamRef.current.getVideoTracks()[0];
      if (video) {
        video.enabled = !video.enabled;
        setIsVideoOff(!video.enabled);
      }
    }
  }, []);

  const formatDuration = useCallback((seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, []);

  // Always return a valid object to prevent destructuring errors
  return {
    callState,
    callType,
    remoteUser,
    peerId,
    incomingCallData,
    callDuration,
    isMuted,
    isVideoOff,
    isIdle: callState === CALL_STATES.IDLE,
    isCalling: callState === CALL_STATES.CALLING,
    isRinging: callState === CALL_STATES.RINGING,
    isConnected: callState === CALL_STATES.CONNECTED,
    localVideoRef,
    remoteVideoRef,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
    formatDuration,
  };
}
