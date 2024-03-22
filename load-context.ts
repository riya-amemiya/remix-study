import type { PlatformProxy } from "wrangler";

// biome-ignore lint/correctness/noUndeclaredVariables: <explanation>
type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
  }
}
