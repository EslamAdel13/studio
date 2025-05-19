// src/app/(auth)/layout.tsx
"use client";

import type { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LayoutDashboard } from 'lucide-react'; // App Icon

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && currentUser) {
      router.replace('/tasks'); // Redirect to main app if logged in
    }
  }, [currentUser, loading, router]);

  if (loading || (!loading && currentUser)) {
    // Show loading indicator or null while checking auth/redirecting
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
             <LayoutDashboard className="h-16 w-16 text-primary mb-6" />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-3">
        <LayoutDashboard className="h-12 w-12 text-primary" />
        <h1 className="text-4xl font-bold text-primary">Habitual Harmony</h1>
      </div>
      <div className="w-full max-w-md rounded-lg border bg-card p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
}
