/* java_v9.6d.js — helpers for Tech Mobile v9.6d (SugarCube 2.x)
   Features:
   - TTS for buttons/links with data-tts="#textareaOrDivId"
   - Path-based breadcrumbs that REWIND history (Engine.go(-N)) on click
   - Rebuild breadcrumbs on each :passagedisplay
*/

(function () {
  'use strict';

  // ---------- Utilities ----------
  function speak(text) {
    try {
      if (!text) return;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(u);
      }
    } catch (e) {
      console.warn("TTS failed:", e);
    }
  }

  function bySel(root, sel) {
    try { return root.querySelector(sel); }
    catch (e) { return null; }
  }

  function onClick(root, selector, fn) {
    root.addEventListener("click", function (ev) {
      var el = ev.target.closest(selector);
      if (!el) return;
      fn(el, ev);
    });
  }

  // ---------- TTS wiring ----------
  function wireTTS(ev) {
    var root = (ev && ev.content) ? ev.content : document;
    onClick(root, "[data-tts]", function (btn) {
      var sel = btn.getAttribute("data-tts");
      var ta  = bySel(root, sel);
      var txt = ta ? (ta.value || ta.textContent) : "";
      speak(txt);
    });
  }

  // ---------- Breadcrumbs (rewind) ----------
  // Render a path-based breadcrumb that trims future history when clicking older crumbs.
  function renderCrumbs() {
    var nav = document.querySelector("nav#crumbs");
    if (!nav) return;

    try {
      var hist = (window.State && window.State.history) ? window.State.history : null;
      if (!hist || !hist.length) return;

      // (Optional) keep the last N steps for readability; uncomment to enable:
      // hist = hist.slice(-8);

      var last = hist.length - 1;
      var parts = hist.map(function (m, i) {
        var t = (m && m.title) ? String(m.title) : "";
        if (!t) return "";

        // Current page is not clickable
        if (i === last) {
          var here = t.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return '<span class="here">' + here + '</span>';
        }

        // Rewind N steps to go to this crumb, trimming history
        var steps = last - i; // positive integer
        var safe  = t.replace(/"/g, '&quot;');
        return '<<link "' + safe + '">><<run Engine.go(-' + steps + ')>><</link>>';
      }).filter(Boolean);

      if (!parts.length) return;

      // Clear and wikify so SugarCube macros render
      nav.innerHTML = "";
      if (typeof window.Wikifier === "function") {
        new window.Wikifier(nav, parts.join(" › "));
      } else {
        // Very unlikely fallback
        nav.textContent = parts.join(" > ").replace(/<<.*?>>/g, "");
      }
    } catch (e) {
      console.warn("crumb render failed:", e);
    }
  }

  // ---------- Hook into SugarCube lifecycle ----------
  // SugarCube fires jQuery-style events; we listen on both DOM and jQuery for robustness.
  document.addEventListener(":passagedisplay", function (ev) {
    // TTS delegation
    wireTTS(ev);
    // Rebuild crumbs after everything else has a chance to run
    setTimeout(renderCrumbs, 0);
  });

  if (window.jQuery) {
    window.jQuery(document).on(":passagedisplay", function (ev) {
      // Duplicate-safe: setTimeout prevents double-render issues
      setTimeout(renderCrumbs, 0);
    });
  }

  // Optional: expose helpers (debug)
  window._tech_v96d = { speak: speak, renderCrumbs: renderCrumbs };
})();
