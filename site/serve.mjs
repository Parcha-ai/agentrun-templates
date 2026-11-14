#!/usr/bin/env node
// Serves site/dist with the production server (lib/server.mjs): the same paths, 404 page and security headers.
// Usage: node site/serve.mjs [--dir site/dist] [--host 127.0.0.1] [--port 7420] [--prod]
// A local look binds 127.0.0.1 with caching off. The container runs it with --host 0.0.0.0 --port 8080 --prod.

import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { siteServer } from "./lib/server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const { values } = parseArgs({ options: { dir: { type: "string" }, host: { type: "string" }, port: { type: "string" }, prod: { type: "boolean" } } });
const root = resolve(values.dir ?? join(here, "dist"));
const host = values.host ?? "127.0.0.1";
const port = Number(values.port ?? 7420);

const server = siteServer({ root, dev: !values.prod });
server.listen(port, host, () => process.stdout.write(`serving ${root} on http://${host}:${port}/\n`));
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => server.close(() => process.exit(0)));
