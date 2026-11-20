// Every page reads fine without this script: search filters existing cards,
// Install opens the reader's AgentRun, and Copy copies the CLI line.
const addressModule = new URL("./install-address.js", import.meta.url);
addressModule.search = new URL(import.meta.url).search;
const { normalizeInstallAddress, templateInstallUrl } = await import(addressModule);

(() => {
  "use strict";
  const KEY = "agentrun.marketplace.address";

  // ---------- search (home) ----------
  const box = document.querySelector("[data-search]");
  const list = document.querySelector("[data-search-list]");
  const status = document.querySelector("[data-search-status]");
  const none = document.querySelector("[data-search-none]");
  if (box && list) {
    let index = null;
    const cards = [...list.querySelectorAll("[data-name]")];
    const words = (s) => String(s || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
    const haystack = (t) => [t.name, t.title, t.description, t.category, ...(t.tags || []), ...(t.needs || [])].join(" ").toLowerCase();
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
      // The count is announced (role="status") for no match too; the paragraph under it then says what to do next.
      if (status) status.textContent = q.length ? `${shown} of ${cards.length} templates match.` : "";
      if (none) {
        none.hidden = !(q.length && !shown);
        // "search all templates" carries the words over to the home page.
        const all = none.querySelector("[data-search-all]");
        if (all) all.href = `/?q=${encodeURIComponent(box.value)}`;
      }
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
    // "/" puts the cursor in the search box, as on GitHub; Escape clears it.
    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? "")) {
        e.preventDefault();
        box.focus();
      }
    });
    box.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && box.value) { e.preventDefault(); box.value = ""; run(); }
    });
  }

  // ---------- install ----------
  const save = (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY); } catch { /* private mode */ } };
  const read = () => {
    try {
      const saved = localStorage.getItem(KEY);
      const address = normalizeInstallAddress(saved);
      if (saved && saved !== address) save(address);
      return address;
    } catch { return null; }
  };

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
      // Once the address is known the button says where it goes.
      let host = "";
      try { host = a ? new URL(a).host : ""; } catch { host = ""; }
      button.textContent = host ? `Install on ${host}` : "Install on your AgentRun";
    };
    const go = (address) => {
      const href = templateInstallUrl(address, src);
      if (!href) return;
      const a = document.createElement("a");
      a.href = href;
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
      const a = normalizeInstallAddress(input.value);
      if (!a) {
        e.preventDefault();
        error.textContent = "That is not an address. Type the one you open your AgentRun at, like agentrun.example.com.";
        input.setAttribute("aria-invalid", "true");
        input.focus();
        return;
      }
      input.removeAttribute("aria-invalid");
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
    const label = btn.textContent;
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Copy failed";
      }
      setTimeout(() => { btn.textContent = label; }, 1600);
    });
  }
})();
