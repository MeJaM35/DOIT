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
        // Store in localStorage
        localStorage.setItem('jwt_token', response.data.token);
        
        // Also store as a cookie for middleware
        document.cookie = `auth-token=${response.data.token}; path=/; max-age=86400; samesite=strict`;
        
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
    
    // Also clear the cookie
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirect to login page would typically happen in a component after this
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    
    if (!token) {
      return false;
    }
    
    // Basic validation to check if token exists and has the correct format
    // A proper JWT has three parts separated by dots
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      this.logout(); // Clear invalid token
      return false;
    }
    
    try {
      // Check if token is expired by decoding the payload
      const payload = JSON.parse(atob(tokenParts[1]));
      
      // Check if token has an expiration date
      if (payload.exp) {
        // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
        if (payload.exp * 1000 < Date.now()) {
          this.logout(); // Clear expired token
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error parsing token:', error);
      this.logout(); // Clear invalid token
      return false;
    }
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