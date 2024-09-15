/* eslint-disable */
import { createPagesFunctionHandler } from "@remix-run/cloudflare-pages";

// @ts-ignore
// biome-ignore lint/style/noNamespaceImport: <explanation>
import * as build from "../build/server";

export const onRequest = createPagesFunctionHandler({
  build,
});
