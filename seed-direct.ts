import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function seedEmails() {
  try {
    console.log('Seeding emails...');

    // First, let's get the admin user ID to associate with these emails
    let adminUser = await db.user.findFirst({
      where: { email: 'admin@vcemail.local' }
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 12);
      adminUser = await db.user.create({
        data: {
          email: 'admin@vcemail.local',
          name: 'Admin User',
          password: hashedAdminPassword,
          role: 'ADMIN'
        }
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user found');
    }

    console.log('User seeding logic complete.');
  } catch (error) {
    console.error("Error seeding emails:", error);
  } finally {
    await db.$disconnect();
  }
}

seedEmails();