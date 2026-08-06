<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

- [2026-04-23] Next dev/build stale SSG: Running `pnpm build` while a `pnpm dev` session has been serving this app can leave the in-app browser showing stale generated SSG chunks even after source edits. When browser output does not match current source after a build/dev overlap, stop dev, remove `.next`, and restart `pnpm dev` before judging UI changes.
- [2026-06-14] Tailscale screenshot gallery: To share temporary screenshot review pages from this Mac over Tailscale, write static files under `/tmp`, serve them with `/usr/bin/python3 -m http.server <high-port> --bind 0.0.0.0`, and use the Tailscale IP from `ifconfig` such as `100.x.x.x:<port>`. The pyenv `python3` server may only be reachable on localhost even when bound to all interfaces, so prefer `/usr/bin/python3` for this case.
- [2026-06-17] Local Playwright port conflicts: localhost ports 3000 and 3002 can be occupied by unrelated lift-prog Node servers that accept connections without serving this app, causing naked-extra-crispy Playwright runs to hang while waiting for webServer readiness. When focused e2e runs stall, check lsof for the port owner, do not kill unrelated repo servers without explicit user approval, and use a temporary Playwright config on a fresh high port if needed.
