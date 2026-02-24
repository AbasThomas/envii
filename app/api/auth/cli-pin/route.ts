import { hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { z } from "zod";

import { createApiToken } from "@/lib/crypto";
import { fail, ok } from "@/lib/http";
import { isValidCliPin, generateCliPin } from "@/lib/cli-pin";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/server-auth";

const upsertSchema = z.object({
  pin: z.string().optional(),
});

type CliPinRow = {
  cli_pin_hash: string | null;
  onboarding_completed: boolean;
  cli_pin_updated_at: Date | null;
  cli_pin_last_used_at: Date | null;
};

async function readCliPinState(userId: string) {
  const rows = await prisma.$queryRaw<Array<CliPinRow>>`
    SELECT
      "cli_pin_hash",
      "onboarding_completed",
      "cli_pin_updated_at",
      "cli_pin_last_used_at"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `;
  const row = rows[0];
  if (!row) return null;

  return {
    hasCliPin: !!row.cli_pin_hash,
    onboardingCompleted: row.onboarding_completed,
    cliPinUpdatedAt: row.cli_pin_updated_at,
    cliPinLastUsedAt: row.cli_pin_last_used_at,
  };
}

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return fail("Unauthorized", 401);

  const state = await readCliPinState(user.id);
  if (!state) return fail("User not found", 404);

  return ok({ state });
}

export async function POST(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return fail("Unauthorized", 401);

  const body = await request.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body ?? {});
  if (!parsed.success) return fail("Invalid payload", 422, parsed.error.flatten());

  const nextPin = parsed.data.pin ?? generateCliPin();
  if (!isValidCliPin(nextPin)) {
    return fail("CLI PIN must be exactly 6 digits", 422);
  }

  const pinHash = await hash(nextPin, 10);
  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "cli_pin_hash" = ${pinHash},
      "cli_pin_updated_at" = NOW(),
      "onboarding_completed" = true
    WHERE "id" = ${user.id}
  `;

  const state = await readCliPinState(user.id);
  return ok({
    pin: nextPin,
    generated: !parsed.data.pin,
    state,
  });
}

export async function DELETE(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return fail("Unauthorized", 401);

  const rotatedToken = createApiToken();
  await prisma.$executeRaw`
    UPDATE "User"
    SET
      "cli_pin_hash" = NULL,
      "cli_pin_updated_at" = NULL,
      "cli_pin_last_used_at" = NULL,
      "api_token" = ${rotatedToken}
    WHERE "id" = ${user.id}
  `;

  const state = await readCliPinState(user.id);
  return ok({
    success: true,
    rotatedApiToken: true,
    state,
  });
}
