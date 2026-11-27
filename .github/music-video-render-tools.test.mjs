// The music video's render runs longer than one `bash` call may (serve stops a call at 600 s, whatever `timeout` it
// asks), so the skill starts it with bash_background and waits for it in turns. A template that names its tools gets
// exactly those, so agent.md's own `tools` must list the three background tools the render needs, or the run has none.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const AGENT = new URL("../templates/music-video/agent.md", import.meta.url);

/** agent.md's top-level `tools` list, read from its front matter (a flow list on one line). */
function agentTools() {
  const text = readFileSync(AGENT, "utf8");
  const front = /^---\n([\s\S]*?)\n---\n/.exec(text);
  assert.ok(front, "agent.md starts with a front matter block");
  const line = front[1].split("\n").find((l) => l.startsWith("tools:"));
  assert.ok(line, "agent.md's front matter has a top-level tools line");
  const list = /^tools:\s*\[(.*)\]\s*$/.exec(line);
  assert.ok(list, `agent.md's tools is a one-line list: ${line}`);
  return list[1].split(",").map((t) => t.trim()).filter(Boolean);
}

test("agent.md's tools list bash_background, bash_output and bash_signal beside bash", () => {
  const tools = agentTools();
  for (const tool of ["bash", "bash_background", "bash_output", "bash_signal"])
    assert.ok(tools.includes(tool), `agent.md's tools [${tools.join(", ")}] lack ${tool}`);
});
