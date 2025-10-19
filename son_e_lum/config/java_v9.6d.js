/* java_v9.6d.js — helpers for Tech Mobile v9.6d (SugarCube 2.x)
   - TTS for [data-tts] and inline "Hear" links (global speak)
   - Read more modal for [data-read]
   - Breadcrumbs that REWIND history; rebuild every passage
*/
(function () {
  'use strict';

  window._v96d_speak = function (text) {
    try {
      if (!text) return;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(text);
        var kick = function(){ try{ window.speechSynthesis.speak(u); }catch(e){} };
        if (window.speechSynthesis.getVoices().length === 0) {
          window.speechSynthesis.onvoiceschanged = function(){ kick(); };
          setTimeout(kick, 80);
        } else {
          kick();
        }
      }
    } catch (e) { console.warn("TTS failed:", e); }
  };

  function ensureCrumbsNode() {
    var nav = document.querySelector("nav#crumbs");
    if (!nav) {
      var cont = document.querySelector("#passages .passage .wrapper") || document.querySelector(".wrapper");
      if (cont) {
        nav = document.createElement("nav");
        nav.id = "crumbs";
        nav.className = "crumbs";
        var img = cont.querySelector(".img-block");
        if (img && img.nextSibling) cont.insertBefore(nav, img.nextSibling);
        else cont.appendChild(nav);
      }
    }
    return nav;
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
        var steps = last - i;
        var safe  = t.replace(/"/g, '&quot;');
        return '<<link "' + safe + '">><<run Engine.go(-' + steps + ')>><</link>>';
      }).filter(Boolean);

      if (!parts.length) return;
      nav.innerHTML = "";
      new Wikifier(nav, parts.join(" › "));
    } catch (e) { console.warn("crumb render failed:", e); }
  }

  if (window.jQuery) {
    jQuery(document).on(":passagedisplay.v96d", function () {
      setTimeout(renderCrumbsRewind, 0);
    });
  } else {
    document.addEventListener(":passagedisplay", function () {
      setTimeout(renderCrumbsRewind, 0);
    });
  }
})();
