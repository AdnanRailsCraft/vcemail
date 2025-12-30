import { NextRequest } from "next/server";
import { seedEmails, seedGuestEmails } from "@/scripts/seedEmails";

export async function GET(req: NextRequest) {
  try {
    await seedEmails();
    await seedGuestEmails();
    return Response.json({ success: true, message: "Sample emails added successfully" });
  } catch (error) {
    console.error("Error seeding emails:", error);
    return Response.json({ success: false, error: "Failed to seed emails" }, { status: 500 });
  }
}