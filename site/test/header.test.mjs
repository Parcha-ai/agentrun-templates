import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marketingHeader, marketingOnboarding } from "../lib/header.mjs";
import { checkWebsite } from "../sync-website.mjs";

const siteRoot = dirname(dirname(fileURLToPath(import.meta.url)));

test("shared header sends website navigation to the website from every marketplace route", () => {
  const markup = String(marketingHeader());
  for (const path of ["/", "/#your-agents", "/#models", "/platform/self-improving", "/platform/durable-agents", "/platform/control-plane", "/docs", "/blog/", "/changelog"]) {
    assert.ok(markup.includes(`href="https://agentrun.ai${path}"`), `${path} must resolve on the website`);
  }
  assert.doesNotMatch(markup, /href="\//);
  assert.match(markup, /href="https:\/\/github.com\/Parcha-ai\/agentrun"/);
  assert.match(markup, /href="https:\/\/console.agentrun.ai"/);
  assert.match(markup, /<details class="mh-platform">[\s\S]*<summary>/);
  assert.doesNotMatch(markup, /<script\b|__GITHUB_/);
});

test("shared header onboarding keeps image and download assets on the marketplace origin", () => {
  assert.match(String(marketingHeader()), /src="\/homepage\/assets\/brand\/agentrun-logo-chevron\.png"/);
  assert.match(String(marketingHeader()), /data-agent-picker/);
  const markup = String(marketingOnboarding());
  assert.match(markup, /data-shared-onboarding/);
  assert.match(markup, /data-setup-dialog/);
  assert.match(markup, /href="\/homepage\/agent-setup\.md" download/);
  assert.doesNotMatch(markup, /src="https?:/);
});

test("shared website artifacts retain their pinned source hashes", () => {
  const manifest = checkWebsite();
  assert.match(manifest.commit, /^[0-9a-f]{40}$/);
  assert.equal(manifest.repository, "https://github.com/Parcha-ai/agentrun-website");
});

test("source verification detects an accidental independent header edit", () => {
  const root = mkdtempSync(join(tmpdir(), "agentrun-header-"));
  try {
    cpSync(join(siteRoot, "vendor"), join(root, "vendor"), { recursive: true });
    cpSync(join(siteRoot, "assets"), join(root, "assets"), { recursive: true });
    const css = join(root, "assets/header.css");
    writeFileSync(css, `${readFileSync(css, "utf8")}\n.marketing-header { display: none; }\n`);
    assert.throws(() => checkWebsite(root), /assets\/header\.css differs from the pinned website source/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
