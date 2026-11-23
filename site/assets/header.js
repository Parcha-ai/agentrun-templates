// The website's header behavior, adapted to a static document lifecycle.
const header = document.querySelector(".marketing-header");
if (header) {
  const update = () => header.toggleAttribute("data-scrolled", window.scrollY > 0);
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("pageshow", update);
  header.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest(".mh-menu a[href]") : null;
    const menu = link?.closest("details");
    if (menu) menu.open = false;
  });
}

const onboarding = document.querySelector("[data-shared-onboarding]");
if (onboarding) {
  const runtime = new URL("/homepage/onboarding.js", window.location.href);
  runtime.search = new URL(import.meta.url).search;
  try {
    const { mount } = await import(runtime.href);
    mount(onboarding);
  } catch (error) {
    console.error("AgentRun setup could not start", error);
    // Keep the primary action useful if the optional setup menu cannot load.
    header?.querySelector("[data-agent-picker]")?.addEventListener("click", () => {
      window.location.assign("https://agentrun.ai/docs/quickstart");
    });
  }
}
