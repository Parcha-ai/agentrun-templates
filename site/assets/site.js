// The only script on the site, and every page reads fine without it: search filters the cards already on the page,
// the Install button opens <your AgentRun>/#/templates/install?src=..., Copy copies the CLI line.
(() => {
  "use strict";
  const KEY = "agentrun.marketplace.address";

  // ---------- search (home) ----------
  const box = document.querySelector("[data-search]");
  const list = document.querySelector("[data-search-list]");
  const status = document.querySelector("[data-search-status]");
  if (box && list) {
    let index = null;
    const cards = [...list.querySelectorAll("[data-name]")];
    const words = (s) => String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const haystack = (t) => [t.name, t.title, t.description, t.category, ...(t.tags || [])].join(" ").toLowerCase();
    const run = () => {
      const q = words(box.value);
      let shown = 0;
      for (const card of cards) {
        const t = index && index.get(card.dataset.name);
        const text = t ? haystack(t) : card.textContent.toLowerCase();
        const hit = q.every((w) => text.includes(w));
        card.hidden = !hit;
        if (hit) shown++;
      }
      if (status) status.textContent = q.length ? `${shown} of ${cards.length} templates match.` : "";
      const url = new URL(location.href);
      if (q.length) url.searchParams.set("q", box.value); else url.searchParams.delete("q");
      history.replaceState(null, "", url);
    };
    fetch("/search.json")
      .then((r) => (r.ok ? r.json() : []))
      .then((rows) => { index = new Map(rows.map((t) => [t.name, t])); run(); })
      .catch(() => {});
    const q = new URL(location.href).searchParams.get("q");
    if (q) box.value = q;
    box.addEventListener("input", run);
    box.form?.addEventListener("submit", (e) => { e.preventDefault(); run(); });
    if (q) run();
  }

  // ---------- install ----------
  const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
  const save = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* private mode */ } };

  /** A base URL the reader typed: http(s) only, no query or fragment, trailing slash dropped. */
  const normalize = (text) => {
    let t = String(text || "").trim();
    if (!t) return null;
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(t)) t = `https://${t}`;
    let u;
    try { u = new URL(t); } catch { return null; }
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (u.username || u.password) return null;
    return `${u.origin}${u.pathname.replace(/\/+$/, "")}`;
  };

  const installUrl = (address, src) => `${address}/#/templates/install?src=${encodeURIComponent(src)}`;
  const button = document.querySelector("[data-install]");
  const forget = document.querySelector("[data-install-forget]");
  const where = document.querySelector("[data-install-address]");
  const dialog = document.querySelector("[data-install-dialog]");
  if (button && dialog) {
    const form = dialog.querySelector("[data-install-form]");
    const input = dialog.querySelector("input[name=address]");
    const error = dialog.querySelector("[data-install-error]");
    const src = button.dataset.install;
    let opener = null;
    const show = () => {
      const a = read();
      forget.hidden = !a;
      where.textContent = a ? `Opens ${a}` : "";
    };
    const go = (address) => {
      const a = document.createElement("a");
      a.href = installUrl(address, src);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    };
    button.hidden = false;
    show();
    button.addEventListener("click", () => {
      const a = read();
      if (a) return go(a);
      opener = button;
      error.textContent = "";
      input.value = "";
      dialog.showModal();
      input.focus();
    });
    forget.addEventListener("click", () => {
      opener = forget;
      error.textContent = "";
      input.value = read() || "";
      dialog.showModal();
      input.focus();
    });
    form.addEventListener("submit", (e) => {
      const a = normalize(input.value);
      if (!a) {
        e.preventDefault();
        error.textContent = "Type your AgentRun's address, like https://agentrun.example.com.";
        return;
      }
      save(a);
      show();
      go(a);
    });
    dialog.querySelector("[data-install-cancel]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => { if (opener) opener.focus(); opener = null; });
  }

  // ---------- copy ----------
  for (const btn of document.querySelectorAll("[data-copy]")) {
    if (!navigator.clipboard) continue;
    btn.hidden = false;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Copy failed";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  }
})();
