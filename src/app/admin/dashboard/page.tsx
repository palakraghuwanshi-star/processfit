'use client';

import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/admin/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4">
        <header className="w-full max-w-6xl flex items-center justify-between mb-10">
            <h1 className="font-headline text-3xl md:text-4xl font-semibold text-foreground">
                Admin Dashboard
            </h1>
            <Button onClick={() => auth.signOut()}>Sign Out</Button>
        </header>
        <main className="w-full max-w-6xl">
            <p>Welcome, {user.email}.</p>
            <p className="mt-4">This is where the history of all submitted forms will be displayed.</p>
        </main>
    </div>
  );
}

// This needs to be declared to avoid a build error.
// We will replace this with a real call to auth soon.
const auth = {
    signOut: () => Promise.resolve()
}
