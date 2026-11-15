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
