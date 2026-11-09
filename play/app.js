/* Zaynyg World: Comics & Games, hub logic.
   One file for the Android app (Capacitor + native ZWNative plugin: Google Play Billing + AdMob)
   and the web version (no billing/ads: the Pass links to the Android app). */
(function () {
  'use strict';
  var CFG = window.ZW_CONFIG;
  var CAP = window.Capacitor;
  var NATIVE = !!(CAP && CAP.isNativePlatform && CAP.isNativePlatform() && CAP.nativePromise);
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  if (!NATIVE) document.body.classList.add('web');

  function nativeCall(method, opts) {
    if (!NATIVE) return Promise.reject(new Error('web'));
    return CAP.nativePromise('ZWNative', method, opts || {});
  }

  /* ---------------- state & entitlements ---------------- */
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var S = {
    owned: LS.get('zw_owned', []),          // product ids Google Play says the user owns (cached)
    prices: {},                             // productId -> localized price from Play
    billingReady: false,
    adsEnabled: NATIVE,                     // AdMob only exists in the Android app
    sessionGames: {},                       // games unlocked for this session by a rewarded video
    tab: 'comics', reading: null, playing: null
  };
  var PASS = function () { return CFG.products.pass; };
  function hasPass() { return S.owned.indexOf(PASS()) >= 0; }
  function ownsComic(c) { return !c.product || hasPass() || S.owned.indexOf(c.product) >= 0; }
  function adsRemoved() { return S.owned.length > 0; }   // Pass or any purchase removes ads
  function priceOf(id) { return S.prices[id] || CFG.fallbackPrices[id] || ''; }
  function setOwned(list) {
    if (!Array.isArray(list)) return;
    S.owned = list; LS.set('zw_owned', list); renderAll(); syncBanner();
  }

  /* ---------------- catalog ---------------- */
  var DANIEL_CAPS = (window.FAITH_CAPTIONS || {})['daniel-comic-preview'] || [];
  var COMICS = [
    { id: 'daniel', title: "Daniel and the Lion's Den", series: 'Bible Heroes #1', cover: 'assets/covers/daniel-comic.jpg',
      blurb: "Jose Quinones's Bible Heroes story, now a full-color comic in his own words. Daniel stays faithful, even in a den of hungry lions.",
      free: CFG.free.danielPanels, product: CFG.products.comics.daniel,
      note: 'Pages 1–10 of 20 are drawn so far (23 panels). Pages 11–20 arrive in a free update for everyone who unlocked it.',
      shop: 'https://zsbzba-dy.myshopify.com/products/daniel-and-the-lions-den',
      panels: DANIEL_CAPS.map(function (cap, i) { return { img: 'comics/daniel/panel-' + (i + 1) + '.jpg', cap: cap }; }) },
    { id: 'star-clash', title: 'STAR CLASH #0: First Spark', series: 'Star Clash', cover: 'assets/covers/star-clash.jpg',
      blurb: 'The night the sky cracked open, Jay\'s hands ignited. A free mini-comic.', free: 99, product: null,
      shop: 'https://zsbzba-dy.myshopify.com/collections/comics',
      panels: [
        { img: 'comics/star-clash/panel-1-sky-crack.jpg', cap: 'It started on an ordinary Tuesday, the night the sky cracked open over the city, and Jay saw the stars bleeding through.' },
        { text: true, cap: 'Across the sky, the Crimson Circuit descended: robot warships come to drain Earth\'s starlight. The invasion had begun.' },
        { img: 'comics/star-clash/panel-3-starlight-hands.jpg', cap: 'But the stars had already chosen their champion. Light answered light, and Jay\'s hands ignited.' },
        { img: 'comics/star-clash/panel-4-leap.jpg', cap: 'One leap. One spark. The first clash of a war for every planet…' }
      ] }
  ];
  var SOON = [
    { title: 'David and Goliath', series: 'Bible Heroes #2', cover: 'assets/covers/david-book.jpg' },
    { title: 'Glitch Kids', series: 'Comic series', cover: 'assets/covers/glitch-kids.jpg' },
    { title: 'North Park', series: 'Comic series', cover: 'assets/covers/north-park.jpg' },
    { title: 'Emberfall', series: 'Comic series', cover: 'assets/covers/emberfall.jpg' }
  ];
  var GAMES = [
    { id: 'glitch-kids', file: 'games/glitch-kids.html', img: 'assets/games/glitch-kids.jpg', title: 'Glitch Kids Adventure',
      desc: 'Zay, Maya and the crew explore a glitchy town, finish quests and battle silly bosses.', free: 'Chapters 1–2 free', pass: 'Chapters 3–5 with Pass' },
    { id: 'crash-course', file: 'games/nmcf-crash-course.html', img: 'assets/games/crash-course.jpg', title: 'NMCF: Crash Course',
      desc: 'Nuclear Monster College Football. Juke, stiff-arm and score as a giant cartoon monster.', free: 'Free to play', pass: null },
    { id: 'apocalypse', file: 'games/nmcf-apocalypse.html', img: 'assets/games/apocalypse.jpg', title: 'NMCF: Apocalypse',
      desc: 'Survive wave after wave of field raiders. Grab weapons, go BEAST mode.', free: 'Waves 1–3 free', pass: 'Endless waves with Pass' },
    { id: 'north-park', file: 'games/north-park-city.html', img: 'assets/games/north-park.jpg', title: 'North Park: City Chaos',
      desc: 'Cruise the block in Family Edition: taco runs, go-kart chases and party missions.', free: 'Missions 1–2 free', pass: 'Missions 3–5 with Pass', exitBottom: true }
  ];
  var SHOP = [];
  var SHOP_CATS = [
    { t: '📚 Books', u: '/collections/books' }, { t: '💥 Comics', u: '/collections/comics' },
    { t: '📦 Box Sets', u: '/collections/box-sets' }, { t: '🎧 Read-Along Audio', u: '/collections/read-along-audio' },
    { t: '🧸 Toys & Gifts', u: '/collections/toys-gifts' }, { t: '🎄 Christmas', u: '/collections/christmas' }
  ];

  /* ---------------- rendering ---------------- */
  function renderComics() {
    var d = COMICS[0];
    var h = '<h2>Comics</h2><p class="sub">Family-clean stories from Zaynyg World. Tap a cover to read.</p>' +
      '<div class="hero"><img src="comics/daniel/panel-1.jpg" alt=""><div class="in"><span class="tag">BIBLE HEROES</span><h3>' + esc(d.title) + '</h3>' +
      '<p>' + esc(d.blurb) + '</p><button class="btn" data-read="daniel" type="button">📖 Read free preview</button></div></div>' +
      '<div class="shelf-title">Read now</div><div class="grid">';
    COMICS.forEach(function (c) {
      var badge = !c.product ? '<span class="badge free">FREE</span>' : ownsComic(c) ? '<span class="badge free">UNLOCKED</span>' : '<span class="badge pass">FREE PREVIEW</span>';
      h += '<button class="card" data-read="' + c.id + '" type="button">' + badge + '<img src="' + c.cover + '" alt="" loading="lazy"><div class="t"><b>' + esc(c.title) + '</b><small>' + esc(c.series) + '</small></div></button>';
    });
    h += '</div><div class="shelf-title">Coming soon</div><div class="grid">';
    SOON.forEach(function (c) {
      h += '<div class="card soon"><span class="badge soon">SOON</span><img src="' + c.cover + '" alt="" loading="lazy"><div class="t"><b>' + esc(c.title) + '</b><small>' + esc(c.series) + '</small></div></div>';
    });
    h += '</div>';
    $('view-comics').innerHTML = h;
  }
  function renderGames() {
    var h = '<h2>Games</h2><p class="sub">Play offline, right on your phone. ' + (hasPass() ? 'Your Pass unlocks every level. ⭐' : 'First levels free. The Zaynyg Pass unlocks the rest.') + '</p>';
    GAMES.forEach(function (g) {
      h += '<button class="game-row" data-game="' + g.id + '" type="button"><img src="' + g.img + '" alt=""><div class="t"><b>' + esc(g.title) + '</b><small>' + esc(g.desc) + '</small>' +
        '<span class="pill free">' + esc(g.free) + '</span>' + (g.pass ? '<span class="pill pass">' + (hasPass() ? '⭐ Unlocked' : esc(g.pass)) + '</span>' : '') + '</div><span class="play">PLAY</span></button>';
    });
    $('view-games').innerHTML = h;
  }
  function renderShop() {
    var h = '<h2>Shop</h2><p class="sub">Books, comics and merch from the Zaynyg World store. A grown-up needs to say OK before we open the store.</p><div class="shop-cats">';
    SHOP_CATS.forEach(function (c) { h += '<button data-url="' + CFG.storeUrl + c.u + '" type="button">' + c.t + '</button>'; });
    h += '</div>';
    var groups = [['Bible Heroes books', function (x) { return /Bible|Daniel|David|Noah|Jonah|Jesus|Sunday/.test(x.title); }],
                  ['Kids books & audio', function (x) { return x.type && /Digital|Book/.test(x.type) && !/Bible|Daniel|David|Noah|Jonah|Jesus|Sunday/.test(x.title); }],
                  ['Merch', function (x) { return !x.type || /Shirt|Tee|Hat|Beanie/.test(x.type + x.title); }]];
    groups.forEach(function (g) {
      var items = SHOP.filter(g[1]); if (!items.length) return;
      h += '<div class="shelf-title">' + g[0] + '</div><div class="grid">';
      items.forEach(function (x) {
        h += '<button class="card' + (/Tee|Beanie/.test(x.title) ? ' sq' : '') + '" data-url="' + x.url + '" type="button"><img src="' + x.img + '" alt="" loading="lazy"><div class="t"><b>' + esc(x.title) + '</b><small class="price">' + (x.price > 0 ? 'from $' + x.price.toFixed(2) : 'FREE') + '</small></div></button>';
      });
      h += '</div>';
    });
    h += '<button class="btn block alt" data-url="' + CFG.storeUrl + '" type="button">Open the full store ›</button>';
    $('view-shop').innerHTML = h;
  }
  function passBenefits() {
    return '<ul><li>Every comic page, including new pages as they are drawn</li><li>Glitch Kids chapters 3–5</li><li>Endless waves in NMCF: Apocalypse</li><li>North Park missions 3–5</li><li>No ads anywhere in the app</li><li>Supports an independent family author and dad of five</li></ul>';
  }
  function renderPass() {
    var h = '<h2>Zaynyg Pass</h2><p class="sub">One pass for every comic and game in Zaynyg World.</p><div class="passbox"><h3>⭐ ZAYNYG PASS</h3>' + passBenefits();
    if (hasPass()) {
      h += '<p><b>Your Pass is active. Thank you! 🙌</b></p><button class="btn block alt native-only" data-act="manage" type="button">Manage subscription in Google Play</button>';
    } else if (NATIVE) {
      h += '<button class="btn block" data-act="buy-pass" type="button">Get the Pass for ' + esc(priceOf(PASS())) + '</button>' +
        '<p class="fine">Monthly subscription, billed through Google Play. Renews every month until canceled. Cancel anytime in Google Play › Subscriptions. A grown-up must approve the purchase.</p>';
    } else {
      h += '<a class="btn block" href="' + CFG.playUrl + '" target="_blank" rel="noopener">Get the Pass in the Android app</a><p class="fine">The Zaynyg Pass is sold through Google Play in the Android app. On the web you can play the free levels and read the free previews.</p>';
    }
    h += '</div>';
    h += '<div class="shelf-title">Single comics</div>';
    COMICS.filter(function (c) { return c.product; }).forEach(function (c) {
      h += '<div class="game-row"><img src="' + c.cover + '" alt=""><div class="t"><b>' + esc(c.title) + '</b><small>' + esc(c.note || '') + '</small></div>' +
        (ownsComic(c) ? '<span class="pill free">Unlocked</span>' : NATIVE ? '<button class="play" data-act="buy-comic" data-id="' + c.id + '" type="button">' + esc(priceOf(c.product)) + '</button>' : '') + '</div>';
    });
    h += '<div class="native-only"><button class="btn block alt" data-act="restore" type="button">Restore purchases</button></div>';
    h += '<p class="fine">Questions? <a href="#" data-act="parents">Parents corner</a> · <a href="#" data-url="' + CFG.privacyUrl + '">Privacy policy</a></p>';
    $('view-pass').innerHTML = h;
  }
  function renderChip() {
    var c = $('passChip');
    if (hasPass()) { c.textContent = '⭐ Pass active'; c.classList.add('owned'); } else { c.textContent = '⭐ Get Pass'; c.classList.remove('owned'); }
  }
  function renderAll() { renderComics(); renderGames(); renderShop(); renderPass(); renderChip(); if (S.reading) drawPanel(); }

  /* ---------------- tabs ---------------- */
  function showTab(t) {
    S.tab = t;
    document.querySelectorAll('.view').forEach(function (v) { v.hidden = v.getAttribute('data-tab') !== t; });
    document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === t); });
    window.scrollTo(0, 0);
  }

  /* ---------------- toast / modal ---------------- */
  var toastT;
  function toast(msg) { var t = $('toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(function () { t.hidden = true; }, 2600); }
  var modalClose = null;
  function openModal(html, onClose) {
    $('sheet').innerHTML = '<button class="x" data-act="close" type="button" aria-label="Close">✕</button>' + html;
    $('modal').hidden = false; modalClose = onClose || null; syncBanner();
  }
  function closeModal(silent) {
    if ($('modal').hidden) return;
    $('modal').hidden = true; var f = modalClose; modalClose = null; syncBanner();
    if (f && !silent) f();
  }

  /* Grown-ups check before purchases and before leaving the app (Families policy best practice). */
  function parentGate(why, ok) {
    var a = 3 + Math.floor(Math.random() * 7), b = 4 + Math.floor(Math.random() * 6);
    openModal('<h3>Grown-ups only</h3><p>' + esc(why) + '</p><p>Please ask a grown-up to answer:</p><p style="font-size:26px;text-align:center"><b>What is ' + a + ' × ' + b + '?</b></p>' +
      '<input id="pgIn" type="number" inputmode="numeric" autocomplete="off" aria-label="Answer"><button class="btn block" id="pgOk" type="button">Continue</button>', reshowLock);
    var inp = $('pgIn');
    $('pgOk').onclick = function () {
      if (parseInt(inp.value, 10) === a * b) { closeModal(true); ok(); }
      else { inp.value = ''; inp.placeholder = 'Not quite. Try again'; }
    };
  }
  function openExternal(url) {
    parentGate('This opens a website outside the app.', function () {
      if (NATIVE) nativeCall('openUrl', { url: url }).catch(function () { toast('Could not open the link'); });
      else window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------------- purchases ---------------- */
  function buy(productId) {
    if (!NATIVE) { window.open(CFG.playUrl, '_blank', 'noopener'); return; }
    parentGate('Purchases are made with Google Play.', function () {
      nativeCall('purchase', { productId: productId }).then(function (r) {
        setOwned(r.owned);
        if (S.owned.indexOf(productId) >= 0) toast('Unlocked! Thank you 🙌'); else if (r.pending) toast('Purchase pending. It unlocks when Google Play confirms it.');
        afterEntitlementChange(); reshowLock();
      }).catch(function (e) {
        var m = (e && e.message) || '';
        reshowLock();
        if (/cancel/i.test(m)) return;
        toast(/not.?ready|unavailable|setup/i.test(m) ? 'Google Play Billing is not available right now.' : 'Purchase did not go through.');
      });
    });
  }
  function restore() {
    nativeCall('restore').then(function (r) { setOwned(r.owned); toast(r.owned.length ? 'Purchases restored ✓' : 'No purchases found for this Google account.'); afterEntitlementChange(); })
      .catch(function () { toast('Could not reach Google Play.'); });
  }
  var pendingUnlock = null;
  function reshowLock() {
    var p = pendingUnlock;
    if (p && p.game && !$('game').hidden && $('modal').hidden && !gameAllowed(p.game)) gameLock(p.game, p.label, p.go);
  }
  function afterEntitlementChange() {
    if (pendingUnlock && pendingUnlock.check()) { var f = pendingUnlock.go; pendingUnlock = null; closeModal(true); f(); }
  }

  /* ---------------- ads ---------------- */
  var bannerOn = false;
  function wantBanner() {
    return NATIVE && S.adsEnabled && !adsRemoved() && $('reader').hidden && $('game').hidden && $('modal').hidden;
  }
  function syncBanner() {
    var want = wantBanner();
    if (want === bannerOn) return;
    bannerOn = want;
    if (want) nativeCall('showBanner').then(function (r) { if (bannerOn) document.documentElement.style.setProperty('--banner-h', ((r && r.height) || 50) + 'px'); }).catch(function () { bannerOn = false; });
    else { document.documentElement.style.setProperty('--banner-h', '0px'); nativeCall('hideBanner').catch(function () {}); }
  }
  function watchVideo(onReward) {
    nativeCall('showRewarded').then(function (r) {
      if (r && r.rewarded) onReward(); else toast('Watch the whole video to unlock.');
    }).catch(function () { toast('No video is ready right now. Try again in a minute.'); });
  }

  /* ---------------- comic reader ---------------- */
  var R = { c: null, i: 0 };
  function extraPages(c) { return LS.get('zw_pages_' + c.id, 0); }
  function freeCount(c) { return ownsComic(c) ? c.panels.length : Math.min(c.panels.length, c.free + extraPages(c)); }
  function openReader(id) {
    var c = COMICS.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    R.c = c; R.i = Math.min(LS.get('zw_pos_' + id, 0), c.panels.length - 1); S.reading = id;
    $('rTitle').textContent = c.title; $('reader').hidden = false; syncBanner(); drawPanel();
  }
  function closeReader() { $('reader').hidden = true; S.reading = null; syncBanner(); }
  function drawPanel() {
    var c = R.c, i = R.i, n = c.panels.length, open = freeCount(c), st = $('rStage');
    LS.set('zw_pos_' + c.id, i);
    $('rCount').textContent = Math.min(i + 1, n) + ' / ' + n;
    $('rBar').style.width = (Math.min(i + 1, n) / n * 100) + '%';
    $('rPrev').disabled = i === 0;
    if (i >= n) { // end card
      st.innerHTML = '<div class="lockcard"><div class="big">🙏</div><h3>To be continued…</h3><p>' + esc(c.note || 'Thanks for reading!') + '</p>' +
        '<button class="btn block pink" data-url="' + c.shop + '" type="button">Get the book in the Zaynyg World store</button><button class="btn block alt" data-act="close-reader" type="button">Back to comics</button></div>';
      $('rNext').disabled = true; st.scrollTop = 0; return;
    }
    $('rNext').disabled = false;
    if (i >= open) { // locked page
      var h = '<div class="lockcard"><div class="big">🔒</div><h3>Keep reading!</h3><p>You read the free preview (' + open + ' of ' + n + ' panels). Unlock the whole comic:</p>';
      if (NATIVE) {
        h += '<button class="btn block col" data-act="buy-pass" type="button"><span>⭐ Zaynyg Pass · ' + esc(priceOf(PASS())) + '</span><small style="font-weight:600">every comic + every game level, no ads</small></button>';
        h += '<button class="btn block green" data-act="buy-comic" data-id="' + c.id + '" type="button">Unlock this comic · ' + esc(priceOf(c.product)) + '</button>';
        if (S.adsEnabled) h += '<button class="btn block alt" data-act="watch-page" type="button">▶ Watch a short video to unlock the next page</button>';
      } else {
        h += '<a class="btn block" href="' + CFG.playUrl + '" target="_blank" rel="noopener">⭐ Get the Zaynyg Pass in the Android app</a><button class="btn block pink" data-url="' + c.shop + '" type="button">Get the book in the store</button>';
      }
      h += '<p class="fine">' + esc(c.note || '') + '</p></div>';
      st.innerHTML = h; $('rNext').disabled = true; st.scrollTop = 0; return;
    }
    var p = c.panels[i];
    st.innerHTML = '<div class="panel">' + (p.text ? '<div class="textonly">' + esc(p.cap) + '</div>' : '<img src="' + p.img + '" alt="Comic panel ' + (i + 1) + '"><div class="cap"><span class="n">Panel ' + (i + 1) + ' of ' + n + '</span>' + p.cap + '</div>') + '</div>';
    $('rNext').textContent = i === n - 1 ? 'Finish ›' : 'Next ›';
    st.scrollTop = 0;
  }
  function step(d) { var n = R.c.panels.length; R.i = Math.max(0, Math.min(n, R.i + d)); drawPanel(); }

  /* ---------------- games ---------------- */
  function gameAllowed(id) { return hasPass() || !!S.sessionGames[id]; }
  function openGame(id) {
    var g = GAMES.filter(function (x) { return x.id === id; })[0]; if (!g) return;
    S.playing = id; $('gExit').className = 'game-exit' + (g.exitBottom ? ' bottom' : ''); $('game').hidden = false; $('gameFrame').src = g.file; syncBanner();
    if (NATIVE) nativeCall('setImmersive', { on: true }).catch(function () {});
  }
  function closeGame() {
    if ($('game').hidden) return;
    $('gameFrame').src = 'about:blank'; $('game').hidden = true; S.playing = null; S.sessionGames = {}; pendingUnlock = null; closeModal(true); syncBanner();
    if (NATIVE) nativeCall('setImmersive', { on: false }).catch(function () {});
  }
  function gameLock(id, label, onUnlock) {
    if (gameAllowed(id)) { onUnlock(); return; }
    if (!$('modal').hidden && pendingUnlock && pendingUnlock.game === id) return; // already showing
    var g = GAMES.filter(function (x) { return x.id === id; })[0] || { title: 'This game' };
    pendingUnlock = { game: id, label: label, check: function () { return gameAllowed(id); }, go: onUnlock };
    var h = '<h3>🔒 ' + esc(label) + '</h3><p>Great playing! <b>' + esc(label) + '</b> of ' + esc(g.title) + ' is part of the Zaynyg Pass.</p>';
    if (NATIVE) {
      h += '<button class="btn block" data-act="buy-pass" type="button">⭐ Get the Zaynyg Pass · ' + esc(priceOf(PASS())) + '</button>';
      if (S.adsEnabled) h += '<button class="btn block green" data-act="watch-game" type="button">▶ Watch a short video to keep playing</button>';
    } else {
      h += '<a class="btn block" href="' + CFG.playUrl + '" target="_blank" rel="noopener">⭐ Get the Pass in the Android app</a>';
    }
    h += '<button class="btn block alt" data-act="exit-game" type="button">Back to games</button>';
    openModal(h, function () { closeGame(); });
  }

  /* ---------------- parents corner ---------------- */
  function parentsCorner() {
    openModal('<h3>Parents corner</h3><p>Zaynyg World: Comics &amp; Games is made by independent author Jose Quinones (Zaynyg World, Fernandina Beach, FL). Stories and games are family-clean.</p>' +
      '<p><b>Purchases:</b> the Zaynyg Pass is an optional monthly subscription through Google Play; single comics are one-time purchases. Every purchase asks a grown-up math question first. Cancel the Pass anytime in Google Play › Subscriptions.</p>' +
      '<p><b>Ads:</b> the free version shows a small banner and optional “watch a video” unlocks. Ads are requested as child-directed, rated G, and never personalized. Any purchase removes ads.</p>' +
      '<p><b>Data:</b> no account, no sign-in, no chat. Game saves and reading progress stay on this device.</p>' +
      '<div class="row"><button class="btn alt native-only" data-act="restore" type="button">Restore purchases</button><button class="btn alt" data-url="' + CFG.privacyUrl + '" type="button">Privacy policy</button><button class="btn alt" data-url="mailto:' + CFG.supportEmail + '" type="button">Contact</button></div>' +
      '<p class="fine">Version 1.0.0</p>');
  }

  /* ---------------- events ---------------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-tab],[data-read],[data-game],[data-url],[data-act]');
    if (!el) return;
    if (el.closest('.tabs') && el.hasAttribute('data-tab')) { showTab(el.getAttribute('data-tab')); return; }
    if (el.hasAttribute('data-read')) { openReader(el.getAttribute('data-read')); return; }
    if (el.hasAttribute('data-game')) { openGame(el.getAttribute('data-game')); return; }
    if (el.hasAttribute('data-url')) { e.preventDefault(); var u = el.getAttribute('data-url'); if (/^mailto:/.test(u)) { if (NATIVE) nativeCall('openUrl', { url: u }); else location.href = u; } else openExternal(u); return; }
    var a = el.getAttribute('data-act'); if (!a) return;
    e.preventDefault();
    if (a === 'close') { closeModal(); }
    else if (a === 'buy-pass') { buy(PASS()); }
    else if (a === 'buy-comic') { var c = COMICS.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (c) buy(c.product); }
    else if (a === 'restore') { restore(); }
    else if (a === 'manage') { nativeCall('openUrl', { url: 'https://play.google.com/store/account/subscriptions?sku=' + PASS() + '&package=com.zaynygworld.app' }); }
    else if (a === 'parents') { parentsCorner(); }
    else if (a === 'close-reader') { closeReader(); }
    else if (a === 'watch-page') { watchVideo(function () { LS.set('zw_pages_' + R.c.id, extraPages(R.c) + 1); toast('Page unlocked! 🎉'); drawPanel(); }); }
    else if (a === 'watch-game') { var id = pendingUnlock && pendingUnlock.game; watchVideo(function () { if (id) S.sessionGames[id] = true; toast('Unlocked for this play session! 🎉'); afterEntitlementChange(); }); }
    else if (a === 'exit-game') { closeModal(); }
  });
  $('passChip').onclick = function () { showTab('pass'); };
  $('parentsBtn').onclick = parentsCorner;
  $('rBack').onclick = closeReader;
  $('rPrev').onclick = function () { step(-1); };
  $('rNext').onclick = function () { step(1); };
  $('gExit').onclick = closeGame;
  $('modal').addEventListener('click', function (e) { if (e.target === $('modal')) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (!$('reader').hidden && $('modal').hidden) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); }
    if (e.key === 'Escape') window.ZW.onBack();
  });

  /* ---------------- public API (games + Android back button) ---------------- */
  window.ZW = {
    gameAllowed: gameAllowed,
    gameLock: gameLock,
    openExternal: openExternal,
    onBack: function () {
      if (!$('modal').hidden) { closeModal(); return true; }
      if (!$('game').hidden) { closeGame(); return true; }
      if (!$('reader').hidden) { closeReader(); return true; }
      if (S.tab !== 'comics') { showTab('comics'); return true; }
      return false;
    },
    _state: S
  };

  /* ---------------- boot ---------------- */
  function boot() {
    renderAll(); showTab('comics');
    fetch('shop-items.json').then(function (r) { return r.json(); }).then(function (j) { SHOP = j; renderShop(); }).catch(function () {});
    if (!NATIVE) return;
    nativeCall('init').then(function (r) {
      var c = r.config || {};
      if (c.passId) CFG.products.pass = c.passId;
      if (c.danielId) CFG.products.comics.daniel = COMICS[0].product = c.danielId;
      if (c.privacyUrl) CFG.privacyUrl = c.privacyUrl;
      S.adsEnabled = c.adsEnabled !== false;
      (r.products || []).forEach(function (p) { S.prices[p.id] = p.price; });
      S.billingReady = !!r.billingReady;
      if (r.billingReady && Array.isArray(r.owned)) setOwned(r.owned); else { renderAll(); syncBanner(); }
    }).catch(function () { S.adsEnabled = false; renderAll(); });
    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) nativeCall('restore').then(function (r) { if (r && Array.isArray(r.owned)) setOwned(r.owned); }).catch(function () {});
    });
  }
  boot();
})();
