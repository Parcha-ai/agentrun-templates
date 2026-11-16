**New PRs on fernlight/fernlight-js** · 2026-11-15T22:00:00Z
### #4164 fix: footnote ids collide across documents (https://github.com/fernlight/fernlight-js/pull/4164)
by @sam-ito · regular · CONTRIBUTOR; 4 PRs here incl. this one; 2 of the 4 shown merged
Says it prefixes footnote ids with a per-document counter to fix collisions across documents, addressing issue #4152.
Touches: src/render/footnotes.ts, test/render/footnotes.test.ts
Watch: test coverage for the footnote id fix
### #4163 feat(auth): sign plugin registry requests with a token (https://github.com/fernlight/fernlight-js/pull/4163)
by @ana-ruiz · member · MEMBER; history not read
Says it adds token-based authentication for the plugin registry to support private plugins, reading FERNLIGHT_REGISTRY_TOKEN.
Touches: auth: src/plugins/registry/auth.ts, src/plugins/registry/client.ts, docs/plugins/private-registry.md
Watch: auth code change: new token-based authentication for plugin registry
Watch: new file auth.ts handles token signing
Watch: draft PR
