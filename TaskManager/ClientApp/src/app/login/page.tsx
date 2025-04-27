'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import authService, { LoginDto } from '@/services/auth-service';
import { toast } from 'sonner';

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/boards';
  
  const [loginData, setLoginData] = useState<LoginDto>({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push('/boards');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user changes input
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [e.target.name]: undefined
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    setIsLoading(true);
    
    try {
      const response = await authService.login(loginData);
      
      if (response && response.token) {
        toast.success('Login successful!');
        
        // Force a hard navigation by directly setting window location
        window.location.href = returnUrl;
      } else {
        throw new Error('Authentication failed. No token received.');
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      
      // Display appropriate error message based on the backend response
      const errorMessage = error.message || 'Login failed. Please check your credentials.';
      
      if (errorMessage.toLowerCase().includes('invalid email')) {
        setErrors({
          email: 'Invalid email address'
        });
        toast.error('Invalid email address');
      } else if (errorMessage.toLowerCase().includes('invalid password') || 
                errorMessage.toLowerCase().includes('invalid email or password')) {
        setErrors({
          general: 'Invalid email or password'
        });
        toast.error('Invalid email or password');
      } else {
        setErrors({
          general: errorMessage
        });
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[40%] -left-[10%] h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-[30%] -right-[10%] h-[600px] w-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>
      
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card variant="gradient" className="w-full max-w-md">
          <CardHeader className="space-y-2 items-center text-center pb-2">
            <div className="flex justify-center mb-2">
              <div className="relative w-16 h-16 flex items-center justify-center bg-background rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:scale-105">
                <Image 
                  src="/doit-logo.png" 
                  alt="DOIT!" 
                  width={60} 
                  height={60}
                  className="p-1" 
                />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome back
              </span>
            </CardTitle>
            <CardDescription>
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-4">
              {errors.general && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  <p className="text-destructive text-sm">{errors.general}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={loginData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={loginData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="current-password"
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button variant="gradient" type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-primary hover:underline underline-offset-4 font-medium">
                  Create account
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="py-6 text-center text-xs text-muted-foreground relative z-10">
        © 2025 DOIT! TaskManager. All rights reserved.
      </footer>
    </div>
  );
}