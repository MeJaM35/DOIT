import apiClient from './api-client';
import axios from 'axios';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Update interfaces to match backend responses
export interface LoginResponse {
  token: string;
}

export interface RegisterResponse {
  message: string;
}

export interface ErrorResponse {
  error: string;
}

class AuthService {
  async login(credentials: LoginDto): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('jwt_token', response.data.token);
        
        // Since we don't get user ID and email from backend,
        // we'll store the email from credentials for display purposes
        localStorage.setItem('user_email', credentials.email);
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract the error message from the error response
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.error || 'Login failed. Please check your credentials.');
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async register(user: RegisterDto): Promise<RegisterResponse> {
    try {
      const response = await apiClient.post<RegisterResponse>('/auth/register', user);
      // For registration, backend only returns a success message,
      // so we'll log the user in after successful registration
      if (response.data.message) {
        // After registration, call login
        await this.login({
          email: user.email,
          password: user.password
        });
      }
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Extract the error message from the error response
        const errorData = error.response.data as ErrorResponse;
        throw new Error(errorData.error || 'Registration failed. Please try again.');
      }
      throw new Error('Registration failed. Please try again.');
    }
  }

  logout(): void {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    // Redirect to login page would typically happen in a component after this
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('jwt_token');
  }

  getCurrentUser(): { email: string } | null {
    const email = localStorage.getItem('user_email');
    
    if (email) {
      return { email };
    }
    
    return null;
  }
}

export default new AuthService();