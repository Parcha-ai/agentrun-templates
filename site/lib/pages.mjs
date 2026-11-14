// The pages: each is real HTML a crawler reads (no client-side rendering), plus a Markdown twin with the same content.

import { CATEGORY_TEXT, computerWords, costWords, keyWords, mcpWords, modelWords, triggerLines, typeWords } from "./describe.mjs";
import { markdownToHtml } from "./markdown.mjs";
import { clip, html, mdCode, mdText, plural, raw, upperFirst } from "./util.mjs";

export const SITE_NAME = "AgentRun Marketplace";
const PLATFORM = "AgentRun is an open-source platform for running agents: it adds learning, durable runs and a control plane on top of the agent harness you pick.";

// ---------- shared frame ----------

function jsonLdTag(data) {
  return raw(`<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`);
}

export function layout(site, page) {
  const url = site.url(page.path);
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "font-src 'self'",
    "img-src 'self' data:",
    "connect-src 'self'",
    "base-uri 'none'",
    "form-action 'self'",
    "object-src 'none'",
  ].join("; ");
  return `<!doctype html>\n${html`<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${page.title}</title>
<meta name="description" content="${page.description}">
${page.noindex ? "" : html`<link rel="canonical" href="${url}">`}
${page.mdPath ? html`<link rel="alternate" type="text/markdown" href="${page.mdPath}" title="This page as Markdown">` : ""}
<meta http-equiv="Content-Security-Policy" content="${csp}">
<meta name="referrer" content="strict-origin-when-cross-origin">
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
    <a class="brand" href="/"><span class="brand-mark" aria-hidden="true"></span><span>AgentRun</span><span class="brand-sub">Marketplace</span></a>
    <nav aria-label="Site">
      <a href="/"${page.nav === "home" ? raw(' aria-current="page"') : ""}>Templates</a>
      <a href="/#categories">Categories</a>
      <a href="/list-your-template/"${page.nav === "list" ? raw(' aria-current="page"') : ""}>List your template</a>
      <a href="${site.repoUrl}">GitHub</a>
    </nav>
  </div>
</header>
<main id="main" class="wrap">
${page.body}
</main>
<footer class="foot">
  <div class="wrap foot-row">
    <p>${PLATFORM} <a href="https://github.com/Parcha-ai/agentrun">Source on GitHub</a>.</p>
    <p class="meta">Templates are Apache-2.0 unless their page says otherwise. Built from <a href="${site.repoUrl}/tree/${site.sha}">${site.sha.slice(0, 7)}</a>.${page.mdPath ? html` <a href="${page.mdPath}">This page as Markdown</a>.` : ""}</p>
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

function chip(text, tone = "plain") {
  return html`<span class="chip chip-${tone}">${text}</span>`;
}

function card(site, pkg) {
  const cost = pkg.measured ? costWords(pkg).headline : null;
  return html`<li class="card tpl" data-name="${pkg.name}">
  <h3><a href="/templates/${pkg.name}/">${pkg.displayName}</a></h3>
  <p class="desc">${clip(pkg.description, 220)}</p>
  <p class="row">${chip(CATEGORY_TEXT[pkg.category].title, "active")}${pkg.triggers.some((t) => t.source?.kind === "schedule") ? chip("scheduled") : ""}${pkg.local ? "" : chip("bundled", "muted")}${cost ? chip(cost) : ""}</p>
</li>`;
}

// ---------- home ----------

export function homePage(site, packages) {
  const cats = Object.keys(CATEGORY_TEXT).filter((c) => packages.some((p) => p.category === c));
  const body = html`
<section class="hero">
  <p class="caps eyebrow">AgentRun templates</p>
  <h1>Agents that already do a job</h1>
  <p class="lead">A template is a working agent you install on your own AgentRun: its instructions, the skills that hold its method, the tools it may use, the shape of its answer and the eval cases it is tested against. Install one, fill in its setup, and it runs. You can read every line before you install it.</p>
</section>

<section aria-labelledby="find">
  <h2 id="find" class="caps section-label">Find a template</h2>
  <form class="search" role="search" action="/" method="get">
    <label class="caps" for="q">Search ${plural(packages.length, "template")}</label>
    <input id="q" name="q" type="search" autocomplete="off" placeholder="kyb, pull requests, competitors…" data-search>
  </form>
  <p class="meta" role="status" data-search-status></p>
  <ul class="cards" data-search-list>
    ${packages.map((p) => card(site, p))}
  </ul>
</section>

<section aria-labelledby="categories">
  <h2 id="categories" class="caps section-label">Categories</h2>
  <ul class="cats">
    ${cats.map((c) => html`<li class="card"><a href="/categories/${c}/"><span class="cat-title">${CATEGORY_TEXT[c].title}</span><span class="meta">${plural(packages.filter((p) => p.category === c).length, "template")}</span></a><p class="desc">${CATEGORY_TEXT[c].blurb}</p></li>`)}
  </ul>
</section>

<section aria-labelledby="what" class="prose-block">
  <h2 id="what" class="caps section-label">What is in a template</h2>
  <dl class="facts">
    <dt>Instructions and skills</dt><dd>What the agent does and the method it follows, as Markdown files you can read and edit after install.</dd>
    <dt>Inputs</dt><dd>What each run is about (a company, a repository, a lead), checked against a schema before the run starts.</dd>
    <dt>Setup</dt><dd>What you fill in once at install: a schedule, a channel, your risk appetite.</dd>
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
    `List your own: ${site.url("/list-your-template.md")}`,
    "",
  ].join("\n");
}

// ---------- category ----------

export function categoryPage(site, category, packages) {
  const { title, blurb } = CATEGORY_TEXT[category];
  const path = `/categories/${category}/`;
  const trail = [["Templates", "/"], [title, path]];
  const body = html`
${crumbNav(trail)}
<section class="hero">
  <p class="caps eyebrow">Category</p>
  <h1>${title} templates</h1>
  <p class="lead">${blurb}</p>
</section>
<ul class="cards">${packages.map((p) => card(site, p))}</ul>
<p class="meta">Looking for something else? <a href="/">See every template</a>, or <a href="/list-your-template/">list your own</a>.</p>`;
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
  const cost = costWords(pkg);
  const keys = keyWords(pkg);
  const triggers = triggerLines(pkg);
  const cli = `agentrun template install ${pkg.installSource}`;
  const shortSha = pkg.sha.slice(0, 7);
  const body = html`
${crumbNav(trail)}
<section class="hero tpl-hero">
  <p class="row">${chip(cat.title, "active")}${pkg.tags.map((t) => chip(t))}</p>
  <h1>${pkg.displayName}</h1>
  <p class="lead">${pkg.description}</p>
  <p class="meta">${[pkg.version ? `Version ${pkg.version}` : null, pkg.license, pkg.author?.name ? `by ${pkg.author.name}` : null, stats ? `${plural(stats.stars, "star")} and ${plural(stats.forks, "fork")} on ${pkg.owner}/${pkg.repo}` : null].filter(Boolean).join(" · ")}</p>
</section>

<section class="card install" aria-labelledby="install">
  <h2 id="install" class="caps section-label">Install</h2>
  <p><button type="button" class="btn btn-solid" data-install="${pkg.installSource}" hidden>Install on your AgentRun</button> <button type="button" class="btn btn-ghost" data-install-forget hidden>Change address</button></p>
  <p class="meta" data-install-address></p>
  <p>Or from a terminal:</p>
  <div class="cmd"><pre class="code"><code>${cli}</code></pre><button type="button" class="btn btn-sm" data-copy="${cli}" hidden>Copy</button></div>
  <p class="meta">Pinned to commit <a href="${pkg.treeUrl}"><code>${shortSha}</code></a>, the version this page describes. The apply screen shows every instruction and skill before anything is saved, and nothing is granted until you tick it.</p>
</section>

<dialog class="card" data-install-dialog aria-labelledby="ask-title">
  <form method="dialog" data-install-form>
    <h2 id="ask-title" class="caps section-label">Your AgentRun address</h2>
    <p>The page opens your AgentRun's install screen for this template. This browser remembers the address, and it is sent nowhere else.</p>
    <label class="caps" for="ar-address">Address</label>
    <input id="ar-address" name="address" type="url" required placeholder="https://agentrun.example.com" autocomplete="url">
    <p class="error" role="alert" data-install-error></p>
    <p class="row"><button type="submit" class="btn btn-solid" value="ok">Open the install screen</button> <button type="button" class="btn" data-install-cancel>Cancel</button></p>
  </form>
</dialog>

<section aria-labelledby="does">
  <h2 id="does" class="caps section-label">What it does</h2>
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
    <dt>Tools</dt><dd>${pkg.tools.length ? pkg.tools.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`) : "None"}${pkg.toolPolicy?.bash ? ` (bash is ${pkg.toolPolicy.bash})` : ""}</dd>
    ${pkg.mcp.map((need) => html`<dt>${mcpWords(need)} tools${need.required ? "" : " (optional)"}</dt><dd>${need.reason ? html`${need.reason} ` : ""}${need.tools.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`)}${need.allow.length ? html`. Runs without asking: ${need.allow.map((t, k) => html`${k ? ", " : ""}<code>${t}</code>`)}` : ""}.</dd>`)}
    <dt>Computer</dt><dd>${upperFirst(computerWords(pkg.computer))}${pkg.checkout === "pull_request" ? ", with the pull request checked out read-only" : ""}</dd>
    <dt>Keys</dt><dd>${keys.model}${keys.secrets.length ? html`, plus ${keys.secrets.map((s, k) => html`${k ? ", " : ""}<code>${s}</code>`)}` : ""}.</dd>
    <dt>Learning</dt><dd>${pkg.learning ? "On: it keeps notes from your corrections and earlier runs." : "Off."}</dd>
    ${pkg.approvals === "never" ? html`<dt>Approvals</dt><dd>Runs unattended: no tool asks. Pins and denials still hold.</dd>` : ""}
  </dl>
</section>

<section aria-labelledby="sample">
  <h2 id="sample" class="caps section-label">Sample output</h2>
  ${sampleSection(pkg)}
  ${pkg.outputSchema ? html`<details><summary class="caps">Output schema (${pkg.outputSchemaPath})</summary>${jsonBlock(pkg.outputSchema)}</details>` : ""}
</section>

<section aria-labelledby="cost">
  <h2 id="cost" class="caps section-label">Cost per run</h2>
  <p class="big">${cost.headline}</p>
  <p class="muted">${cost.detail}</p>
</section>

<section aria-labelledby="evals">
  <h2 id="evals" class="caps section-label">Tested by</h2>
  ${pkg.evals.length ? html`<p>${plural(pkg.evals.length, "eval case")}: ${pkg.evals.map((e, k) => html`${k ? ", " : ""}<code>${e}</code>`)}.</p>` : html`<p class="muted">No eval cases.</p>`}
</section>

<section aria-labelledby="src">
  <h2 id="src" class="caps section-label">Source</h2>
  <dl class="facts">
    <dt>Package</dt><dd><a href="${pkg.treeUrl}"><code>${pkg.source}</code></a> at <code>${shortSha}</code></dd>
    <dt>Publisher</dt><dd><a href="https://github.com/${pkg.owner}">${pkg.owner}</a> on GitHub${stats ? ` (${plural(stats.stars, "star")}, ${plural(stats.forks, "fork")})` : ""}</dd>
    ${pkg.author?.name ? html`<dt>Author</dt><dd>${pkg.author.url ? html`<a href="${pkg.author.url}">${pkg.author.name}</a>` : pkg.author.name}</dd>` : ""}
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
    title: `${clip(pkg.displayName, 50)}: AgentRun template`,
    ogTitle: pkg.displayName,
    description: clip(pkg.description, 158),
    jsonLd,
    body,
    md: templateMd(site, pkg, { cost, keys, triggers, cli, stats }),
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

function templateMd(site, pkg, { cost, keys, triggers, cli, stats }) {
  const out = [
    `# ${pkg.displayName}`,
    "",
    pkg.description,
    "",
    `Category: ${CATEGORY_TEXT[pkg.category].title}. Tags: ${pkg.tags.join(", ") || "none"}. ${pkg.version ? `Version ${pkg.version}. ` : ""}${pkg.license ? `License ${pkg.license}. ` : ""}${pkg.author?.name ? `By ${pkg.author.name}.` : ""}`.trim(),
    "",
    "## Install",
    "",
    "```sh",
    cli,
    "```",
    "",
    `Or open \`<your AgentRun address>/templates/install?src=${encodeURIComponent(pkg.installSource)}\`. Pinned to commit ${pkg.sha}.`,
    "",
    "## What it does",
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
    "## Cost per run",
    "",
    `${cost.headline}. ${cost.detail}`,
    "",
    "## Tested by",
    "",
    pkg.evals.length ? `${plural(pkg.evals.length, "eval case")}: ${pkg.evals.join(", ")}.` : "No eval cases.",
    "",
    "## Source",
    "",
    `- Package: ${pkg.treeUrl}`,
    `- Publisher: ${pkg.owner}${stats ? ` (${plural(stats.stars, "star")}, ${plural(stats.forks, "fork")})` : ""}`,
    `- Page: ${site.url(`/templates/${pkg.name}/`)}`,
    "",
  );
  return out.join("\n");
}

// ---------- list your template ----------

export function listPage(site) {
  const path = "/list-your-template/";
  const trail = [["Templates", "/"], ["List your template", path]];
  const entry = `{ "name": "your-template", "source": "github:you/your-repo/path/to/template@v1.0.0", "category": "research", "tags": ["your-tag"] }`;
  const steps = [
    ["Put the template in a public GitHub repository.", "One folder: agent.md with its front matter, skills/, evals/, examples/ and the output schema. Private repositories can't be installed."],
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
    "One examples/<name>/ with input.json and an output.json that matches the schema.",
    "A description written for someone searching for this job: what it does, in plain words.",
  ];
  const body = html`
${crumbNav(trail)}
<section class="hero">
  <p class="caps eyebrow">For template authors</p>
  <h1>List your template</h1>
  <p class="lead">The marketplace is one file, <code>.agentrun/marketplace.json</code> in <a href="${site.repoUrl}">${site.repo.owner}/${site.repo.name}</a>. Your template stays in your repository. Listing it is a pull request that adds one line.</p>
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
<section aria-labelledby="cost-note">
  <h2 id="cost-note" class="caps section-label">Cost per run</h2>
  <p>Add a <code>measured.json</code> beside agent.md once you have run your evals, and the page shows the median cost instead of "not measured yet":</p>
  <pre class="code"><code>{ "median_usd": 0.42, "runs": 12, "model": "openrouter/particle-ai/particle-1", "harness": "pi", "measured_on": "2026-11-14" }</code></pre>
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
      "## Cost per run",
      "",
      "Add a `measured.json` beside agent.md: `{ \"median_usd\": 0.42, \"runs\": 12, \"model\": \"...\", \"harness\": \"pi\", \"measured_on\": \"2026-11-14\" }`.",
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
