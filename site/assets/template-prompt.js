// Listing prompts are separate from the website header's AgentRun setup prompt.
(() => {
  const root = document.querySelector("[data-template-onboarding]");
  const dialog = document.querySelector("[data-template-prompt-dialog]");
  if (!root || !dialog) return;
  const picker = root.querySelector("[data-template-picker]");
  const menu = root.querySelector("[data-template-menu], .template-agent-menu");
  const feedback = document.querySelector("[data-template-feedback]");
  const status = dialog.querySelector("[data-template-prompt-status]");
  const textarea = dialog.querySelector("textarea");
  const prompt = textarea.value;
  const agents = [
    { name: "Codex app", icon: "codex-app.png", link: "codex://new?prompt=" },
    { name: "Codex CLI", icon: "codex-cli.svg" },
    { name: "Claude Code app", icon: "claude-app.png", link: "claude://code/new?q=" },
    { name: "Claude Code CLI", icon: "claude-code-cli.svg" },
    { name: "Cursor", symbol: "↖", link: "cursor://anysphere.cursor-deeplink/prompt?text=" },
    { name: "Pi", icon: "pi.svg" },
    { name: "OpenCode", symbol: ">_" },
    { name: "Other / terminal", symbol: ">_" },
  ];
  let opener = picker;
  let previousOverflow = "";
  let copyRequest = 0;
  // A floating menu outside the sticky install panel is not clipped by its scrollbar.
  menu.classList.add("agent-onboarding");
  document.body.append(menu);

  const close = (focus = false) => {
    menu.hidden = true;
    picker.setAttribute("aria-expanded", "false");
    if (focus) picker.focus();
  };
  const items = () => [...menu.querySelectorAll("[role=menuitem]")];
  const position = () => {
    if (menu.hidden) return;
    const bounds = picker.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= innerHeight) return close();
    const below = innerHeight - bounds.bottom - 12;
    const above = bounds.top - 12;
    const top = below < Math.min(menu.scrollHeight, 440) && above > below;
    menu.style.maxHeight = `${Math.max(100, top ? above : below)}px`;
    menu.style.left = `${Math.max(12, Math.min(bounds.left, innerWidth - menu.offsetWidth - 12))}px`;
    menu.style.top = `${top ? Math.max(12, bounds.top - menu.offsetHeight - 8) : bounds.bottom + 8}px`;
  };
  const open = (last = false) => {
    menu.hidden = false;
    picker.setAttribute("aria-expanded", "true");
    position();
    const options = items();
    (last ? options.at(-1) : options[0]).focus({ preventScroll: true });
  };
  const view = (trigger = picker, select = false) => {
    close();
    status.textContent = "";
    if (!dialog.open) {
      opener = trigger;
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      dialog.showModal();
    }
    if (select) { textarea.focus(); textarea.select(); }
  };
  const copy = async (name = "your agent", trigger = picker) => {
    const request = ++copyRequest;
    close(trigger === picker);
    try {
      await navigator.clipboard.writeText(prompt);
      if (request !== copyRequest) return;
      feedback.textContent = status.textContent = `Prompt copied. Paste it into ${name}.`;
    } catch {
      if (request !== copyRequest) return;
      view(trigger, true);
      status.textContent = "Copy the selected prompt, or download the Markdown file.";
    }
  };
  const option = (label, action, href) => {
    const element = document.createElement(href ? "a" : "button");
    if (href) element.href = href; else element.type = "button";
    element.className = "agent-menu-item";
    element.setAttribute("role", "menuitem");
    element.tabIndex = -1;
    element.setAttribute("aria-label", label);
    element.addEventListener("click", action);
    menu.append(element);
    return element;
  };
  for (const agent of agents) {
    const url = agent.link && agent.link + encodeURIComponent(prompt);
    const href = url?.length <= 8000 ? url : null;
    const element = option(agent.name, () => href ? close(true) : copy(agent.name), href);
    const icon = document.createElement("span");
    icon.className = "agent-menu-icon";
    icon.setAttribute("aria-hidden", "true");
    if (agent.icon) {
      const image = document.createElement("img");
      image.src = `/homepage/assets/agents/${agent.icon}`;
      image.alt = "";
      image.width = image.height = 18;
      icon.append(image);
    } else icon.textContent = agent.symbol;
    const label = document.createElement("span");
    label.className = "agent-menu-label";
    label.textContent = agent.name;
    const hint = document.createElement("span");
    hint.className = "agent-menu-hint";
    hint.textContent = href ? "Open" : "Copy";
    hint.setAttribute("aria-hidden", "true");
    element.append(icon, label, hint);
  }
  const separator = document.createElement("div");
  separator.className = "agent-menu-separator";
  separator.setAttribute("role", "separator");
  menu.append(separator);
  option("Copy prompt", () => copy()).textContent = "Copy prompt";
  option("View instructions", () => view()).textContent = "View instructions";

  picker.addEventListener("click", () => menu.hidden ? open() : close(true));
  picker.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      open(event.key === "ArrowUp");
    }
  });
  menu.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); close(true); }
    else if (event.key === "Tab") close(true);
    else if (event.key === " " && document.activeElement?.tagName === "A") {
      event.preventDefault(); document.activeElement.click();
    } else if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const options = items();
      const current = options.indexOf(document.activeElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : (current + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
      options[next].focus();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (!root.contains(event.target) && !menu.contains(event.target)) close();
  });
  window.addEventListener("resize", position);
  document.addEventListener("scroll", (event) => {
    // A click can queue a scroll event before opening the menu. Repositioning
    // keeps that delayed event from immediately dismissing the new menu.
    if (!menu.contains(event.target)) position();
  }, { capture: true, passive: true });
  // Cancel synchronously: the native close event arrives after pending promises can settle.
  const dismiss = () => {
    ++copyRequest;
    dialog.close();
  };
  dialog.querySelector("[data-template-prompt-close]").addEventListener("click", dismiss);
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dismiss();
  });
  dialog.addEventListener("cancel", () => { ++copyRequest; });
  dialog.addEventListener("close", () => {
    ++copyRequest;
    document.body.style.overflow = previousOverflow;
    opener.focus();
  });
  dialog.querySelector("[data-template-prompt-copy]").addEventListener("click", (event) => copy("your agent", event.currentTarget));
  dialog.querySelector("[data-template-prompt-download]").addEventListener("click", () => {
    const url = URL.createObjectURL(new Blob([prompt], { type: "text/markdown;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "agentrun-template-install.md";
    link.click();
    URL.revokeObjectURL(url);
  });
  picker.hidden = false;
  document.querySelector("[data-template-prompt-fallback]").hidden = true;
})();
