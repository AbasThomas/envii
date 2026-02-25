import { hash } from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { z } from "zod";

import { enforceRepoLimit, requireUser } from "@/lib/api-guards";
import { fail, ok } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { withDb } from "@/lib/prisma-resilience";
import { isValidRepoPin } from "@/lib/repo-pin";
import { slugify } from "@/lib/utils";

const createRepoSchema = z.object({
  name: z.string().min(2).max(64),
  slug: z.string().min(2).max(64).optional(),
  repoPin: z.string().regex(/^\d{6}$/, "Repository PIN must be exactly 6 digits"),
  visibility: z.enum(["private", "public"]).default("private"),
  description: z.string().max(1000).optional(),
  readme: z.string().max(100_000).optional(),
  tags: z.array(z.string().min(1).max(24)).default([]),
  defaultEnv: z.enum(["development", "staging", "production"]).default("development"),
});

export const GET = withDb(async (request: NextRequest) => {
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

  if (onlyPublic) {
    const publicRepos = await prisma.repo.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, image: true } },
        _count: { select: { stars: true, envs: true, forks: true } },
      },
      orderBy: [{ starsCount: "desc" }, { updatedAt: "desc" }],
      take: 50,
    });
    return ok({ repos: publicRepos });
  }

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
      ...(query || tag ? where : {}),
    },
    include: {
      owner: { select: { id: true, name: true, email: true, image: true } },
      stars: {
        where: { userId: user.id },
        select: { id: true },
      },
      _count: { select: { stars: true, envs: true, forks: true, shares: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return ok({ repos });
});

export const POST = withDb(async (request: NextRequest) => {
  const { user, response } = await requireUser(request);
  if (response || !user) return response;

  const json = await request.json().catch(() => null);
  const parsed = createRepoSchema.safeParse(json);
  if (!parsed.success) {
    return fail("Invalid payload", 422, parsed.error.flatten());
  }

  if (!isValidRepoPin(parsed.data.repoPin)) {
    return fail("Repository PIN must be 6 digits", 422);
  }

  const requestedPublicRepo = parsed.data.visibility === "public";
  const limitCheck = await enforceRepoLimit(user.id, requestedPublicRepo);
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
      isPublic: requestedPublicRepo,
      tags: parsed.data.tags.map((t) => t.toLowerCase()),
      defaultEnv: parsed.data.defaultEnv,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });

  await prisma.$executeRaw`
    UPDATE "Repo"
    SET "repo_pin_hash" = ${await hash(parsed.data.repoPin, 10)}
    WHERE "id" = ${repo.id}
  `;

  await prisma.auditLog.create({
    data: {
      repoId: repo.id,
      userId: user.id,
      action: "repo.created",
      metadata: { slug: repo.slug },
    },
  });

  return ok({ repo }, 201);
});
