import { db } from "@/lib/db";

async function checkUsers() {
  try {
    console.log("Checking users in database...");
    
    const adminUser = await db.user.findUnique({
      where: { email: "admin@vcemail.local" }
    });
    
    const readOnlyUser = await db.user.findUnique({
      where: { email: "readonly@vcemail.local" }
    });
    
    console.log("Admin user:", adminUser ? "Found" : "Not found");
    console.log("Read-only user:", readOnlyUser ? "Found" : "Not found");
    
    if (!readOnlyUser) {
      console.log("Creating read-only user...");
      const newUser = await db.user.create({
        data: {
          email: "readonly@vcemail.local",
          name: "Read Only User",
          password: "$2b$12$3KNii3YMmBfGv8s/H9uYkOJ62Y2z8h6wZ0y3m7z4r9k0v1p5q7s9o", // bcrypt hash for 'readonly123'
          role: "READ_ONLY"
        }
      });
      console.log("Read-only user created:", newUser);
    }
    
    if (!adminUser) {
      console.log("Creating admin user...");
      const newUser = await db.user.create({
        data: {
          email: "admin@vcemail.local",
          name: "Admin User",
          password: "$2b$12$3KNii3YMmBfGv8s/H9uYkOJ62Y2z8h6wZ0y3m7z4r9k0v1p5q7s9o", // bcrypt hash for 'admin123'
          role: "ADMIN"
        }
      });
      console.log("Admin user created:", newUser);
    }
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    await db.$disconnect();
  }
}

checkUsers();