'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
import authService from '@/services/auth-service';
import { toast } from 'sonner';

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
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/boards" className="text-xl font-bold text-zinc-900 dark:text-white">
            DOIT! TaskManager
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" asChild>
            <Link href="/boards">
              Boards
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarFallback>{getInitials(email)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}