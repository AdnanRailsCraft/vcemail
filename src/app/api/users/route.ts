import { NextRequest } from "next/server";
import { createUser } from "@/actions/userActions";
import { UserRole } from "@prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, password, role } = body;

    if (!email || !name || !password || !role) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const user = await createUser({
      email,
      name,
      password,
      role: role as UserRole
    });

    return Response.json({ success: true, user });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}