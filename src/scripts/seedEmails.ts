import { db } from "@/lib/db";
import { Email } from "@prisma/client";
import bcrypt from "bcrypt";



// Function to seed the database with sample emails
export async function seedEmails() {
  try {
    console.log("Seeding emails...");

    // First, let's get the admin user ID to associate with these emails
    const adminUser = await db.user.findFirst({
      where: { email: "admin@vcemail.local" }
    });

    if (!adminUser) {
      console.error("Admin user not found. Please create an admin user first.");
      return;
    }

    console.log("Admin seeding logic complete.");
  } catch (error) {
    console.error("Error seeding emails:", error);
  }
}

export async function seedGuestEmails() {
  try {
    console.log("Seeding guest (read-only) emails...");

    let guestUser = await db.user.findFirst({
      where: { email: "readonly@vcemail.local" }
    });

    if (!guestUser) {
      const guestPassword = process.env.GUEST_PASSWORD || "guest123";
      const hashedGuestPassword = await bcrypt.hash(guestPassword, 12);
      guestUser = await db.user.create({
        data: {
          email: "readonly@vcemail.local",
          name: "Guest User",
          password: hashedGuestPassword,
          role: "READ_ONLY"
        }
      });
    }

    console.log("Guest seeding logic complete.");
  } catch (error) {
    console.error("Error seeding guest emails:", error);
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedEmails().then(() => seedGuestEmails());
}