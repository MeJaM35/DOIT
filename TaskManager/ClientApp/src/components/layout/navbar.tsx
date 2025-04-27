'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Layers, Plus, LogOut, User, Settings } from 'lucide-react';
import authService from '@/services/auth-service';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully!');
    router.push('/login');
  };

  const getInitials = (email: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/boards" className="group flex items-center transition-all">
            <Image 
              src="/doit-logo.png" 
              alt="DOIT!" 
              width={48}
              height={48}
              className="transition-transform group-hover:scale-110"
              priority
            />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:inline-block">DOIT!</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden md:flex gap-1 items-center">
            <Link href="/boards">
              <Layers className="h-4 w-4 mr-1" />
              Boards
            </Link>
          </Button>
          
          <Button variant="gradient" size="sm" className="hidden md:flex gap-1 items-center">
            <Plus className="h-4 w-4" />
            New Board
          </Button>

          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                    {getInitials(email)}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>My Account</span>
                  <span className="text-xs text-muted-foreground font-normal truncate max-w-[200px]">{email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer flex w-full items-center">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex w-full items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className={cn(
                  "cursor-pointer text-destructive focus:text-destructive",
                  "focus:bg-destructive/10"
                )}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}