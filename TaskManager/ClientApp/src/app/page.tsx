'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/auth-service';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and redirect accordingly
    if (authService.isAuthenticated()) {
      router.push('/boards');
    } else {
      router.push('/login');
    }
  }, [router]);

  // This return is just a fallback while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">DOIT! TaskManager</h1>
        <p className="text-gray-500 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
