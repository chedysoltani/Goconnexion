import React from 'react';
import { redirect } from 'next/navigation';

// Simulate auth check - in real app, this would check session/token
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: Replace with actual auth check
  const isAuthenticated = true; // Simulate authenticated user
  
  if (!isAuthenticated) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gc-bg">
      {children}
    </div>
  );
}
