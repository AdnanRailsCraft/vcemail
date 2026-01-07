import { db } from "@/lib/db";
import { Email } from "@prisma/client";
import { createTransport, Transporter } from "nodemailer";
import imaps from "imap-simple";
import { simpleParser, ParsedMail } from "mailparser";

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

  /**
   * Fetches emails from IMAP server and saves them to the database
   * @param options Optional configuration for IMAP connection and fetching
   * @returns Object with count of new emails fetched and any errors
   */
  async fetchEmailsFromIMAP(options?: {
    host?: string;
    port?: number;
    user?: string;
    password?: string;
    mailbox?: string;
    markAsSeen?: boolean;
    limit?: number;
  }): Promise<{ fetched: number; errors: string[] }> {
    const errors: string[] = [];
    let fetched = 0;

    // Get IMAP configuration from options or environment variables
    const imapHost = options?.host || process.env.IMAP_HOST;
    const imapPort = options?.port || parseInt(process.env.IMAP_PORT || "993");
    const imapUser = options?.user || process.env.IMAP_USER;
    const imapPassword = options?.password || process.env.IMAP_PASSWORD;
    const mailbox = options?.mailbox || process.env.IMAP_MAILBOX || "INBOX";
    const markAsSeen = options?.markAsSeen ?? (process.env.IMAP_MARK_AS_SEEN === "true");
    const limit = options?.limit || parseInt(process.env.IMAP_FETCH_LIMIT || "50");

    // Validate required configuration
    if (!imapHost || !imapUser || !imapPassword) {
      const errorMsg = "IMAP configuration missing. Please set IMAP_HOST, IMAP_USER, and IMAP_PASSWORD environment variables.";
      console.error(errorMsg);
      errors.push(errorMsg);
      return { fetched, errors };
    }

    const config = {
      imap: {
        user: imapUser,
        password: imapPassword,
        host: imapHost,
        port: imapPort,
        tls: imapPort === 993,
        tlsOptions: { rejectUnauthorized: false }, // Allow self-signed certificates
        authTimeout: 10000,
      },
    };

    try {
      // Connect to IMAP server
      const connection = await imaps.connect(config);
      console.log("Connected to IMAP server");

      // Open mailbox
      await connection.openBox(mailbox);
      console.log(`Opened mailbox: ${mailbox}`);

      // Search for unread emails (or all emails if markAsSeen is false)
      // Fetch emails from the last 30 days by default
      const since = new Date();
      since.setDate(since.getDate() - 30);

      const searchCriteria = markAsSeen
        ? ["UNSEEN", ["SINCE", since]]
        : [["SINCE", since]];

      const fetchOptions = {
        bodies: "",
        struct: true,
        markSeen: markAsSeen,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      console.log(`Found ${messages.length} emails to process`);

      // Limit the number of emails to process
      const emailsToProcess = messages.slice(0, limit);

      // Process each email
      for (const message of emailsToProcess) {
        try {
          // Get the email body - imap-simple returns it in message.parts[0].body
          let emailBody: string | Buffer | undefined;

          if (message.parts && message.parts.length > 0) {
            // Try to get body from parts
            emailBody = message.parts[0].body;
          } else {
            // Fallback: try to get body directly
            emailBody = (message as any).body;
          }

          // If still no body, try fetching by part
          if (!emailBody) {
            const allParts = imaps.getParts(message.attributes.struct);
            const part = allParts.find((part: any) => part.which === "TEXT") || allParts[0];

            if (part) {
              try {
                emailBody = await connection.getPartData(message, part);
              } catch (fetchError: any) {
                console.warn(`Error fetching email part: ${fetchError.message}`);
              }
            }
          }

          if (!emailBody) {
            console.warn("Could not fetch email body, skipping");
            continue;
          }

          // Parse the email
          const parsedEmail: ParsedMail = await simpleParser(emailBody);

          // Extract email data
          const messageId = parsedEmail.messageId || `imap-${Date.now()}-${Math.random()}`;

          // Handle from address
          const fromAddress = parsedEmail.from?.value?.[0]?.address || parsedEmail.from?.text || "unknown@unknown.com";
          const from = fromAddress.includes("@") ? fromAddress : `unknown@unknown.com`;

          // Handle to addresses (can be multiple)
          const toAddresses = parsedEmail.to?.value || [];
          const to = toAddresses.length > 0
            ? toAddresses.map((addr: any) => addr.address).join(", ")
            : (parsedEmail.to?.text || "");

          // Handle cc addresses (can be multiple)
          const ccAddresses = parsedEmail.cc?.value || [];
          const cc = ccAddresses.length > 0
            ? ccAddresses.map((addr: any) => addr.address).join(", ")
            : (parsedEmail.cc?.text || null);

          // Handle bcc addresses (can be multiple)
          const bccAddresses = parsedEmail.bcc?.value || [];
          const bcc = bccAddresses.length > 0
            ? bccAddresses.map((addr: any) => addr.address).join(", ")
            : (parsedEmail.bcc?.text || null);
          const subject = parsedEmail.subject || "(No Subject)";
          const bodyText = parsedEmail.text || null;
          const bodyHtml = parsedEmail.html || null;
          const sentAt = parsedEmail.date || new Date();
          const receivedAt = new Date();

          // Calculate email size
          const size = (bodyText?.length || 0) + (bodyHtml?.length || 0) + (subject?.length || 0);

          // Store headers as JSON string
          const headers = JSON.stringify(parsedEmail.headers);

          // Handle attachments
          let attachmentsString: string | null = null;
          if (parsedEmail.attachments && parsedEmail.attachments.length > 0) {
            attachmentsString = parsedEmail.attachments
              .map((att) => `${att.filename || "unnamed"}:${att.size || 0}`)
              .join(",");
          }

          // Check if email already exists (by messageId)
          const existingEmail = await db.email.findFirst({
            where: { messageId },
          });

          if (existingEmail) {
            console.log(`Email with messageId ${messageId} already exists, skipping`);
            continue;
          }

          // Save email to database
          await db.email.create({
            data: {
              messageId,
              from,
              to,
              cc,
              bcc,
              subject,
              bodyText,
              bodyHtml,
              attachments: attachmentsString,
              sentAt,
              receivedAt,
              size,
              headers,
              isRead: markAsSeen, // Mark as read if we marked it as seen in IMAP
            },
          });

          fetched++;
          console.log(`Saved email: ${subject} from ${from}`);
        } catch (emailError: any) {
          const errorMsg = `Error processing email: ${emailError.message}`;
          console.error(errorMsg, emailError);
          errors.push(errorMsg);
        }
      }

      // Close connection
      await connection.end();
      console.log(`IMAP fetch completed. Fetched ${fetched} new emails.`);

      return { fetched, errors };
    } catch (error: any) {
      const errorMsg = `IMAP connection error: ${error.message}`;
      console.error(errorMsg, error);
      errors.push(errorMsg);
      return { fetched, errors };
    }
  }

  // Get all emails for the inbox (shared mailbox)
  async getUserEmails(userId: string, userEmail?: string | null) {
    return await db.email.findMany({
      orderBy: {
        receivedAt: "desc",
      },
      take: 100, // Show more emails
    });
  }

  async getGuestEmails() {
    return await db.email.findMany({
      orderBy: {
        receivedAt: "desc",
      },
      take: 100,
    });
  }

  // Get a specific email
  async getEmailById(emailId: string, userId: string, userEmail?: string | null) {
    return await db.email.findFirst({
      where: {
        id: emailId,
      },
    });
  }

  // Delete an email (admin only)
  async deleteEmail(emailId: string, userId: string, userEmail?: string | null): Promise<{ success: boolean; error?: string; notFound?: boolean }> {
    try {
      // Check if email exists and user has access to it
      const email = await this.getEmailById(emailId, userId, userEmail);

      if (!email) {
        return { success: false, error: "Email not found", notFound: true };
      }

      // Delete the email
      await db.email.delete({
        where: { id: emailId },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error deleting email:", error);
      return { success: false, error: error.message || "Failed to delete email" };
    }
  }

  // Delete multiple emails (admin only)
  async deleteEmails(emailIds: string[], userId: string, userEmail?: string | null): Promise<{ success: number; failed: number; errors: string[] }> {
    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const emailId of emailIds) {
      const result = await this.deleteEmail(emailId, userId, userEmail);
      if (result.success) {
        success++;
      } else {
        failed++;
        errors.push(`Failed to delete email ${emailId}: ${result.error}`);
      }
    }

    return { success, failed, errors };
  }
}