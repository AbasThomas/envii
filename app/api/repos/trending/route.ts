import { NextRequest } from "next/server";

import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const limit = Number(request.nextUrl.searchParams.get("limit") ?? 20);

  const repos = await prisma.repo.findMany({
    where: { isPublic: true },
    include: {
      owner: { select: { id: true, name: true, image: true } },
      _count: { select: { stars: true, envs: true, forks: true } },
    },
    orderBy: [
      { starsCount: "desc" },
      { viewsCount: "desc" },
      { updatedAt: "desc" },
    ],
    take: Number.isNaN(limit) ? 20 : Math.min(limit, 100),
  });

  return ok({ repos });
}
