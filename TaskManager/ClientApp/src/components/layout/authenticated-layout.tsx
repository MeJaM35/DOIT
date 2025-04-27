'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from './navbar';
import authService from '@/services/auth-service';
import { Loader2 } from 'lucide-react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      setIsLoading(true);
      
      try {
        // Check token validity (this could call an API endpoint to verify token)
        const authenticated = authService.isAuthenticated();
        
        if (!authenticated) {
          // Redirect to login if not authenticated
          router.replace('/login?returnUrl=' + encodeURIComponent(window.location.pathname));
          return;
        }
        
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication error:', error);
        // Handle authentication error, redirect to login
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4 p-8 rounded-lg">
          <Loader2 size={40} className="animate-spin text-primary" />
          <p className="text-foreground font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        {children}
      </main>
      <footer className="py-6 border-t border-border bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-muted-foreground">
          <p>© 2025 DOIT! TaskManager. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}