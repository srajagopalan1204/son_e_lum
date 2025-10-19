/* java_v9.6d.js — helpers for Tech Mobile v9.6d (SugarCube 2.x)
   - TTS for [data-tts]
   - Read more modal for [data-read]
   - Breadcrumbs that REWIND history; rebuild every passage
*/
(function () {
  'use strict';

  function ensureCrumbsNode() {
    var nav = document.querySelector("nav#crumbs");
    if (!nav) {
      var w = document.querySelector(".wrapper");
      if (w) {
        nav = document.createElement("nav");
        nav.id = "crumbs";
        nav.className = "crumbs";
        var img = w.querySelector(".img-block");
        if (img && img.nextSibling) { w.insertBefore(nav, img.nextSibling); }
        else { w.insertBefore(nav, w.firstChild); }
      }
    }
    return nav;
  }

  function speak(text) {
    try {
      if (!text) return;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        var kick = function(){ try { window.speechSynthesis.speak(u); } catch(e){} };
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = function(){ kick(); };
          setTimeout(kick, 50);
        } else {
          kick();
        }
      }
    } catch (e) { console.warn("TTS failed:", e); }
  }

  function bySel(root, sel) { try { return root.querySelector(sel); } catch(e){ return null; } }
  function onClick(root, selector, fn) {
    root.addEventListener("click", function (ev) {
      var el = ev.target.closest(selector);
      if (!el) return;
      fn(el, ev);
    });
  }

  function openModalFromSelector(root, sel, title) {
    var src = bySel(root, sel);
    var html = src ? (src.value || src.innerHTML || src.textContent || "") : "";
    if (window.Dialog && Dialog.setup && Dialog.open) {
      Dialog.setup(title || "Read more");
      new Wikifier(Dialog.body(), html);
      Dialog.open();
    } else {
      alert((title ? (title + "\n\n") : "") + (src ? src.textContent : "No details."));
    }
  }
function renderCrumbsRewind() {
  var nav = ensureCrumbsNode();
  if (!nav) return;

  try {
    var hist = (window.State && window.State.history) ? window.State.history : null;
    if (!hist || !hist.length) return;

    var last = hist.length - 1;
    var parts = hist.map(function (m, i) {
      var t = (m && m.title) ? String(m.title) : "";
      if (!t) return "";

      if (i === last) {
        var here = t.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return '<span class="here">' + here + '</span>';
      }

      var steps = last - i; // rewind N steps
      var safe  = t.replace(/"/g, '&quot;');
      return '<<link "' + safe + '">><<run Engine.go(-' + steps + ')>><</link>>';
    }).filter(Boolean);

    if (!parts.length) return;
    nav.innerHTML = "";
    new Wikifier(nav, parts.join(" › "));
  } catch (e) {
    console.warn("crumb render failed:", e);
  }
}


  document.addEventListener(":passagedisplay", function (ev) {
    var root = ev.content || document;
    onClick(root, "[data-tts]", function(btn){
      var sel = btn.getAttribute("data-tts");
      var ta  = bySel(root, sel);
      var txt = ta ? (ta.value || ta.textContent) : "";
      speak(txt);
    });
    onClick(root, "[data-read]", function(btn){
      var sel = btn.getAttribute("data-read");
      var label = btn.getAttribute("data-title") || btn.textContent || "Read more";
      openModalFromSelector(root, sel, label.trim());
    });
    setTimeout(renderCrumbsRewind, 0);
  });

  if (window.jQuery) {
    window.jQuery(document).on(":passagedisplay", function(){ setTimeout(renderCrumbsRewind, 0); });
  }
})();
