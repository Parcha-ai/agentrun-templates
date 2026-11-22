---
type: llm
---
A release-film run on a fake fal, filming Parcha-ai/agentrun v0.1.0-beta.51 by hand at 9:16, tone playful. GitHub
marks the release a pre-release; a run by hand films any release. The notes show no image. They are 19,442 characters,
quoted whole at the end of this rubric: that quote is the only reference for what the release says. The calls show the
notes cut to their first part, so a claim missing from the calls is not missing from the notes; look it up in the
quote. (The quote stands in for whole call results, which graders do not get yet.)

Read the answer's last fenced `json` block and the calls. Pass only if all hold:

1. **One headline.** `story.headline` is one change the quoted notes state, not "a new release" or a list; the report
   names some of the changes it left out.
2. **Only the release's claims.** Judge `story.headline`, every sentence of the script and each beat's `on_screen`
   against the quoted notes, one claim at a time: each says only what the notes say (a playful framing of a stated
   change is fine); on-screen words are real text from the notes (a field name, a command, an error, a number) or
   short titles. No invented figure, praise or promise. Quote the notes' words for any claim you fail.
3. **Filmed though a pre-release.** `status` is `completed`, `release.prerelease` true, `release.tag`
   `v0.1.0-beta.51`.
4. **Vertical.** `film.width` 1080, `film.height` 1920, `film.seconds` between 29.5 and 30.5, as an `ffprobe` call in
   the run shows; `checks.check_errors` is 0; any `outside_safe_zone` warning is fixed or kept with a reason.
5. **Type alone.** No release image was saved (there is none); the avatar was saved to `media/mark.png` and used on
   the end card; no interface, dashboard or logo was drawn.
6. **Script.** `word_count` between 50 and 75, matching the script within 8 words; "beta fifty one" (or similar) is
   spelled as said.

Answer pass or fail, and quote what decided it.

The release notes, word for word (the release's `body` as the run fetched it):

<!-- quote fixtures/web.json fetch.answers.0.text.body -->
````text
This release fixes two ways a run on an Archil disk failed as a missing file, lets a person's answer reach an ACP agent that asks for another command, and tidies email, templates and approvals. A pending approval says why it asks in a field of its own, `asks_because`, and no longer among the call's arguments (breaking for a client that read `args_preview.asked_because`). Settings → Email's Save signs in before it keeps the account, an email trigger has its own page and form in the console, and a template's apply answer says what it did to the agent (`agent_change`) and lists every trigger it made or kept. A runner shared by many customers keeps per-run users with the server's user in one group, and its operator can bound the private hosts an owner may allow. On Postgres the store moves to migration 0024, which beta.50 does not open, so back up the Postgres schema before you upgrade; a SQLite store stays at version 14. The box image is beta.50's.

**Upgrading and going back:**

- The store moves on Postgres. At its start the server applies migration `0024_runner_capacity.sql`, which adds `version` and `slots` to `runners` and a `hand_backs` table (#3350). It is additive: a beta.50 runner already running keeps working beside it, but one that starts after it refuses the store, so roll Postgres runners with the server, as before. beta.50 refuses a Postgres store once this release opened it ("set up by a later release than this one"), so back up the Postgres schema before you upgrade; going back to beta.50 is that backup and the beta.50 image or package. A SQLite store stays at version 14: the server adds the same columns and table at its start, and beta.50 opens it as it is. An approval this release left pending shows in beta.50 without why it asks. From beta.49 or older, read beta.50's notes first: it moves a Postgres store to migration 0023, which beta.49 does not open.
- The box image's recipe did not move since beta.50 (hash `ed5aee54d3ea`), so a Daytona snapshot or a relay set up for beta.50 holds.
- With Archil on (Mode 2), uploads move to the server's own Archil disk, `agentrun-<server id>-files`, made by the first upload. A file uploaded before this release stays in `DIR/files/` and is not seen while Archil is on: upload it again. An uploaded file that no run names is now deleted after `AGENTRUN_UPLOAD_RETENTION` (default `7d`; `off` keeps every file). Mode 1 is unchanged (#3348).
- `PUT /v2/settings/email` now signs in to IMAP and SMTP before it saves, as `POST /v2/settings/email/test` does. A password either server refuses, or a server it can't reach, is `424 upstream_failed` with nothing saved; it used to save any password and answer 200 (#3357).
- The image's run helper (`agentrun-runas`, per-run users) now needs a fourth capability, `CHOWN`, beside `SETUID`, `SETGID` and `SETPCAP`: it gives a run's folders to the run's user and back. The Helm chart keeps all four. A deployment of your own that drops every capability and adds the helper's back adds `CHOWN` too; without it the kernel refuses to start the helper (#3358).

**Breaking:**

- A pending approval says why a call its setting allows asks in a field of its own, `asks_because` (on `pending` of `GET /v2/runs/{run_id}` and the run list), and no longer among the call's arguments: `args_preview` is the model's arguments alone, with no `asked_because` key, and `summary` no longer ends "Asks because ...". A client that read the reason from `args_preview`'s `asked_because` (or from the end of `summary`) breaks: read `asks_because` instead, absent on a call that asks by its setting. The console's approval card, on the run page and on Mission Control, says "Asks because <why>." above the arguments' box (#3357).

**Known issues:**

- Under the image's default command, no run can use a paired computer, a paired Linux sandbox included. Start the image with the server's options alone for one.
- A learned workflow refused for a host setting (a tool gated, denied or missing) still reads `serving`, while every run it is given hands back to the agent. A workflow this release's DSL refuses is held.
- For up to about 10 minutes after the release is published, an install can fail while npm shows the new packages one by one. Try again a few minutes later.
- An API token's `GET /v2/settings/calendar` is refused 403 in the words for saving a secret. Reading the calendar's settings takes the owner's signed-in session in the console, as saving them does.
- On Postgres a purge does not reach the database's bytes: `VACUUM` only makes a purged row's space reusable, `VACUUM FULL` rewrites the table, and Postgres's WAL, archived WAL and backups keep the old values for their own lifetimes.
- On SQLite, when a purge's scrub marker cannot be written (a full disk), the purge has still committed and its `DELETE` answers `500 internal`; a retried `DELETE` of that run answers `204` but does not write the marker again, so the next start does not scrub the log for that purge. beta.50 has this too.

**Changes:**

Runs and the server

- A run whose revision ships skills no longer fails at its claim on a fresh Archil folder with `".agents/skills" is not there` when it runs in its own process: a `WorkspaceError` crosses the run's channel as a `WorkspaceError` with its `code`, as the other run errors do. Runs in the runner's process were not affected (#3354).
- A disk removed at Archil while a run is on it now fails that run's next disk call as the disk being gone (`UNAVAILABLE`, in Archil's words), not as a missing file (#3363).
- A person's answer to an ACP agent's own tool call (Cursor's shell) reaches the run when the agent, started again, asks for another command instead: the adapter asks about each request the turn left waiting before it starts the agent, and with no answer yet the run parks again with no prompt sent. Before, the answer was never taken and the run restarted the agent every few seconds, each time with a new approval, until the plan's turn limit. An agent that keeps asking the person about other commands instead of the one they allowed ends its turn with `ACP_REASK_LIMIT` (#3356).

Templates, triggers and email

- `POST /v2/templates/{template}/apply` answers what it did to the agent: `agent_change` (`made`, `updated`, or `unchanged` for an update with `agent_id` whose package and parameters the current revision already holds, no revision written), with `revision_version` the agent's current revision once it is done, and `triggers`, every trigger the apply made or kept, each `{trigger_id, name, kind, enabled}` (`trigger_ids` is unchanged). The TypeScript and Python clients carry the new fields, and the console's apply result says it from the answer ("Nothing to update: rev 2 is current.") and lists each trigger by its name and kind (#3357).
- Settings → Email's Save signs in before it keeps the account (see Upgrading), and the console shows the refusal beside the form. An email trigger's page opens in the console (the account and mailbox it watches, how often, its last check, its filter, its agent and its firings, with Pause, Run now and Delete), and Triggers → New makes an email trigger; both carry the approval warning the other triggers' pages do. Triggers names an agent made after the console opened (#3357).

Learning

- A look-back cut by a stop or cancel is said as "a stop or cancel cut it while it wrote what it learned", and the learning state's `reflecting` description names the run's end it reads (#3357).

Console

- The console takes a run with only a field for an agent whose `input_schema` fields are all optional, as the server does, offers the Grade form on an ended run whose learning reads `reflecting` (saying a `409 run_learning` in the server's words), and says on a template's install page and on each Triggers row which tools wait for your approval (#3357).

Also in this release

- A runner that holds many customers' runs keeps per-run users without putting the server's user in 256 groups: in the image that user is in its own group alone, so a platform that reads a user's groups at start can run the image with per-run users on, and `AGENTRUN_RUN_USER=same` is no longer needed there. A run's folders are given to its slot before it starts and back to the server's user at its end; the `agentrun-runas` helper's `reown` and `reap --fix` are gone. A new operator switch, `AGENTRUN_PRIVATE_HOSTS`, bounds the private-network hosts an owner may allow an MCP server or a calendar on: unset, the owner's list holds, as before; `none` reads no owner's list (set it on a server or runner many customers share, and on each runner); a comma list of address ranges allows a listed host only inside them. The threat model is in [docs/multi-tenant-runners.md](https://github.com/Parcha-ai/agentrun/blob/main/docs/multi-tenant-runners.md) (#3358).
- An ACP agent (Cursor) that skipped a command the person allowed no longer has its turn cut after three more commands its tool setting allows: only commands that wait for the person count toward `REASK_LIMIT`. An allow-once is now used once: if a later agent process in the same turn asks for the same command again, the person is asked again instead of the old allow running it a second time (#3370).
- `GET /v2/capacity` (`capacity/1`) says how much room the runners have, read from the store alone, so a server with no runner beside it (`--no-runner`, `AGENTRUN_API_ONLY=1`, where it is served too) answers for every runner on its store. It gives the runs waiting for a runner (`runs.queued`: queued, handed back, or with a claim that ran out, past any backoff) and the runs a live claim holds (`runs.executing`). It lists each live runner by name with its build's `version`, its `slots` (the most runs it holds at once), what it holds (`executing`) and its `free_slots`, plus the total `free_slots`. It counts the runs handed back still running within `?window=` minutes (`hand_backs`: 1 to 1440, default 15). It names no run, agent or address, and it takes the server's token like every route but capabilities and health. An operator or a scaler reads it to size the runners by backlog, not CPU (#3350).
- A runner on Postgres no longer needs the store's schema to match its own version exactly. The server can migrate first while the earlier release's runners keep running, as long as the migrations are additive. Each store keeps a runner floor: the oldest schema version a runner's build must know. A migration marked `-- runners: breaking` raises the floor to its own version. Every runner reads the floor again every 10 s, whether or not it holds runs. When the floor rises above its version, it claims nothing more, drains, hands its runs back and exits 3. A runner that starts below the floor exits 3 and says to run a runner of the server's release. A runner on a store its server has not migrated yet still exits 3, as before. Runners of earlier releases still need an exact match, so roll this release's runners with its server as before; from this release on, a runner keeps running beside the next releases' additive migrations (#3360).
  - `agentrun-serve store-schema [--data DIR]` prints the store's schema version and runner floor beside this build's version, and what this build's server and runner do on that store, as one line of JSON. It reads only: no lock, no migration. `--build` prints the build's own versions with no store. `GET /v2/capabilities` carries the same live values in `store_schema` (`version`, `runner_floor`, `known`), for a deploy check that refuses a build older than its store.
  - A Postgres migration that drops or renames anything, changes a column's type, makes a column NOT NULL, or adds a NOT NULL column with no default must carry the `-- runners: breaking` header. A test fails one that does not. Migrations up to 0022 predate the rule and count as breaking; 0023, the first the lint reads, is additive. A SQLite runner still opens only its own schema version.
- With Archil on (Mode 2), uploads live on Archil and the server places a run's files in its folder at the run's start, so a runner reads no upload and needs no disk of the server's. `POST` and `PUT /v2/files` keep each file on the server's own uploads disk, `agentrun-<server id>-files` (made by the first upload), at `files/<file_id>/`, and listing, reading and deleting read it there. A run started with `file_ids` has each file copied into its folder at `work/inputs/<path>` before it is queued (2 files at a time across every start on the server, at most 45 s). Its launch records `files_placed` and the disk it used, and its claim copies nothing. A copy that fails refuses the start with `424 upstream_failed` in words, and no run is made (#3348).
- Connect independently started Codex CLI and Claude Code sessions with `learning connect`, without
  an SDK wrapper or replacing the source task launcher. Hooks record completed prompt windows and
  reported usage; later prompts receive pinned owner corrections from AgentRun. Source task dialogue
  never becomes a standing correction automatically. Source hooks do not expose a workflow execution
  bridge or launch extra native reflection sessions. Retired automatic notes and skills stay on disk
  but are not served or converted to owner corrections. Existing CLI profiles with a stored
  `learning: "notes"` setting read as enabled under the current learning model; new definitions use
  its boolean or loop settings.

  Connection credentials are scoped, installation preserves unrelated hooks, and disconnect removes
  only its own hooks. Incomplete evidence and cancellations stay explicit. The console offers capture
  and correction delivery enrollment for existing applications while execution and editing stay in
  their original setup. Initial enrollment requires a local AgentRun server and the selected CLI's
  sign-in; metadata observation alone does not enable it.

  Private pending capture journals are bound to their destination and credential generation. A reconnect
  starts a fresh journal; prior or unbound records remain on disk and are not automatically migrated,
  uploaded or deleted. `learning retry` reports `blocked_journals` and exits with status 1 when those
  records need review.

  Disconnect disables local capture before removing hooks or contacting the server. If server revocation is
  pending, loaded hooks and retries stay disabled until disconnect completes; status exposes `capture_enabled`.
  Retries advance across retained sessions, queued hooks and unfinished turns so older entries cannot indefinitely
  hide later uploads. Interrupted connection commands recover an abandoned lock while a live owner keeps it.
  Recovery also recognizes a proven previous kernel boot on the same host. A different namespace from the
  same boot, or an unknown boot identity, stays protected until its owner's death can be established.
  Project installer and shared Codex hook locks now keep private owner records and recover after a proven
  owner death. Legacy empty or malformed installer locks stay protected regardless of age; the error names
  the lock and requires stopping and verifying all relevant installers before manually removing that lock.
- Observe token usage from already-running Codex sessions without restarting their native processes. Polling subscriptions follow loaded interactive, exec and delegated sessions; explicitly selected historical sessions remain available. Input, output and reported cache counters use native model metadata and source UTC dates, with cumulative baselines, atomic local checkpoints and sequence deduplication preventing duplicate accounting.

  Polling usage requires the receiver’s advertised capability. Existing lifetime totals are not backfilled; missing counters, tail gaps and queue drops remain partial coverage. Conversation content stays local, existing learning consent is unchanged, and OTLP ingestion keeps its existing behavior.

  Selected failed sessions remain eligible for bounded usage polling, so counters flushed after Codex reports a system error are retained. Acknowledged counters are not counted again after another poll or a connector restart.
- Keep agent cards focused on status and Run/Edit actions. Learning setup, verification and settings
  remain on the agent detail page; cards show a compact learning status without an Enable button.
- The CLI capture API uses `agentrun cli-learning enroll|list|revoke|start|get|events|complete`.
  Its earlier generated `CLI learning` group was one word internally and did not accept the documented
  invocations. The generated TypeScript resource is `cliLearning` with the same verbs, and Python uses
  `cli_learning`; API paths and operation IDs are unchanged. The local `learning connect`, `status`,
  `disconnect`, `retry` and `hook` commands and the existing learning API commands keep their routes.
- Show connected coding agents in the same searchable inventory and count as registered agents, with
  project, session, model, activity and token details. Preserve loaded cards when another source is
  loading or unavailable, and exclude nonarchivable connections from the archived view.

  Identify coding sessions by their native title, project basename or delegated task name, with a stable
  ID suffix for unnamed sessions. Names refresh even while idle. The observer sends bounded labels only
  to receivers advertising support; prompts, conversation previews, full paths and obvious credentials
  are excluded. Token accounting and selection scopes stay unchanged.
  Unicode labels respect queue and delivery byte limits so long multilingual names cannot stall delivery.
- Give connected coding sessions the same card layout and coding-agent Run/Edit handoffs as other
  agents, with learning status and setup or settings actions. Project learning connections remain
  available in Learning Dojo but no longer appear as duplicate agents in the active inventory.

  The connector can associate a session with an existing project/runtime learning connection using
  its installed hook receipt and a scoped proof. Learning is shown as on only after that exact session
  has reported a hook window and the server and project settings allow learning. Missing setup,
  unverified activation and unsupported delegated sessions remain explicit. Revoked or invalid proofs
  do not grant access or prevent ordinary activity and token reports. This does not install hooks,
  enroll additional projects, import conversations or change how coding sessions are started.
- Template packages such as Inbound Lead and KYB accept and retain their `learning.agree_on` settings through import, apply and later edits. A learned workflow's promotion check and shadow audit compare the declared answer fields, with each dotted path required in the template's output schema; a missing path disagrees. Without `agree_on`, the existing whole-answer comparison remains. The console and API describe which fields the check compared.

## Install

- Server: `npx @parcha/agentrun-serve@0.1.0-beta.51`; every `@parcha/agentrun-*` package of this release is 0.1.0-beta.51 on npm
- Launcher and CLI: `npx @parcha/agentrun@0.4.19`
- Python client: `pip install parcha-agentrun==0.3.19`
- Server image: `docker pull ghcr.io/parcha-ai/agentrun-server:v0.1.0-beta.51` (linux/amd64, linux/arm64)
- Helm chart: `helm install agentrun oci://ghcr.io/parcha-ai/charts/agentrun --version 0.1.0-beta.51`

````
<!-- /quote -->
