import { readFileSync } from "node:fs";
import { raw } from "./util.mjs";

// This is the website's generated header, kept byte-for-byte by sync-website.mjs.
// Only website-relative navigation changes when it is rendered on the marketplace.
const header = JSON.parse(readFileSync(new URL("../vendor/agentrun-website/header.json", import.meta.url), "utf8"));
const onboarding = JSON.parse(readFileSync(new URL("../vendor/agentrun-website/onboarding.json", import.meta.url), "utf8"));

export function marketingHeader() {
  const markup = header.html.replace(/\bhref="(\/(?!\/)[^"]*)"/g, (_, path) => `href="https://agentrun.ai${path}"`);
  return raw(`<header class="marketing-header">${markup}</header>`);
}

export function marketingOnboarding() {
  // The matching /homepage/ assets are served locally, including the Markdown
  // download whose URL the website runtime uses to resolve the agent icons.
  return raw(`<div data-shared-onboarding>${onboarding.html}</div>`);
}
