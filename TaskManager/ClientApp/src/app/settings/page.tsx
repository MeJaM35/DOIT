'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { UserProfileDto } from '@/services/profile-service';
import { SunIcon, MoonIcon, LaptopIcon, KeyIcon, TrashIcon } from 'lucide-react';
import { useTheme } from '@/lib/theme-provider';
import profileService from '@/services/profile-service';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasGitHubToken, setHasGitHubToken] = useState(false);
  const [newToken, setNewToken] = useState('');
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  useEffect(() => {
    loadProfile();
    checkGitHubToken();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      // Set the theme from the user's profile if it exists
      if (data.theme) {
        setTheme(data.theme as "light" | "dark" | "system");
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const checkGitHubToken = async () => {
    try {
      const hasToken = await profileService.hasGitHubToken();
      setHasGitHubToken(hasToken);
    } catch (error) {
      console.error('Failed to check GitHub token status:', error);
    }
  };

  const handleThemeChange = async (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    try {
      await profileService.updateSettings({ theme: newTheme });
      toast.success('Theme updated successfully');
    } catch (error) {
      console.error('Failed to update theme setting:', error);
      toast.error('Failed to update theme');
    }
  };

  const handleSaveToken = async () => {
    if (!newToken.trim()) {
      toast.error('Please enter a valid GitHub token');
      return;
    }

    setIsTokenLoading(true);
    try {
      await profileService.updateGitHubToken(newToken);
      setHasGitHubToken(true);
      setNewToken('');
      toast.success('GitHub token saved successfully');
    } catch (error) {
      console.error('Failed to save GitHub token:', error);
      toast.error('Failed to save GitHub token');
    } finally {
      setIsTokenLoading(false);
    }
  };

  const handleDeleteToken = async () => {
    setIsTokenLoading(true);
    try {
      await profileService.deleteGitHubToken();
      setHasGitHubToken(false);
      toast.success('GitHub token deleted successfully');
    } catch (error) {
      console.error('Failed to delete GitHub token:', error);
      toast.error('Failed to delete GitHub token');
    } finally {
      setIsTokenLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-48 bg-muted rounded mb-4"></div>
            <div className="h-4 w-64 bg-muted rounded"></div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container max-w-4xl py-8 mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-center">Settings</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Customize your experience and manage your integrations
        </p>

        <div className="space-y-8">
          {/* Theme Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
              <CardDescription>
                Choose how DoIt looks for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                value={theme} 
                onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem 
                    value="light" 
                    id="light" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="light" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <SunIcon className="mb-3 h-6 w-6" />
                    Light Theme
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="dark" 
                    id="dark" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="dark" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <MoonIcon className="mb-3 h-6 w-6" />
                    Dark Theme
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem 
                    value="system" 
                    id="system" 
                    className="peer sr-only" 
                  />
                  <Label 
                    htmlFor="system" 
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <LaptopIcon className="mb-3 h-6 w-6" />
                    System Theme
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* GitHub Integration */}
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Add your GitHub Personal Access Token to enable GitHub integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasGitHubToken ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>GitHub token is configured</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Your GitHub token allows DoIt to connect with your GitHub repositories. The token is stored securely.
                  </p>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteToken}
                    disabled={isTokenLoading}
                    className="mt-2"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {isTokenLoading ? 'Processing...' : 'Remove Token'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    A GitHub Personal Access Token enables DoIt to access and manage your GitHub repositories, issues, and pull requests.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="github-token">GitHub Personal Access Token</Label>
                    <div className="flex items-center space-x-2">
                      <KeyIcon className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="github-token"
                        type="password"
                        placeholder="ghp_xxxxxxxxxxxxxxx"
                        value={newToken}
                        onChange={(e) => setNewToken(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Create a token with 'repo' scope from your GitHub Developer Settings
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleSaveToken}
                    disabled={isTokenLoading || !newToken}
                  >
                    {isTokenLoading ? 'Saving...' : 'Save Token'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/profile')}
          >
            Back to Profile
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}