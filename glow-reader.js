/* ==========================================================================
   GLOW READER — glow-reader.js
   FAMILY / FAITH LANE ONLY. No 18+ content may be added to this reader.
   Adult-lane comics keep their own gated reader (after-dark-reader.html).

   HOW A PANEL WORKS:
     { bg:"p1", cap:"TITLE", pg:"PANEL 1 OF 5",
       bubbles:[ { c:"pixel", shape:"hero", x:"8%", y:"16%", tail:"left",
                   text:"..." }, ... ],
       sfx:{ text:"KRA-KOOM", color:"#ff2f4e" }   // optional
     }
   - c: character id from CHARACTERS (signature color auto-applied)
   - shape: "hero" | "villain" | "cosmic" | "tech" (defaults to char default)
   - x/y: CSS position of the bubble inside the panel
   ========================================================================== */

"use strict";

/* ---- Character registry: id -> signature color, bubble shape, display name.
   To add a character: add one line here. See GLOW-READER.md for the full table. */
const CHARACTERS = {
  /* Glitch Kids — heroes (rounded bold) */
  pixel: { name:"PIXEL",   color:"#2dd4bf", shape:"hero",   initial:"P",
           lane:"family", note:"Glitch Kids leader" },
  lag:   { name:"LAG",     color:"#7dff8a", shape:"hero",   initial:"L",
           lane:"family", note:"Glitch Kids — loyal, hungry, brave-ish" },
  volt:  { name:"VOLT",    color:"#ff9f1c", shape:"tech",   initial:"V",
           lane:"family", note:"Glitch Kids tech whiz" },

  /* The Static — kid-safe villain (jagged/spiked) */
  static:{ name:"THE STATIC", color:"#ff2f4e", shape:"villain", initial:"S",
           lane:"family", note:"Rogue glitch that eats light" },

  /* Jose / Speedy + Kai — hero cameos, family-safe */
  speedy:{ name:"SPEEDY",  color:"#ffd23f", shape:"hero",   initial:"S",
           lane:"family", note:"Jose — the neighbor who never gives up" },
  kai:   { name:"KAI",     color:"#a78bfa", shape:"hero",   initial:"K",
           lane:"family", note:"Keeper of the bright ideas" },

  /* Cosmic narrator + The Light — faith lane (wispy cloud) */
  narrator:{ name:"THE STARS", color:"#8fb8ff", shape:"cosmic", initial:"✦",
             lane:"faith", note:"Cosmic narrator voice" },
  light:   { name:"THE LIGHT", color:"#fff3c4", shape:"cosmic", initial:"✝",
             lane:"faith", note:"Jesus — voice of the Light", holy:true },

  /* Adult-lane roster lives ONLY in after-dark-reader.html (18+ gate).
     Colors are reserved here so nothing collides if they ever cameo:
     chomp #39ff6a villain · bonecrusher #ff5a1f villain ·
     commissioner #7dc4ff cosmic — see GLOW-READER.md */
};

/* ---- Demo story: GLITCH KIDS #0 — "THE NIGHT THE LIGHTS WENT OUT"
   100% original, family/faith lane. ------------------------------------ */
const PANELS = [
  {
    bg:"p1", pg:"Panel 1 of 5", cap:"THE NIGHT THE LIGHTS WENT OUT",
    bubbles:[
      { c:"narrator", y:"24%", x:"6%",
        text:"Maple Street. Movie night. Popcorn ready… and then — every light in town blinked out at once." },
      { c:"pixel", shape:"hero", x:"8%", y:"58%",
        text:"Okay, that's NOT part of the movie. Everybody stay calm!" },
      { c:"lag", shape:"hero", x:"56%", y:"62%", tail:"right",
        text:"I'm calm! I'm calm! …Can somebody hold my popcorn? My hands are doing the scaredy-shake." }
    ]
  },
  {
    bg:"p2", pg:"Panel 2 of 5", cap:"THE SIGNAL",
    bubbles:[
      { c:"volt", shape:"tech", x:"6%", y:"12%",
        text:"SCAN COMPLETE. One signal. Old water tower. Something up there is DRINKING the town's light." },
      { c:"static", shape:"villain", x:"52%", y:"46%",
        text:"SLURRRP. That's right, little lights. I eat brightness for breakfast. And lunch. And second lunch." },
      { c:"pixel", shape:"hero", x:"8%", y:"66%",
        text:"Then we're taking our light BACK. Glitch Kids — TOWER TIME!" }
    ]
  },
  {
    bg:"p3", pg:"Panel 3 of 5", cap:"CLIMB",
    sfx:{ text:"CREAK… CREAK…", color:"#8fb8ff" },
    bubbles:[
      { c:"lag", shape:"hero", x:"60%", y:"10%", tail:"right",
        text:"Remind me why the ladder had to be a MILLION rungs tall—" },
      { c:"speedy", shape:"hero", x:"6%", y:"52%",
        text:"Because the best views come after the hardest climbs, champ. One rung at a time — that's how winners do it." },
      { c:"kai", shape:"hero", x:"54%", y:"62%", tail:"right",
        text:"And hey — the dark is just a room waiting for somebody brave to flip the switch." }
    ]
  },
  {
    bg:"p4", pg:"Panel 4 of 5", cap:"THE LIGHT SPEAKS",
    bubbles:[
      { c:"light", y:"10%", x:"10%",
        text:"Little lights… do not be afraid of the dark. Even the smallest candle can chase a whole night away." },
      { c:"pixel", shape:"hero", x:"8%", y:"58%",
        text:"You hear that, team? We're not just kids with a plunger. We're the LIGHTS tonight." },
      { c:"volt", shape:"tech", x:"56%", y:"64%", tail:"right",
        text:"TURBO PLUNGER 9000… REVERSED! Channeling every porch light, flashlight and firefly in town — NOW!" }
    ]
  },
  {
    bg:"p5", pg:"Panel 5 of 5", cap:"DAWN BREAKS",
    sfx:{ text:"FWOOOOSH!", color:"#ffd23f" },
    bubbles:[
      { c:"static", shape:"villain", x:"56%", y:"8%",
        text:"NOOOO — too… BRIGHT… too… WARM… okay fine, I like it a little. DON'T TELL ANYBODY." },
      { c:"narrator", y:"52%", x:"6%",
        text:"And just like that, Maple Street glowed again — brighter than before. Because light shared is light multiplied." },
      { c:"lag", shape:"hero", x:"58%", y:"68%", tail:"right",
        text:"Best movie night EVER. …Can we do the popcorn part again though? I dropped mine. Twice." }
    ]
  }
];

/* ---------------- Renderer + navigation ---------------- */
const stage  = document.getElementById("stage");
const bar    = document.getElementById("bar");
const count  = document.getElementById("count");
const prevB  = document.getElementById("prev");
const nextB  = document.getElementById("next");
let i = 0;

function bubbleHTML(b){
  const ch = CHARACTERS[b.c];
  if(!ch) return "";
  const shape = b.shape || ch.shape;
  const cls = "bubble b-" + shape + (ch.holy ? " holy" : "") +
              (b.tail === "right" ? " tail-right" : "");
  const pos = "left:" + (b.x || "8%") + ";top:" + (b.y || "20%") + ";";
  const inner = '<span class="who"><span class="avatar">' + ch.initial +
                '</span>' + ch.name + '</span><p class="line">' + b.text + "</p>";
  // Clipped shapes (villain/tech) need an inner layer for the outline trick.
  if(shape === "villain" || shape === "tech"){
    return '<div class="' + cls + '" style="--c:' + ch.color + ";" + pos + '">' +
           '<div class="in">' + inner + "</div></div>";
  }
  return '<div class="' + cls + '" style="--c:' + ch.color + ";" + pos + '">' +
         inner + "</div>";
}

function render(dir){
  const N = PANELS.length;
  if(i < N){
    const p = PANELS[i];
    const sfx = p.sfx
      ? '<div class="sfx" style="--c:' + p.sfx.color + '">' + p.sfx.text + "</div>"
      : "";
    stage.innerHTML =
      '<div class="panel' + (dir < 0 ? " anim-back" : " anim") + '" title="Tap to continue">' +
        '<div class="p-bg ' + p.bg + '"></div>' +
        '<div class="p-bg stars"></div>' +
        '<div class="panel-cap"><span class="pg">' + p.pg + "</span>" + p.cap + "</div>" +
        sfx +
        '<div class="bubble-layer">' + p.bubbles.map(bubbleHTML).join("") + "</div>" +
      "</div>";
    stage.querySelector(".panel").addEventListener("click", function(){ go(1); });
    count.textContent = (i + 1) + " / " + N;
    bar.style.width = ((i + 1) / N * 100) + "%";
    prevB.style.visibility = i === 0 ? "hidden" : "visible";
    nextB.style.visibility = "visible";
    nextB.textContent = i === N - 1 ? "Finish →" : "Next →";
  } else {
    bar.style.width = "100%";
    count.textContent = "Done";
    stage.innerHTML =
      '<div class="panel anim" style="display:flex;align-items:center;justify-content:center;cursor:default">' +
        '<div class="p-bg p5" style="opacity:.35"></div>' +
        '<div class="glow-end" style="position:relative;z-index:2;margin:18px">' +
          "<h2>TO BE CONTINUED…</h2>" +
          "<p>You just experienced the <b>GLOW READER</b> prototype — " +
          "<b>GLITCH KIDS #0: “The Night the Lights Went Out.”</b><br>" +
          "Every hero, villain, voice and machine speaks in its own " +
          "signature color and shape. A reading experience the world has never seen.</p>" +
          '<a class="glow-btn btn-next" href="library.html" style="text-decoration:none">← Back to Library</a>' +
          '<br><br><span class="lane-note">✓ Family / Faith lane — all ages</span>' +
        "</div>" +
      "</div>";
    prevB.style.visibility = "visible";
    nextB.style.visibility = "hidden";
  }
}

function go(d){
  const n = i + d, N = PANELS.length;
  if(n < 0 || n > N) return;
  i = n;
  render(d);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

prevB.addEventListener("click", function(){ go(-1); });
nextB.addEventListener("click", function(){ go(1); });
document.addEventListener("keydown", function(e){
  if(e.key === "ArrowRight") go(1);
  if(e.key === "ArrowLeft")  go(-1);
});

/* Legend: built from the character registry so it never drifts */
(function buildLegend(){
  const grid = document.getElementById("legendGrid");
  if(!grid) return;
  const order = ["pixel","lag","volt","static","speedy","kai","narrator","light"];
  grid.innerHTML = order.map(function(id){
    const ch = CHARACTERS[id];
    return '<div class="legend-item"><span class="legend-dot" style="--c:' +
      ch.color + '"></span><span>' + ch.name +
      "<small>" + ch.shape + " · " + ch.lane + "</small></span></div>";
  }).join("");
  document.getElementById("legendToggle").addEventListener("click", function(){
    document.getElementById("legend").classList.toggle("open");
  });
})();

render(1);
