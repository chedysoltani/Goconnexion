'use client';

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/I18nContext';
import { api } from '@/lib/api';

const VISITOR_ID_KEY = 'gc_chat_visitor_id';
const SESSION_ID_KEY = 'gc_chat_session_id';

// Le widget n'apparaît que sur les pages publiques — inutile pour les
// utilisateurs déjà authentifiés (support géré via la messagerie du dashboard).
const HIDDEN_PATH_PREFIXES = ['/dashboard', '/admin'];

interface ChatMessage {
  id: string;
  role: 'visitor' | 'agent';
  content: string;
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAuthenticated(!!localStorage.getItem('user'));
  }, [pathname]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  const hidden = authenticated || HIDDEN_PATH_PREFIXES.some((p) => pathname?.startsWith(p));
  if (hidden) return null;

  async function ensureSession(): Promise<string> {
    if (sessionIdRef.current) return sessionIdRef.current;

    const existing = localStorage.getItem(SESSION_ID_KEY);
    if (existing) {
      sessionIdRef.current = existing;
      return existing;
    }

    const params = new URLSearchParams(window.location.search);
    const { sessionId, visitorId } = await api.agentChatbot.startSession({
      visitorId: localStorage.getItem(VISITOR_ID_KEY) ?? undefined,
      sourceUrl: window.location.href,
      utmSource: params.get('utm_source') ?? undefined,
      utmCampaign: params.get('utm_campaign') ?? undefined,
    });

    localStorage.setItem(SESSION_ID_KEY, sessionId);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
    sessionIdRef.current = sessionId;
    return sessionId;
  }

  async function handleOpen() {
    setOpen(true);
    if (messages.length === 0) {
      setMessages([{ id: 'greeting', role: 'agent', content: t.chatbot.greeting }]);
      try {
        await ensureSession();
      } catch {
        // La session sera retentée au premier envoi de message.
      }
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'visitor', content: text }]);
    setSending(true);

    try {
      const sessionId = await ensureSession();
      const { reply } = await api.agentChatbot.sendMessage(sessionId, text);
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'agent', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'agent', content: t.chatbot.error }]);
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9996 }}>
      {open && (
        <div
          style={{
            width: 340,
            maxWidth: 'calc(100vw - 32px)',
            height: 480,
            maxHeight: 'calc(100vh - 120px)',
            marginBottom: 12,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 8px 32px rgba(15,23,42,0.16), 0 2px 8px rgba(15,23,42,0.08)',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: '#2563eb',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15 }}>{t.chatbot.title}</span>
            <button
              onClick={() => setOpen(false)}
              aria-label={t.chatbot.closeLabel}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4, display: 'flex' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === 'visitor' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '9px 13px',
                  borderRadius: 14,
                  fontSize: 13.5,
                  lineHeight: 1.45,
                  whiteSpace: 'pre-wrap',
                  background: m.role === 'visitor' ? '#2563eb' : '#f1f5f9',
                  color: m.role === 'visitor' ? '#fff' : '#0f172a',
                }}
              >
                {m.content}
              </div>
            ))}
            {sending && (
              <div style={{ alignSelf: 'flex-start', padding: '9px 13px', borderRadius: 14, background: '#f1f5f9', display: 'flex' }}>
                <Loader2 size={16} className="animate-spin" color="#64748b" />
              </div>
            )}
          </div>

          {/* Disclaimer */}
          <div style={{ padding: '0 14px 8px', fontSize: 10.5, color: '#94a3b8', lineHeight: 1.3 }}>
            {t.chatbot.disclaimer}
          </div>

          {/* Input */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, padding: '10px 12px', borderTop: '1px solid #e2e8f0' }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chatbot.placeholder}
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: '8px 10px',
                fontSize: 13.5,
                fontFamily: 'inherit',
                outline: 'none',
                maxHeight: 80,
              }}
            />
            <button
              onClick={handleSend}
              disabled={sending || !input.trim()}
              aria-label={t.chatbot.send}
              style={{
                background: '#2563eb',
                border: 'none',
                borderRadius: 10,
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
                opacity: sending || !input.trim() ? 0.5 : 1,
                flexShrink: 0,
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Launcher button */}
      <button
        onClick={() => (open ? setOpen(false) : handleOpen())}
        aria-label={open ? t.chatbot.closeLabel : t.chatbot.openLabel}
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: '#2563eb',
          border: 'none',
          boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          marginLeft: 'auto',
        }}
      >
        {open ? <X size={24} color="#fff" /> : <MessageCircle size={24} color="#fff" />}
      </button>
    </div>
  );
}
