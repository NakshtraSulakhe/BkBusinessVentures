import { prisma } from './database';

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email }
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id }
  });
}

export async function createUser(email: string, password: string, name?: string, role: string = 'operator') {
  const { hashPassword } = await import('./auth');
  
  return prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(password),
      name,
      role
    }
  });
}
