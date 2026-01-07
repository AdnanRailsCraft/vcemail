import { EmailService } from "@/services/emailService";

/**
 * Simple polling loop to automatically fetch emails from IMAP.
 *
 * This script is meant to be run as a long‑lived Node process, e.g.:
 *   npx tsx src/scripts/autoFetchEmails.ts
 *
 * It will:
 * - Use IMAP configuration from environment variables
 * - Poll the mailbox at a fixed interval
 * - Log successes and errors to stdout
 */
async function runOnce() {
  const emailService = new EmailService();

  console.log("--------------------------------------------------");
  console.log(`[${new Date().toISOString()}] Starting IMAP fetch cycle...`);
  console.log(`IMAP_HOST=${process.env.IMAP_HOST}`);
  console.log(`IMAP_USER=${process.env.IMAP_USER}`);
  console.log(`IMAP_PORT=${process.env.IMAP_PORT || "993"}`);
  console.log(`IMAP_MAILBOX=${process.env.IMAP_MAILBOX || "INBOX"}`);

  try {
    const result = await emailService.fetchEmailsFromIMAP();

    console.log(`[${new Date().toISOString()}] Fetch complete.`);
    console.log(`Fetched: ${result.fetched} new email(s).`);

    if (result.errors.length > 0) {
      console.log(`Encountered ${result.errors.length} error(s):`);
      result.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err}`);
      });
    } else {
      console.log("No errors this cycle.");
    }
  } catch (err: any) {
    console.error(
      `[${new Date().toISOString()}] Fatal error during fetch cycle:`,
      err?.message || err
    );
  }
}

async function main() {
  // Default: 5 minutes between polls
  const defaultIntervalMs = 5 * 60 * 1000;
  const intervalMs = Number(process.env.IMAP_FETCH_INTERVAL_MS || defaultIntervalMs);

  if (Number.isNaN(intervalMs) || intervalMs <= 0) {
    console.error(
      "Invalid IMAP_FETCH_INTERVAL_MS value. It must be a positive number (milliseconds)."
    );
    process.exit(1);
  }

  console.log("==================================================");
  console.log(" IMAP Auto‑Fetch Service");
  console.log("==================================================");
  console.log(`Interval: ${intervalMs} ms (${(intervalMs / 60000).toFixed(2)} minutes)`);
  console.log("Press Ctrl+C to stop.");
  console.log("==================================================");

  // Run immediately once at startup
  await runOnce();

  // Then schedule subsequent runs
  setInterval(runOnce, intervalMs);
}

if (require.main === module) {
  main().catch((err) => {
    console.error("Unexpected error in auto‑fetch main():", err);
    process.exit(1);
  });
}


