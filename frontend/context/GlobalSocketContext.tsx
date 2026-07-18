'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, Socket } from 'socket.io-client';
import { playMessageSound, startRingtone, stopRingtone } from '@/lib/sounds';

// ── Public types ────────────────────────────────────────────────────
export interface GlobalMessageBubble {
  id: string;
  senderFirstName: string;
  senderLastName: string;
  preview: string;
  conversationId: string;
  senderRole: string;
}

export interface GlobalPendingCall {
  callerId: string;
  callerFirstName: string;
  callerLastName: string;
  callerRole: string;
  callType: 'video' | 'audio';
  offer: RTCSessionDescriptionInit;
}

interface CtxValue {
  socket: Socket | null;
  /** MessagesPage sets true on mount, false on unmount */
  setIsInMessages: (v: boolean) => void;
  /** Floating message bubble — null when no new message */
  messageBubble: GlobalMessageBubble | null;
  dismissBubble: () => void;
  /** Incoming call when user is NOT in Messages */
  pendingCall: GlobalPendingCall | null;
  declineGlobalCall: () => void;
  /** Lifted out of VideoCallModal to avoid stale closures */
  remoteAnswer: { answer: RTCSessionDescriptionInit } | null;
  consumeRemoteAnswer: () => void;
}

const defaultCtx: CtxValue = {
  socket: null,
  setIsInMessages: () => {},
  messageBubble: null,
  dismissBubble: () => {},
  pendingCall: null,
  declineGlobalCall: () => {},
  remoteAnswer: null,
  consumeRemoteAnswer: () => {},
};

const GlobalSocketCtx = createContext<CtxValue>(defaultCtx);

export function GlobalSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const isInMessagesRef = useRef(false);

  const [messageBubble, setMessageBubble] = useState<GlobalMessageBubble | null>(null);
  const [pendingCall, setPendingCall]     = useState<GlobalPendingCall | null>(null);
  const [remoteAnswer, setRemoteAnswer]   = useState<{ answer: RTCSessionDescriptionInit } | null>(null);

  // ── Helpers ────────────────────────────────────────────────────
  const dismissBubble = useCallback(() => {
    setMessageBubble(null);
  }, []);

  const declineGlobalCall = useCallback(() => {
    setPendingCall(null);
    stopRingtone();
  }, []);

  const consumeRemoteAnswer = useCallback(() => setRemoteAnswer(null), []);

  const setIsInMessages = useCallback(
    (v: boolean) => {
      isInMessagesRef.current = v;
      if (v) dismissBubble(); // entering Messages clears any bubble
    },
    [dismissBubble],
  );

  // ── Socket lifecycle ───────────────────────────────────────────
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';
    console.log('[Global] connecting socket to:', wsUrl);

    const sock = io(wsUrl, {
      withCredentials: true,
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 3000,
      reconnectionAttempts: 5,
    });

    sock.on('connect', () => {
      console.log('[Global] socket connected — id:', sock.id, '— url:', wsUrl);
    });

    sock.on('connect_error', (err) => {
      console.error('[Global] socket connect_error:', err.message, '— url:', wsUrl);
    });

    sock.on('disconnect', (reason) => {
      console.warn('[Global] socket disconnected:', reason);
    });

    // ── newMessage ──────────────────────────────────────────────
    sock.on('newMessage', (msg: {
      id: string;
      conversationId: string;
      content: string;
      sender: { firstName: string; lastName: string; role: string };
    }) => {
      // Sound only when not actively viewing Messages
      if (!isInMessagesRef.current) {
        playMessageSound();

        const raw = msg.content ?? '';
        setMessageBubble({
          id: msg.id,
          senderFirstName: msg.sender.firstName,
          senderLastName:  msg.sender.lastName,
          senderRole:      msg.sender.role,
          conversationId:  msg.conversationId,
          preview:         raw.length > 30 ? raw.slice(0, 30) + '…' : raw,
        });
      }
    });

    // ── incoming-call ───────────────────────────────────────────
    sock.on('incoming-call', (call: GlobalPendingCall) => {
      console.log('[Global] incoming-call received — isInMessages:', isInMessagesRef.current, call.callerId);
      // Only take over when user is NOT already in Messages
      // (MessagesPage has its own listener for the in-Messages case)
      if (!isInMessagesRef.current) {
        setPendingCall(call);
        startRingtone();
      }
    });

    // ── call-answered ───────────────────────────────────────────
    // Lifted here so the listener is on a stable, never-recreated socket.
    sock.on('call-answered', (data: { answer: RTCSessionDescriptionInit }) => {
      setRemoteAnswer(data);
    });

    setSocket(sock);

    return () => {
      sock.disconnect();
      stopRingtone();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop ringtone as soon as call is dismissed
  useEffect(() => {
    if (!pendingCall) stopRingtone();
  }, [pendingCall]);

  return (
    <GlobalSocketCtx.Provider
      value={{
        socket,
        setIsInMessages,
        messageBubble,
        dismissBubble,
        pendingCall,
        declineGlobalCall,
        remoteAnswer,
        consumeRemoteAnswer,
      }}
    >
      {children}
    </GlobalSocketCtx.Provider>
  );
}

export const useGlobalSocket = () => useContext(GlobalSocketCtx);
