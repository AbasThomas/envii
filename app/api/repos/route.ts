import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceRepoLimit, requireUser } from "@/lib/api-guards";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const createRepoSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z.string().min(2).max(64).optional(),
  description: z.string().max(1000).optional(),
  readme: z.string().max(100_000).optional(),
  tags: z.array(z.string().min(1).max(24)).default([]),
  isPublic: z.boolean().default(false),
  defaultEnv: z.enum(["development", "staging", "production"]).default("development"),
});

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const onlyPublic = searchParams.get("public") === "true";
  const query = searchParams.get("q")?.trim();
  const tag = searchParams.get("tag")?.trim();

  const where: Prisma.RepoWhereInput = {
    ...(onlyPublic ? { isPublic: true } : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { tags: { has: query.toLowerCase() } },
          ],
        }
      : {}),
    ...(tag ? { tags: { has: tag.toLowerCase() } } : {}),
  };

  if (!onlyPublic) {
    const { user, response } = await requireUser(request);
    if (response || !user) return response;

    const repos = await prisma.repo.findMany({
      where: {
        OR: [
          { userId: user.id },
          {
            shares: {
              some: { userId: user.id },
            },
          },
        ],
        ...(query ? where : {}),
      },
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { stars: true, envs: true } },
      },
      orderBy: { updatedAt: "desc" },
    });

    return ok({ repos });
  }

  const repos = await prisma.repo.findMany({
    where,
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      _count: { select: { stars: true, envs: true } },
    },
    orderBy: [{ starsCount: "desc" }, { viewsCount: "desc" }, { updatedAt: "desc" }],
    take: 60,
  });
  return ok({ repos });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (response || !user) return response;

  const json = await request.json().catch(() => null);
  const parsed = createRepoSchema.safeParse(json);
  if (!parsed.success) {
    return fail("Invalid payload", 422, parsed.error.flatten());
  }

  const limitCheck = await enforceRepoLimit(user.id, parsed.data.isPublic);
  if (!limitCheck.allowed) {
    return fail(limitCheck.reason, 403);
  }

  const slug = slugify(parsed.data.slug ?? parsed.data.name);
  if (!slug) return fail("Could not generate a valid repo slug", 422);

  const existing = await prisma.repo.findUnique({
    where: { userId_slug: { userId: user.id, slug } },
  });
  if (existing) return fail("A repository with this slug already exists", 409);

  const repo = await prisma.repo.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      readme: parsed.data.readme,
      isPublic: parsed.data.isPublic,
      tags: parsed.data.tags.map((t) => t.toLowerCase()),
      defaultEnv: parsed.data.defaultEnv,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      repoId: repo.id,
      userId: user.id,
      action: "repo.created",
      metadata: { slug: repo.slug },
    },
  });

  return ok({ repo }, 201);
}
