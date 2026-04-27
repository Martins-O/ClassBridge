import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable must be set in production');
    }
    return 'development-only-jwt-secret-do-not-use-in-production';
  }
  return secret;
};

const getJwtRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_REFRESH_SECRET environment variable must be set in production');
    }
    return 'development-only-refresh-secret-do-not-use-in-production';
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();
const JWT_REFRESH_SECRET = getJwtRefreshSecret();
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPayload {
    userId: string;
    email: string;
    name: string;
    role: string;
    schoolId?: string;
    schoolApproved?: boolean;
    schoolStatus?: 'pending' | 'approved' | 'rejected';
}

export interface RefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}

export function generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'classbridge',
        subject: payload.userId
    });
}

export function generateRefreshToken(userId: string): RefreshToken {
    const token = jwt.sign({ userId, type: 'refresh' }, JWT_REFRESH_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY,
        issuer: 'classbridge',
        subject: userId,
        jwtid: uuidv4()
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return {
        id: uuidv4(),
        userId,
        token,
        expiresAt,
        createdAt: new Date()
    };
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET, {
        issuer: 'classbridge'
    }) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'classbridge'
    }) as { userId: string };
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch {
        return null;
    }
}

export function isTokenExpired(token: string): boolean {
    try {
        const decoded = jwt.decode(token) as { exp?: number };
        if (!decoded?.exp) return true;
        return Date.now() >= decoded.exp * 1000;
    } catch {
        return true;
    }
}
