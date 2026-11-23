const loopback = (hostname) => {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  return host === "localhost" || host.endsWith(".localhost") || host === "[::1]" || /^127\.\d+\.\d+\.\d+$/.test(host);
};

/** The console's base URL, preserving an explicit scheme and any deployment path. */
export function normalizeInstallAddress(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  const explicitScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
  const address = text.replace(/^\/\//, "");
  let url;
  try {
    url = new URL(explicitScheme ? text : `https://${address}`);
    // AgentRun's local server listens over HTTP. Remote addresses default to HTTPS;
    // a scheme the reader supplies always wins, including HTTPS on localhost.
    if (!explicitScheme && loopback(url.hostname)) url = new URL(`http://${address}`);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;
  return `${url.origin}${url.pathname.replace(/\/+$/, "")}`;
}

/** Match AgentRun's console deep link without carrying a pasted query or fragment. */
export function templateInstallUrl(address, source) {
  const base = normalizeInstallAddress(address);
  return base ? `${base}/#/templates/install?src=${encodeURIComponent(source)}` : null;
}
