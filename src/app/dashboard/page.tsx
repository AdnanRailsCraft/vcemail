import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { redirect } from "next/navigation";
import DashboardPageContent from "./DashboardPageContent";
import { db } from "@/lib/db";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // Get user's email stats
  const emailCount = await db.email.count({
    where: {
      senderId: session.user?.id
    }
  });

  return (
    <DashboardPageContent
      user={session.user}
      emailCount={emailCount}
    />
  );
}