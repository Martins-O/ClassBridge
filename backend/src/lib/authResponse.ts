import { Response } from 'express';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: any;
  tokens: AuthTokens;
}

export function formatAuthResponse(res: Response, result: LoginResult): Response {
  return res.json({
    success: true,
    user: result.user,
    accessToken: result.tokens.accessToken,
    refreshToken: result.tokens.refreshToken,
  });
}

export function formatLoginErrorResponse(
  res: Response,
  errorCode: string,
  message: string,
  statusCode = 401,
  extra?: Record<string, any>
): Response {
  return res.status(statusCode).json({
    success: false,
    error: message,
    errorCode,
    ...extra,
  });
}

export function formatLogoutResponse(res: Response): Response {
  return res.json({
    success: true,
    message: 'Logged out successfully',
  });
}

export function formatRegisterResponse(res: Response, user: any): Response {
  return res.status(201).json({
    success: true,
    user,
  });
}

export function formatRefreshResponse(res: Response, tokens: AuthTokens): Response {
  return res.json({
    success: true,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}
