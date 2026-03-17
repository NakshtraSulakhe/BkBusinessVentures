import jwt from 'jsonwebtoken';
import { prisma } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function hashPassword(password: string): string {
  // For now, using a simple hash - in production, use bcrypt
  return Buffer.from(password + JWT_SECRET).toString('base64');
}

export function comparePassword(password: string, hashedPassword: string): boolean {
  const hashedInput = hashPassword(password);
  return hashedInput === hashedPassword;
}

export async function blacklistToken(token: string): Promise<void> {
  const decoded = jwt.decode(token) as any;
  if (decoded && decoded.exp) {
    await prisma.blacklistedToken.create({
      data: {
        tokenHash: Buffer.from(token).toString('base64'),
        expiresAt: new Date(decoded.exp * 1000),
      },
    });
  }
}
