'use client';

import React from 'react';
import { GlobalSocketProvider } from '@/context/GlobalSocketContext';
import MessageBubble from './MessageBubble';
import GlobalCallHandler from './GlobalCallHandler';

export default function GlobalProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlobalSocketProvider>
      {children}
      <MessageBubble />
      <GlobalCallHandler />
    </GlobalSocketProvider>
  );
}
