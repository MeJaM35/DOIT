'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import authService, { RegisterDto } from '@/services/auth-service';
import { toast } from 'sonner';

export default function Register() {
  const router = useRouter();
  const [registerData, setRegisterData] = useState<RegisterDto>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterData({
      ...registerData,
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
    
    // Client-side validation
    if (registerData.password !== registerData.confirmPassword) {
      setErrors({
        confirmPassword: 'Passwords do not match!'
      });
      toast.error('Passwords do not match!');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await authService.register(registerData);
      toast.success('Registration successful!');
      router.push('/boards');
    } catch (error: any) {
      console.error('Registration failed:', error);
      
      // Check if the error message contains specific keywords to provide more targeted feedback
      const errorMessage = error.message || 'Registration failed. Please try again.';
      
      if (errorMessage.toLowerCase().includes('email already exists')) {
        setErrors({
          email: 'This email is already registered'
        });
        toast.error('This email is already registered');
      } else if (errorMessage.toLowerCase().includes('username is already taken')) {
        setErrors({
          username: 'This username is already taken'
        });
        toast.error('This username is already taken');
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
    <div className="flex min-h-screen flex-col bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/40 shadow-lg">
          <CardHeader className="space-y-2 items-center text-center pb-2">
            <div className="flex justify-center mb-2">
              <Logo width={60} height={60} href={null} />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
            <CardDescription>
              Get started with DOIT! TaskManager
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
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="yourname"
                  required
                  value={registerData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="username"
                />
                {errors.username && (
                  <p className="text-destructive text-xs mt-1">{errors.username}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={registerData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-destructive text-xs mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={registerData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={registerData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? "border-destructive ring-destructive focus-visible:ring-destructive" : ""}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href="/login" className="text-primary hover:underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      <footer className="py-6 text-center text-xs text-muted-foreground">
        © 2025 DOIT! TaskManager. All rights reserved.
      </footer>
    </div>
  );
}