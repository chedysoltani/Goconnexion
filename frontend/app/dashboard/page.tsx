'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ActivityFeed from '@/components/dashboard/EnhancedActivityFeed';
import UserProfileCard from '@/components/dashboard/UserProfileCard';
import NotificationCenter from '@/components/dashboard/NotificationCenter';
import ConnectionsPage from '@/components/dashboard/ConnectionsPage';
import MessagesPage from '@/components/dashboard/MessagesPage';
import ProjectsPage from '@/components/dashboard/ProjectsPage';
import EarningsPage from '@/components/dashboard/EarningsPage';
import AnalyticsPage from '@/components/dashboard/AnalyticsPage';
import { User } from '@/types/auth';
import { api } from '@/lib/api';
import IncubatorPage from '@/components/dashboard/IncubatorPage';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'connections' | 'messages' | 'projects' | 'earnings' | 'analytics' | 'incubator'>('feed');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await api.auth.me();
        
        const mappedUser = {
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          role: currentUser.role.toLowerCase() as any,
          createdAt: new Date(currentUser.createdAt),
          updatedAt: new Date(),
          profile: currentUser.freelancerProfile 
            ? {
                skills: currentUser.freelancerProfile.skills || [],
                experience: currentUser.freelancerProfile.bio || 'Aucune description fournie',
                hourlyRate: currentUser.freelancerProfile.hourlyRate,
                portfolio: currentUser.freelancerProfile.portfolioUrl,
                bio: currentUser.freelancerProfile.bio || '',
              }
            : currentUser.entrepreneurProfile
            ? {
                company: currentUser.entrepreneurProfile.companyName || '',
                position: 'Fondateur',
                industry: 'Tech',
                companySize: '1-10',
                website: currentUser.entrepreneurProfile.website,
                bio: currentUser.entrepreneurProfile.bio || '',
              }
            : {
                interests: [],
                goals: '',
                bio: '',
              }
        } as any;

        setUser(mappedUser);
      } catch (err) {
        console.error('Error fetching user:', err);
        api.auth.logout();
        router.push('/auth/login');
      }
    };

    fetchUser();
  }, [router]);

  const getRoleDisplay = () => {
    if (!user) return '';
    switch (user.role) {
      case 'freelancer': return 'Freelancer';
      case 'entrepreneur': return 'Entrepreneur';
      case 'user': return 'Utilisateur';
      default: return 'Utilisateur';
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'feed': return 'Fil d\'activité';
      case 'connections': return 'Connexions';
      case 'messages': return 'Messages';
      case 'projects': return 'Projets';
      case 'earnings': return 'Revenus';
      case 'analytics': return 'Analytiques';
      case 'incubator': return 'Incubateur Virtuel';
      default: return 'Tableau de bord';
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <DashboardSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-white border-b border-gc-border px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold text-foreground">
                {getTabTitle()} - {getRoleDisplay()}
              </h1>
              <span className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                {user?.role?.toUpperCase()}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <NotificationCenter />
              <UserProfileCard user={user} />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'feed' && <div className="h-full overflow-y-auto"><ActivityFeed user={user} /></div>}
          {activeTab === 'connections' && <div className="h-full overflow-y-auto"><ConnectionsPage user={user} setActiveTab={setActiveTab} /></div>}
          {activeTab === 'messages' && <div className="h-full overflow-y-auto"><MessagesPage user={user} /></div>}
          {activeTab === 'projects' && <div className="h-full overflow-y-auto"><ProjectsPage user={user} /></div>}
          {activeTab === 'earnings' && <div className="h-full overflow-y-auto"><EarningsPage user={user} /></div>}
          {activeTab === 'analytics' && <div className="h-full overflow-y-auto"><AnalyticsPage user={user} /></div>}
          {activeTab === 'incubator' && <div className="h-full overflow-y-auto"><IncubatorPage user={user} /></div>}
        </main>
      </div>
    </div>
  );
}
