'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface IncomingCall {
  callerId: string;
  callerFirstName: string;
  callerLastName: string;
  callerRole: string;
  callType: 'video' | 'audio';
  offer: RTCSessionDescriptionInit;
}

interface VideoCallModalProps {
  socket: Socket;
  targetUser: Participant;
  callType: 'video' | 'audio';
  direction: 'outgoing' | 'incoming';
  incomingOffer?: RTCSessionDescriptionInit;
  remoteAnswer?: { answer: RTCSessionDescriptionInit } | null;
  onRemoteAnswerConsumed?: () => void;
  onClose: () => void;
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

type CallStatus = 'calling' | 'ringing' | 'connected' | 'ended' | 'rejected' | 'error';

export default function VideoCallModal({
  socket,
  targetUser,
  callType,
  direction,
  incomingOffer,
  remoteAnswer,
  onRemoteAnswerConsumed,
  onClose,
}: VideoCallModalProps) {
  const [callStatus, setCallStatus] = useState<CallStatus>(
    direction === 'outgoing' ? 'calling' : 'ringing',
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [duration, setDuration] = useState(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closedRef = useRef(false);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  // Always holds the latest socket — avoids stale closures when the prop changes between renders
  const socketRef = useRef(socket);
  useEffect(() => { socketRef.current = socket; }, [socket]);

  const cleanup = useCallback(() => {
    if (closedRef.current) return;
    closedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    pcRef.current?.close();
  }, []);

  const endCall = useCallback(() => {
    socketRef.current.emit('video-call-end', { targetUserId: targetUser.id });
    cleanup();
    setCallStatus('ended');
    setTimeout(onClose, 1500);
  }, [targetUser.id, cleanup, onClose]);

  const buildPeerConnection = useCallback((): RTCPeerConnection => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit('ice-candidate', {
          targetUserId: targetUser.id,
          candidate: e.candidate,
        });
      }
    };

    pc.ontrack = (e) => {
      if (remoteVideoRef.current && e.streams[0]) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    const startTimer = () => {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[WebRTC] connectionState=', pc.connectionState);
      if (pc.connectionState === 'connected') {
        setCallStatus('connected');
        startTimer();
      } else if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed' ||
        pc.connectionState === 'closed'
      ) {
        endCall();
      }
    };

    // Fallback: iceConnectionState fires more reliably across browsers than connectionState
    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] iceConnectionState=', pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
        setCallStatus((prev) => (prev === 'connected' ? prev : 'connected'));
        startTimer();
      } else if (pc.iceConnectionState === 'failed') {
        endCall();
      }
    };

    return pc;
  }, [targetUser.id, endCall]);

  const getMedia = useCallback(async (): Promise<MediaStream> => {
    const constraints = callType === 'video' ? { video: true, audio: true } : { video: false, audio: true };
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch {
      // Try audio-only as fallback for video call
      return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    }
  }, [callType]);

  const startOutgoingCall = useCallback(async () => {
    try {
      const stream = await getMedia();
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = buildPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      console.log('[WebRTC] emitting video-call-request, socket.id=', socketRef.current.id, 'target=', targetUser.id);
      socketRef.current.emit('video-call-request', {
        targetUserId: targetUser.id,
        callType,
        offer,
      });
    } catch {
      setCallStatus('error');
      setTimeout(onClose, 2000);
    }
  }, [getMedia, buildPeerConnection, targetUser.id, callType, onClose]);

  const acceptIncomingCall = useCallback(async () => {
    console.log('answer clicked', { incomingOffer, callStatus });
    if (!incomingOffer) {
      console.warn('[WebRTC] acceptIncomingCall: incomingOffer is null — cannot answer');
      return;
    }
    try {
      console.log('[WebRTC] requesting media...');
      const stream = await getMedia();
      console.log('[WebRTC] media granted, tracks:', stream.getTracks().map(t => t.kind));
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      const pc = buildPeerConnection();
      stream.getTracks().forEach((t) => pc.addTrack(t, stream));

      console.log('[WebRTC] setRemoteDescription (offer)');
      await pc.setRemoteDescription(new RTCSessionDescription(incomingOffer));

      // Flush ICE candidates that arrived before the remote description was set
      for (const c of pendingCandidatesRef.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* ignore stale candidates */ }
      }
      pendingCandidatesRef.current = [];

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('[WebRTC] answer created, emitting video-call-answer to', targetUser.id);

      socketRef.current.emit('video-call-answer', { callerId: targetUser.id, answer });
      // Show "connecting" state while ICE negotiates (onconnectionstatechange will set 'connected')
      setCallStatus('calling');
    } catch (err) {
      console.error('[WebRTC] acceptIncomingCall error:', err);
      setCallStatus('error');
      setTimeout(onClose, 2000);
    }
  }, [incomingOffer, callStatus, getMedia, buildPeerConnection, targetUser.id, onClose]);

  const rejectCall = useCallback(() => {
    socketRef.current.emit('video-call-reject', { callerId: targetUser.id });
    cleanup();
    onClose();
  }, [targetUser.id, cleanup, onClose]);

  // Handle call-answered via prop (listener lives in MessagesPage on the stable socket)
  useEffect(() => {
    if (!remoteAnswer) return;
    console.log('[WebRTC] remoteAnswer prop received, processing answer');
    const pc = pcRef.current;
    if (!pc || pc.signalingState === 'closed') {
      console.warn('[WebRTC] remoteAnswer ignored — pc is null or closed');
      onRemoteAnswerConsumed?.();
      return;
    }
    if (pc.signalingState !== 'have-local-offer') {
      console.warn('[WebRTC] remoteAnswer ignored — signalingState is', pc.signalingState, '(expected have-local-offer)');
      onRemoteAnswerConsumed?.();
      return;
    }
    onRemoteAnswerConsumed?.();
    pc.setRemoteDescription(new RTCSessionDescription(remoteAnswer.answer))
      .then(() => {
        console.log('[WebRTC] setRemoteDescription(answer) OK — signalingState=', pc.signalingState, '— waiting for ICE...');
        for (const c of pendingCandidatesRef.current) {
          pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        }
        pendingCandidatesRef.current = [];
      })
      .catch((err) => console.error('[WebRTC] setRemoteDescription(answer) failed:', err));
  }, [remoteAnswer]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wire remaining socket events (rejected / ended / ICE)
  useEffect(() => {
    const s = socketRef.current;
    if (direction === 'outgoing') {
      console.log('[WebRTC] caller socket wired, id=', s.id, 'connected=', s.connected);
    }

    if (direction === 'outgoing') startOutgoingCall();

    const onRejected = () => {
      cleanup();
      setCallStatus('rejected');
      setTimeout(onClose, 2000);
    };

    const onEnded = () => {
      cleanup();
      setCallStatus('ended');
      setTimeout(onClose, 1500);
    };

    const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      const pc = pcRef.current;
      if (!pc || !candidate || pc.signalingState === 'closed') return;
      if (pc.remoteDescription) {
        try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch { /* ignore */ }
      } else {
        pendingCandidatesRef.current.push(candidate);
      }
    };

    s.on('call-rejected', onRejected);
    s.on('call-ended', onEnded);
    s.on('ice-candidate', onIce);

    return () => {
      s.off('call-rejected', onRejected);
      s.off('call-ended', onEnded);
      s.off('ice-candidate', onIce);
      cleanup();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleMute = () => {
    localStreamRef.current?.getAudioTracks().forEach((t) => { t.enabled = isMuted; });
    setIsMuted((v) => !v);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach((t) => { t.enabled = isVideoOff; });
    setIsVideoOff((v) => !v);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const statusLabel: Record<CallStatus, string> = {
    calling: 'Appel en cours…',
    ringing: direction === 'incoming' ? 'Appel entrant' : 'Sonnerie…',
    connected: fmt(duration),
    ended: 'Appel terminé',
    rejected: 'Appel refusé',
    error: 'Erreur média — accès micro/caméra refusé',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full mx-4 rounded-3xl overflow-hidden flex flex-col"
        style={{
          maxWidth: callType === 'video' ? 680 : 360,
          background: '#080f1a',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
        }}
      >
        {/* Video area */}
        <div
          className="relative flex items-center justify-center"
          style={{
            aspectRatio: callType === 'video' ? '16/9' : '4/3',
            background: 'linear-gradient(135deg, #0a1628 0%, #080f1a 100%)',
          }}
        >
          {/* Remote video (visible once connected) */}
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ display: callStatus === 'connected' ? 'block' : 'none' }}
          />

          {/* Waiting overlay */}
          {callStatus !== 'connected' && (
            <div className="flex flex-col items-center justify-center z-10 py-12">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-5"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  boxShadow: '0 0 40px rgba(59,130,246,0.4)',
                }}
              >
                {targetUser.firstName[0]}{targetUser.lastName[0]}
              </div>
              <h3 className="text-white text-xl font-bold mb-2">
                {targetUser.firstName} {targetUser.lastName}
              </h3>
              <p
                className={`text-sm font-medium ${callStatus === 'rejected' || callStatus === 'error' ? 'text-red-400' : 'text-white/50'}`}
              >
                {statusLabel[callStatus]}
              </p>

              {/* Pulse animation while calling/ringing */}
              {(callStatus === 'calling' || callStatus === 'ringing') && (
                <div className="mt-4 flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full bg-blue-400"
                      style={{
                        animation: `pulse 1.2s ${i * 0.2}s ease-in-out infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Local video PiP */}
          {callType === 'video' && (
            <div
              className="absolute bottom-3 right-3 rounded-xl overflow-hidden"
              style={{
                width: 120,
                height: 80,
                boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255,255,255,0.15)',
                display: callStatus === 'connected' || direction === 'outgoing' ? 'block' : 'none',
              }}
            >
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>
          )}

          {/* Timer badge */}
          {callStatus === 'connected' && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold text-white"
              style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}
            >
              {fmt(duration)}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 px-6 py-5">
          {/* Incoming call — accept / reject */}
          {callStatus === 'ringing' && direction === 'incoming' ? (
            <>
              <button
                onClick={rejectCall}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Refuser"
                style={{ background: '#ef4444', boxShadow: '0 4px 16px rgba(239,68,68,0.4)' }}
              >
                <PhoneOff size={22} color="#fff" />
              </button>
              <div className="text-center">
                <p className="text-white/70 text-xs">
                  {callType === 'video' ? 'Appel vidéo' : 'Appel vocal'}
                </p>
              </div>
              <button
                onClick={acceptIncomingCall}
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="Accepter"
                style={{ background: '#10b981', boxShadow: '0 4px 16px rgba(16,185,129,0.4)' }}
              >
                <Phone size={22} color="#fff" />
              </button>
            </>
          ) : (
            <>
              {/* Mute */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Activer micro' : 'Couper micro'}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                style={{
                  background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {isMuted ? <MicOff size={18} color="#fff" /> : <Mic size={18} color="#fff" />}
              </button>

              {/* Video toggle */}
              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  title={isVideoOff ? 'Activer caméra' : 'Couper caméra'}
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
                  style={{
                    background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {isVideoOff ? <VideoOff size={18} color="#fff" /> : <Video size={18} color="#fff" />}
                </button>
              )}

              {/* End call */}
              <button
                onClick={endCall}
                title="Terminer l'appel"
                className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                style={{ background: '#ef4444', boxShadow: '0 4px 20px rgba(239,68,68,0.45)' }}
              >
                <PhoneOff size={22} color="#fff" />
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
