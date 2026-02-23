import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPlanConfig } from "@/lib/plans";
import { prisma } from "@/lib/prisma";
import { getRequestUser } from "@/lib/server-auth";

export async function requireUser(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { user, response: null };
}

export async function enforceRepoLimit(userId: string, requestedPublicRepo = false) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "User not found" };

  const plan = getPlanConfig(user.planTier);
  const repoCount = await prisma.repo.count({ where: { userId } });

  if (repoCount >= plan.repoLimit) {
    return {
      allowed: false,
      reason: `Plan limit reached (${plan.repoLimit} repos). Upgrade to continue.`,
    };
  }

  if (requestedPublicRepo && !plan.allowPublicRepos) {
    return {
      allowed: false,
      reason: "Your current plan does not support public repositories.",
    };
  }

  return { allowed: true as const };
}

export async function enforceFeature(userId: string, feature: "allowSharing" | "allowForksAndStars" | "allowAuditLogs" | "allowTeams" | "allowVersionHistory") {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { allowed: false, reason: "User not found" };
  const plan = getPlanConfig(user.planTier);
  if (!plan[feature]) {
    return {
      allowed: false,
      reason: `Feature blocked by ${plan.label} plan. Upgrade to unlock.`,
    };
  }
  return { allowed: true as const };
}
