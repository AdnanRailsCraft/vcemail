import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/auth";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get search query from URL parameters
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Build the search query (emails sent by user or addressed to them)
    const ownershipClause = session.user.email
      ? { OR: [{ senderId: session.user.id }, { to: session.user.email }] }
      : { senderId: session.user.id };

    const searchClause = query
      ? {
          OR: [
            { subject: { contains: query, mode: "insensitive" } },
            { from: { contains: query, mode: "insensitive" } },
            { to: { contains: query, mode: "insensitive" } },
            { bodyText: { contains: query, mode: "insensitive" } },
          ],
        }
      : {};

    // Fetch emails with search and pagination
    const emails = await db.email.findMany({
      where: {
        AND: [ownershipClause, searchClause],
      },
      orderBy: {
        receivedAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalCount = await db.email.count({
      where: {
        AND: [ownershipClause, searchClause],
      },
    });

    return Response.json({ 
      emails, 
      totalCount,
      hasMore: offset + limit < totalCount
    });
  } catch (error) {
    console.error("Error fetching emails:", error);
    return Response.json({ error: "Failed to fetch emails" }, { status: 500 });
  }
}