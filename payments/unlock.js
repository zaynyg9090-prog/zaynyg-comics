/* Zaynyg World Comics — v1 unlock flow (STAGED).
 *
 * No server, no accounts. After a successful Stripe Payment Link purchase the
 * reader gets a per-issue unlock CODE (shown on the Stripe confirmation page —
 * see PAYWALL-DESIGN.md §6). They enter it once; we validate the checksum and
 * remember the unlock in localStorage. No login, works offline afterwards.
 *
 * HONEST LIMITS (v1): validation is client-side, so this is a convenience
 * unlock, not DRM — it stops casual freeloading, not piracy. v2 = Cloudflare
 * Worker + Stripe webhook issuing signed single-use tokens (see design doc).
 *
 * [TODO: when Stripe payout onboarding is done, generate each issue's code
 *  with the dev-time snippet in PAYWALL-DESIGN.md §7 and paste it into that
 *  issue's Stripe Payment Link confirmation message. Never commit codes.]
 */
window.ZW_UNLOCK = (function () {
  "use strict";

  var STORE_KEY = "zw_unlocks";       /* JSON array of unlocked SKUs */
  var ADULT_KEY = "zw_adult_ok";      /* shared 18+ gate flag (after-dark pages) */
  var CODE_SALT = "zw1-paywall-salt-v1"; /* visible in source — see "honest limits" above */
  var ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; /* no 0/O, 1/I/L */

  function fnv1a(str) {
    var h = 0x811c9dc5;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h >>> 0;
  }

  /* The code printed for an issue at setup time. Kept in sync with the
     dev-time generator in PAYWALL-DESIGN.md §7 — same algorithm. */
  function codeForIssue(sku) {
    var base = ALPHABET.length; /* 31 chars — always index with % base, never a hardcoded 32 */
    var n = fnv1a(String(sku) + ":" + CODE_SALT), out = "";
    for (var k = 0; k < 8; k++) { out = ALPHABET[n % base] + out; n = Math.floor(n / base); }
    return "ZW1-" + out.slice(0, 4) + "-" + out.slice(4);
  }

  function normalize(code) {
    return String(code || "").toUpperCase().replace(/[\s\-_]/g, "")
      .replace(/0/g, "O").replace(/1/g, "I").replace(/L/g, "I");
  }

  /* Validate a user-entered code for a SKU. Tolerant of spaces/dashes/case. */
  function validateCode(sku, code) {
    var want = normalize(codeForIssue(sku));
    var got = normalize(code);
    /* Accept with or without the ZW1 prefix. */
    return got === want || got === want.replace(/^ZW1/, "");
  }

  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
      return Array.isArray(v) ? v : [];
    } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }

  function isUnlocked(sku) { return load().indexOf(sku) !== -1; }

  function unlock(sku) {
    var list = load();
    if (list.indexOf(sku) === -1) { list.push(sku); save(list); }
    return true;
  }

  /* Dev helper: console.table of every issue + its code for Stripe setup.
     [TODO: run once at setup time AFTER Jose's Stripe onboarding; never ship codes.] */
  function setupTable() {
    var rows = {};
    Object.keys(window.ZW_PAY.ISSUES).forEach(function (sku) {
      rows[sku] = codeForIssue(sku);
    });
    return rows;
  }

  return {
    isUnlocked: isUnlocked,
    unlock: unlock,
    validateCode: validateCode,
    codeForIssue: codeForIssue,   /* setup-time use only */
    setupTable: setupTable,       /* setup-time use only */
    ADULT_KEY: ADULT_KEY
  };
})();
