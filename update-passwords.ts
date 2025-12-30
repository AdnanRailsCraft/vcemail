import { db } from "@/lib/db";
import bcrypt from "bcrypt";

async function updateUserPassword() {
  try {
    console.log("Updating read-only user password...");

    // Hash the guest password from environment or default
    const guestPassword = process.env.GUEST_PASSWORD || "guest123";
    const hashedPassword = await bcrypt.hash(guestPassword, 12);

    // Update the read-only user with the correct password
    const updatedUser = await db.user.update({
      where: { email: "readonly@vcemail.local" },
      data: { password: hashedPassword }
    });

    console.log("Read-only user password updated:", updatedUser);

    // Also make sure the admin user has the correct password
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminHashedPassword = await bcrypt.hash(adminPassword, 12);
    const updatedAdmin = await db.user.update({
      where: { email: "admin@vcemail.local" },
      data: { password: adminHashedPassword }
    });

    console.log("Admin user password updated:", updatedAdmin);
  } catch (error) {
    console.error("Error updating user passwords:", error);
  } finally {
    await db.$disconnect();
  }
}

updateUserPassword();