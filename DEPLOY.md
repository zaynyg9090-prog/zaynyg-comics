# Zaynyg World Comics — Deploy Runbook ($0, free tiers only)

**Status:** Site is fixed, tested, and deploy-ready. Git repo initialized + committed at `~/workspace/comics-app`.
**Blocked on:** GitHub + Cloudflare accounts don't exist yet. Everything below is staged so deploy takes ~10 min once accounts exist.

## What's ready
- All pages render with zero JS errors (tested via jsdom): index, library, reader, store, 404
- All 9 webp assets valid; icons generated (192/512 PNG + favicon.ico); manifest.json has icons
- All links relative → works under any subpath (`username.github.io/zaynyg-comics/`, `*.pages.dev`)
- `.nojekyll` (GitHub Pages), `.github/workflows/pages.yml` (auto-deploy on push to `main`), `wrangler.toml` (Cloudflare Pages)
- Commit: `e13c620 Zaynyg Comics launch build`

## Path A — GitHub Pages (needs: GitHub account for zaynyg9090@gmail.com)
1. Jose creates the account (github.com/signup) and taps the verification email. If he saves the password via Secure Vault, use it for `gh auth login`.
2. Then run:
   ```
   cd ~/workspace/comics-app
   echo '<VAULT_TOKEN>' | gh auth login --with-token   # or: gh auth login (interactive)
   gh repo create zaynyg-comics --public --source=. --push
   ```
3. Enable Pages: repo → Settings → Pages → Source: **GitHub Actions** (workflow already in repo).
4. Live URL: `https://<username>.github.io/zaynyg-comics/` — verify homepage + reader load.

## Path B — Cloudflare Pages (needs: Cloudflare account for zaynyg9090@gmail.com)
Easiest (no CLI): dash.cloudflare.com → sign up → tap verification email → **Workers & Pages → Create → Pages → Upload assets** → drag the `~/workspace/comics-app` folder → Deploy.
CLI alternative (needs API token in Secure Vault):
```
cd ~/workspace/comics-app
npx wrangler pages deploy . --project-name=zaynyg-comics
```
Live URL: `https://zaynyg-comics.pages.dev` (or the assigned `*.pages.dev` name) — verify homepage + reader load.

## Jose's taps (the only blockers)
1. GitHub verification email → zaynyg9090@gmail.com
2. Cloudflare verification email → zaynyg9090@gmail.com
(Optional) Save both passwords via the Secure Vault so future pushes/deploys need no more taps.

## Fixes applied in this pass
- PWA manifest had empty `icons: []` → generated 192/512 icons from the STAR CLASH cover, wired into manifest
- Added favicon.ico (+ `<link rel="icon">` on all 5 pages) and custom 404.html
- Footer copy: "Prototype build — not yet public" → launch-ready copy
- Store modal: "Prototype mode: nothing is for sale yet" → "checkout opens at launch… check back soon"
- Store modal now closes on Escape (was click/✕ only)
- Mobile nav: brand + 4 links crowded at 360px → shrunk brand/links under 640px

## Perfection pass (Sep 30, 2026)
- Name locked per Jose: **Zaynyg World Comics** — updated in all page titles, nav brand, footers, manifest (`name`/`short_name`), README, and this runbook. Deploy slugs stay `zaynyg-comics` (short URLs).
- Killed the "New Drops Weekly" promise (nothing is on a weekly schedule yet): feature card → "More Drops Incoming", footer → "More drops on the way".
- Store "How buying will work" no longer names payment vendors — just "free-to-start payment link". Modal still says checkout opens at launch; no real promises.
- Hero now lists all six series (Santa vs. the Zombie Apocalypse was missing).
- PWA polish: `manifest.json` gained `scope: "./"`; every page now links the manifest + apple-touch-icon + theme-color (previously only index.html linked the manifest).
- Mobile nav now wraps cleanly under 640px instead of overflowing at 360px widths.
- Removed empty `assets/hero/` directory (nothing referenced it).
