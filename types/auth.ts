export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: number;
  dodamId: string;
  grade?: number;
  room?: number;
  number?: number;
  name: string;
  profileImage: string;
  role: UserRole;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user?: User;
}

export interface LoginRequest {
  id: string;
  password: string;
}
