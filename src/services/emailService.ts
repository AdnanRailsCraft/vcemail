import { createTransport, Transporter } from "nodemailer";
import imaps from "imap-simple";
import { simpleParser, ParsedMail } from "mailparser";
import { Email } from "@/types/email";

interface SendEmailParams {
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  text?: string;
  html?: string;
}

interface EmailCache {
  emails: Email[];
  timestamp: number;
}

// Shared cache across all instances
let globalEmailCache: EmailCache | null = null;
const CACHE_TTL = 60000; // 60 seconds

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

  private async getImapConnection() {
    const config = {
      imap: {
        user: process.env.IMAP_USER || "",
        password: process.env.IMAP_PASSWORD || "",
        host: process.env.IMAP_HOST || "",
        port: parseInt(process.env.IMAP_PORT || "993"),
        tls: process.env.IMAP_PORT === "993" || !process.env.IMAP_PORT,
        tlsOptions: { rejectUnauthorized: false },
        authTimeout: 10000,
      },
    };

    if (!config.imap.user || !config.imap.password || !config.imap.host) {
      throw new Error("IMAP configuration missing");
    }

    return await imaps.connect(config);
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
        console.warn("Failed to send email via transport:", sendError.message);
      }

      // Return a mock email object since we're not saving to DB
      return {
        id: `sent-${Date.now()}`,
        messageId: info.messageId || `mock-${Date.now()}`,
        from: params.from,
        to: params.to,
        cc: params.cc || null,
        bcc: params.bcc || null,
        subject: params.subject,
        bodyText: params.text || null,
        bodyHtml: params.html || null,
        attachments: null,
        sentAt: new Date(),
        receivedAt: new Date(),
        size: params.text ? params.text.length : (params.html ? params.html.length : 0),
        headers: null,
        isRead: true,
        isStarred: false,
        labels: null,
        senderId: userId,
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }
  }

  private isCacheValid(): boolean {
    if (!globalEmailCache) return false;
    const now = Date.now();
    return (now - globalEmailCache.timestamp) < CACHE_TTL;
  }

  private invalidateCache(): void {
    globalEmailCache = null;
  }

  async fetchEmailsFromIMAP(options?: {
    mailbox?: string;
    limit?: number;
  }): Promise<Email[]> {
    // Check cache first
    if (this.isCacheValid()) {
      console.log('Returning cached emails');
      return globalEmailCache!.emails;
    }

    console.log('Fetching fresh emails from IMAP...');
    const mailbox = options?.mailbox || process.env.IMAP_MAILBOX || "INBOX";
    const limit = options?.limit || parseInt(process.env.IMAP_FETCH_LIMIT || "50");

    let connection: any;
    try {
      connection = await this.getImapConnection();
      await connection.openBox(mailbox);

      const since = new Date();
      since.setDate(since.getDate() - 30);

      const searchCriteria = [["SINCE", since]];
      const fetchOptions = {
        bodies: "",
        struct: true,
        markSeen: false,
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      // Get latest emails first
      const sortedMessages = messages.sort((a: any, b: any) => b.attributes.uid - a.attributes.uid);
      const emailsToProcess = sortedMessages.slice(0, limit);

      // Process emails in parallel for better performance
      const emailPromises = emailsToProcess.map(async (message: any) => {
        try {
          let emailBody: string | Buffer | undefined;
          if (message.parts && message.parts.length > 0) {
            emailBody = message.parts[0].body;
          } else {
            emailBody = (message as any).body;
          }

          if (!emailBody) {
            const allParts = imaps.getParts(message.attributes.struct);
            const part = allParts.find((part: any) => part.which === "TEXT") || allParts[0];
            if (part) {
              emailBody = await connection.getPartData(message, part);
            }
          }

          if (!emailBody) return null;

          const parsedEmail: ParsedMail = await simpleParser(emailBody);
          const flags = message.attributes.flags || [];

          return {
            id: message.attributes.uid.toString(),
            messageId: parsedEmail.messageId || `imap-${message.attributes.uid}`,
            from: parsedEmail.from?.value?.[0]?.address || parsedEmail.from?.text || "unknown@unknown.com",
            to: (parsedEmail.to as any)?.value?.map((addr: any) => addr.address).join(", ") || (parsedEmail.to as any)?.text || "",
            cc: (parsedEmail.cc as any)?.value?.map((addr: any) => addr.address).join(", ") || (parsedEmail.cc as any)?.text || null,
            bcc: (parsedEmail.bcc as any)?.value?.map((addr: any) => addr.address).join(", ") || (parsedEmail.bcc as any)?.text || null,
            subject: parsedEmail.subject || "(No Subject)",
            bodyText: parsedEmail.text || null,
            bodyHtml: parsedEmail.html || null,
            attachments: parsedEmail.attachments?.map((att: any) => `${att.filename || "unnamed"}:${att.size || 0}`).join(",") || null,
            sentAt: parsedEmail.date || new Date(),
            receivedAt: message.attributes.date || new Date(),
            size: (typeof parsedEmail.text === 'string' ? parsedEmail.text.length : 0) + (typeof parsedEmail.html === 'string' ? parsedEmail.html.length : 0),
            headers: JSON.stringify(parsedEmail.headers),
            isRead: flags.includes("\\Seen"),
            isStarred: flags.includes("\\Flagged"),
            labels: null,
            senderId: null,
          } as Email;
        } catch (err) {
          console.error(`Error parsing email ${message.attributes.uid}:`, err);
          return null;
        }
      });

      const emailResults = await Promise.all(emailPromises);
      const emails = emailResults.filter((email): email is Email => email !== null);

      // Cache the fetched emails
      globalEmailCache = {
        emails,
        timestamp: Date.now()
      };

      return emails;
    } catch (error) {
      console.error("IMAP error:", error);
      return [];
    } finally {
      if (connection) connection.end();
    }
  }

  async getUserEmails(userId: string, userEmail?: string | null) {
    return this.fetchEmailsFromIMAP();
  }

  async getGuestEmails() {
    return this.fetchEmailsFromIMAP();
  }

  async getEmailById(emailId: string) {
    // Try to get from cache first (instant)
    if (this.isCacheValid()) {
      const cachedEmail = globalEmailCache!.emails.find(e => e.id === emailId);
      if (cachedEmail) {
        console.log('Returning email from cache');
        return cachedEmail;
      }
    }

    // If not in cache, fetch all emails (this will also populate cache)
    console.log('Email not in cache, fetching from IMAP...');
    const emails = await this.fetchEmailsFromIMAP({ limit: 100 });
    return emails.find(e => e.id === emailId) || null;
  }

  async toggleStar(emailId: string, isStarred: boolean) {
    let connection;
    try {
      connection = await this.getImapConnection();
      await connection.openBox("INBOX");
      const uid = parseInt(emailId);
      if (isStarred) {
        await connection.addFlags(uid, "\\Flagged");
      } else {
        await connection.removeFlags(uid, "\\Flagged");
      }
      this.invalidateCache(); // Invalidate cache after operation
      return { success: true };
    } catch (error) {
      console.error("Error toggling star in IMAP:", error);
      return { success: false, error: "Failed to update star in IMAP" };
    } finally {
      if (connection) connection.end();
    }
  }

  async toggleReadStatus(emailId: string, isRead: boolean) {
    let connection;
    try {
      connection = await this.getImapConnection();
      await connection.openBox("INBOX");
      const uid = parseInt(emailId);
      if (isRead) {
        await connection.addFlags(uid, "\\Seen");
      } else {
        await connection.removeFlags(uid, "\\Seen");
      }
      this.invalidateCache(); // Invalidate cache after operation
      return { success: true };
    } catch (error) {
      console.error("Error toggling read status in IMAP:", error);
      return { success: false, error: "Failed to update read status in IMAP" };
    } finally {
      if (connection) connection.end();
    }
  }

  async deleteEmail(emailId: string): Promise<{ success: boolean; error?: string }> {
    let connection;
    try {
      connection = await this.getImapConnection();
      await connection.openBox("INBOX");
      const uid = parseInt(emailId);
      await connection.addFlags(uid, "\\Deleted");
      await (connection as any).imap.expunge((err: any) => {
        if (err) console.error("Expunge error:", err);
      });
      this.invalidateCache(); // Invalidate cache after operation
      return { success: true };
    } catch (error) {
      console.error("Error deleting email in IMAP:", error);
      return { success: false, error: "Failed to delete email in IMAP" };
    } finally {
      if (connection) connection.end();
    }
  }

  async deleteEmails(emailIds: string[]): Promise<{ success: number; failed: number; errors: string[] }> {
    // Process deletions in parallel for better performance
    const deletePromises = emailIds.map(async (emailId) => {
      const result = await this.deleteEmail(emailId);
      return { emailId, result };
    });

    const results = await Promise.all(deletePromises);

    const errors: string[] = [];
    let success = 0;
    let failed = 0;

    for (const { emailId, result } of results) {
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