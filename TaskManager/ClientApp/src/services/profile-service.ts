import apiClient from './api-client';

export interface UserProfileDto {
  username: string;
  email: string;
  fullName?: string;
  bio?: string;
  profilePictureUrl?: string;
  theme: string;
}

export interface UpdateSettingsDto {
  fullName?: string;
  bio?: string;
  profilePictureUrl?: string;
  theme?: string;
}

export interface GitHubPATDto {
  personalAccessToken: string;
}

class ProfileService {
  // Get current user profile
  async getProfile(): Promise<UserProfileDto> {
    const response = await apiClient.get<UserProfileDto>('/profile');
    return response.data;
  }
  
  // Update user settings
  async updateSettings(settings: UpdateSettingsDto): Promise<void> {
    await apiClient.put('/profile/settings', settings);
  }
  
  // Update GitHub PAT
  async updateGitHubToken(token: string): Promise<void> {
    await apiClient.put('/profile/github-token', { personalAccessToken: token });
  }
  
  // Check if user has GitHub PAT
  async hasGitHubToken(): Promise<boolean> {
    const response = await apiClient.get<{ hasToken: boolean }>('/profile/github-token-status');
    return response.data.hasToken;
  }
  
  // Delete GitHub PAT
  async deleteGitHubToken(): Promise<void> {
    await apiClient.delete('/profile/github-token');
  }
}

export default new ProfileService();