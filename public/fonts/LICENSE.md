# Satoshi Font

Designed by Deni Anggara, published by Indian Type Foundry (ITF), distributed free via
[Fontshare](https://www.fontshare.com/fonts/satoshi) under Fontshare's free license
(`license_type: itf_ffl` per Fontshare's own API) — free for personal and commercial use,
including self-hosting, with no attribution required. Self-hosted here (rather than loaded from
Fontshare's CDN) to keep font loading fully offline-first, consistent with the rest of this PWA.

Files: `Satoshi-Regular.woff2` (400), `Satoshi-Medium.woff2` (500), `Satoshi-Bold.woff2` (700 —
also covers Tailwind's `font-semibold`/600 via normal browser font-weight fallback, since
Satoshi has no static 600 cut), fetched directly from Fontshare's CDN
(`api.fontshare.com/v2/css?f[]=satoshi@...`). The 900 (Black) weight was fetched too but removed
since nothing in the app used it — no point precaching unused font weight.
