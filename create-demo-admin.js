// Create Demo Admin User
// Run this script with: node create-demo-admin.js

const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('./src/lib/auth.js');

const prisma = new PrismaClient();

async function createDemoAdmin() {
  try {
    // Check if any users already exist
    const userCount = await prisma.user.count();
    
    if (userCount > 0) {
      console.log('Users already exist. Please use the dashboard to create additional users.');
      return;
    }

    // Create demo admin user
    const passwordHash = await hashPassword('admin123');
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Demo Admin',
        email: 'admin@bkbusiness.com',
        passwordHash,
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Demo admin user created successfully!');
    console.log('📧 Email: admin@bkbusiness.com');
    console.log('🔑 Password: admin123');
    console.log('🔗 Login at: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creating demo admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAdmin();
