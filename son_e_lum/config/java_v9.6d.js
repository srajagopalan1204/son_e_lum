/* java_v9.6d.js — optional helper (SugarCube 2.x) */
(function () {
  'use strict';
  function rerenderCrumbs() {
    var nav = document.getElementById("crumbs");
    if (!nav) return;
    try {
      var hist = (window.State && window.State.history) ? window.State.history : null;
      if (!hist || !hist.length) return;
      var last = hist.length - 1, parts = [];
      for (var i=0;i<hist.length;i++){
        var t = (hist[i] && hist[i].title) ? String(hist[i].title) : "";
        if(!t) continue;
        if (i === last) {
          var here = t.replace(/</g,"&lt;").replace(/>/g,"&gt;");
          parts.push('<span class="here">'+here+'</span>');
        } else {
          var steps = last - i;
          var safe  = t.replace(/"/g,'&quot;');
          parts.push('<<link "'+safe+'">><<run Engine.go(-'+steps+')>><</link>>');
        }
      }
      nav.innerHTML = "";
      new Wikifier(nav, parts.join(" › "));
    } catch(e){ console.warn("crumbs:", e); }
  }
  if (window.jQuery) {
    jQuery(document).on(":passagedisplay.v96d", function(){ setTimeout(rerenderCrumbs, 0); });
  } else {
    document.addEventListener(":passagedisplay", function(){ setTimeout(rerenderCrumbs, 0); });
  }
})();
