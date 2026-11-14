#!/usr/bin/env node
// Builds marketplace.agentrun.ai into site/dist from the templates repo's index (.agentrun/marketplace.json) and the
// packages it lists. Usage: node site/build.mjs [--root <repo>] [--out <dir>] [--offline] [--base-url <url>]
//                                             [--repo <owner/name>] [--sha <commit>]

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { GitHub } from "./lib/github.mjs";
import { loadPackage, readIndex, SiteError } from "./lib/packages.mjs";
import { CATEGORY_TEXT } from "./lib/describe.mjs";
import { categoryPage, homePage, layout, listPage, notFoundPage, SITE_NAME, templatePage } from "./lib/pages.mjs";
import { mdText } from "./lib/util.mjs";

const here = dirname(fileURLToPath(import.meta.url));
/** The console's two families (@fontsource, pinned in package.json); their latin 400 and 600 files are served. */
const FONTS = ["jetbrains-mono", "schibsted-grotesk"];

export async function build(options = {}) {
  const root = resolve(options.root ?? join(here, ".."));
  const out = resolve(options.out ?? join(here, "dist"));
  const baseUrl = String(options.baseUrl ?? process.env.SITE_BASE_URL ?? "https://marketplace.agentrun.ai").replace(/\/+$/, "");
  const [repoOwner, repoName] = String(options.repo ?? process.env.SITE_REPO ?? "Parcha-ai/agentrun-templates").split("/");
  const log = options.log ?? ((msg) => process.stderr.write(`${msg}\n`));
  const gitRoot = (...args) => {
    try { return execFileSync("git", ["-C", root, ...args], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; }
  };
  const sha = options.sha ?? process.env.SITE_SHA ?? (gitRoot("rev-parse", "HEAD") || process.env.GITHUB_SHA);
  if (!/^[0-9a-f]{40}$/.test(sha ?? "")) throw new SiteError("no commit to pin local templates to: build inside the templates repo's git checkout, or pass --sha");
  if (gitRoot("status", "--porcelain", "--", ".agentrun", "templates")) log("warn: the index or templates/ has uncommitted changes; install links pin HEAD, which does not have them");
  const lastmod = gitRoot("log", "-1", "--format=%cs") || new Date().toISOString().slice(0, 10);

  const github = new GitHub({ cacheDir: resolve(options.cacheDir ?? join(here, ".cache")), offline: !!options.offline, log });
  const index = readIndex(root);
  const ctx = { root, repo: { owner: repoOwner, name: repoName }, localSha: sha, github, log };

  const packages = [];
  for (const entry of index.templates) packages.push(await loadPackage(entry, ctx));
  const stats = new Map();
  for (const key of new Set(packages.map((p) => `${p.owner}/${p.repo}`))) {
    const [o, r] = key.split("/");
    stats.set(key, await github.repoStats(o, r));
  }

  const assetsDir = join(here, "assets");
  const assetFiles = readdirSync(assetsDir).sort();
  const assetVersion = createHash("sha256").update(assetFiles.map((f) => readFileSync(join(assetsDir, f))).join("\0")).digest("hex").slice(0, 10);
  const site = {
    baseUrl,
    url: (path) => `${baseUrl}${path}`,
    repo: { owner: repoOwner, name: repoName },
    repoUrl: `https://github.com/${repoOwner}/${repoName}`,
    sha,
    assetVersion,
  };

  const pages = [homePage(site, packages)];
  for (const pkg of packages) pages.push(templatePage(site, pkg, stats.get(`${pkg.owner}/${pkg.repo}`)));
  for (const cat of Object.keys(CATEGORY_TEXT)) {
    const inCat = packages.filter((p) => p.category === cat);
    if (inCat.length) pages.push(categoryPage(site, cat, inCat));
  }
  pages.push(listPage(site));
  const notFound = notFoundPage();

  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });
  const write = (rel, text) => {
    const file = join(out, rel);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, text);
  };
  for (const page of [...pages, notFound]) {
    write(page.path.endsWith("/") ? `${page.path}index.html` : page.path, layout(site, page));
    if (page.mdPath) write(page.mdPath, page.md);
  }
  mkdirSync(join(out, "assets", "fonts"), { recursive: true });
  for (const f of assetFiles) copyFileSync(join(assetsDir, f), join(out, "assets", f));
  for (const font of FONTS) {
    const pkg = join(here, "node_modules", "@fontsource", font);
    for (const weight of [400, 600]) copyFileSync(join(pkg, "files", `${font}-latin-${weight}-normal.woff2`), join(out, "assets", "fonts", `${font}-latin-${weight}-normal.woff2`));
    copyFileSync(join(pkg, "LICENSE"), join(out, "assets", "fonts", `${font}-LICENSE.txt`));
  }
  write(".nojekyll", "");

  write("search.json", JSON.stringify(packages.map((p) => ({
    name: p.name, title: p.displayName, description: p.description, category: p.category, tags: p.tags, url: `/templates/${p.name}/`,
  }))) + "\n");

  const priority = (path) => (path === "/" ? "1.0" : path.startsWith("/templates/") ? "0.8" : "0.6");
  write("sitemap.xml", [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map((p) => `  <url><loc>${site.url(p.path)}</loc><lastmod>${lastmod}</lastmod><priority>${priority(p.path)}</priority></url>`),
    "</urlset>",
    "",
  ].join("\n"));
  write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${site.url("/sitemap.xml")}\n`);

  const byCat = Object.keys(CATEGORY_TEXT).filter((c) => packages.some((p) => p.category === c));
  write("llms.txt", [
    `# ${SITE_NAME}`,
    "",
    "> Templates for AgentRun, an open-source platform for running agents. Each template is a working agent (instructions, skills, tools, an output schema and eval cases) that installs with one command. Every page here has a Markdown twin at the same path with .md.",
    "",
    `Install any template with \`agentrun template install <source>\`, or open \`<your AgentRun address>/#/templates/install?src=<source>\`. The index these pages come from: ${site.repoUrl}/blob/main/.agentrun/marketplace.json`,
    "",
    ...byCat.flatMap((c) => [
      `## ${CATEGORY_TEXT[c].title}`,
      "",
      ...packages.filter((p) => p.category === c).map((p) => `- [${mdText(p.displayName)}](${site.url(`/templates/${p.name}.md`)}): ${mdText(p.description)}`),
      "",
    ]),
    "## Optional",
    "",
    `- [List your template](${site.url("/list-your-template.md")}): how to add a template to the index with a pull request`,
    `- [All templates as JSON](${site.url("/search.json")})`,
    "",
  ].join("\n"));

  return { out, pages: pages.length, packages: packages.length, files: pages.length * 2 + 1 };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { values } = parseArgs({
    options: {
      root: { type: "string" }, out: { type: "string" }, offline: { type: "boolean" }, "base-url": { type: "string" },
      repo: { type: "string" }, sha: { type: "string" }, "cache-dir": { type: "string" },
    },
  });
  try {
    const result = await build({ root: values.root, out: values.out, offline: values.offline, baseUrl: values["base-url"], repo: values.repo, sha: values.sha, cacheDir: values["cache-dir"] });
    process.stdout.write(`built ${result.pages} pages (${result.packages} templates) into ${result.out}\n`);
  } catch (err) {
    process.stderr.write(`build failed: ${err instanceof SiteError ? err.message : err.stack ?? err}\n`);
    process.exit(1);
  }
}
