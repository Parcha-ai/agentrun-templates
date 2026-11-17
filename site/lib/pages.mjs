// The pages: each is real HTML a crawler reads (no client-side rendering), plus a Markdown twin with the same content.

import { CATEGORY_TEXT, computerWords, factsShort, isFree, keyWords, mcpWords, modelChoices, modelWords, requirements, testedLine, triggerLines, typeWords, unprovenWords } from "./describe.mjs";
import { markdownToHtml } from "./markdown.mjs";
import { clip, html, mdCode, mdText, plural, raw, upperFirst } from "./util.mjs";

export const SITE_NAME = "AgentRun Marketplace";
const PLATFORM = "AgentRun is an open-source platform for running agents: it adds learning, durable runs and a control plane on top of the agent harness you pick.";

// ---------- shared frame ----------

// agentrun.ai's product mark and the GitHub mark, inline so the header needs no image request.
const MARK = '<svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" fill="#ff8000"/><path d="M12 9l11 7-11 7z" fill="#000"/></svg>';
const GITHUB_MARK = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297a12 12 0 0 0-3.793 23.385c.6.111.82-.261.82-.577 0-.285-.011-1.04-.017-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.839 1.237 1.839 1.237 1.07 1.835 2.807 1.305 3.492.998.108-.776.418-1.305.762-1.605-2.665-.303-5.467-1.334-5.467-5.931 0-1.31.469-2.381 1.236-3.221-.124-.303-.536-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.5 11.5 0 0 1 3.003-.404c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.655 1.652.243 2.873.119 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.625-5.479 5.922.43.372.823 1.102.823 2.222 0 1.606-.015 2.898-.015 3.293 0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297Z"/></svg>';

function jsonLdTag(data) {
  return raw(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`);
}

export function layout(site, page) {
  const url = site.url(page.path);
  return `<!doctype html>\n${html`<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? "" : html`<link rel="canonical" href="${url}">`}
${page.mdPath ? html`<link rel="alternate" type="text/markdown" href="${page.mdPath}" title="This page as Markdown">` : ""}
<meta name="color-scheme" content="dark light">
${page.noindex ? raw('<meta name="robots" content="noindex">') : ""}
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${page.ogType ?? "website"}">
<meta property="og:title" content="${page.ogTitle ?? page.title}">
<meta property="og:description" content="${page.description}">
${page.noindex ? "" : html`<meta property="og:url" content="${url}">`}
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${page.ogTitle ?? page.title}">
<meta name="twitter:description" content="${page.description}">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/jetbrains-mono-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/schibsted-grotesk-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css?v=${site.assetVersion}">
${page.jsonLd ? jsonLdTag(page.jsonLd) : ""}
<script src="/assets/site.js?v=${site.assetVersion}" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap top-row">
    <a class="brand" href="/" aria-label="AgentRun Marketplace home">${raw(MARK)}agent<span class="brand-run">.run()</span><span class="brand-sub">Marketplace</span></a>
    <nav aria-label="Site">
      <a href="/"${page.nav === "home" ? raw(' aria-current="page"') : ""}>Templates</a>
      <a href="/list-your-template/"${page.nav === "list" ? raw(' aria-current="page"') : ""}>List your template</a>
      <a href="https://agentrun.ai/docs">Docs</a>
      <a href="${site.repoUrl}">${raw(GITHUB_MARK)}GitHub</a>
    </nav>
  </div>
</header>
<main id="main" class="wrap${page.mainClass ? ` ${page.mainClass}` : ""}">
${page.body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="foot-layout">
      <div class="foot-brand">
        <a class="brand" href="https://agentrun.ai/" aria-label="AgentRun">${raw(MARK)}agent<span class="brand-run">.run()</span></a>
        <p>${PLATFORM}</p>
      </div>
      <nav class="foot-cols" aria-label="Footer">
        <div><h2>Marketplace</h2><ul>
          <li><a href="/">All templates</a></li>
          <li><a href="/list-your-template/">List your template</a></li>
          <li><a href="${site.repoUrl}">Templates on GitHub</a></li>
          <li><a href="/llms.txt">For your agents</a></li>
        </ul></div>
        <div><h2>AgentRun</h2><ul>
          <li><a href="https://agentrun.ai/">agentrun.ai</a></li>
          <li><a href="https://agentrun.ai/docs">Documentation</a></li>
          <li><a href="https://agentrun.ai/docs/quickstart">Run your first agent</a></li>
          <li><a href="https://github.com/Parcha-ai/agentrun">AgentRun on GitHub</a></li>
        </ul></div>
        <div><h2>Company</h2><ul>
          <li><a href="https://grep.ai/">Grep AI</a></li>
          <li><a href="https://grep.ai/privacy">Privacy</a></li>
          <li><a href="https://grep.ai/terms">Terms of service</a></li>
        </ul></div>
      </nav>
    </div>
    <div class="foot-meta">
      <p>© 2026 Parcha Labs, Inc. Templates are Apache-2.0 unless their page says otherwise.</p>
      <nav aria-label="This page">${page.mdPath ? html`<a href="${page.mdPath}">This page as Markdown</a>` : ""}<a href="${site.repoUrl}/tree/${site.sha}">Built from ${site.sha.slice(0, 7)}</a></nav>
    </div>
  </div>
</footer>
</body>
</html>`}\n`;
}

function crumbs(site, items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map(([name, path], k) => ({ "@type": "ListItem", position: k + 1, name, item: site.url(path) })),
  };
}

function crumbNav(items) {
  return html`<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map(([name, path], k) =>
    k === items.length - 1 ? html`<li><span aria-current="page">${name}</span></li>` : html`<li><a href="${path}">${name}</a></li>`)}</ol></nav>`;
}

/** What a template requires, as a row of logos with no heading. Each says its line on hover and on keyboard focus
 *  (site.css), and a screen reader reads the line. Nothing when it needs nothing beyond a model. */
function reqRow(site, pkg) {
  const reqs = requirements(pkg);
  if (!reqs.length) return "";
  return html`<ul class="reqs" aria-label="What it requires">${reqs.map((r) => html`<li class="req" tabindex="0"><img src="/assets/${r.logo}?v=${site.assetVersion}" alt="" width="18" height="18"><span class="req-tip">${r.text}</span></li>`)}</ul>`;
}

function card(site, pkg) {
  return html`<li class="card tpl" data-name="${pkg.name}">
  <h3><a href="/templates/${pkg.name}/">${pkg.displayName}</a></h3>
  <p class="desc">${pkg.summary}</p>
  ${reqRow(site, pkg)}
</li>`;
}

/** "12 stars, 3 forks", leaving out a zero count; "" when both are zero or unknown. */
function starWords(stats) {
  return [stats?.stars ? plural(stats.stars, "star") : null, stats?.forks ? plural(stats.forks, "fork") : null].filter(Boolean).join(", ");
}

// ---------- gallery (home, free, one category) ----------

/** The tabs over every gallery page: all, free (when any template is), then each category that has templates. Each is
 *  a real page, so they work without the script and a crawler follows them. */
function tabs(packages, current) {
  const cats = Object.keys(CATEGORY_TEXT).filter((c) => packages.some((p) => p.category === c));
  const free = packages.filter(isFree).length;
  const items = [
    ["all", "/", "All", packages.length],
    ...(free ? [["free", "/free/", "Free", free]] : []),
    ...cats.map((c) => [c, `/categories/${c}/`, CATEGORY_TEXT[c].title, packages.filter((p) => p.category === c).length]),
  ];
  return html`<nav class="tabs" id="categories" aria-label="Categories">${items.map(([id, href, label, n]) =>
    html`<a href="${href}"${id === current ? raw(' aria-current="page"') : ""}>${label} <span class="n">${n}</span></a>`)}</nav>`;
}

/** Title, one line, the tabs, search, and the cards: the same frame on the home page, the free page and each category. */
function gallery(site, { title, lead, current, all, shown }) {
  return html`
<section class="hero${current === "all" ? " hero-home" : ""}">
  <h1>${title}</h1>
  <p class="lead">${lead}</p>
</section>

<section aria-label="Templates" class="gallery">
  ${tabs(all, current)}
  <form class="search" role="search" action="${current === "all" ? "/" : current === "free" ? "/free/" : `/categories/${current}/`}" method="get">
    <label class="sr" for="q">Search ${plural(shown.length, "template")}</label>
    <input id="q" name="q" type="search" autocomplete="off" placeholder="Search ${plural(shown.length, "template")}: slack, pull requests, competitors…" data-search>
    <kbd class="key" aria-hidden="true">/</kbd>
  </form>
  <p class="meta status" role="status" data-search-status></p>
  <ul class="cards" data-search-list>
    ${shown.map((p) => card(site, p))}
  </ul>
  <p class="none" data-search-none hidden>No template matches. Try fewer words${current === "all" ? "" : html`, or <a href="/" data-search-all>search all ${all.length} templates</a>`}. Missing one you need? <a href="/list-your-template/">List your own</a>.</p>
</section>`;
}

export function homePage(site, packages) {
  const cats = Object.keys(CATEGORY_TEXT).filter((c) => packages.some((p) => p.category === c));
  const body = html`${gallery(site, { title: "Agents that already do a job", lead: "Working agents for your own AgentRun. Read every instruction, install one, and it runs.", current: "all", all: packages, shown: packages })}

<section aria-labelledby="what" class="prose-block">
  <h2 id="what" class="caps section-label">What is in a template</h2>
  <dl class="facts">
    <dt>Instructions and skills</dt><dd>What the agent does and the method it follows, as Markdown files you can read and edit after install.</dd>
    <dt>Inputs</dt><dd>What each run is about (a company, a repository, a lead), checked against a schema before the run starts.</dd>
    <dt>Setup</dt><dd>What you fill in once at install, such as a schedule, a channel or your risk appetite.</dd>
    <dt>Tools</dt><dd>Web search, page fetches, GitHub. Each one is listed with why it is needed, and nothing is granted until you tick it.</dd>
    <dt>Output</dt><dd>A JSON Schema for the answer, with a Markdown report your console renders.</dd>
    <dt>Evals</dt><dd>Test cases with graders, including a prompt injection case and a case where there is nothing to find.</dd>
  </dl>
  <p>Have one of your own? <a href="/list-your-template/">List your template</a> with a one-line pull request.</p>
</section>`;
  return {
    path: "/",
    mdPath: "/index.md",
    nav: "home",
    title: "AgentRun Marketplace: agent templates you can install",
    description: clip(`Ready-made agents for AgentRun: ${packages.slice(0, 4).map((p) => p.displayName.toLowerCase()).join(", ")} and more. Read every instruction, then install one on your own AgentRun.`, 160),
    jsonLd: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "WebSite", "@id": `${site.url("/")}#site`, name: SITE_NAME, url: site.url("/"), publisher: { "@type": "Organization", name: "Parcha", url: "https://github.com/Parcha-ai" } },
        { "@type": "CollectionPage", name: "AgentRun templates", url: site.url("/"), isPartOf: { "@id": `${site.url("/")}#site` }, mainEntity: itemList(site, packages) },
      ],
    },
    body,
    md: homeMd(site, packages, cats),
  };
}

/** The templates that prefer a free model, on their own page. */
export function freePage(site, packages) {
  const free = packages.filter(isFree);
  const path = "/free/";
  const lead = "These run on a free model, so a run costs nothing. Each page lists the free tier's limits.";
  return {
    path,
    mdPath: "/free.md",
    title: `Free agent templates | ${SITE_NAME}`,
    description: clip(`${plural(free.length, "agent template")} for AgentRun that run on a free model: ${free.map((p) => p.displayName).join(", ")}.`, 160),
    jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "CollectionPage", name: "Free templates", url: site.url(path), mainEntity: itemList(site, free) }, crumbs(site, [["Templates", "/"], ["Free", path]])] },
    body: gallery(site, { title: "Free templates", lead, current: "free", all: packages, shown: free }),
    md: ["# Free templates", "", lead, "", ...free.map((p) => `- [${mdText(p.displayName)}](${site.url(`/templates/${p.name}.md`)}): ${mdText(p.description)}`), ""].join("\n"),
  };
}

function itemList(site, packages) {
  return {
    "@type": "ItemList",
    numberOfItems: packages.length,
    itemListElement: packages.map((p, k) => ({ "@type": "ListItem", position: k + 1, url: site.url(`/templates/${p.name}/`), name: p.displayName })),
  };
}

function homeMd(site, packages, cats) {
  return [
    "# AgentRun Marketplace",
    "",
    "A template is a working agent you install on your own AgentRun: its instructions, the skills that hold its method, the tools it may use, the shape of its answer and the eval cases it is tested against. Install one, fill in its setup, and it runs.",
    "",
    "## Templates",
    "",
    ...packages.map((p) => `- [${mdText(p.displayName)}](${site.url(`/templates/${p.name}.md`)}) (${p.category}): ${mdText(p.description)}`),
    "",
    "## Categories",
    "",
    ...cats.map((c) => `- [${CATEGORY_TEXT[c].title}](${site.url(`/categories/${c}.md`)}): ${CATEGORY_TEXT[c].blurb}`),
    "",
    ...(packages.some(isFree) ? [`Free to run: ${site.url("/free.md")}`, ""] : []),
    `List your own: ${site.url("/list-your-template.md")}`,
    "",
  ].join("\n");
}

// ---------- category ----------

export function categoryPage(site, category, packages, all = packages) {
  const { title, blurb } = CATEGORY_TEXT[category];
  const path = `/categories/${category}/`;
  const trail = [["Templates", "/"], [title, path]];
  const body = gallery(site, { title: `${title} templates`, lead: blurb, current: category, all, shown: packages });
  return {
    path,
    mdPath: `/categories/${category}.md`,
    title: `${title} agent templates | ${SITE_NAME}`,
    description: clip(`${plural(packages.length, `${category} agent template`)} for AgentRun. ${blurb} ${packages.map((p) => p.displayName).join(", ")}.`, 160),
    jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "CollectionPage", name: `${title} templates`, url: site.url(path), mainEntity: itemList(site, packages) }, crumbs(site, trail)] },
    body,
    md: [
      `# ${title} templates`,
      "",
      blurb,
      "",
      ...packages.map((p) => `- [${mdText(p.displayName)}](${site.url(`/templates/${p.name}.md`)}): ${mdText(p.description)}`),
      "",
    ].join("\n"),
  };
}

// ---------- template ----------

/** A manifest description as a sentence: capitalised, ending in a full stop. */
function sentence(text) {
  const t = String(text ?? "").trim();
  if (!t) return "";
  return upperFirst(/[.!?)"]$/.test(t) ? t : `${t}.`);
}

function inputsTable(rows) {
  return html`<div class="table-wrap"><table>
<thead><tr><th scope="col">Name</th><th scope="col">Type</th><th scope="col">Required</th><th scope="col">What it is</th></tr></thead>
<tbody>${rows.map((r) => html`<tr>
  <td><code>${r.key}</code>${r.title ? html`<div class="meta">${r.title}</div>` : ""}</td>
  <td>${typeWords(r)}</td>
  <td>${r.required ? "yes" : "no"}</td>
  <td>${sentence(r.description)}${defaultText(r.default) !== null ? html` <span class="meta">Default: <code>${defaultText(r.default)}</code>.</span>` : ""}${Array.isArray(r.examples) && r.examples.length ? html` <span class="meta">Example: <code>${r.examples.map(String).join(", ")}</code>.</span>` : ""}</td>
</tr>`)}</tbody>
</table></div>`;
}

function jsonBlock(value) {
  return html`<pre class="code"><code>${JSON.stringify(value, null, 2)}</code></pre>`;
}

/** The sample as Markdown: output.md when the author wrote one (it carries the "illustrative" note), else the report
 *  field of output.json. */
function sampleMarkdown(pkg, ex) {
  if (typeof ex.outputMd === "string" && ex.outputMd.trim()) return ex.outputMd;
  const report = pkg.markdownField && ex.output ? ex.output[pkg.markdownField] : undefined;
  return typeof report === "string" && report.trim() ? report : null;
}

/** A parameter or input default as text, or null when there is nothing to show. */
function defaultText(value) {
  if (value === undefined || value === null || value === "") return null;
  if (Array.isArray(value)) return value.length ? value.map(String).join(", ") : null;
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function sampleSection(pkg) {
  if (!pkg.examples.length) {
    return html`<p class="muted">No sample output ships with this template yet. The output schema below shows what each run answers.</p>`;
  }
  return pkg.examples.map((ex) => {
    const shown = sampleMarkdown(pkg, ex);
    return html`<div class="sample">
  ${pkg.examples.length > 1 ? html`<h3 class="caps">${ex.name}</h3>` : ""}
  ${ex.input !== undefined ? html`<details><summary class="caps">Input</summary>${jsonBlock(ex.input)}</details>` : ""}
  ${shown ? html`<article class="report card">${raw(markdownToHtml(shown, { shift: 2 }))}</article>` : ""}
  ${ex.output !== undefined ? html`<details><summary class="caps">The full answer as JSON</summary>${jsonBlock(ex.output)}</details>` : ""}
</div>`;
  });
}

export function templatePage(site, pkg, stats) {
  const path = `/templates/${pkg.name}/`;
  const cat = CATEGORY_TEXT[pkg.category];
  const trail = [["Templates", "/"], [cat.title, `/categories/${pkg.category}/`], [pkg.displayName, path]];
  const keys = keyWords(pkg);
  const choices = modelChoices(pkg.model);
  const triggers = triggerLines(pkg);
  // npx: a stranger has no global `agentrun`. --trust: a server's first package from a publisher is refused without it.
  const cli = `npx @parcha/agentrun template install ${pkg.installSource} --trust`;
  const shortSha = pkg.sha.slice(0, 7);
  const body = html`
${crumbNav(trail)}
<section class="hero tpl-hero">
  <h1>${pkg.displayName}</h1>
  <p class="lead">${pkg.summary}</p>
  ${reqRow(site, pkg)}
</section>

<section class="card install" aria-labelledby="install">
  <h2 id="install" class="caps section-label">Install</h2>
  ${pkg.setup ? html`<p class="setup">${pkg.setup}</p>` : ""}
  ${pkg.guide ? html`<p class="guide"><a href="${pkg.guide}">The setup guide</a> walks you through it step by step.</p>` : ""}
  ${unprovenWords(pkg) ? html`<p class="unproven">${unprovenWords(pkg)}</p>` : ""}
  <p><button type="button" class="btn btn-solid" data-install="${pkg.installSource}" hidden>Install on your AgentRun</button> <button type="button" class="btn btn-ghost" data-install-forget hidden>Change address</button></p>
  <p class="meta" data-install-address></p>
  <p class="or">Or from a terminal on the machine where your AgentRun runs:</p>
  <div class="cmd"><pre class="code"><code>${cli}</code></pre><button type="button" class="btn btn-sm" data-copy="${cli}" hidden>Copy</button></div>
  <p class="meta">Pinned to commit <a href="${pkg.treeUrl}"><code>${shortSha}</code></a>. <code>--trust</code> means you trust ${pkg.owner}, its publisher. AgentRun asks once per publisher. The apply screen shows every instruction and tool before anything is saved, and grants nothing until you tick it.</p>
  <p class="meta">No AgentRun yet? <code>npx @parcha/agentrun</code> starts one.</p>
</section>

<dialog class="card" data-install-dialog aria-labelledby="ask-title">
  <form method="dialog" data-install-form novalidate>
    <h2 id="ask-title" class="caps section-label">Your AgentRun address</h2>
    <p>The page opens your AgentRun's install screen for this template. This browser remembers the address, and it is sent nowhere else.</p>
    <label class="caps" for="ar-address">Address</label>
    <input id="ar-address" name="address" type="text" inputmode="url" autocapitalize="off" spellcheck="false" placeholder="agentrun.example.com" autocomplete="url" aria-describedby="ar-address-error">
    <p class="error" id="ar-address-error" role="alert" data-install-error></p>
    <p class="row"><button type="submit" class="btn btn-solid" value="ok">Open the install screen</button> <button type="button" class="btn" data-install-cancel>Cancel</button></p>
    <p class="meta">No AgentRun yet? <code>npx @parcha/agentrun</code> starts one on your machine.</p>
  </form>
</dialog>

<section aria-labelledby="sample">
  <h2 id="sample" class="caps section-label">Sample output</h2>
  ${sampleSection(pkg)}
  ${pkg.outputSchema ? html`<details><summary class="caps">Output schema (${pkg.outputSchemaPath})</summary>${jsonBlock(pkg.outputSchema)}</details>` : ""}
</section>

<section aria-labelledby="does">
  <h2 id="does" class="caps section-label">What it does</h2>
  <p>${pkg.description}</p>
  ${pkg.skills.length ? html`<dl class="facts">${pkg.skills.map((s) => html`<dt>Skill: ${s.name}</dt><dd>${s.description || "No description."}</dd>`)}</dl>` : ""}
  ${pkg.rules.length ? html`<p>Rules it reads: ${pkg.rules.map((r, k) => html`${k ? ", " : ""}<code>${r}</code>`)}.</p>` : ""}
  <details><summary class="caps">Read the instructions</summary><div class="prose">${raw(markdownToHtml(pkg.instructions, { shift: 2 }))}</div></details>
  ${pkg.skills.map((s) => html`<details><summary class="caps">Read the ${s.name} skill</summary><div class="prose">${raw(markdownToHtml(s.body, { shift: 2 }))}</div></details>`)}
</section>

<section aria-labelledby="starts">
  <h2 id="starts" class="caps section-label">What starts it</h2>
  <ul class="plain">${triggers.map((t) => html`<li>${t.text}</li>`)}</ul>
</section>

<section aria-labelledby="inputs">
  <h2 id="inputs" class="caps section-label">Inputs</h2>
  ${pkg.inputs.length
    ? html`<p>What each run is about. AgentRun checks a run's input against these before it starts.</p>${inputsTable(pkg.inputs)}`
    : html`<p>Each run takes a plain message (<code>content</code>): say what you want done.</p>`}
  ${pkg.parameters.length ? html`<h3 class="caps sub">Setup, filled in once at install</h3>${inputsTable(pkg.parameters)}` : ""}
</section>

<section aria-labelledby="needs">
  <h2 id="needs" class="caps section-label">What it needs</h2>
  <dl class="facts">
    <dt>Harness</dt><dd>${pkg.harness.length ? pkg.harness.map((h, k) => html`${k ? ", " : ""}<code>${h}</code>`) : "Any"}</dd>
    <dt>Model</dt><dd>${upperFirst(modelWords(pkg.model))}${pkg.effort ? `, ${pkg.effort} effort` : ""}</dd>
    ${choices.length ? html`<dt>Model choices</dt><dd>At install you can keep that, or pick one of these:<ul class="choices">${choices.map((c) => html`<li><strong>${c.label}</strong>: <code>${c.model}</code>${c.harness ? html` on <code>${c.harness}</code>` : ""}${c.secrets.length ? html`, needs ${c.secrets.map((s, k) => html`${k ? ", " : ""}<code>${s}</code>`)}` : ""}.${c.warning ? html` <strong>Warning:</strong> ${c.warning}` : ""}${c.note ? html` ${c.note}` : ""}</li>`)}</ul></dd>` : ""}
    <dt>Tools</dt><dd>${pkg.tools.length ? pkg.tools.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`) : "None"}${pkg.toolPolicy?.bash ? ` (bash is ${pkg.toolPolicy.bash})` : ""}</dd>
    ${pkg.mcp.map((need) => html`<dt>${mcpWords(need)} tools${need.required ? "" : " (optional)"}</dt><dd>${need.reason ? html`${need.reason} ` : ""}${need.tools.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`)}${need.allow.length ? html`. Runs without asking: ${need.allow.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`)}` : ""}.</dd>`)}
    <dt>Computer</dt><dd>${upperFirst(computerWords(pkg.computer))}${pkg.checkout === "pull_request" ? ", with the pull request checked out read-only" : ""}</dd>
    <dt>Keys</dt><dd>${keys.model}${keys.secrets.length ? html`, plus ${keys.secrets.map((s, k) => html`${k ? ", " : ""}<code>${s}</code>`)}` : ""}.</dd>
    <dt>Learning</dt><dd>${pkg.learning ? "On: it keeps notes from your corrections and earlier runs." : "Off."}</dd>
    ${pkg.approvals === "never" ? html`<dt>Approvals</dt><dd>Runs unattended: no tool asks. Pins and denials still hold.</dd>` : ""}
  </dl>
</section>

<section aria-labelledby="evals">
  <h2 id="evals" class="caps section-label">Tested</h2>
  ${testedLine(pkg) ? html`<p class="tested">${testedLine(pkg)}</p>` : ""}
  ${pkg.evals.length ? html`<p class="meta">${plural(pkg.evals.length, "eval case")}: ${pkg.evals.map((e, k) => html`${k ? ", " : ""}<code>${e}</code>`)}.</p>` : html`<p class="muted">No eval cases.</p>`}
</section>

<section aria-labelledby="src">
  <h2 id="src" class="caps section-label">Source</h2>
  <dl class="facts">
    <dt>Package</dt><dd><a href="${pkg.treeUrl}"><code>${pkg.source}</code></a> at <code>${shortSha}</code></dd>
    <dt>Publisher</dt><dd><a href="https://github.com/${pkg.owner}">${pkg.owner}</a> on GitHub${starWords(stats) ? ` (${starWords(stats)})` : ""}</dd>
    ${pkg.author?.name ? html`<dt>Author</dt><dd>${pkg.author.url ? html`<a href="${pkg.author.url}">${pkg.author.name}</a>` : pkg.author.name}</dd>` : ""}
    ${pkg.version ? html`<dt>Version</dt><dd>${pkg.version}</dd>` : ""}
    ${pkg.license ? html`<dt>License</dt><dd>${pkg.license}</dd>` : ""}
  </dl>
</section>`;

  const appCategory = ["engineering", "security"].includes(pkg.category) ? "DeveloperApplication" : "BusinessApplication";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${site.url(path)}#template`,
        name: pkg.displayName,
        description: pkg.description,
        url: site.url(path),
        applicationCategory: appCategory,
        applicationSubCategory: cat.title,
        operatingSystem: "AgentRun",
        ...(pkg.version ? { softwareVersion: pkg.version } : {}),
        ...(pkg.license ? { license: pkg.license === "Apache-2.0" ? "https://www.apache.org/licenses/LICENSE-2.0" : pkg.license } : {}),
        ...(pkg.author?.name ? { author: { "@type": "Organization", name: pkg.author.name } } : {}),
        publisher: { "@type": "Organization", name: pkg.owner, url: `https://github.com/${pkg.owner}` },
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        isAccessibleForFree: true,
        keywords: [pkg.category, ...pkg.tags].join(", "),
        downloadUrl: pkg.treeUrl,
      },
      crumbs(site, trail),
    ],
  };

  return {
    path,
    mdPath: `/templates/${pkg.name}.md`,
    ogType: "article",
    mainClass: "tpl-main",
    title: `${clip(pkg.displayName, 50)}: AgentRun template`,
    ogTitle: pkg.displayName,
    // The search snippet: what it does (its first sentence), then the eval line, inside 158 characters.
    description: (() => {
      const line = [pkg.summary, factsShort(pkg)].filter(Boolean).join(" ");
      if (line.length > 158) return pkg.summary;
      return line.length >= 50 ? line : clip(`${line} ${pkg.description}`, 158);
    })(),
    jsonLd,
    body,
    md: templateMd(site, pkg, { keys, triggers, cli, stats }),
  };
}

function mdTable(rows) {
  const head = "| Name | Type | Required | What it is |\n| --- | --- | --- | --- |";
  const what = (r) => [
    mdText(sentence(r.description)),
    defaultText(r.default) !== null ? `Default: ${mdCode(defaultText(r.default))}.` : "",
    Array.isArray(r.examples) && r.examples.length ? `Example: ${mdCode(r.examples.map(String).join(", "))}.` : "",
  ].filter(Boolean).join(" ");
  return [head, ...rows.map((r) => `| ${mdCode(r.key)} | ${mdText(typeWords(r))} | ${r.required ? "yes" : "no"} | ${what(r)} |`)].join("\n");
}

function templateMd(site, pkg, { keys, triggers, cli, stats }) {
  const choices = modelChoices(pkg.model);
  const reqs = requirements(pkg);
  const out = [
    `# ${pkg.displayName}`,
    "",
    mdText(pkg.summary),
    "",
    ...(reqs.length ? [reqs.map((r) => `${mdText(r.text)}.`).join(" "), ""] : []),
    "## Install",
    "",
    ...(pkg.setup ? [mdText(pkg.setup), ""] : []),
    ...(pkg.guide ? [`[The setup guide](${pkg.guide}) walks you through it step by step.`, ""] : []),
    ...(unprovenWords(pkg) ? [unprovenWords(pkg), ""] : []),
    "```sh",
    cli,
    "```",
    "",
    `Or open \`<your AgentRun address>/#/templates/install?src=${encodeURIComponent(pkg.installSource)}\`. Pinned to commit ${pkg.sha}.`,
    "",
    "## What it does",
    "",
    pkg.description,
    "",
    ...pkg.skills.map((s) => `- Skill ${mdCode(s.name)}: ${mdText(s.description)}`),
    ...(pkg.rules.length ? [`- Rules: ${pkg.rules.map(mdCode).join(", ")}`] : []),
    "",
    "## What starts it",
    "",
    ...triggers.map((t) => `- ${t.text}`),
    "",
    "## Inputs",
    "",
    pkg.inputs.length ? mdTable(pkg.inputs) : "Each run takes a plain message (`content`).",
    "",
    ...(pkg.parameters.length ? ["### Setup, filled in once at install", "", mdTable(pkg.parameters), ""] : []),
    "## What it needs",
    "",
    `- Harness: ${pkg.harness.join(", ") || "any"}`,
    `- Model: ${modelWords(pkg.model)}${pkg.effort ? `, ${pkg.effort} effort` : ""}`,
    ...(choices.length ? ["- Model choices, picked at install instead:", ...choices.map((c) => `  - ${mdText(c.label)}: ${mdCode(c.model)}${c.harness ? ` on ${mdCode(c.harness)}` : ""}${c.secrets.length ? `, needs ${c.secrets.map(mdCode).join(", ")}` : ""}.${c.warning ? ` Warning: ${mdText(c.warning)}` : ""}${c.note ? ` ${mdText(c.note)}` : ""}`)] : []),
    `- Tools: ${pkg.tools.join(", ") || "none"}`,
    ...pkg.mcp.map((n) => `- ${mcpWords(n)} tools${n.required ? "" : " (optional)"}: ${n.tools.join(", ")}${n.reason ? `. ${n.reason}` : ""}`),
    `- Computer: ${computerWords(pkg.computer)}`,
    `- Keys: ${keys.model}${keys.secrets.length ? `, plus ${keys.secrets.join(", ")}` : ""}`,
    `- Learning: ${pkg.learning ? "on" : "off"}`,
    "",
    "## Sample output",
    "",
  ];
  if (!pkg.examples.length) out.push("No sample output ships with this template yet.", "");
  for (const ex of pkg.examples) {
    const shown = sampleMarkdown(pkg, ex);
    if (pkg.examples.length > 1) out.push(`### ${ex.name}`, "");
    if (ex.input !== undefined) out.push("Input:", "", "```json", JSON.stringify(ex.input, null, 2), "```", "");
    if (shown) out.push("Output:", "", shown.trim().replace(/^#{1,4} /gm, "#### "), "");
  }
  out.push(
    "## Tested",
    "",
    ...(testedLine(pkg) ? [testedLine(pkg), ""] : []),
    pkg.evals.length ? `${plural(pkg.evals.length, "eval case")}: ${pkg.evals.join(", ")}.` : "No eval cases.",
    "",
    "## Source",
    "",
    `- Package: ${pkg.treeUrl}`,
    `- Publisher: ${pkg.owner}${starWords(stats) ? ` (${starWords(stats)})` : ""}`,
    ...(pkg.author?.name ? [`- Author: ${mdText(pkg.author.name)}`] : []),
    ...(pkg.version ? [`- Version: ${pkg.version}`] : []),
    ...(pkg.license ? [`- License: ${pkg.license}`] : []),
    `- Category: ${CATEGORY_TEXT[pkg.category].title}`,
    `- Page: ${site.url(`/templates/${pkg.name}/`)}`,
    "",
  );
  return out.join("\n");
}

// ---------- list your template ----------

export function listPage(site) {
  const path = "/list-your-template/";
  const trail = [["Templates", "/"], ["List your template", path]];
  const entry = `{ "name": "your-template", "source": "github:you/your-repo/path/to/template@v1.0.0", "category": "research", "tags": ["your-tag"],
  "summary": "One line, what it does, shown on its card and under its title.",
  "setup": "Optional. What to do before installing, shown once in Install.",
  "guide": "Optional. An https link to a step-by-step setup guide, linked under setup." }`;
  const steps = [
    ["Put the template in a public GitHub repository.", "One folder: agent.md with its front matter, skills/, evals/ and the output schema. Private repositories can't be installed."],
    ["Check it.", "Run agentrun template validate <folder>. It runs the same checks AgentRun runs on install."],
    ["Open a pull request that adds one entry.", `On ${site.repo.owner}/${site.repo.name}, add your template to .agentrun/marketplace.json. Pin the source to a tag or a commit with @ref: the page and the install link use exactly that version.`],
    ["We review it.", "We read the instructions and skills, run the evals, and check it meets the bar below. When it merges, the site rebuilds and your page goes up."],
    ["Ship a new version.", "Open another pull request that moves the @ref. Installs already made keep the commit they were installed from."],
  ];
  const bar = [
    "Typed inputs for what each run is about, and parameters only for setup (a schedule, a channel).",
    "One or two skills that hold the method, each SKILL.md under 200 lines.",
    "An output schema (JSON Schema 2020-12) with a report_markdown string marked contentMediaType text/markdown, beside the typed fields.",
    "A per-run budget (budget.per_run_usd), and learning: true when it runs on a schedule.",
    "At least four eval cases: one prompt injection inside a fetched page, one where there is nothing to find and it must not invent anything, and one per thing the description promises. A scheduled template adds a no-repeats case.",
    "A sample run in samples/<template>/<name>/ of this repository: input.json and an output.json that matches the schema.",
    "A summary of 20 to 140 characters in the index entry that says what it does in plain words, and a description in agent.md with the detail.",
  ];
  // The same steps and bar as the page, worded as a job for a coding agent, so the reader can hand the listing over.
  const prompt = [
    `Help me list my AgentRun template on the AgentRun template marketplace (${site.url("/")}).`,
    "",
    "Work in the repository I have open. Ask me before you push, tag or open a pull request. Never invent an eval result or a sample output: run the template to get them.",
    "",
    `Reference: ${site.url("/list-your-template.md")}`,
    "",
    "1. Find the template folder: the one that holds agent.md. If there are several, ask me which one.",
    "2. Check it against the bar below. Tell me each gap in one line, then fix the ones I approve.",
    "3. Run `npx @parcha/agentrun template validate <folder>` and fix what it reports until it passes.",
    "4. Check the GitHub repository is public. If it is private, stop and tell me: private repositories can't be installed.",
    "5. Pin a version: propose a tag (for example v1.0.0) on the commit that passed, and create and push it once I agree.",
    `6. Write the marketplace entry and show it to me. Then fork ${site.repo.owner}/${site.repo.name}, add the entry to .agentrun/marketplace.json, add the sample run under samples/<template>/<name>/, and open a pull request.`,
    "7. Give me the pull request link and say what the reviewers will check.",
    "",
    "The bar:",
    ...bar.map((b) => `- ${b}`),
    "",
    "The entry:",
    entry,
    "",
    `Categories: ${Object.keys(CATEGORY_TEXT).join(", ")}. Up to 8 tags, lowercase letters, digits and dashes. Pin the source with @ref (a tag or a commit).`,
  ].join("\n");
  const body = html`
<section class="hero">
  <h1>List your template</h1>
  <p class="lead">The marketplace is one file, <code>.agentrun/marketplace.json</code> in <a href="${site.repoUrl}">${site.repo.owner}/${site.repo.name}</a>. Your template stays in your repository. Listing it is a pull request that adds one line.</p>
</section>
<section aria-labelledby="agent">
  <h2 id="agent" class="caps section-label">Have your agent list it</h2>
  <p>Paste this into Claude Code, Codex or another coding agent, in the repository that holds your template. It checks the template, fixes the gaps and opens the pull request.</p>
  <div class="prompt"><p class="prompt-bar"><button type="button" class="btn btn-solid btn-sm" data-copy="${prompt}" hidden>Copy prompt</button></p><pre class="code" tabindex="0" aria-label="Prompt for a coding agent"><code>${prompt}</code></pre></div>
</section>
<section aria-labelledby="how">
  <h2 id="how" class="caps section-label">How it works</h2>
  <ol class="steps">${steps.map(([h, p]) => html`<li><strong>${h}</strong> ${p}</li>`)}</ol>
  <p>The entry:</p>
  <pre class="code"><code>${entry}</code></pre>
  <p class="meta">Categories: ${Object.keys(CATEGORY_TEXT).join(", ")}. Up to 8 tags, lowercase letters, digits and dashes.</p>
</section>
<section aria-labelledby="bar">
  <h2 id="bar" class="caps section-label">The bar</h2>
  <p>The same one the bundled templates meet.</p>
  <ul class="plain">${bar.map((b) => html`<li>${b}</li>`)}</ul>
</section>
<section aria-labelledby="eval-note">
  <h2 id="eval-note" class="caps section-label">Eval results</h2>
  <p>Add a <code>measured.json</code> beside agent.md once you have run your evals, and the page shows how many cases pass on each harness:</p>
  <pre class="code"><code>{ "runs": 12, "model": "openrouter/particle-ai/particle-1", "harness": "pi", "measured_on": "2026-11-14", "passed": { "pi": "5/5", "claude-agent": "4/5", "codex": "5/5" } }</code></pre>
  <p>What a template requires (its integrations, web search, a schedule) comes from its agent.md: its tools, MCP toolkits and triggers. There is nothing to write for it.</p>
  <p>A template that searches or reads the web adds <code>"live": { "cases": 1, "passed": { "pi": "2/2" } }</code>: its cases named <code>live-*</code>, which give it no pages and run on the real web. <code>passed</code> counts the other cases. Without <code>live</code>, the page says it has not been tried on the live web.</p>
</section>`;
  return {
    path,
    mdPath: "/list-your-template.md",
    nav: "list",
    title: `List your template | ${SITE_NAME}`,
    description: "Add your AgentRun template to the marketplace with a pull request that adds one entry to .agentrun/marketplace.json. Here is the entry, the review and the bar.",
    jsonLd: { "@context": "https://schema.org", "@graph": [{ "@type": "WebPage", name: "List your template", url: site.url(path) }, crumbs(site, trail)] },
    body,
    md: [
      "# List your template",
      "",
      `The marketplace is one file, \`.agentrun/marketplace.json\` in ${site.repoUrl}. Your template stays in your repository. Listing it is a pull request that adds one line.`,
      "",
      "## Have your agent list it",
      "",
      "Paste this into a coding agent, in the repository that holds your template:",
      "",
      "````text",
      prompt,
      "````",
      "",
      "## How it works",
      "",
      ...steps.map(([h, p], k) => `${k + 1}. ${h} ${p}`),
      "",
      "```json",
      entry,
      "```",
      "",
      "## The bar",
      "",
      ...bar.map((b) => `- ${b}`),
      "",
      "## Eval results",
      "",
      "Add a `measured.json` beside agent.md: `{ \"runs\": 12, \"model\": \"...\", \"harness\": \"pi\", \"measured_on\": \"2026-11-14\", \"passed\": { \"pi\": \"5/5\" } }` (passed: cases passed per harness, from your latest runs). What a template requires comes from its agent.md (tools, MCP toolkits, triggers); there is nothing to write for it. A template that uses the web adds `\"live\": { \"cases\": 1, \"passed\": { \"pi\": \"2/2\" } }` from its `live-*` cases, which give it no pages and run on the real web; `passed` counts the other cases. Without `live`, the page says it has not been tried on the live web.",
      "",
    ].join("\n"),
  };
}

export function notFoundPage() {
  return {
    path: "/404.html",
    noindex: true,
    title: `Page not found | ${SITE_NAME}`,
    description: "This page does not exist. Every AgentRun template is listed on the home page.",
    body: html`<section class="hero"><h1>Page not found</h1><p class="lead">Nothing lives at this address. <a href="/">See every template</a>.</p></section>`,
  };
}
