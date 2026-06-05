import jwt from 'jsonwebtoken';

const defaultSecret = 'renteazy-dev-secret-change-me';

export interface AuthUser {
  userId: string;
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET || defaultSecret, { expiresIn: '15m' });
}

export function signRefreshToken(userId: string) {
  return jwt.sign({ sub: userId, typ: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || defaultSecret, { expiresIn: '30d' });
}

export function verifyAccessToken(token?: string): AuthUser | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || defaultSecret);
    if (typeof payload === 'object' && payload.sub) return { userId: String(payload.sub) };
    return null;
  } catch {
    return null;
  }
}

export function bearerToken(header: string | undefined) {
  return header?.startsWith('Bearer ') ? header.slice(7) : undefined;
}

