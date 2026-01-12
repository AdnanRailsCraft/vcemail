# VC Email System

A modern, IMAP-backed inbox built with Next.js 16 (App Router) and React 19. It fetches mail directly from your IMAP server, caches results for quick reloads, and lets admins send and delete mail while guests browse read-only.

## 🚀 Features

- **IMAP Inbox**: Fetches and parses recent mail; 60s shared cache to avoid repeat IMAP hits.
- **Fast Fetching**: Parallel message parsing and parallel bulk deletes for snappier operations.
- **Role-Based Access**: `ADMIN` can fetch, send, star, mark read/unread, and delete; `READ_ONLY` can browse and star/read.
- **Optimistic UI**: Inbox updates instantly for deletes and starring; auto-refresh on mount.
- **Compose (Admin)**: Sends via SMTP with Nodemailer; falls back to JSON transport when SMTP is absent.
- **NextAuth Credentials**: Environment-driven admin/guest accounts; JWT sessions.
- **Responsive UI**: Tailwind CSS 4 styling; works great on mobile and desktop.

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Auth**: NextAuth.js (credentials/JWT)
- **Mail**: imap-simple + mailparser (IMAP), Nodemailer (SMTP)
- **State & Perf**: React server actions, shared in-memory IMAP cache (60s), memoized list items
- **Testing**: Vitest, Playwright

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1) **Clone & install**
```bash
git clone https://github.com/AdnanRailsCraft/vcemail.git
cd vcemail
npm install
```

2) **Environment variables** — create `.env` in the repo root:
```env
NEXTAUTH_SECRET="change-me"
NEXTAUTH_URL="http://localhost:3000"

# Admin account (defaults admin email to IMAP_USER if not set)
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-admin-password"

# Guest account (read-only)
NEXT_PUBLIC_GUEST_EMAIL="guest@example.com"
GUEST_PASSWORD="your-guest-password"
NEXT_PUBLIC_GUEST_PASSWORD="your-guest-password"

# IMAP (required for inbox)
IMAP_HOST="imap.example.com"
IMAP_USER="your-imap-user@example.com"
IMAP_PASSWORD="your-imap-password"
# Optional IMAP tuning
IMAP_PORT="993"
IMAP_MAILBOX="INBOX"
IMAP_MARK_AS_SEEN="false"
IMAP_FETCH_LIMIT="50"

# SMTP (optional for sending mail; falls back to JSON transport when omitted)
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"  # Use 465 for SSL/TLS, 587 for STARTTLS
EMAIL_SERVER_USER="your-smtp-user@example.com"
EMAIL_SERVER_PASSWORD="your-smtp-password"
# Optional: Set to "true" to reject unauthorized certificates (default: false)
EMAIL_SERVER_REJECT_UNAUTHORIZED="false"
```

### SMTP Configuration Examples

**Gmail:**
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"  # Use App Password, not regular password
```

**Outlook/Hotmail:**
```env
EMAIL_SERVER_HOST="smtp-mail.outlook.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@outlook.com"
EMAIL_SERVER_PASSWORD="your-password"
```

**Custom SMTP with SSL:**
```env
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="465"  # SSL/TLS port
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
```

**Note:** The SMTP implementation automatically:
- Uses SSL/TLS for port 465
- Uses STARTTLS for port 587
- Verifies connection before sending
- Provides detailed error messages for troubleshooting

3) **Run the app**
```bash
npm run dev
```
Visit http://localhost:3000 and sign in with the admin or guest credentials above.

## 🧪 Testing

- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## ℹ️ Notes

- No database required; everything is fetched directly from IMAP and cached in memory for 60 seconds.
- Admin-only actions: compose, delete, bulk delete. Both roles can toggle star/read where permitted by IMAP flags.

## 📄 License

MIT License.
