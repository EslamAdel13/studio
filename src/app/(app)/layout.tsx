// src/app/(app)/layout.tsx
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SidebarNav } from '@/components/SidebarNav';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.replace('/login'); // Redirect to login if not authenticated
    }
  }, [currentUser, loading, router]);

  if (loading || (!loading && !currentUser)) {
    // Show loading indicator or null while checking auth/redirecting
     return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
        <div className="flex min-h-screen">
          <SidebarNav />
          <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">
            <div className="container mx-auto max-w-7xl">
             {children}
            </div>
          </main>
        </div>
    </SidebarProvider>
  );
}
