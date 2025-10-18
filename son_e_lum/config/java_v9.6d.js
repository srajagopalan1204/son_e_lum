/* java_v9.6d.js — minimal helpers for Tech Mobile v9.6d
   - TTS for buttons with data-tts
   - Breadcrumb fallback that only runs if #crumbs is empty
   Assumes SugarCube 2.x is present (Twine format). */

(function () {
  'use strict';

  // ---- Tiny utilities ----
  function speak(text) {
    try {
      if (!text) return;
      // Stop any current speech, then speak new text
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(u);
      } else {
        console.warn("Speech Synthesis API not available in this browser.");
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

  // ---- Breadcrumb fallback (only if #crumbs is empty) ----
  function renderCrumbsFallback() {
    // Find nav#crumbs in the *current* passage
    var nav = document.querySelector("nav#crumbs");
    if (!nav) return;
    // If something already rendered breadcrumbs, do nothing
    if (nav.innerHTML && nav.innerHTML.trim()) return;

    try {
      var hist = (window.State && window.State.history) ? window.State.history : null;
      if (!hist || !hist.length) return;

      // Build a simple trail: [Start] › [S1] › [Current]
      var parts = hist.map(function (step, i) {
        var title = (step && step.title) ? String(step.title) : "";
        if (!title) return "";
        // Link all but the last (current) passage
        if (i < hist.length - 1) {
          var safe = title.replace(/"/g, '&quot;');
          // Use SugarCube link/goto so it navigates properly
          return '<<link "' + safe + '">><<goto "' + safe + '">><</link>>';
        } else {
          // Current passage (not a link)
          var safeHTML = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return '<span class="here">' + safeHTML + '</span>';
        }
      }).filter(Boolean);

      if (!parts.length) return;
      nav.innerHTML = "";
      // Wikify into the nav so SugarCube macros render
      if (typeof window.Wikifier === "function") {
        new window.Wikifier(nav, parts.join(" › "));
      } else {
        // Fallback: plain text if Wikifier missing (very unlikely in SugarCube)
        nav.textContent = parts.join(" > ").replace(/<<.*?>>/g, "");
      }
    } catch (e) {
      console.warn("Breadcrumb fallback failed:", e);
    }
  }

  // ---- Passage wiring ----
  // SugarCube triggers jQuery events; if jQuery is not present, SugarCube still fires them.
  // We defensively hook both jQuery and DOM in case of custom setups.
  function bindPassageHandlers() {
    // For TTS buttons
    document.addEventListener(":passagedisplay", function (ev) {
      var root = ev.content || document;
      onClick(root, "button[data-tts]", function (btn) {
        var sel = btn.getAttribute("data-tts");
        var ta  = bySel(root, sel);
        var txt = ta ? (ta.value || ta.textContent) : "";
        speak(txt);
      });
    });

    // Render crumbs after each passage; give other scripts a tick to populate first.
    document.addEventListener(":passagedisplay", function () {
      setTimeout(renderCrumbsFallback, 0);
    });

    // If jQuery is present (SugarCube usually bundles it), also attach via jQuery to be extra safe
    if (window.jQuery) {
      window.jQuery(document).on(":passagedisplay", function (ev) {
        // duplicate-safe; setTimeout guard prevents double-render issues
        setTimeout(renderCrumbsFallback, 0);
      });
    }
  }

  // Initialize immediately (SugarCube loads scripts before first passage render)
  bindPassageHandlers();
})();
