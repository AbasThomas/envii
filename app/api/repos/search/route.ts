import { NextRequest } from "next/server";

import { ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const tag = request.nextUrl.searchParams.get("tag")?.trim() ?? "";

  const repos = await prisma.repo.findMany({
    where: {
      isPublic: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { readme: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(tag ? { tags: { has: tag.toLowerCase() } } : {}),
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      _count: { select: { stars: true, envs: true } },
    },
    orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
    take: 100,
  });

  return ok({ repos });
}
