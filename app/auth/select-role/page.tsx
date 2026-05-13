'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UserRole } from '@/types/auth';

const roleOptions = [
  {
    role: 'freelancer' as UserRole,
    title: 'Freelancer',
    description: 'Trouvez des clients et développez votre activité',
    features: ['Portfolio professionnel', 'Accès aux projets', 'Facturation simplifiée'],
    icon: (
      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    role: 'entrepreneur' as UserRole,
    title: 'Entrepreneur',
    description: 'Connectez-vous avec des talents et développez votre réseau',
    features: ['Recrutement', 'Networking B2B', 'Visibilité entreprise'],
    icon: (
      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A9.002 9.002 0 0112 21a9.002 9.002 0 01-9-9.255M12 3v18m0-12a3 3 0 110 6 3 3 0 010-6z" />
      </svg>
    ),
  },
  {
    role: 'user' as UserRole,
    title: 'Utilisateur',
    description: 'Explorez les opportunités et développez votre carrière',
    features: ['Développement carrière', 'Mentorat', 'Formation continue'],
    icon: (
      <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    ),
  },
];

export default function SelectRolePage() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  return (
    <div className="min-h-screen bg-gc-bg flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gc-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">GC</span>
            </div>
            <span className="font-sans font-semibold text-foreground">GoConnexions</span>
          </Link>
          <Link href="/auth/login" className="text-sm text-muted hover:text-foreground transition-colors">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Rejoignez GoConnexions
            </h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Choisissez votre profil pour accéder à des fonctionnalités adaptées à vos besoins
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {roleOptions.map((option) => (
              <div
                key={option.role}
                onClick={() => setSelectedRole(option.role)}
                className={`relative bg-white rounded-2xl p-8 border-2 cursor-pointer transition-all duration-300 ${
                  selectedRole === option.role
                    ? 'border-accent shadow-lg scale-105'
                    : 'border-gc-border hover:border-accent/50 hover:shadow-md'
                }`}
              >
                {selectedRole === option.role && (
                  <div className="absolute top-4 right-4 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
                    selectedRole === option.role ? 'bg-accent text-white' : 'bg-accent-light text-accent'
                  }`}>
                    {option.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {option.title}
                  </h3>
                  
                  <p className="text-muted mb-6">
                    {option.description}
                  </p>

                  <ul className="space-y-2 text-sm text-left w-full">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="text-center">
            <Link
              href={selectedRole ? `/auth/signup?role=${selectedRole}` : '#'}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold transition-all ${
                selectedRole
                  ? 'bg-accent text-white hover:bg-primary shadow-md hover:shadow-lg'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              onClick={(e) => {
                if (!selectedRole) {
                  e.preventDefault();
                }
              }}
            >
              Continuer avec {selectedRole ? roleOptions.find(opt => opt.role === selectedRole)?.title : '...'}
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <p className="text-sm text-muted mt-4">
              Vous pourrez changer votre profil plus tard dans les paramètres
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
