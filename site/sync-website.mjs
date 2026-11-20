#!/usr/bin/env node
// Vendor the website's shared header from a reviewed Git commit, without changing its checkout.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const siteRoot = dirname(fileURLToPath(import.meta.url));
const manifestPath = "vendor/agentrun-website/source.json";
const publicFiles = [
  "onboarding.css", "onboarding.js", "agent-setup.md",
  "assets/brand/agentrun-logo-chevron.png",
  "assets/agents/codex-app.png", "assets/agents/codex-cli.svg",
  "assets/agents/claude-app.png", "assets/agents/claude-code-cli.svg", "assets/agents/pi.svg",
  "assets/agents/SOURCES.md", "assets/agents/lucide-LICENSE.txt",
];
const files = [
  { source: "content/header.generated.json", target: "vendor/agentrun-website/header.json" },
  { source: "public/homepage/header.css", target: "assets/header.css" },
  { source: "content/onboarding.generated.json", target: "vendor/agentrun-website/onboarding.json" },
  ...publicFiles.map((path) => ({ source: `public/homepage/${path}`, target: `vendor/agentrun-website/public/homepage/${path}` })),
];
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

/** Fail when the shared artifact is hand-edited without updating its source. */
export function checkWebsite(root = siteRoot) {
  const manifest = JSON.parse(readFileSync(join(root, manifestPath), "utf8"));
  if (!/^[0-9a-f]{40}$/.test(manifest.commit ?? "")) throw new Error("Website source must name an immutable Git commit");
  for (const file of files) {
    const entry = manifest.files.find((entry) => entry.source === file.source && entry.target === file.target);
    if (!entry || digest(readFileSync(join(root, file.target))) !== entry.sha256) {
      throw new Error(`${file.target} differs from the pinned website source; use sync-website.mjs to refresh it`);
    }
  }
  return manifest;
}

export function syncWebsite({ source, ref, root = siteRoot }) {
  if (!source) throw new Error("Pass --source /path/to/agentrun-website; normal builds use the checked-in artifacts");
  const git = (...args) => execFileSync("git", ["-C", resolve(source), ...args], { stdio: ["ignore", "pipe", "pipe"] });
  const selectedRef = ref ?? JSON.parse(readFileSync(join(root, manifestPath), "utf8")).commit;
  const commit = git("rev-parse", "--verify", `${selectedRef}^{commit}`).toString("utf8").trim();
  const artifacts = files.map((file) => ({ ...file, bytes: git("show", `${commit}:${file.source}`) }));
  const header = JSON.parse(artifacts[0].bytes.toString("utf8"));
  if (typeof header.html !== "string" || !header.html.includes('class="mh-nav"') || !header.stylesheet?.startsWith("/homepage/header.css")) {
    throw new Error("Website header format changed; review its integration before updating");
  }
  const onboarding = JSON.parse(artifacts[2].bytes.toString("utf8"));
  if (typeof onboarding.html !== "string" || !onboarding.html.includes("data-setup-dialog") ||
      !onboarding.stylesheet?.startsWith("/homepage/onboarding.css") || !onboarding.runtime?.startsWith("/homepage/onboarding.js")) {
    throw new Error("Website onboarding format changed; review its integration before updating");
  }
  const authoredCSS = git("show", `${commit}:public/proposals/wayfinding-v12/header.css`);
  if (!artifacts[1].bytes.equals(authoredCSS)) throw new Error("Website's generated header CSS differs from its authored shared source");

  for (const { target, bytes } of artifacts) {
    mkdirSync(dirname(join(root, target)), { recursive: true });
    writeFileSync(join(root, target), bytes);
  }
  const manifest = {
    repository: "https://github.com/Parcha-ai/agentrun-website",
    commit,
    files: artifacts.map(({ source, target, bytes }) => ({ source, target, sha256: digest(bytes) })),
  };
  writeFileSync(join(root, manifestPath), `${JSON.stringify(manifest, null, 2)}\n`);
  return checkWebsite(root);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({ options: { source: { type: "string" }, ref: { type: "string" }, check: { type: "boolean" } } });
  try {
    const manifest = values.check ? checkWebsite() : syncWebsite({ source: values.source, ref: values.ref });
    process.stdout.write(`${values.check ? "Verified" : "Synced"} website header at ${manifest.commit}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
  }
}
