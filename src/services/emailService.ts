import { db } from "@/lib/db";
import { Email } from "@prisma/client";
import { createTransport, Transporter } from "nodemailer";

interface SendEmailParams {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
}

export class EmailService {
  private transporter: Transporter;

  constructor() {
    // Initialize the transporter with email server configuration
    if (process.env.EMAIL_SERVER_HOST) {
      this.transporter = createTransport({
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      });
    } else {
      console.warn("No email server configuration found. Using JSON transport (logging emails to console).");
      this.transporter = createTransport({
        jsonTransport: true,
      });
    }
  }

  async sendEmail(params: SendEmailParams, userId: string): Promise<Email> {
    try {
      let info: any = { messageId: `mock-${Date.now()}` };

      try {
        // Send the email
        info = await this.transporter.sendMail({
          from: params.from,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          subject: params.subject,
          text: params.text,
          html: params.html,
        });
      } catch (sendError: any) {
        console.warn("Failed to send email via transport (falling back to DB save only):", sendError.message);
        // Continue to save to DB despite transport failure
      }

      // Save the email to the database
      const email = await db.email.create({
        data: {
          messageId: info.messageId || `mock-${Date.now()}`,
          from: params.from,
          to: params.to,
          cc: params.cc,
          bcc: params.bcc,
          subject: params.subject,
          bodyText: params.text,
          bodyHtml: params.html,
          sentAt: new Date(),
          receivedAt: new Date(),
          size: params.text ? params.text.length : (params.html ? params.html.length : 0),
          senderId: userId,
        },
      });

      return email;
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  // This method would be used by a background service to fetch emails from IMAP
  async fetchEmailsFromIMAP(): Promise<void> {
    // Implementation would connect to IMAP server and fetch emails
    // For now, this is a placeholder
    console.log("Fetching emails from IMAP server...");
  }

  // Get emails for a specific user
  async getUserEmails(userId: string, userEmail?: string | null) {
    const ownershipClause = userEmail
      ? { OR: [{ senderId: userId }, { to: userEmail }] }
      : { senderId: userId };

    return await db.email.findMany({
      where: ownershipClause,
      orderBy: {
        receivedAt: "desc",
      },
      take: 50, // Limit to last 50 emails
    });
  }

  async getGuestEmails() {
    return await db.email.findMany({
      where: {
        to: "readonly@vcemail.local",
      },
      orderBy: {
        receivedAt: "desc",
      },
      take: 50,
    });
  }

  // Get a specific email
  async getEmailById(emailId: string, userId: string, userEmail?: string | null) {
    const ownershipClause = userEmail
      ? { OR: [{ senderId: userId }, { to: userEmail }] }
      : { senderId: userId };

    return await db.email.findFirst({
      where: {
        id: emailId,
        ...ownershipClause,
      },
    });
  }
}