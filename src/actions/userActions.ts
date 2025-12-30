"use server";

import { db } from "@/lib/db";
import { hash } from "bcrypt";
import { UserRole } from "@prisma/client";

interface CreateUserParams {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export async function createUser({ email, name, password, role }: CreateUserParams) {
  // Check if user already exists
  const existingUser = await db.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash the password
  const hashedPassword = await hash(password, 12);

  // Create the user
  const user = await db.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role
    }
  });

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}