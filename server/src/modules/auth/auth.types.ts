/**
 * Auth-specific type definitions.
 */

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

export interface SignupResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}
