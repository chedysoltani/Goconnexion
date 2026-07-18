'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { useGlobalSocket } from '@/context/GlobalSocketContext';
import VideoCallModal from '@/components/dashboard/VideoCallModal';

export default function GlobalCallHandler() {
  const { socket, pendingCall, declineGlobalCall, remoteAnswer, consumeRemoteAnswer } =
    useGlobalSocket();

  if (!pendingCall || !socket || typeof document === 'undefined') return null;

  return createPortal(
    <VideoCallModal
      socket={socket}
      targetUser={{
        id:        pendingCall.callerId,
        firstName: pendingCall.callerFirstName,
        lastName:  pendingCall.callerLastName,
        role:      pendingCall.callerRole,
      }}
      callType={pendingCall.callType}
      direction="incoming"
      incomingOffer={pendingCall.offer}
      remoteAnswer={remoteAnswer}
      onRemoteAnswerConsumed={consumeRemoteAnswer}
      onClose={declineGlobalCall}
    />,
    document.body,
  );
}
