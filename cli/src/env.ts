import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type EnvMap = Record<string, string>;

export function readLocalEnv(fileName = ".env"): EnvMap {
  const envPath = join(process.cwd(), fileName);
  if (!existsSync(envPath)) return {};
  return parseDotEnv(readFileSync(envPath, "utf8"));
}

export function writeLocalEnv(values: EnvMap, fileName = ".env") {
  const envPath = join(process.cwd(), fileName);
  writeFileSync(envPath, stringifyDotEnv(values), "utf8");
}

export function parseDotEnv(raw: string): EnvMap {
  const result: EnvMap = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
    result[key] = value;
  }
  return result;
}

export function stringifyDotEnv(values: EnvMap) {
  return Object.entries(values)
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join("\n");
}
