import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { EmailService } from "@/services/emailService";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const emailService = new EmailService();
    const email = await emailService.getEmailById(id, session.user.id, session.user.email);

    if (!email) {
      return Response.json({ error: "Email not found" }, { status: 404 });
    }

    return Response.json({ email });
  } catch (error) {
    console.error("Error fetching email:", error);
    return Response.json({ error: "Failed to fetch email" }, { status: 500 });
  }
}