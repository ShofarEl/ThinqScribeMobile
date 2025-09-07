// Type declarations for API modules
declare module '@/src/api/auth' {
  export interface LoginCredentials {
    email: string;
    password: string;
  }

  export interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: 'student' | 'writer';
  }

  export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'writer';
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface AuthResponse {
    token: string;
    user: User;
    message?: string;
  }

  export function login(credentials: LoginCredentials): Promise<AuthResponse>;
  export function register(userData: RegisterData): Promise<AuthResponse>;
  export function logout(): Promise<void>;
  export function getCurrentUser(): Promise<User>;
  export function getAuthToken(): Promise<string | null>;
}

declare module '@/src/utils/errorMessages' {
  export function getAuthErrorMessage(error: Error): string;
}
