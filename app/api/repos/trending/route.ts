import { NextRequest } from "next/server";

import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "24");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 24;

  const repos = await prisma.repo.findMany({
    where: { isPublic: true },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { stars: true, envs: true, forks: true } },
    },
    orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return ok({ repos });
}
