'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import authService from '@/services/auth-service';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to boards
    if (authService.isAuthenticated()) {
      router.push('/boards');
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between py-4 mx-auto">
          <div className="flex items-center">
            <Image 
              src="/doit-logo.png" 
              alt="DOIT!" 
              width={36} 
              height={36} 
              className="rounded-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex gap-6 items-center">
              <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                How it works
              </Link>
            </nav>
            <ThemeToggle />
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-background">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Task Management Simplified
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Organize your projects, collaborate with your team, and track your tasks with our simple and intuitive interface.
                </p>
              </div>
              <div className="space-x-4">
                <Button size="lg" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/40">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Key Features
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Everything you need to manage your projects efficiently
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2l4-4"></path>
                    <path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9s-9-1.8-9-9s1.8-9 9-9z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Task Management</h3>
                <p className="text-muted-foreground text-center">
                  Create, organize, and track tasks with ease. Set priorities and deadlines to stay on schedule.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Github Integration</h3>
                <p className="text-muted-foreground text-center">
                  Connect your boards to GitHub repositories and automatically close tasks when commits are made.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 p-6 bg-background rounded-lg shadow-sm border">
                <div className="p-3 rounded-full bg-primary/10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Board Organization</h3>
                <p className="text-muted-foreground text-center">
                  Create multiple boards for different projects. Customize your workflow with lists that match your process.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  How It Works
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Get started with DOIT! in three simple steps
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-16">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold">Create an Account</h3>
                <p className="text-muted-foreground text-center">
                  Sign up for a free account and start organizing your tasks right away.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold">Create Boards</h3>
                <p className="text-muted-foreground text-center">
                  Set up boards for your projects and customize lists to match your workflow.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border bg-background">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold">Manage Tasks</h3>
                <p className="text-muted-foreground text-center">
                  Add tasks, set priorities, and track your progress as you work through your projects.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-muted">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Get Started?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of users who have improved their productivity with DOIT!
                </p>
              </div>
              <div className="space-x-4 mt-6">
                <Button size="lg" asChild>
                  <Link href="/register">Sign up for free</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 md:py-0 border-t border-border">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:h-24 text-center md:text-left mx-auto">
          <div className="flex items-center">
            <Image 
              src="/doit-logo.png" 
              alt="DOIT!" 
              width={24} 
              height={24} 
              className="rounded-md"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
