'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/authenticated-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { UpdateSettingsDto, UserProfileDto } from '@/services/profile-service';
import profileService from '@/services/profile-service';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UpdateSettingsDto>({
    fullName: '',
    bio: '',
    profilePictureUrl: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setFormData({
        fullName: data.fullName || '',
        bio: data.bio || '',
        profilePictureUrl: data.profilePictureUrl || '',
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await profileService.updateSettings(formData);
      toast.success('Profile updated successfully');
      await loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
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
        <h1 className="text-3xl font-bold tracking-tight mb-1 text-center">Your Profile</h1>
        <p className="text-muted-foreground mb-8 text-center">
          Manage your personal information and settings
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>
                  Your profile image will be visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={profile?.profilePictureUrl || ''}
                      alt={profile?.fullName || profile?.username || ''}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile?.fullName || profile?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium">
                      Username
                    </label>
                    <Input
                      id="username"
                      value={profile?.username || ''}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Your username cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ''}
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">
                      Contact support to change your email address
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="profilePictureUrl" className="text-sm font-medium">
                      Profile Picture URL
                    </label>
                    <Input
                      id="profilePictureUrl"
                      name="profilePictureUrl"
                      value={formData.profilePictureUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/your-photo.jpg"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="bio" className="text-sm font-medium">
                      Bio
                    </label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us a little about yourself"
                      rows={4}
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            variant="outline"
            onClick={() => router.push('/settings')}
          >
            Go to Settings
          </Button>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}