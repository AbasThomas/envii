import { NextRequest } from "next/server";

import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  const tag = request.nextUrl.searchParams.get("tag")?.trim().toLowerCase();
  const limitParam = Number(request.nextUrl.searchParams.get("limit") ?? "30");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 30;

  const repos = await prisma.repo.findMany({
    where: {
      isPublic: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { tags: { has: query.toLowerCase() } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {}),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { stars: true, envs: true, forks: true } },
    },
    orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
    take: limit,
  });

  return ok({ repos });
}
