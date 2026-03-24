import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface JWTPayload {
  userId: string;
  email: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
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
