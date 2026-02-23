import axios from "axios";

import { readGlobalConfig } from "./config.js";

export function createApiClient() {
  const config = readGlobalConfig();
  const client = axios.create({
    baseURL: config.baseUrl,
    timeout: 20_000,
    headers: config.token
      ? {
          Authorization: `Bearer ${config.token}`,
        }
      : undefined,
  });

  return client;
}
