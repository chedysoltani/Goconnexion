'use client';

import React, { useState } from 'react';
import { User } from '@/types/auth';

interface ActivityFeedProps {
  user: User | null;
}

interface ActivityItem {
  id: string;
  type: 'post' | 'connection' | 'project' | 'achievement';
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  content: string;
  timestamp: Date;
  likes?: number;
  comments?: number;
  image?: string;
}

export default function ActivityFeed({ user }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'post',
      author: {
        name: 'Marie Laurent',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b6296a?w=40&h=40&fit=crop&crop=face',
        role: 'freelancer',
      },
      content: 'Super satisfait de mon nouveau projet ! Developpement d une application React avec TypeScript. Le client est ravi du resultat.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 24,
      comments: 8,
    },
    {
      id: '2',
      type: 'connection',
      author: {
        name: 'Thomas Bernard',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=40&h=40&fit=crop&crop=face',
        role: 'entrepreneur',
      },
      content: 'Nouvelle connexion avec Sophie Martin - UX Designer. Nous travaillons sur un projet innovant dans le secteur de la sante.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'achievement',
      author: {
        name: 'Claire Dubois',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6c21de2f02f5?w=40&h=40&fit=crop&crop=face',
        role: 'user',
      },
      content: 'Objectif atteint ! 50+ connexions professionnelles qualitatives cette annee. Merci a toute la communaute !',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
      likes: 156,
      comments: 23,
    }
  ]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      return 'a l instant';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'post':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="#3B82F6" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8c1.55 0 2.823.62 3.734 1.51L21 12z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg width="16" height="16" fill="none" stroke="#10B981" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2A3 3 0 015.356-1.857M7 20v-2C0-.656.126-1.283.356-1.857m0 0A5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        );
    }
  };

  const [newPost, setNewPost] = useState('');

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.trim()) {
      const post: ActivityItem = {
        id: Date.now().toString(),
        type: 'post',
        author: {
          name: `${user?.firstName} ${user?.lastName}`,
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4?w=40&h=40&fit=crop&crop=face',
          role: user?.role || 'user',
        },
        content: newPost,
        timestamp: new Date(),
        likes: 0,
        comments: 0,
      };
      setActivities([post, ...activities]);
      setNewPost('');
    }
  };

  return (
    <div className="flex-1 bg-gc-bg">
      <div className="bg-white border-b border-gc-border p-6">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center flex-shrink-0">
            <span className="text-accent font-semibold text-sm">
              {user?.firstName ? user.firstName[0] : 'U'}
              {user?.lastName ? user.lastName[0] : 'U'}
            </span>
          </div>
          <form onSubmit={handlePostSubmit} className="flex-1">
            <input
              type="text"
              placeholder="Partagez une actualite..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="flex-1 px-4 py-2 border border-gc-border rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newPost.trim()}
              className="ml-3 px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publier
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-y-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <div className="p-6 space-y-6">
          {activities.map((activity) => (
            <div key={activity.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img
                        src={activity.author.avatar}
                        alt={activity.author.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {activity.author.name}
                      </p>
                      <p className="text-xs text-muted capitalize">
                        {activity.author.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {getActivityIcon(activity.type)}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-foreground leading-relaxed">
                  {activity.content}
                </p>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted">
                <button className="flex items-center gap-2 hover:text-accent transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 1.894 2.254V17a2 2 0 01-2 2h-1M9 12a2 2 0 002 2v4a2 2 0 002 2h-1" />
                  </svg>
                  <span>{activity.likes || 0}</span>
                </button>
                <button className="flex items-center gap-2 hover:text-accent transition-colors">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8c1.55 0 2.823.62 3.734 1.51L21 12z" />
                  </svg>
                  <span>{activity.comments || 0}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
