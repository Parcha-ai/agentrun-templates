import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeInstallAddress, templateInstallUrl } from "../assets/install-address.js";

test("scheme-less loopback addresses open AgentRun's HTTP server", () => {
  for (const [typed, expected] of [
    ["localhost:7340", "http://localhost:7340"],
    ["127.0.0.1:7340", "http://127.0.0.1:7340"],
    ["127.2.3.4:7340", "http://127.2.3.4:7340"],
    ["[::1]:7340", "http://[::1]:7340"],
    ["agent.localhost:7340", "http://agent.localhost:7340"],
    ["localhost:443", "http://localhost:443"],
  ]) assert.equal(normalizeInstallAddress(typed), expected, typed);
});

test("remote addresses default to HTTPS and explicit schemes are preserved", () => {
  for (const [typed, expected] of [
    ["agentrun.example.com", "https://agentrun.example.com"],
    ["192.168.1.20:7340", "https://192.168.1.20:7340"],
    ["localhost.example.com", "https://localhost.example.com"],
    ["https://localhost:7340", "https://localhost:7340"],
    ["http://agentrun.example.com:7340", "http://agentrun.example.com:7340"],
    [" https://agentrun.example.com/team///?unused=1#/runs ", "https://agentrun.example.com/team"],
  ]) assert.equal(normalizeInstallAddress(typed), expected, typed);
});

test("install URLs retain the pinned source while replacing a copied console route", () => {
  const source = "github:Parcha-ai/agentrun-templates/templates/calendar-brief@551404db5a7fe6b066051c37979d664006382062";
  const target = new URL(templateInstallUrl("localhost:7340/?unused=1#/agents/my-agent", source));
  assert.equal(target.origin, "http://localhost:7340");
  assert.equal(target.pathname, "/");
  assert.equal(target.search, "");
  assert.equal(target.hash.split("?")[0], "#/templates/install");
  assert.equal(new URLSearchParams(target.hash.split("?")[1]).get("src"), source);
  assert.equal(templateInstallUrl("https://agentrun.example.com/team/", source),
    `https://agentrun.example.com/team/#/templates/install?src=${encodeURIComponent(source)}`);
});

test("invalid addresses, credentials, and non-HTTP schemes cannot become install links", () => {
  for (const typed of ["", "   ", null, "not a host", "https://", "https://user:password@example.com", "user@example.com", "ftp://example.com", "file:///tmp/agentrun", "javascript:alert(1)", "data:text/html,hello"]) {
    assert.equal(normalizeInstallAddress(typed), null, String(typed));
    assert.equal(templateInstallUrl(typed, "github:Parcha-ai/agentrun-templates/templates/calendar-brief@main"), null, String(typed));
  }
});
