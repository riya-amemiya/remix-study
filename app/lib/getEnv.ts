import type { AppLoadContext } from "@remix-run/cloudflare";

export const getEnv = (context: AppLoadContext): Env => {
  try {
    return process.env as unknown as Env;
  } catch {
    return context.cloudflare.env as Env;
  }
};
