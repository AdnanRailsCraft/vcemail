# VC Email System

A modern, high-performance email management application designed for VC accounts, built with Next.js, Prisma, and Tailwind CSS.

## 🚀 Features

- **Intuitive Inbox**: A Gmail-like interface with smooth transitions and real-time updates.
- **Role-Based Access**: Specialized views for `ADMIN` (full control) and `READ_ONLY` (guest/view-only) users.
- **Secure Authentication**: Built with NextAuth.js, featuring secure session management and role enforcement.
- **Email Management**: Star, archive, delete (Admin only), and search functionalities.
- **Dark Mode & Responsiveness**: Fully optimized for all screen sizes, from mobile to desktop.
- **Modern Tech Stack**: Leveraging Next.js 16, React 19, and Tailwind CSS 4.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Frontend**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Database**: [Prisma](https://www.prisma.io/) with SQLite (local) / PostgreSQL (production)
- **Auth**: [NextAuth.js v4](https://next-auth.js.org/)
- **Utility**: [Zod](https://zod.dev/), [Nodemailer](https://nodemailer.com/)
- **Testing**: [Vitest](https://vitest.dev/), [Playwright](https://playwright.dev/)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/vcemail.git
   cd vcemail
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Optional: Email configuration for outgoing mail
   EMAIL_SERVER_HOST="smtp.example.com"
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER="user"
   EMAIL_SERVER_PASSWORD="password"
   EMAIL_FROM="no-reply@example.com"
   ```

4. **Database Initialization**:
   ```bash
   npx prisma db push
   npx tsx src/scripts/seedEmails.ts
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 🧪 Testing

- **Unit Tests**: `npm run test`
- **E2E Tests**: `npm run test:e2e`

## 📦 Deployment (AWS)

For production deployment on AWS:
1. Use **AWS App Runner** or **ECS Fargate** for containerized hosting.
2. Connect to an **Amazon RDS (PostgreSQL)** instance.
3. Manage secrets with **AWS Secrets Manager**.
4. Configure **Amazon SES** for reliable email delivery.

Refer to [TECHNICAL_DETAILS.md](./TECHNICAL_DETAILS.md) for a comprehensive deployment guide.

## 📄 License

This project is licensed under the MIT License.
