import { db } from "@/lib/db";
import { Email } from "@prisma/client";
import bcrypt from "bcrypt";

// Sample emails data
const sampleEmails: Omit<Email, "id" | "receivedAt" | "createdAt" | "updatedAt">[] = [
  {
    messageId: "msg001",
    from: "volunteer@org1.com",
    to: "admin@vcemail.local",
    cc: "manager@org1.com",
    bcc: "",
    subject: "Weekly Volunteer Update",
    bodyText: "Hello,\n\nHere's the weekly update on volunteer activities. We had 15 volunteers this week, and they completed 3 major projects in the community garden. Next week we're focusing on the food drive for the holiday season.\n\nBest regards,\nVolunteer Coordinator",
    bodyHtml: "<p>Hello,</p><p>Here's the weekly update on volunteer activities. We had 15 volunteers this week, and they completed 3 major projects in the community garden. Next week we're focusing on the food drive for the holiday season.</p><p>Best regards,<br>Volunteer Coordinator</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    size: 342,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: false,
    isStarred: false,
    labels: JSON.stringify(["inbox"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg002",
    from: "events@community.org",
    to: "admin@vcemail.local",
    cc: "",
    bcc: "",
    subject: "Upcoming Community Event - Dec 28",
    bodyText: "Dear Volunteer Coordinator,\n\nWe're excited to invite you to our annual community cleanup event on December 28th. We'll be meeting at 9 AM at Central Park. Please bring volunteers!\n\nLooking forward to seeing you there.\n\nCommunity Events Team",
    bodyHtml: "<p>Dear Volunteer Coordinator,</p><p>We're excited to invite you to our annual community cleanup event on December 28th. We'll be meeting at 9 AM at Central Park. Please bring volunteers!</p><p>Looking forward to seeing you there.</p><p>Community Events Team</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    size: 298,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: true,
    isStarred: true,
    labels: JSON.stringify(["inbox", "important"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg003",
    from: "support@volunteers.net",
    to: "admin@vcemail.local",
    cc: "info@volunteers.net",
    bcc: "",
    subject: "New Volunteer Registration",
    bodyText: "Hi there,\n\nA new volunteer has registered through our system:\n- Name: John Smith\n- Email: john@example.com\n- Interests: Environmental cleanup, elderly care\n\nPlease reach out to welcome them to our community.\n\nBest,\nVolunteer Support",
    bodyHtml: "<p>Hi there,</p><p>A new volunteer has registered through our system:</p><ul><li>Name: John Smith</li><li>Email: john@example.com</li><li>Interests: Environmental cleanup, elderly care</li></ul><p>Please reach out to welcome them to our community.</p><p>Best,<br>Volunteer Support</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    size: 421,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: true,
    isStarred: false,
    labels: JSON.stringify(["inbox"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg004",
    from: "newsletter@volunteerhq.com",
    to: "admin@vcemail.local",
    cc: "",
    bcc: "",
    subject: "Monthly Volunteer Newsletter",
    bodyText: "Hello,\n\nCheck out our latest newsletter with updates on volunteer opportunities, success stories, and upcoming events. This month we're featuring the story of Maria, who has volunteered over 200 hours this year!\n\nRead the full newsletter here: https://volunteerhq.com/newsletter\n\nBest,\nThe VolunteerHQ Team",
    bodyHtml: "<p>Hello,</p><p>Check out our latest newsletter with updates on volunteer opportunities, success stories, and upcoming events. This month we're featuring the story of Maria, who has volunteered over 200 hours this year!</p><p><a href='https://volunteerhq.com/newsletter'>Read the full newsletter here</a></p><p>Best,<br>The VolunteerHQ Team</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    size: 512,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: false,
    isStarred: false,
    labels: JSON.stringify(["inbox", "newsletter"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg005",
    from: "feedback@cityservices.gov",
    to: "admin@vcemail.local",
    cc: "info@cityservices.gov",
    bcc: "",
    subject: "Volunteer Program Feedback",
    bodyText: "Dear Volunteer Coordinator,\n\nWe wanted to reach out to thank you and your team for the excellent work done at the Riverside Community Center last month. The volunteers were punctual, professional, and made a real difference in our community.\n\nWe look forward to working with you again soon.\n\nSincerely,\nCity Services Department",
    bodyHtml: "<p>Dear Volunteer Coordinator,</p><p>We wanted to reach out to thank you and your team for the excellent work done at the Riverside Community Center last month. The volunteers were punctual, professional, and made a real difference in our community.</p><p>We look forward to working with you again soon.</p><p>Sincerely,<br>City Services Department</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
    size: 387,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: true,
    isStarred: false,
    labels: JSON.stringify(["inbox", "feedback"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg006",
    from: "training@volunteernow.org",
    to: "admin@vcemail.local",
    cc: "",
    bcc: "",
    subject: "New Training Sessions Available",
    bodyText: "Hi,\n\nWe're pleased to announce new training sessions for volunteer coordinators:\n\n- Advanced Volunteer Management: Dec 15, 10 AM\n- Crisis Response Training: Dec 20, 2 PM\n- Youth Volunteer Engagement: Dec 22, 11 AM\n\nRegister at: https://volunteernow.org/training\n\nBest regards,\nTraining Team",
    bodyHtml: "<p>Hi,</p><p>We're pleased to announce new training sessions for volunteer coordinators:</p><ul><li>Advanced Volunteer Management: Dec 15, 10 AM</li><li>Crisis Response Training: Dec 20, 2 PM</li><li>Youth Volunteer Engagement: Dec 22, 11 AM</li></ul><p><a href='https://volunteernow.org/training'>Register here</a></p><p>Best regards,<br>Training Team</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 144), // 6 days ago
    size: 445,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: false,
    isStarred: false,
    labels: JSON.stringify(["inbox"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg007",
    from: "emergency@redcross.org",
    to: "admin@vcemail.local",
    cc: "dispatch@redcross.org",
    bcc: "",
    subject: "URGENT: Disaster Relief Volunteers Needed",
    bodyText: "URGENT REQUEST\n\nDue to recent flooding in the eastern districts, we urgently need volunteers for disaster relief efforts. We need volunteers for:\n- Distribution of supplies\n- Temporary shelter setup\n- Emotional support services\n\nPlease respond immediately if you can mobilize volunteers.\n\nRed Cross Emergency Team",
    bodyHtml: "<p><strong>URGENT REQUEST</strong></p><p>Due to recent flooding in the eastern districts, we urgently need volunteers for disaster relief efforts. We need volunteers for:</p><ul><li>Distribution of supplies</li><li>Temporary shelter setup</li><li>Emotional support services</li></ul><p>Please respond immediately if you can mobilize volunteers.</p><p>Red Cross Emergency Team</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 168), // 7 days ago
    size: 376,
    headers: JSON.stringify({ "content-type": "text/html", "priority": "high" }),
    isRead: true,
    isStarred: true,
    labels: JSON.stringify(["inbox", "urgent"]),
    senderId: null,
    attachments: null,
  },
  {
    messageId: "msg008",
    from: "partnership@nonprofitalliance.org",
    to: "admin@vcemail.local",
    cc: "",
    bcc: "",
    subject: "Partnership Opportunity",
    bodyText: "Hello,\n\nWe're reaching out to explore a potential partnership between our organizations. We believe our missions align well, and there could be opportunities for collaborative volunteer programs.\n\nWould you be available for a brief call next week?\n\nBest,\nPartnership Team",
    bodyHtml: "<p>Hello,</p><p>We're reaching out to explore a potential partnership between our organizations. We believe our missions align well, and there could be opportunities for collaborative volunteer programs.</p><p>Would you be available for a brief call next week?</p><p>Best,<br>Partnership Team</p>",
    sentAt: new Date(Date.now() - 1000 * 60 * 60 * 192), // 8 days ago
    size: 256,
    headers: JSON.stringify({ "content-type": "text/html" }),
    isRead: true,
    isStarred: false,
    labels: JSON.stringify(["inbox"]),
    senderId: null,
    attachments: null,
  }
];

function buildGuestEmails(
  guestUserId: string,
  guestEmail: string,
  count: number = 30
): Omit<Email, "id" | "receivedAt" | "createdAt" | "updatedAt">[] {
  const now = Date.now();

  return Array.from({ length: count }, (_, idx) => {
    const sentOffsetHours = idx * 6; // stagger by 6 hours
    const sentAt = new Date(now - sentOffsetHours * 60 * 60 * 1000);

    return {
      messageId: `guest-${idx + 1}-${now}`,
      from: `community${idx + 1}@mail.demo`,
      to: guestEmail,
      cc: idx % 5 === 0 ? "team@vcemail.local" : "",
      bcc: "",
      subject: `Welcome to VC Email - Sample ${idx + 1}`,
      bodyText: `Hi there,\n\nThis is sample message #${idx + 1} for the guest inbox so you can see how conversations appear. Feel free to open, star, or search these messages.\n\nThanks!\nVC Email Demo`,
      bodyHtml: `<p>Hi there,</p><p>This is <strong>sample message #${idx + 1}</strong> for the guest inbox so you can see how conversations appear. Feel free to open, star, or search these messages.</p><p>Thanks!<br/>VC Email Demo</p>`,
      sentAt,
      size: 320 + idx,
      headers: JSON.stringify({ "content-type": "text/html" }),
      isRead: idx % 3 === 0,
      isStarred: idx % 7 === 0,
      labels: JSON.stringify(["inbox"]),
      senderId: guestUserId,
      attachments: null,
    };
  });
}

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

    // Add each sample email to the database
    for (const emailData of sampleEmails) {
      await db.email.create({
        data: {
          ...emailData,
          senderId: adminUser.id, // Associate with admin user
        }
      });
    }

    console.log(`Successfully added ${sampleEmails.length} sample emails to the database.`);
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

    const guestEmails = buildGuestEmails(guestUser.id, guestUser.email, 30);

    for (const emailData of guestEmails) {
      await db.email.create({ data: emailData });
    }

    console.log(`Successfully added ${guestEmails.length} guest emails to the database.`);
  } catch (error) {
    console.error("Error seeding guest emails:", error);
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedEmails().then(() => seedGuestEmails());
}