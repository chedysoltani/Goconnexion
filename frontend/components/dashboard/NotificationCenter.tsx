'use client';

import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { io, Socket } from 'socket.io-client';
import { Bell, UserCheck, MessageSquare, Heart, MessageCircle, Info, Check } from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Le cookie gc_access est envoyé automatiquement dans le handshake WebSocket
    const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001', {
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Notification WebSocket connected');
    });

    socket.on('notification', (newNotif: Notification) => {
      console.log('Received live notification:', newNotif);
      setNotifications((prev) => [newNotif, ...prev]);
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('connection')) {
      return (
        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
          <UserCheck size={16} />
        </div>
      );
    }
    if (lowerType.includes('message')) {
      return (
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 flex-shrink-0">
          <MessageSquare size={16} />
        </div>
      );
    }
    if (lowerType.includes('like')) {
      return (
        <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 flex-shrink-0">
          <Heart size={16} />
        </div>
      );
    }
    if (lowerType.includes('comment')) {
      return (
        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 flex-shrink-0">
          <MessageCircle size={16} />
        </div>
      );
    }
    return (
      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0">
        <Info size={16} />
      </div>
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleMarkRead = async (id: string, isAlreadyRead: boolean) => {
    if (isAlreadyRead) return;
    try {
      await api.notifications.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `il y a ${diffInDays} j`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} h`;
    } else if (diffInMinutes > 0) {
      return `il y a ${diffInMinutes} min`;
    } else {
      return "à l'instant";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-accent-light text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} nouvelles
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10px] font-semibold text-accent hover:text-indigo-600 transition-colors flex items-center gap-0.5"
              >
                <Check size={10} />
                <span>Tout lire</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-[10px]">Aucune notification pour le moment.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleMarkRead(notification.id, notification.read)}
                  className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 items-start ${
                    !notification.read ? 'bg-slate-50/70 border-l-2 border-accent' : ''
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-slate-900 text-[11px] truncate">
                        {notification.title}
                      </p>
                      <span className="text-[9px] text-slate-400 flex-shrink-0">
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 leading-relaxed break-words">
                      {notification.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
