#!/usr/bin/env node

import { existsSync, writeFileSync } from "node:fs";
import { basename } from "node:path";

import chalk from "chalk";
import { Command } from "commander";
import dotenv from "dotenv";
import inquirer from "inquirer";

import { createApiClient } from "./api.js";
import {
  getConfigPath,
  readProjectConfig,
  writeGlobalConfig,
  writeProjectConfig,
} from "./config.js";
import { parseDotEnv, readLocalEnv, stringifyDotEnv } from "./env.js";
import {
  backupCommand,
  forkCommand,
  listCommand,
  pullCommand,
  restoreCommand,
  starCommand,
} from "./worker.js";
import { startEnvWatcher } from "./watcher.js";

dotenv.config();

const program = new Command();
program
  .name("envii")
  .description("GitHub-style environment variable management CLI")
  .version("0.1.0");

program
  .command("login")
  .description("Authenticate and store your API token in ~/.envii/config.json")
  .action(async () => {
    const answers = await inquirer.prompt<{
      baseUrl: string;
      email: string;
      password: string;
    }>([
      {
        type: "input",
        name: "baseUrl",
        message: "API base URL",
        default: process.env.ENVII_API_URL ?? "http://localhost:3000",
      },
      {
        type: "input",
        name: "email",
        message: "Email",
      },
      {
        type: "password",
        name: "password",
        message: "Password",
      },
    ]);

    const api = createApiClient();
    api.defaults.baseURL = answers.baseUrl;
    const { data } = await api.post("/api/cli/login", {
      email: answers.email,
      password: answers.password,
    });

    writeGlobalConfig({
      baseUrl: answers.baseUrl,
      token: data.token,
      email: data.user.email,
      userId: data.user.id,
    });

    console.log(chalk.green(`Logged in as ${data.user.email}`));
    console.log(chalk.gray(`Config stored at ${getConfigPath()}`));
  });

program
  .command("init")
  .description("Initialize current directory for envii")
  .option("-r, --repo <slug>", "Repo slug (defaults to folder name)")
  .option("-e, --environment <env>", "Target environment", "development")
  .action(async (options) => {
    const repoSlug = options.repo ?? basename(process.cwd()).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
    const environment =
      options.environment === "staging" || options.environment === "production"
        ? options.environment
        : "development";

    writeProjectConfig({
      repoSlug,
      environment,
      commitMessage: "Initial env snapshot",
    });

    const envValues = readLocalEnv();
    if (!existsSync(".env.example")) {
      const sanitized = Object.keys(envValues).reduce<Record<string, string>>((acc, key) => {
        acc[key] = "";
        return acc;
      }, {});
      writeFileSync(".env.example", stringifyDotEnv(sanitized), "utf8");
      console.log(chalk.green("Created .env.example"));
    }

    console.log(chalk.green(`Initialized envii for repo "${repoSlug}" (${environment})`));
  });

program
  .command("backup")
  .description("Backup your local env file to envii")
  .option("-m, --message <message>", "Commit message")
  .option("-k, --key <key>", "Client-side encryption key")
  .action(async (options) => {
    await backupCommand({
      commitMessage: options.message,
      key: options.key,
    });
  });

program
  .command("restore [repoSlug]")
  .description("Restore latest env snapshot into local .env")
  .option("-k, --key <key>", "Client-side decryption key")
  .action(async (repoSlug, options) => {
    await restoreCommand(repoSlug, options.key);
  });

program.command("list").description("List your envii repositories").action(listCommand);

program
  .command("commit")
  .description("Save a default commit message for the next push/backup")
  .requiredOption("-m, --message <message>", "Commit message")
  .action((options) => {
    const current = readProjectConfig();
    if (!current) throw new Error("Run `envii init` first.");

    writeProjectConfig({
      ...current,
      commitMessage: options.message,
    });
    console.log(chalk.green("Commit message staged for next push."));
  });

program
  .command("push")
  .description("Sync local .env to envii using the staged commit message")
  .option("-k, --key <key>", "Client-side encryption key")
  .action(async (options) => {
    await backupCommand({
      key: options.key,
    });
  });

program
  .command("pull")
  .description("Download latest snapshot for current repo")
  .option("-k, --key <key>", "Client-side decryption key")
  .action(async (options) => {
    await pullCommand({ key: options.key });
  });

program
  .command("fork <repoId>")
  .description("Fork a public repository")
  .action(async (repoId) => {
    await forkCommand(repoId);
  });

program
  .command("star <repoId>")
  .description("Toggle star for a repository")
  .action(async (repoId) => {
    await starCommand(repoId);
  });

program
  .command("watch")
  .description("Watch .env and prompt for backup on changes")
  .option("-f, --file <file>", "Path to env file", ".env")
  .action(async (options) => {
    startEnvWatcher(options.file);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown CLI error";
  console.error(chalk.red(`Error: ${message}`));
  process.exit(1);
});

const fallbackEnv = readLocalEnv();
if (!Object.keys(fallbackEnv).length && process.env.ENVII_LOAD_PROCESS_ENV === "true") {
  parseDotEnv(Object.entries(process.env).map(([k, v]) => `${k}=${v ?? ""}`).join("\n"));
}
