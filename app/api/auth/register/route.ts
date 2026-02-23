import { hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { z } from "zod";

import { createApiToken } from "@/lib/crypto";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(64).optional(),
  referralCode: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(json);

  if (!parsed.success) {
    return fail("Invalid payload", 422, parsed.error.flatten());
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("Email is already registered", 409);
  }

  const passwordHash = await hash(parsed.data.password, 10);
  const referredBy = parsed.data.referralCode
    ? await prisma.user.findUnique({
        where: { referralCode: parsed.data.referralCode },
      })
    : null;

  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      apiToken: createApiToken(),
      referredById: referredBy?.id,
    },
    select: {
      id: true,
      email: true,
      name: true,
      planTier: true,
      apiToken: true,
      referralCode: true,
    },
  });

  return ok({ user }, 201);
}
