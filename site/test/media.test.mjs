import { test } from "node:test";
import assert from "node:assert/strict";
import { copyFileSync, cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "../build.mjs";
import { check } from "../check.mjs";
import { MEDIA_TYPES, mediaSize } from "../lib/media.mjs";
import { SiteError } from "../lib/packages.mjs";
import { CSP, MEDIA_CONTENT_TYPES, parseRange, siteServer } from "../lib/server.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "fixtures", "repo");
const media = join(here, "fixtures", "media");
const SHA = "0123456789abcdef0123456789abcdef01234567";
const BASE = "https://marketplace.agentrun.ai";
const URL_OF = (file) => `/templates/sample-watch/samples/acme/${file}`;

/** A copy of the fixture repo whose acme sample has `files` in media/ ({name: fixture file or Buffer}) and `report`. */
function repoWith(files, report) {
  const root = mkdtempSync(join(tmpdir(), "site-media-repo-"));
  cpSync(fixture, root, { recursive: true });
  const dir = join(root, "samples", "sample-watch", "acme", "media");
  mkdirSync(dir, { recursive: true });
  for (const [name, from] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, name)), { recursive: true });
    if (Buffer.isBuffer(from)) writeFileSync(join(dir, name), from);
    else copyFileSync(join(media, from), join(dir, name));
  }
  if (report !== undefined) {
    const out = join(root, "samples", "sample-watch", "acme", "output.json");
    writeFileSync(out, JSON.stringify({ ...JSON.parse(readFileSync(out, "utf8")), report_markdown: report }));
  }
  return root;
}

async function built(root) {
  const out = mkdtempSync(join(tmpdir(), "site-media-dist-"));
  const cache = mkdtempSync(join(tmpdir(), "site-media-cache-"));
  try {
    await build({ root, out, sha: SHA, offline: true, cacheDir: cache, log: () => {} });
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
  return out;
}

const REPORT = [
  "# Acme this week",
  "",
  "![A dot](media/dot.png)",
  "",
  "![The clip](media/tiny.mp4)",
  "",
  "![Narration](./media/clip.mp3)",
  "",
  "Get [the full image](media/dot.png). A [missing one](media/nope.png) and ![another](media/nope.png).",
  "",
  "![third party](https://cdn.example/x.png) and <img src=x onerror=alert(1)>.",
  "",
].join("\n");

test("image, mp4 and webp headers give their pixel size; other bytes give none", () => {
  const size = (f) => mediaSize(readFileSync(join(media, f)), f);
  assert.deepEqual(size("dot.png"), { width: 8, height: 6 });
  assert.deepEqual(size("dot.jpg"), { width: 10, height: 6 });
  assert.deepEqual(size("dot.gif"), { width: 12, height: 4 });
  assert.deepEqual(size("dot.webp"), { width: 14, height: 8 }, "VP8");
  assert.deepEqual(size("dot-lossless.webp"), { width: 14, height: 10 }, "VP8L");
  assert.deepEqual(size("dot-alpha.webp"), { width: 16, height: 12 }, "VP8X");
  assert.deepEqual(size("tiny.mp4"), { width: 64, height: 36 }, "the video track, not the audio track's 0x0");
  assert.deepEqual(size("big.mp4"), { width: 1600, height: 900 });
  assert.equal(size("clip.mp3"), null);
  assert.equal(mediaSize(Buffer.from("not an image at all"), "x.png"), null);
  assert.equal(mediaSize(readFileSync(join(media, "dot.png")).subarray(0, 12), "x.png"), null, "a cut-off header");
  assert.equal(mediaSize(Buffer.alloc(64), "x.mp4"), null);
});

test("the server's media content types are lib/media.mjs's list", () => {
  assert.deepEqual(MEDIA_CONTENT_TYPES, Object.fromEntries(Object.entries(MEDIA_TYPES).map(([ext, m]) => [ext, m.type])));
});

test("a sample's media plays on its template page from this site, and the Markdown twin links each file", async () => {
  const root = repoWith({ "dot.png": "dot.png", "tiny.mp4": "tiny.mp4", "tiny.vtt": "tiny.vtt", "clip.mp3": "clip.mp3", "extra.jpg": "dot.jpg", "aside.mp3": "clip.mp3" }, REPORT);
  const out = await built(root);
  try {
    assert.deepEqual(check({ dir: out, baseUrl: BASE }).problems, []);
    const page = readFileSync(join(out, "templates", "sample-watch", "index.html"), "utf8");
    const report = /<article class="report card">([\s\S]*?)<\/article>/.exec(page)[1];
    // An image token naming a file in media/ is an img with its size; a video is a player with its captions; audio too.
    assert.match(report, new RegExp(`<img src="${URL_OF("dot.png")}" alt="A dot" loading="lazy" width="8" height="6">`));
    assert.match(report, new RegExp(`<video controls preload="metadata" playsinline width="64" height="36" src="${URL_OF("tiny.mp4")}" aria-label="The clip"><track kind="captions" src="${URL_OF("tiny.vtt")}" label="Captions" default><a href="${URL_OF("tiny.mp4")}">The clip</a></video>`));
    assert.match(report, new RegExp(`<audio controls preload="metadata" src="${URL_OF("clip.mp3")}" aria-label="Narration"><a href="${URL_OF("clip.mp3")}">Narration</a></audio>`));
    // A link to a media file points at the copy; one to a file that isn't there stays text, as any relative link does.
    assert.match(report, new RegExp(`Get <a href="${URL_OF("dot.png")}">the full image</a>\\. A missing one and another\\.`));
    // Everything else as before: a third-party image is a link, never loaded, and raw HTML is text.
    assert.match(report, /<a href="https:\/\/cdn\.example\/x\.png" rel="nofollow noopener" target="_blank">third party<\/a>/);
    assert.match(report, /&lt;img src=x onerror=alert\(1\)&gt;/);
    assert.doesNotMatch(page, /src="https:\/\/cdn\.example/);
    // Files the report never names follow it, each under its name; captions belong to their video, never listed.
    const rest = /<div class="sample-media">([\s\S]*?)<\/div>/.exec(page)[1];
    assert.deepEqual([...rest.matchAll(/<figcaption><code>([^<]+)<\/code><\/figcaption>/g)].map((m) => m[1]), ["aside.mp3", "extra.jpg"]);
    assert.match(rest, new RegExp(`<figure><audio controls preload="metadata" src="${URL_OF("aside.mp3")}">`));
    assert.match(rest, new RegExp(`<figure><img src="${URL_OF("extra.jpg")}" alt="" loading="lazy" width="10" height="6">`));
    assert.ok(page.indexOf('class="report card"') < page.indexOf('class="sample-media"'), "the rest come after the report");
    assert.doesNotMatch(page, /\sstyle="/);
    // The build copied each file, byte for byte, beside the page.
    for (const [name, from] of [["dot.png", "dot.png"], ["tiny.mp4", "tiny.mp4"], ["tiny.vtt", "tiny.vtt"], ["clip.mp3", "clip.mp3"], ["extra.jpg", "dot.jpg"]]) {
      assert.deepEqual(readFileSync(join(out, URL_OF(name))), readFileSync(join(media, from)), name);
    }
    const md = readFileSync(join(out, "templates", "sample-watch.md"), "utf8");
    for (const f of ["aside.mp3", "clip.mp3", "dot.png", "extra.jpg"]) assert.match(md, new RegExp(`^- \\[${f.replace(".", "\\.")}\\]\\(${BASE}${URL_OF(f)}\\)$`, "m"));
    assert.match(md, new RegExp(`^- \\[tiny\\.mp4\\]\\(${BASE}${URL_OF("tiny.mp4")}\\), captions: ${BASE}${URL_OF("tiny.vtt")}$`, "m"));
    assert.match(md, new RegExp(`!\\[A dot\\]\\(${BASE}${URL_OF("dot.png")}\\)`), "the report's own media links are full URLs in the twin");
    assert.match(md, /!\[another\]\(media\/nope\.png\)/, "a name with no file is left alone");
    // The CSS sizes the players; corners stay square.
    const css = readFileSync(join(out, "assets", "site.css"), "utf8");
    assert.match(css, /\.report :is\(img, video\), \.sample-media :is\(img, video\) \{[^}]*max-width: 100%; height: auto; border-radius: 0;/);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("a sample with only media and no report shows every file", async () => {
  const root = repoWith({ "dot.png": "dot.png" });
  const out = await built(root);
  try {
    const page = readFileSync(join(out, "templates", "sample-watch", "index.html"), "utf8");
    assert.match(page, /<div class="sample-media"><figure><img src="\/templates\/sample-watch\/samples\/acme\/dot\.png"/);
    assert.deepEqual(check({ dir: out, baseUrl: BASE }).problems, []);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
});

test("a file in media/ the site doesn't play fails the build, naming it", async () => {
  for (const [files, message] of [
    [{ "notes.txt": Buffer.from("x") }, /samples\/sample-watch\/acme\/media\/notes\.txt: \.txt isn't a media type/],
    [{ "movie.mov": Buffer.from("x") }, /media\/movie\.mov: \.mov isn't a media type/],
    [{ "sub/dot.png": "dot.png" }, /media\/sub\/dot\.png: media\/ is flat/],
    [{ "two words.png": "dot.png" }, /media\/two words\.png: name media files with/],
    [{ "orphan.vtt": "tiny.vtt" }, /media\/orphan\.vtt: captions need the \.mp4 with the same name, orphan\.mp4/],
  ]) {
    const root = repoWith(files);
    try {
      await assert.rejects(built(root), (err) => err instanceof SiteError && message.test(err.message), Object.keys(files)[0]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test("check fails a template over the media budget, a video over 720p, and a type it doesn't allow, with the numbers", async () => {
  const pad = Buffer.alloc(8 * 1024 * 1024 - 1000);
  const root = repoWith({ "big.mp4": "big.mp4", "pad.wav": pad, "dot.png": "dot.png" });
  const out = await built(root);
  try {
    writeFileSync(join(out, URL_OF("stray.exe")), "x");
    const problems = check({ dir: out, baseUrl: BASE }).problems;
    const total = 2124 + pad.length + 96 + 1;
    assert.deepEqual(problems.sort(), [
      "templates/sample-watch: sample media acme/big.mp4 is 1600x900; a video's shorter side is 720 px at most",
      "templates/sample-watch: sample media acme/stray.exe: .exe isn't an allowed type (.jpg .jpeg .png .webp .gif .mp4 .mp3 .m4a .wav .ogg .vtt)",
      `templates/sample-watch: sample media total ${total} bytes (${(total / 1048576).toFixed(2)} MiB), over the 8.00 MiB a template may ship; the largest file is acme/pad.wav at ${pad.length} bytes`,
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
  // Under the budget and at 720p or less passes.
  const ok = repoWith({ "tiny.mp4": "tiny.mp4", "pad.wav": Buffer.alloc(1024 * 1024) });
  const okOut = await built(ok);
  try {
    assert.deepEqual(check({ dir: okOut, baseUrl: BASE }).problems, []);
  } finally {
    rmSync(ok, { recursive: true, force: true });
    rmSync(okOut, { recursive: true, force: true });
  }
});

test("a byte range is parsed as RFC 9110 says for one range", () => {
  assert.deepEqual(parseRange("bytes=0-9", 100), { start: 0, end: 9 });
  assert.deepEqual(parseRange("bytes=90-", 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange("bytes=-10", 100), { start: 90, end: 99 });
  assert.deepEqual(parseRange("bytes=-500", 100), { start: 0, end: 99 }, "a suffix longer than the file is the whole file");
  assert.deepEqual(parseRange("bytes=50-500", 100), { start: 50, end: 99 }, "an end past the file stops at its last byte");
  assert.equal(parseRange("bytes=100-", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=-0", 100), "unsatisfiable");
  assert.equal(parseRange("bytes=0-", 0), "unsatisfiable");
  for (const ignored of [undefined, "", "bytes=9-0", "bytes=0-1,5-6", "items=0-1", "bytes=-", "bytes=a-b"]) assert.equal(parseRange(ignored, 100), null, String(ignored));
});

test("the server answers a byte range with 206, an impossible one with 416, streams files, and keeps HEAD", async () => {
  const dir = mkdtempSync(join(tmpdir(), "site-media-serve-"));
  const mp4 = readFileSync(join(media, "tiny.mp4"));
  mkdirSync(join(dir, "templates", "t", "samples", "c"), { recursive: true });
  writeFileSync(join(dir, "404.html"), "missing");
  writeFileSync(join(dir, "index.html"), "home");
  copyFileSync(join(media, "tiny.mp4"), join(dir, "templates", "t", "samples", "c", "tiny.mp4"));
  copyFileSync(join(media, "clip.mp3"), join(dir, "templates", "t", "samples", "c", "clip.mp3"));
  copyFileSync(join(media, "dot.jpg"), join(dir, "templates", "t", "samples", "c", "dot.jpg"));
  const servers = [siteServer({ root: dir, dev: true }), siteServer({ root: dir })];
  for (const s of servers) await new Promise((ok) => s.listen(0, "127.0.0.1", ok));
  const [devBase, prodBase] = servers.map((s) => `http://127.0.0.1:${s.address().port}`);
  const path = "/templates/t/samples/c/tiny.mp4";
  const get = async (p, init = {}, base = devBase) => {
    const res = await fetch(base + p, init);
    return { status: res.status, headers: res.headers, body: Buffer.from(await res.arrayBuffer()) };
  };
  try {
    const whole = await get(path);
    assert.equal(whole.status, 200);
    assert.deepEqual(whole.body, mp4);
    assert.equal(whole.headers.get("accept-ranges"), "bytes");
    assert.equal(whole.headers.get("content-type"), "video/mp4");
    assert.equal(whole.headers.get("content-length"), String(mp4.length));
    assert.equal(whole.headers.get("content-security-policy"), CSP);
    for (const [range, start, end] of [["bytes=0-1", 0, 1], ["bytes=100-", 100, mp4.length - 1], ["bytes=-16", mp4.length - 16, mp4.length - 1], ["bytes=10-99999999", 10, mp4.length - 1]]) {
      const part = await get(path, { headers: { range } });
      assert.equal(part.status, 206, range);
      assert.equal(part.headers.get("content-range"), `bytes ${start}-${end}/${mp4.length}`, range);
      assert.equal(part.headers.get("content-length"), String(end - start + 1), range);
      assert.deepEqual(part.body, mp4.subarray(start, end + 1), range);
    }
    const tooFar = await get(path, { headers: { range: `bytes=${mp4.length}-` } });
    assert.equal(tooFar.status, 416);
    assert.equal(tooFar.headers.get("content-range"), `bytes */${mp4.length}`);
    assert.equal(tooFar.headers.get("content-security-policy"), CSP);
    const several = await get(path, { headers: { range: "bytes=0-1,4-5" } });
    assert.equal(several.status, 200, "several ranges get the whole file");
    assert.deepEqual(several.body, mp4);
    // HEAD: the same headers, no body, with and without a range.
    const head = await get(path, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(head.headers.get("content-length"), String(mp4.length));
    assert.equal(head.body.length, 0);
    const headPart = await get(path, { method: "HEAD", headers: { range: "bytes=0-9" } });
    assert.equal(headPart.status, 206);
    assert.equal(headPart.headers.get("content-length"), "10");
    assert.equal(headPart.body.length, 0);
    assert.equal((await get("/", { method: "HEAD" })).headers.get("content-length"), "4");
    // A missing file is the 404 page, whole, whatever range was asked.
    const missing = await get("/templates/t/samples/c/nope.mp4", { headers: { range: "bytes=0-1" } });
    assert.equal(missing.status, 404);
    assert.equal(missing.body.toString(), "missing");
    // Content types, and in production media keeps a day like /assets/ while pages keep five minutes.
    assert.equal((await get("/templates/t/samples/c/clip.mp3")).headers.get("content-type"), "audio/mpeg");
    assert.equal((await get("/templates/t/samples/c/dot.jpg")).headers.get("content-type"), "image/jpeg");
    assert.equal((await get(path, {}, prodBase)).headers.get("cache-control"), "public, max-age=86400");
    assert.equal((await get("/", {}, prodBase)).headers.get("cache-control"), "public, max-age=300");
    assert.equal((await get("/templates/t/samples/c/nope.mp4", {}, prodBase)).headers.get("cache-control"), "public, max-age=300", "a 404 isn't kept a day");
    assert.equal(whole.headers.get("cache-control"), "no-store", "a local look caches nothing");
  } finally {
    for (const s of servers) await new Promise((ok) => s.close(ok));
    rmSync(dir, { recursive: true, force: true });
  }
});

test("an uppercase extension the build accepts is served with its type and kept a day", async () => {
  const dir = mkdtempSync(join(tmpdir(), "site-media-case-"));
  mkdirSync(join(dir, "m"), { recursive: true });
  writeFileSync(join(dir, "404.html"), "missing");
  copyFileSync(join(media, "tiny.vtt"), join(dir, "m", "tiny.VTT"));
  copyFileSync(join(media, "dot.jpg"), join(dir, "m", "dot.JPG"));
  const server = siteServer({ root: dir });
  await new Promise((ok) => server.listen(0, "127.0.0.1", ok));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const [file, type] of [["tiny.VTT", "text/vtt; charset=utf-8"], ["dot.JPG", "image/jpeg"]]) {
      const res = await fetch(`${base}/m/${file}`);
      await res.arrayBuffer();
      assert.equal(res.status, 200, file);
      assert.equal(res.headers.get("content-type"), type, file);
      assert.equal(res.headers.get("cache-control"), "public, max-age=86400", file);
    }
  } finally {
    await new Promise((ok) => server.close(ok));
    rmSync(dir, { recursive: true, force: true });
  }
});

const FORMS = [
  "Code stays code: `![Preview](media/dot.png \"Preview\")`, even with the same text as the image after it.",
  "",
  "![Preview](media/dot.png \"Preview\")",
  "",
  "[Download captions](media/tiny.vtt) and ![not a player](media/tiny.vtt).",
  "",
  "See ![the clip][clip] and [the dot][preview].",
  "",
  "[![framed](media/dot.png)](<./media/tiny.mp4>)",
  "",
  "Code stays code: `![x](media/dot.png)`.",
  "",
  "[preview]: media/dot.png \"The dot\"",
  "[clip]: ./media/tiny.mp4",
  "",
].join("\n");

/** The fixture built with FORMS as the acme report, handed to `fn(out)`. */
async function withForms(fn) {
  const root = repoWith({ "dot.png": "dot.png", "tiny.mp4": "tiny.mp4", "tiny.vtt": "tiny.vtt" }, FORMS);
  const out = await built(root);
  try {
    assert.deepEqual(check({ dir: out, baseUrl: BASE }).problems, []);
    await fn(out);
  } finally {
    rmSync(root, { recursive: true, force: true });
    rmSync(out, { recursive: true, force: true });
  }
}

test("a link to captions points at the copy; an image token naming them is no player; reference forms render", () => withForms((out) => {
  const page = readFileSync(join(out, "templates", "sample-watch", "index.html"), "utf8");
  const html = /<article class="report card">([\s\S]*?)<\/article>/.exec(page)[1];
  assert.match(html, new RegExp(`<img src="${URL_OF("dot.png")}" alt="Preview" loading="lazy" width="8" height="6">`), "a titled image");
  assert.match(html, new RegExp(`<a href="${URL_OF("tiny.vtt")}">Download captions</a> and not a player\\.`));
  assert.doesNotMatch(html, /<(video|audio|img)[^>]*tiny\.vtt/, "an image token naming captions is no player");
  assert.match(html, new RegExp(`See <video [^>]*src="${URL_OF("tiny.mp4")}"[^>]*>[\\s\\S]*?</video> and <a href="${URL_OF("dot.png")}">the dot</a>\\.`), "reference forms");
}));

test("the Markdown twin points every link, image and definition naming a media file at its full URL", () => withForms((out) => {
  const md = readFileSync(join(out, "templates", "sample-watch.md"), "utf8");
  const abs = (f) => `${BASE}${URL_OF(f)}`;
  assert.ok(md.includes(`![Preview](${abs("dot.png")} "Preview")`), "a titled image");
  assert.ok(md.includes(`[Download captions](${abs("tiny.vtt")})`), "a link to captions");
  assert.ok(md.includes(`![not a player](${abs("tiny.vtt")})`));
  assert.ok(md.includes(`[preview]: ${abs("dot.png")} "The dot"`), "a reference definition");
  assert.ok(md.includes(`[clip]: ${abs("tiny.mp4")}`), "a reference definition with ./");
  assert.ok(md.includes(`[![framed](${abs("dot.png")})](<${abs("tiny.mp4")}>)`), "an image inside a link, and an <angle> target");
  assert.ok(md.includes("See ![the clip][clip] and [the dot][preview]."), "reference uses stay as written");
  assert.ok(md.includes("Code stays code: `![x](media/dot.png)`."), "code is not a link");
  assert.ok(md.includes("Code stays code: `![Preview](media/dot.png \"Preview\")`, even"), "code before an identical link stays as written");
}));

test("the CSP lets media load from this site only", () => {
  assert.match(CSP, /(^|; )media-src 'self'(;|$)/);
  assert.doesNotMatch(CSP, /https?:|\*/, "no other origin, no wildcard");
});
