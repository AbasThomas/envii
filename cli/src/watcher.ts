import chokidar from "chokidar";
import chalk from "chalk";
import inquirer from "inquirer";

import { backupCommand } from "./worker.js";

export function startEnvWatcher(path = ".env") {
  const watcher = chokidar.watch(path, { ignoreInitial: true });
  let inFlight = false;

  watcher.on("change", async () => {
    if (inFlight) return;
    inFlight = true;

    try {
      console.log(chalk.yellow("Detected .env change."));
      const { shouldBackup } = await inquirer.prompt<{ shouldBackup: boolean }>([
        {
          type: "confirm",
          name: "shouldBackup",
          message: "Run `envvy backup` now?",
          default: true,
        },
      ]);

      if (shouldBackup) {
        await backupCommand({
          commitMessage: "Auto backup from watcher",
        });
      }
    } finally {
      inFlight = false;
    }
  });

  console.log(chalk.green(`Watching ${path} for changes...`));
  return watcher;
}
