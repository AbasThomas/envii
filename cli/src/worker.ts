import chalk from "chalk";

import { createApiClient } from "./api.js";
import { readGlobalConfig, readProjectConfig, writeProjectConfig } from "./config.js";
import { encryptJson } from "./crypto.js";
import { readLocalEnv, writeLocalEnv } from "./env.js";

function ensureToken() {
  const config = readGlobalConfig();
  if (!config.token) {
    throw new Error("Not logged in. Run `envii login` first.");
  }
  return config;
}

function ensureProjectConfig() {
  const project = readProjectConfig();
  if (!project) {
    throw new Error("Project not initialized. Run `envii init` first.");
  }
  return project;
}

export async function backupCommand(options?: { commitMessage?: string; key?: string }) {
  ensureToken();
  const project = ensureProjectConfig();

  const envValues = readLocalEnv();
  const envFromProcess = Object.keys(envValues).length ? envValues : (process.env as Record<string, string>);
  const commitMessage = options?.commitMessage ?? project.commitMessage ?? "CLI backup";

  const payload: Record<string, unknown> = {
    repoSlug: project.repoSlug,
    environment: project.environment,
    commitMsg: commitMessage,
  };

  if (options?.key) {
    payload.clientEncrypted = true;
    payload.encryptedBlob = encryptJson(envFromProcess, options.key);
  } else {
    payload.env = envFromProcess;
  }

  const api = createApiClient();
  const { data } = await api.post("/api/cli/backup", payload);

  writeProjectConfig({
    ...project,
    commitMessage,
  });

  console.log(
    chalk.green(
      `Backed up ${data.repo.slug} (${data.env.environment}) at version ${data.env.version}.`,
    ),
  );
}

export async function pullCommand(options?: { repoSlug?: string; key?: string }) {
  ensureToken();
  const project = ensureProjectConfig();
  const slug = options?.repoSlug ?? project.repoSlug;

  const api = createApiClient();
  const { data } = await api.get(`/api/cli/restore/${encodeURIComponent(slug)}?decrypt=true`, {
    headers: options?.key
      ? {
          "x-envii-user-key": options.key,
        }
      : undefined,
  });

  const values = data.env.values as Record<string, string>;
  writeLocalEnv(values);
  console.log(chalk.green(`Pulled latest env for ${slug} into .env`));
}

export async function listCommand() {
  ensureToken();
  const api = createApiClient();
  const { data } = await api.get("/api/cli/repos");
  const repos = data.repos as Array<{ name: string; slug: string; _count: { envs: number } }>;

  if (!repos.length) {
    console.log(chalk.yellow("No repositories found."));
    return;
  }

  for (const repo of repos) {
    console.log(chalk.cyan(`${repo.name} (${repo.slug})`) + chalk.gray(` snapshots: ${repo._count.envs}`));
  }
}

export async function restoreCommand(repoSlug?: string, key?: string) {
  return pullCommand({ repoSlug, key });
}

export async function starCommand(repoId: string) {
  ensureToken();
  const api = createApiClient();
  await api.post("/api/social/star", { repoId });
  console.log(chalk.green(`Star toggled for repo ${repoId}`));
}

export async function forkCommand(repoId: string) {
  ensureToken();
  const api = createApiClient();
  const { data } = await api.post("/api/social/fork", { repoId });
  console.log(chalk.green(`Fork created: ${data.repo.slug}`));
}
