import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { EmailService } from "@/services/emailService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const emailService = new EmailService();

    // For guests (no session), show latest announcements
    if (!session) {
      const guestEmails = await emailService.getGuestEmails();
      return Response.json({ emails: guestEmails });
    }

    const emails = await emailService.getUserEmails(session.user.id, session.user.email);

    return Response.json({ emails });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return Response.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}