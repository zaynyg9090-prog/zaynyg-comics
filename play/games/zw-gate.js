/* Zaynyg World hub bridge for games (added for the combined app).
   When a game runs inside the hub, premium chapters/waves/missions ask the hub
   whether they are unlocked (Zaynyg Pass or a rewarded video). Opened on its own,
   every game plays fully, exactly as before. External links go through the hub's
   grown-ups check. */
(function () {
  var P = null;
  try { if (window.parent && window.parent !== window && window.parent.ZW) P = window.parent.ZW; } catch (e) { P = null; }
  window.ZWGate = {
    inHub: !!P,
    allowed: function (game) { return !P || P.gameAllowed(game); },
    lock: function (game, label, onUnlock) {
      if (!P) { if (onUnlock) onUnlock(); return; }
      P.gameLock(game, label, onUnlock);
    }
  };
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var h = a.getAttribute('href') || '';
    if (/^https?:/i.test(h)) {
      e.preventDefault(); e.stopPropagation();
      if (P) P.openExternal(h); else window.open(h, '_blank', 'noopener');
    }
  }, true);
})();
