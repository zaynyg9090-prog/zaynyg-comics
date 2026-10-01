# ⚡ Zaynyg World Comics — Plan & Prototype

**Status:** Local clickable prototype (not public, not deployed). Built Sep 29, 2026. Name locked Sep 30, 2026: **Zaynyg World Comics** (Jose's pick).
**Open it:** open `index.html` in any browser — no server, no build step, no sign-in.

---

## 1. The Concept

**Name: Zaynyg World Comics** (Jose's pick, locked Sep 30, 2026).
Tagline: *"Original comics, straight from the source."*

Jose's own comics reader + store for his original universes — no licensed characters, nothing he doesn't own 100%.

### Launch universes (all original, all his)
| Series | Genre | Audience | Hook |
|---|---|---|---|
| STAR CLASH | Sci-fi action | Teen | Anime superheroes vs. robotic vampire aliens draining every planet |
| Glitch Kids | Comedy adventure | All ages | A toilet portal, a Turbo Plunger 9000, infinite bad decisions |
| Emberfall | Epic fantasy | Teen | A stablehand, the last comet wolf, and the rising dead stars |
| North Park | Slapstick comedy | All ages | The wildest block in the city turns every day into cartoon chaos |
| Shell Shock | Action comedy | Teen | Zombie chick gang vs. alien turtle warrior women |
| Santa vs. the Zombie Apocalypse | Holiday horror-comedy | Teen | One jolly man vs. the hungry dead on Christmas Eve |

### Reader experience (mobile-first)
- **Panel-by-panel reading** — one panel fills the screen, tap / click / arrow-key to advance. No pinching or zooming.
- Progress bar + panel counter on every issue.
- Caption cards for story beats between art panels (also keeps art costs down).
- End-of-issue card pushes the reader to the store ("Get Issue #1").

### Store model
- **Every series launches with a FREE Issue #0** — the lead magnet. Fall in love first, pay later.
- Paid issues $0.99–$2.99, holiday specials up to $4.99. DRM-free: read in-app or download CBZ/PDF, keep forever.
- Creator-direct: no app-store cut on web sales. (Native app stores take ~15–30% later — web stays the home base.)

### Creator branding
- "By Zaynyg World" on every cover page, issue, and footer.
- Cross-links to the Shopify store, YouTube, TikTok, and Gumroad books from the app footer (Phase 2).

---

## 2. The Free Stack ($0, no paid signups)

| Layer | Choice | Cost |
|---|---|---|
| App | Plain HTML/CSS/JS, zero build step | $0 |
| Art (prototype) | Generated cover/panel art, local `.webp` | $0 |
| Hosting (when ready) | GitHub Pages, Cloudflare Pages, or Netlify free tier | $0 |
| Installability | PWA `manifest.json` (already included) — "Add to Home Screen" | $0 |
| Payments (Phase 2) | Stripe Payment Links or Gumroad — free to start, small % per sale only | $0 upfront |
| Analytics (later) | Cloudflare Web Analytics | $0 |
| Domain (optional, later) | e.g. comics.zaynygworld.com via Cloudflare | ~$10/yr only if wanted |

Nothing here requires a credit card. The prototype runs from `file://` today.

---

## 3. What's Built (this prototype)

```
~/workspace/comics-app/
├── index.html          — homepage: hero, featured shelf, feature band, store tease
├── library.html        — full library, genre filters, tap-a-series detail view
├── reader.html         — panel-by-panel reader: STAR CLASH #0 "First Spark" (4 beats)
├── store.html          — mock store: free + paid issues, mock checkout modal
├── 404.html            — custom not-found page (used by GitHub Pages + Cloudflare Pages)
├── data.js             — series + issue catalog (edit this to add content)
├── styles.css          — dark comic theme, mobile-first
├── manifest.json       — PWA manifest (installable later), favicon.ico
└── assets/
    ├── covers/         — 6 original series covers (webp)
    ├── panels/         — 3 original reader panels (webp)
    └── icons/          — PWA icons (192/512 PNG) + favicon source (64 PNG)
```

**To preview:** open `index.html` in a browser. Click through Home → Library → Read Free → Store. All links work locally.

**Art note:** one planned panel (alien warships over the city) couldn't be generated; beat 2 of the mini-comic is told as a styled caption card instead — a legit comics device, and the story still reads cleanly.

---

## 4. Roadmap

### Phase 1 — Web app (FREE, now → launch)
- [x] Prototype: homepage, library, panel reader, store mock
- [x] Name locked: **Zaynyg World Comics** (Jose, Sep 30, 2026)
- [ ] Jose reads the free Issue #0 and gives the final go on the art direction
- [ ] Polish: real logo, about page, footer links to store/socials
- [ ] Deploy free: GitHub Pages or Cloudflare Pages (5-minute setup, $0)
- [ ] Announce free Issue #0s on TikTok/YouTube/IG → traffic loop back to store

### Phase 2 — Real issues (FREE to produce, revenue starts)
- [ ] Adapt existing books into issues: Glitch Kids #1–3, Emberfall #1–5, North Park #1–3 (panel scripts from the finished manuscripts)
- [ ] Panel art pipeline: generated panels in each series' style, ~20–30 panels per issue
- [ ] Connect real checkout: Stripe Payment Links (free to start, ~2.9% + 30¢ per sale) — no monthly fee
- [ ] Sell DRM-free CBZ/PDF direct — keeps ~97% vs. Amazon KDP's 35–70% royalties. **This is the KDP-free path Jose asked about: he keeps his books AND his margin.**
- [ ] Bundle play: comic Issue #1 free with any Shopify toy order (QR code in packaging)

### Phase 3 — Native mobile apps (ONLY when revenue justifies)
- [ ] Wrap the web app (PWA → native shell) for iOS/Android
- [ ] ⚠️ Fees apply: **Apple Developer $99/year, Google Play $25 one-time** — do NOT sign up until the web app is earning
- [ ] Web remains the home base (no 15–30% store cut on web sales)

---

## 5. Next Step (recommended)

**Jose reads the free Issue #0 in `reader.html` and says go/no-go on the art direction.**
If go: polish + free deploy (Phase 1, ~1 day of work, $0). Then Phase 2 turns his finished books into the first real issues — the content already exists, it just needs paneling.

---

*All characters, stories, and art in this prototype are original works created for Zaynyg World. No licensed or third-party characters are used.*
