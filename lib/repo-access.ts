import type { ShareRole } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const SHARE_RANK: Record<ShareRole, number> = {
  VIEWER: 1,
  CONTRIB: 2,
  EDITOR: 3,
  OWNER: 4,
};

export async function canAccessRepo(
  userId: string,
  repoId: string,
  minimumRole: ShareRole = "VIEWER",
) {
  const repo = await prisma.repo.findUnique({
    where: { id: repoId },
    include: {
      shares: {
        where: {
          userId,
        },
      },
    },
  });

  if (!repo) return { ok: false, repo: null as typeof repo };
  if (repo.userId === userId) return { ok: true, repo };

  const share = repo.shares[0];
  if (!share) return { ok: false, repo };

  return {
    ok: SHARE_RANK[share.role] >= SHARE_RANK[minimumRole],
    repo,
  };
}
