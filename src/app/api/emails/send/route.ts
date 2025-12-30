import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { EmailService } from "@/services/emailService";
import { NextRequest } from "next/server";
import { canPerformAction } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !canPerformAction(session.user, "send_email")) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailService = new EmailService();
    const body = await req.json();

    const { to, cc, bcc, subject, text, html } = body;

    if (!to || !subject) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Use the authenticated user's email as the sender
    const result = await emailService.sendEmail(
      {
        from: session.user.email || "",
        to,
        cc,
        bcc,
        subject,
        text,
        html,
      },
      session.user.id
    );

    return Response.json({ success: true, emailId: result.id });
  } catch (error) {
    console.error("Error sending email:", error);
    return Response.json({ error: "Failed to send email" }, { status: 500 });
  }
}