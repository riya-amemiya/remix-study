import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
});
