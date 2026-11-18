# AgentRun templates

Agents that already do a job, ready to install on your own AgentRun. Each folder under `templates/` is one template:
its instructions, skills, rules, eval cases and a sample of its output. `.agentrun/marketplace.json` lists every
template, ours and the community's; the site at marketplace.agentrun.ai is built from it.

Install one from your AgentRun console (Templates, Add from URL), or from a terminal on the machine where your
AgentRun runs:

    npx @parcha/agentrun template install github:Parcha-ai/agentrun-templates/templates/<name> --dry-run
    npx @parcha/agentrun template install github:Parcha-ai/agentrun-templates/templates/<name> --trust

The first prints the whole package and stores nothing. The second imports it; `--trust` says you trust Parcha-ai, the
publisher (AgentRun asks once per publisher). It prints the console page that applies the template. No AgentRun yet?
`npx @parcha/agentrun` starts one.

Nothing is granted until you tick it on the apply screen.

## Composio slug check

`scripts/check-composio.mjs` confirms that every Composio tool (`tools`, `allow` and `pin` in an `mcp:` entry with
`source: composio`) and every Composio trigger event (`event` and `accept[].event` in a trigger with
`source: { kind: composio }`) a template names is still in Composio's live list, read at each toolkit's latest version.
It prints one line per slug that is gone, naming the template, the field and the slug, with a near match when one is
obvious, and exits 1; otherwise it prints one summary line. The `composio-check` workflow runs it daily and on pull
requests that change a template. Run it locally with Node 24 and any Composio project key:

    node --test 'scripts/test/*.test.mjs'
    COMPOSIO_API_KEY=... node scripts/check-composio.mjs
