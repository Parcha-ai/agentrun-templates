// Everything the build reads from GitHub. Package files come through git (a shallow, blobless fetch of the one commit,
// blobs read on demand), so reading a bundled template costs no API quota and never truncates. The REST API is used
// only for a repository's stars and forks, anonymously, cached to a file; when it is rate-limited or down the build
// keeps the last cached numbers, or shows none.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OWNER = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/;
const REPO = /^[A-Za-z0-9._-]{1,100}$/;
const SHA = /^[0-9a-f]{40}$/;
const STATS_TTL_MS = 6 * 60 * 60 * 1000;

export function validRepo(owner, repo) {
  return OWNER.test(owner) && REPO.test(repo) && repo !== "." && repo !== "..";
}

function git(args, opts = {}) {
  return execFileSync("git", ["-c", "protocol.allow=never", "-c", "protocol.https.allow=always", "-c", "core.hooksPath=/dev/null", ...args], {
    encoding: opts.encoding ?? "utf8",
    input: opts.input,
    maxBuffer: 64 << 20,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_ASKPASS: "/bin/false" },
    timeout: opts.timeout ?? 120_000,
  });
}

export class GitHub {
  constructor({ cacheDir, offline = false, log = () => {} }) {
    this.cacheDir = cacheDir;
    this.offline = offline;
    this.log = log;
    mkdirSync(cacheDir, { recursive: true });
    this.statsFile = join(cacheDir, "github-stats.json");
    this.refsFile = join(cacheDir, "github-refs.json");
    this.stats = readJson(this.statsFile) ?? {};
    this.refs = readJson(this.refsFile) ?? {};
  }

  url(owner, repo) {
    return `https://github.com/${owner}/${repo}`;
  }

  /** A ref (branch, tag, full sha, or undefined for the default branch) as a full commit sha. Falls back to the last
   *  sha this cache resolved it to when GitHub can't be reached. */
  resolve(owner, repo, ref) {
    if (ref && SHA.test(ref)) return ref;
    const key = `${owner}/${repo}@${ref ?? "HEAD"}`;
    if (!this.offline) {
      try {
        const out = git(["ls-remote", this.url(owner, repo), ...(ref ? [ref, `refs/tags/${ref}^{}`] : ["HEAD"])], { timeout: 30_000 });
        const rows = out.trim().split("\n").filter(Boolean).map((line) => line.split("\t"));
        const pick = (name) => rows.find(([, n]) => n === name)?.[0];
        const sha = ref
          ? pick(`refs/tags/${ref}^{}`) ?? pick(`refs/tags/${ref}`) ?? pick(`refs/heads/${ref}`) ?? pick(ref)
          : pick("HEAD");
        if (sha && SHA.test(sha)) {
          this.refs[key] = sha;
          writeFileSync(this.refsFile, JSON.stringify(this.refs, null, 2) + "\n");
          return sha;
        }
        throw new Error(`no ref ${ref ?? "HEAD"}`);
      } catch (err) {
        this.log(`warn: could not resolve ${key} (${firstLine(err)}); using the cached sha`);
      }
    }
    if (this.refs[key]) return this.refs[key];
    throw new Error(`${key}: could not resolve the ref and no cached sha`);
  }

  /** A reader over one package folder at one commit. */
  reader(owner, repo, sha, path) {
    const bare = join(this.cacheDir, "git", `${owner}__${repo}.git`);
    if (!existsSync(join(bare, "HEAD"))) {
      mkdirSync(bare, { recursive: true });
      git(["init", "-q", "--bare", bare]);
      git(["-C", bare, "config", "remote.origin.url", this.url(owner, repo)]);
      git(["-C", bare, "config", "remote.origin.promisor", "true"]);
      git(["-C", bare, "config", "remote.origin.partialclonefilter", "blob:none"]);
    }
    let have = true;
    try { git(["-C", bare, "cat-file", "-e", `${sha}^{commit}`]); } catch { have = false; }
    if (!have) {
      if (this.offline) throw new Error(`${owner}/${repo}@${sha} is not in the cache and the build is offline`);
      git(["-C", bare, "fetch", "-q", "--depth", "1", "--filter=blob:none", "origin", sha]);
    }
    const prefix = path ? `${path}/` : "";
    // No -l: sizes would make git fetch every blob (eval fixtures included) one request at a time.
    const listing = git(["-C", bare, "ls-tree", "-r", "--full-tree", sha, "--", ...(path ? [path] : [])]);
    const files = new Map();
    for (const row of listing.split("\n").filter(Boolean)) {
      const [meta, name] = row.split("\t");
      const [mode, type, oid] = meta.split(/\s+/);
      if (!name.startsWith(prefix)) continue;
      // Links and submodules are refused, as the platform's own import refuses them.
      if (type !== "blob" || mode === "120000") continue;
      files.set(name.slice(prefix.length), { oid });
    }
    // Fetch, in one request, the blobs the site may read (everything but evals/), so reads don't each pay a lazy fetch.
    if (!this.offline) {
      const wanted = new Set([...files].filter(([rel]) => !rel.startsWith("evals/")).map(([, f]) => f.oid));
      const missing = git(["-C", bare, "rev-list", "--objects", "--missing=print", sha]).split("\n")
        .filter((l) => l.startsWith("?")).map((l) => l.slice(1).trim()).filter((oid) => wanted.has(oid));
      if (missing.length) git(["-C", bare, "-c", "fetch.negotiationAlgorithm=noop", "fetch", "-q", "--no-tags", "--no-write-fetch-head", "--filter=blob:none", "origin", ...missing]);
    }
    return {
      list: () => [...files.keys()].sort(),
      size: (rel) => {
        const f = files.get(rel);
        if (!f) return undefined;
        f.size ??= Number(git(["-C", bare, "cat-file", "-s", f.oid]).trim());
        return f.size;
      },
      read: (rel) => {
        const f = files.get(rel);
        if (!f) return undefined;
        return git(["-C", bare, "cat-file", "blob", f.oid]);
      },
    };
  }

  /** {stars, forks} for a repository, or null when GitHub never answered. Never throws. */
  async repoStats(owner, repo) {
    const key = `${owner}/${repo}`;
    const cached = this.stats[key];
    const fresh = cached && Date.now() - Date.parse(cached.fetched_at) < STATS_TTL_MS;
    if (this.offline || fresh) return cached?.missing ? null : cached ? { stars: cached.stars, forks: cached.forks } : null;
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { accept: "application/vnd.github+json", "user-agent": "agentrun-marketplace-site", "x-github-api-version": "2022-11-28" },
        signal: AbortSignal.timeout(15_000),
      });
      if (res.status === 404) {
        this.stats[key] = { missing: true, fetched_at: new Date().toISOString() };
      } else if (res.ok) {
        const body = await res.json();
        this.stats[key] = { stars: body.stargazers_count, forks: body.forks_count, fetched_at: new Date().toISOString() };
      } else {
        this.log(`warn: GitHub answered ${res.status} for ${key} (rate limit left: ${res.headers.get("x-ratelimit-remaining") ?? "?"}); keeping the cached stars`);
        return cached && !cached.missing ? { stars: cached.stars, forks: cached.forks } : null;
      }
      writeFileSync(this.statsFile, JSON.stringify(this.stats, null, 2) + "\n");
    } catch (err) {
      this.log(`warn: could not reach GitHub for ${key} (${firstLine(err)}); keeping the cached stars`);
      return cached && !cached.missing ? { stars: cached.stars, forks: cached.forks } : null;
    }
    const now = this.stats[key];
    return now.missing ? null : { stars: now.stars, forks: now.forks };
  }
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, "utf8")); } catch { return undefined; }
}

function firstLine(err) {
  return String(err?.stderr || err?.message || err).trim().split("\n")[0];
}
