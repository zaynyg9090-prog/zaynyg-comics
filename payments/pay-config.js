/* Zaynyg World Comics — one-tap pay-link catalog (STAGED).
 *
 * STANDING RULE: Issue #0 / preview is FREE, no login. Everything below is PAID.
 *
 * PAYOUT ROUTE (Jose's call, Oct 19, 2026): SHOPIFY, not Stripe.
 * Each `payLink` gets the live Shopify product URL the moment that issue's
 * product is published (draft → attach PDF via the Digital Products app → ACTIVE).
 * Payouts flow through the store's existing Shopify Payments pipe.
 * Until then every payLink is a PLACEHOLDER on purpose. Nothing here can take money.
 *
 * Shopify "Comics" collection (staging, unpublished): gid://shopify/Collection/325919375445
 * Digital delivery: Shopify Digital Products app (free, installed) — attach the issue
 * PDF on the product page in Admin; the buyer gets the download link at checkout + by email.
 * Full flow: ~/workspace/ops/comics-shopify-payout-2026-10-19/REPORT.md
 *
 * Tiers: mini $0.99 · standard $1.99 · special $2.99
 *
 * CHECKOUT WIRED Oct 25, 2026 (staged, LAUNCH OFF — see payments/CHECKOUT-README.md):
 * Family-issue payLinks below are real Shopify cart-permalink checkout URLs
 * (https://zsbzba-dy.myshopify.com/cart/<variantId>:1). NOTHING is buyable yet:
 * isLive() returns false until LAUNCH is flipped to true AND the issue's Shopify
 * product is published (drafts must be published + PDF attached in Admin first).
 * Adult-lane issues (bb-1..bb-6) keep PLACEHOLDER payLinks — no adult product wired.
 * adult:true  → 18+ gate renders BEFORE the paywall (Borderline Beasts, North Park adult).
 * status: "presale" (buy now, issue drops soon) | "live" (read immediately after unlock)
 */
window.ZW_PAY = (function () {
  var PLACEHOLDER = "[TODO: replace with live Shopify product URL once the issue product is published]";
  /* MASTER SWITCH — defaults OFF. Flip to true ONLY at launch (see payments/CHECKOUT-README.md).
     While false, isLive() returns false for every issue, so every buy button in the app
     stays in its "coming soon" state even though the payLinks below are real URLs. */
  var LAUNCH = false;

  /* FAMILY_ONLY (added Nov 8, 2026): the public family site/app build sets this to true
     (the export script flips it), so adult-lane issues are invisible there: getIssue()
     returns null for them. The adult staging copy keeps it false. Nothing is removed. */
  var FAMILY_ONLY = true;

  /* CONTENT_READY (added Nov 8, 2026): only issues whose pages actually exist in
     paid-reader.html PAID_PAGES. Every other paid issue shows "Coming soon" — no buy
     button, no unlock box — even if LAUNCH is flipped, so nobody can pay for an empty issue.
     When an issue's art is finished: add PAID_PAGES[sku] in paid-reader.html AND its sku here. */
  var CONTENT_READY = { "overdue-2": true, "star-clash-az-1": true, "jesus-wedding": true };

  var ISSUES = {
    /* ---- Family lane ---- */
    "star-clash-1": {
      sku: "star-clash-1", series: "STAR CLASH",
      title: "#1 — Battle for Every Planet",
      blurb: "The full 22-page issue. Five teens ignite — and the war for every planet begins.",
      price: 1.99, tier: "standard", adult: false, status: "presale",
      cover: "assets/covers/cover-star-clash.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46529544716373:1"
    },
    "emberfall-1": {
      sku: "emberfall-1", series: "Emberfall",
      title: "#1 — Spark of the Comet Wolf",
      blurb: "The full issue, adapted from the novel. Ride the comet wolf. Outrun the dead stars.",
      price: 1.99, tier: "standard", adult: false, status: "presale",
      cover: "assets/covers/cover-emberfall.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46529544749141:1"
    },
    "north-park-1": {
      sku: "north-park-1", series: "North Park",
      title: "#1 — The Great Snow Day Heist",
      blurb: "The wildest block in the city turns a snow day into a full-blown cartoon catastrophe.",
      price: 0.99, tier: "mini", adult: false, status: "presale",
      cover: "assets/covers/cover-north-park.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46529544683605:1"
    },
    "santa-zombie-special": {
      sku: "santa-zombie-special", series: "Santa vs. the Zombie Apocalypse",
      title: "Holiday Special — 48 pages",
      blurb: "Christmas Eve. The dead rise hungry. One jolly old man stands between them and every kid on the nice list.",
      price: 2.99, tier: "special", adult: false, status: "presale",
      cover: "assets/covers/cover-santa-zombie.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46529544781909:1"
    },

    /* ---- Workstream 1 batch (staged Oct 19, 2026) — story beats staged in reader stubs ---- */
    "overdue-2": {
      sku: "overdue-2", series: "OVERDUE",
      title: "#2 — The Audit",
      blurb: "The full issue — 10 painted panels. The Write-Offs face the Comptroller's cosmic audit.",
      price: 2.99, tier: "special", adult: false, status: "presale",
      cover: "assets/panels/cover-overdue-pawnshop.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46435609018453:1"
    },
    "star-clash-az-1": {
      sku: "star-clash-az-1", series: "STAR CLASH",
      title: "Ascendant Zero #1 — The Invitation",
      blurb: "The full issue — 8 painted panels. Four Ascendants walk into the Maw Engine's tournament.",
      price: 1.99, tier: "standard", adult: false, status: "presale",
      cover: "assets/covers/cover-star-clash.webp",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46435609575509:1"
    },
    "jesus-wedding": {
      sku: "jesus-wedding", series: "KINGDOM COMICS",
      title: "Jesus at the Wedding — Love & Heaven Vol. 1",
      blurb: "The full issue — 6 painted panels in reverent golden light. Jesus's first miracle at the wedding in Cana.",
      price: 1.99, tier: "standard", adult: false, status: "presale",
      cover: "assets/covers/faith-jesus-wedding.jpg",
      payLink: "https://zsbzba-dy.myshopify.com/cart/46435610099797:1"
    },

    /* ---- Adult lane (18+ gate stays in front of purchase — never in the family store) ---- */
    "bb-1": {
      sku: "bb-1", series: "BORDERLINE BEASTS",
      title: "#1 — First Blood at the Muck",
      blurb: "The first official game at The Muck. The league learns what beastball really costs.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/cover-issue0-the-crash.webp",
      payLink: PLACEHOLDER
    },
    "bb-2": {
      sku: "bb-2", series: "BORDERLINE BEASTS",
      title: "#2 — The Kennel Rules",
      blurb: "The rematch in Hellhound Creek. Bonecrusher unveils the Rage Core.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/concept-bonecrusher-vex.webp",
      payLink: PLACEHOLDER
    },
    "bb-3": {
      sku: "bb-3", series: "BORDERLINE BEASTS",
      title: "#3 — Surge Season",
      blurb: "Chomp's Surge starts burning him out — and a fixer offers a \"cleaner\" kind of power.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/concept-chomp-delgado.webp",
      payLink: PLACEHOLDER
    },
    "bb-4": {
      sku: "bb-4", series: "BORDERLINE BEASTS",
      title: "#4 — The Fixer's Game",
      blurb: "Both teams discover the Commissioner's league is rigged from the inside.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/concept-swampjaw-mauler.webp",
      payLink: PLACEHOLDER
    },
    "bb-5": {
      sku: "bb-5", series: "BORDERLINE BEASTS",
      title: "#5 — Redline Rising",
      blurb: "The Raiders weaponize the crash site itself — the swamp starts mutating everything.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/concept-redline-raider.webp",
      payLink: PLACEHOLDER
    },
    "bb-6": {
      sku: "bb-6", series: "BORDERLINE BEASTS",
      title: "#6 — Border War",
      blurb: "Season finale: the Border Bowl under a burning sky. The Commissioner's true plan revealed.",
      price: 1.99, tier: "standard", adult: true, status: "presale",
      cover: "assets/panels-adult/cover-issue0-the-crash.webp",
      payLink: PLACEHOLDER
    }
  };

  function getIssue(sku) {
    var it = ISSUES[sku] || null;
    if (it && FAMILY_ONLY && it.adult) return null;
    return it;
  }

  function hasContent(issue) { return !!issue && CONTENT_READY[issue.sku] === true; }

  /* A pay link is LIVE only when LAUNCH is on AND it's a real https URL, not the placeholder.
     Single gate for the whole app: store, paid-reader, faith-reader, and the dedicated
     issue readers all call isLive(), so flipping LAUNCH is what arms every buy button. */
  function isLive(issue) {
    return LAUNCH && hasContent(issue) && typeof issue.payLink === "string" &&
      issue.payLink.indexOf("https://") === 0;
  }

  function money(n) { return "$" + n.toFixed(2); }

  return {
    PLACEHOLDER: PLACEHOLDER,
    ISSUES: ISSUES,
    getIssue: getIssue,
    hasContent: hasContent,
    familyOnly: FAMILY_ONLY,
    isLive: isLive,
    money: money,
    /* Checkout redirect targets (relative so staging works; absolute in production). Shopify checkout returns buyers to the store; the app unlock flow stays code-based. */
    successPage: "payments/success.html",
    cancelPage: "payments/cancelled.html",
    readerPage: "paid-reader.html"
  };
})();
