const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAndActivateUsers() {
  try {
    // List all users first
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    console.log('All users in database:');
    allUsers.forEach(user => {
      console.log(`- ${user.email} (${user.name}) - Role: ${user.role} - Active: ${user.isActive}`);
    });

    // Try to find the specific user
    const email = 'nakshtrasulakhe2613@gmail.com';
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('\nUser not found with email:', email);
      
      // Try to find by partial email or name
      const possibleUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: 'nakshtra' } },
            { name: { contains: 'Nakshtra' } }
          ]
        }
      });
      
      if (possibleUsers.length > 0) {
        console.log('Found possible matching users:');
        possibleUsers.forEach(u => {
          console.log(`- ${u.email} (${u.name}) - Role: ${u.role} - Active: ${u.isActive}`);
        });
        
        // Activate the first match
        const targetUser = possibleUsers[0];
        const updatedUser = await prisma.user.update({
          where: { id: targetUser.id },
          data: { isActive: true }
        });
        
        console.log('\nActivated user:', updatedUser.email);
      }
    } else {
      console.log('\nFound user:', user.email, '- Active:', user.isActive);
      
      if (!user.isActive) {
        const updatedUser = await prisma.user.update({
          where: { email },
          data: { isActive: true }
        });
        console.log('User activated successfully!');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndActivateUsers();
