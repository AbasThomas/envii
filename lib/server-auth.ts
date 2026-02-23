import type { User } from "@prisma/client";
import type { NextRequest } from "next/server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}

export async function getRequestUser(request: NextRequest): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;

  const token = authorization.replace("Bearer ", "").trim();
  if (!token) return null;

  return prisma.user.findUnique({
    where: { apiToken: token },
  });
}
