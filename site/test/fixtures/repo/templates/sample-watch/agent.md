---
name: sample-watch
display_name: "Sample watch: ${parameters.topic}"
version: 0.2.0
description: >
  Watches one topic every week and answers with what changed, each item dated
  and linked. A test fixture for the site build: <script>alert(1)</script> stays text.
license: Apache-2.0
author: { name: Parcha Labs }
repository: https://github.com/Parcha-ai/agentrun-templates
category: research
tags: [fixture]
harness: [pi, claude-agent, codex]
model:
  tier: fast
  prefer: openrouter/particle-ai/particle-1
  choices:
    - id: free
      label: Free model
      model: openrouter/example/free-1:free
      harness: pi
      secrets: [OPENROUTER_API_KEY]
      warning: "Its provider may log what it reads <script>alert(1)</script>."
      note: "Free accounts get 50 requests a day."
effort: low
tools: [web_search, web_fetch, read]
mcp:
  - source: github
    toolkit: github
    tools: [search_issues]
    required: false
    reason: "Reads open issues on the repository you name."
    allow: [search_issues]
inputs:
  company: { type: string, title: "Company name", description: "the company to watch", examples: ["Stripe, Inc."] }
  website: { type: string, format: uri, required: false, description: "its website" }
  limit: { type: integer, minimum: 1, maximum: 50, required: false, default: 10 }
  topics: { type: array, items: { type: string }, required: false }
parameters:
  topic: { type: string, required: false, description: "what to watch" }
  cron: { type: string, format: cron, default: "0 9 * * 1-5" }
  timezone: { type: string, format: timezone, default: Europe/Madrid }
budget: { per_run_usd: 0.40 }
learning: true
approvals: never
triggers:
  - name: weekly
    source: { kind: schedule, cron: "${parameters.cron}", timezone: "${parameters.timezone}" }
    target: { kind: start_run, input: { content: "Scheduled run." } }
output: { schema: watch.schema.json }
---

# Sample watch

Read the [skill](javascript:alert(1)) and follow it. <img src=x onerror=alert(1)>
