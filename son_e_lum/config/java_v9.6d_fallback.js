/* java_v9.6d_fallback.js — safe helpers; won't override your site logic */
(function () {
  function speak(text) {
    try {
      if (!text) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(u);
    } catch (e) { console.warn("TTS failed:", e); }
  }
  function bySel(root, sel) { try { return root.querySelector(sel); } catch(e){ return null; } }
  function onClick(root, sel, fn) {
    root.addEventListener("click", function(ev) {
      var btn = ev.target.closest(sel);
      if (!btn) return;
      fn(btn, ev);
    });
  }

  /* TTS buttons (data-tts) */
  $(document).on(":passagedisplay", function (ev) {
    var root = ev.content;
    onClick(root, "button[data-tts]", function(btn){
      var sel = btn.getAttribute("data-tts");
      var ta  = bySel(root, sel);
      speak(ta ? (ta.value || ta.textContent) : "");
    });
  });

  /* Breadcrumb fallback — render only if #crumbs is still empty */
  function renderCrumbsFallback() {
    var nav = document.querySelector("nav#crumbs");
    if (!nav) return;
    if (nav.innerHTML && nav.innerHTML.trim()) return; // already filled
    try {
      var hist = State.history; // SugarCube 2
      if (!hist || !hist.length) return;
      var parts = hist.map(function (m, i) {
        var t = m.title || "";
        if (!t) return "";
        if (i < hist.length - 1) {
          return '<<link "' + t.replace(/"/g,'&quot;') + '">><<goto "' + t.replace(/"/g,'&quot;') + '">><</link>>';
        } else {
          return '<span class="here">' + t.replace(/</g,"&lt;").replace(/>/g,"&gt;") + '</span>';
        }
      }).filter(Boolean);
      if (!parts.length) return;
      nav.innerHTML = "";
      new Wikifier(nav, parts.join(" › "));
    } catch (e) { console.warn("crumb fallback failed:", e); }
  }
  $(document).on(":passagedisplay", function () {
    setTimeout(renderCrumbsFallback, 0);
  });
})();
