import { hashPassword } from './auth';

// In-memory user storage for demo purposes
// In production, you'd use a database like Prisma with PostgreSQL
interface User {
  id: string;
  email: string;
  passwordHash: string;
  name?: string;
  createdAt: Date;
}

let users: User[] = [];

export function findUserByEmail(email: string): User | null {
  return users.find(user => user.email === email) || null;
}

export function findUserById(id: string): User | null {
  return users.find(user => user.id === id) || null;
}

export function createUser(email: string, password: string, name?: string): User | null {
  // Check if user already exists
  const existingUser = findUserByEmail(email);
  if (existingUser) {
    return null;
  }

  const newUser: User = {
    id: generateUserId(),
    email,
    passwordHash: hashPassword(password),
    name,
    createdAt: new Date(),
  };

  users.push(newUser);
  return newUser;
}

function generateUserId(): string {
  return 'user_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

// For demo purposes - add a test user
export function initializeTestUser() {
  const testUser = createUser('test@example.com', 'password123', 'Test User');
  console.log('Test user created:', testUser);
}
