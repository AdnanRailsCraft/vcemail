# VC Email App - Technical Details & Deployment Guide

## Technical Stack

The VC Email System is a modern web application built with a focus on speed, developer experience, and visual excellence.

### Core Technologies
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Runtime**: Node.js

### Backend & Data
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: SQLite (Development) / PostgreSQL (Recommended for Production)
- **Authentication**: [NextAuth.js v4](https://next-auth.js.org/)

### Email Services
- **Outgoing**: [Nodemailer](https://nodemailer.com/)
- **Incoming**: [imap-simple](https://www.npmjs.com/package/imap-simple) and [mailparser](https://nodemailer.com/extras/mailparser/)

### Testing
- **Unit/Integration**: [Vitest](https://vitest.dev/)
- **End-to-End (E2E)**: [Playwright](https://playwright.dev/)

---

## Application Architecture

### Project Structure
```
vcemail/
├── src/
│   ├── actions/          # Server actions
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication pages
│   │   ├── compose/      # Email composition pages
│   │   ├── dashboard/    # Dashboard pages
│   │   ├── guest/        # Guest access pages
│   │   ├── inbox/        # Inbox pages
│   │   └── setup/        # Setup pages
│   ├── auth/             # Authentication configuration
│   ├── components/       # Reusable React components
│   ├── emails/           # Email templates
│   ├── lib/              # Utility functions and database connection
│   ├── scripts/          # Utility scripts
│   ├── services/         # Business logic services
│   ├── test/             # Test utilities
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── prisma/               # Prisma schema and migrations
├── public/               # Static assets
└── ...
```

### Key Components

#### Authentication System
The application uses NextAuth.js with a custom credentials provider and Prisma adapter for database integration. The authentication system includes:
- User roles (ADMIN and READ_ONLY)
- JWT-based session management
- Password hashing with bcrypt
- Account activation/deactivation

#### Middleware
The application implements middleware that:
- Protects routes requiring authentication
- Enforces role-based access control (ADMIN users can access compose functionality)
- Redirects unauthenticated users to the login page

#### Database Schema
The Prisma schema defines two main models:
- **User**: Email, password, name, role (ADMIN/READ_ONLY), active status
- **Email**: Full email metadata including sender, recipients, subject, content, and read/star status

#### Email Service
The EmailService class provides:
- Sending emails via Nodemailer
- Fetching emails from IMAP (placeholder implementation)
- User-specific email retrieval
- Guest email access

---

## Environment Variables

### Required Environment Variables
```env
# Database
DATABASE_URL="sqlite://./dev.db" # For development with SQLite
# DATABASE_URL="postgresql://user:password@host:port/dbname" # For production with PostgreSQL

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000" # Your application URL

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com" # or your SMTP server
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@domain.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="no-reply@your-domain.com"
```

### Optional Environment Variables
```env
# Node Environment
NODE_ENV="development" # or "production"

# Database (for production)
DIRECT_URL="your-direct-database-url" # For connection pooling in production
```

---

## API Endpoints

### Authentication API
- `POST /api/auth/callback/credentials` - Login endpoint
- `GET /api/auth/session` - Get current session
- `POST /api/auth/signout` - Logout endpoint

### Email API
- `GET /api/emails` - Get user's emails
- `POST /api/emails` - Send a new email
- `GET /api/emails/:id` - Get a specific email
- `PUT /api/emails/:id` - Update email status (read/unread, starred/unstarred)

---

## Database Migrations

### Setting up the database
1. Run `npx prisma db push` for development (direct schema to database)
2. For production, use `npx prisma migrate dev` to create and apply migrations

### Seeding data
Use the provided `seed-direct.ts` script to populate the database with initial data:
```bash
npx tsx seed-direct.ts
```

---

## Development Workflow

### Running the Application
1. Install dependencies: `npm install`
2. Set up environment variables in `.env.local`
3. Run database migrations: `npx prisma db push`
4. Start the development server: `npm run dev`

### Testing
- Run unit/integration tests: `npm run test`
- Run end-to-end tests: `npm run test:e2e`

### Building for Production
```bash
npm run build
npm start
```

---

## AWS Deployment Guide

To deploy this application on AWS, we recommend using a containerized approach for scalability and reliability.

### 1. Architectural Components Needed
- **Compute**: AWS App Runner (easiest) or Amazon ECS with Fargate.
- **Database**: Amazon RDS for PostgreSQL.
- **Secrets**: AWS Secrets Manager (for API keys and database credentials).
- **Email**: Amazon SES (Simple Email Service) for sending emails and potentially S3/Lambda for receiving.
- **Networking**: Amazon Route 53 (DNS) and AWS Certificate Manager (SSL/TLS).

### 2. Deployment Steps

#### A. Prepare for Production
1. **Database Migration**:
   - Update `prisma/schema.prisma` to use `postgresql` instead of `sqlite`.
   - Ensure `DATABASE_URL` in production points to your RDS instance.
2. **Containerization**:
   - Create a `Dockerfile` for the Next.js application.
   - Use a multi-stage build to keep the image small.

#### B. Setup AWS Resources
1. **RDS**: Create a PostgreSQL instance in a private subnet.
2. **Secrets Manager**: Store values for `NEXTAUTH_SECRET`, `DATABASE_URL`, `EMAIL_SERVER_URL`, etc.
3. **App Runner or ECS**:
   - Create a new service.
   - Point it to your Docker image (stored in Amazon ECR).
   - Configure environment variables to pull from Secrets Manager.

#### C. Configuration
- **NextAuth**: Set `NEXT_PUBLIC_APP_URL` to your production domain.
- **SES**: Verify your domain in AWS SES and request production access (out of sandbox) to send emails freely.

### 3. Required Environment Variables for Production
```env
DATABASE_URL="postgresql://user:password@host:port/dbname"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.com"
EMAIL_SERVER_HOST="email-smtp.us-east-1.amazonaws.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-ses-smtp-user"
EMAIL_SERVER_PASSWORD="your-ses-smtp-password"
EMAIL_FROM="no-reply@your-domain.com"
```

---

## Maintenance & Monitoring
- **Logs**: Use Amazon CloudWatch for application and access logs.
- **CD**: Set up a CI/CD pipeline using GitHub Actions or AWS CodePipeline.

---

## Security Considerations

### Authentication & Authorization
- Passwords are hashed using bcrypt
- JWT tokens are used for session management with a 24-hour expiration
- Role-based access control prevents unauthorized access to sensitive features
- Middleware enforces authentication on protected routes

### Input Validation
- Zod is used for schema validation (if implemented)
- All user inputs are validated before processing
- SQL injection prevention through Prisma ORM

### Email Security
- Email content is sanitized before display
- Email sending is rate-limited to prevent abuse
- Only authenticated users can send emails

---

## Performance Optimization

### Caching
- Next.js App Router provides automatic caching for static content
- Database queries are optimized using Prisma's built-in features
- Client-side caching with React Query or SWR can be implemented for frequently accessed data

### Database Optimization
- Proper indexing on frequently queried fields
- Connection pooling for production deployments
- Prisma's raw queries for complex operations when needed

### Asset Optimization
- Next.js built-in image optimization
- Automatic font optimization using `next/font`
- CSS optimization through Tailwind CSS
