/* java_v9.6b.js – fully working SugarCube Back link + context visibility + TTS + modal */
Config.passages.displayTitles = false;

$(function() {

  /* ===== Breadcrumbs ===== */
  $(document).on(':passagedisplay', function() {
    try {
      const cur = State.passage;
      if (/^(menu|start)$/i.test(cur)) State.variables.crumbs = ['Start'];
      const c = State.variables.crumbs || [];
      if (c[c.length - 1] !== cur) c.push(cur);
      State.variables.crumbs = c.slice(-20);
      $('#crumbs').text(State.variables.crumbs.join(' / '));

      // Show/hide Back link contextually
      if (/^(menu|start)$/i.test(cur)) {
        $('.link-back').hide();
      } else {
        $('.link-back').show();
      }
    } catch (e) { console.warn('Breadcrumb error:', e); }
  });

  /* ===== Text-to-Speech ===== */
  $(document).on('click', 'button[data-tts]', function() {
    try {
      const sel = $(this).attr('data-tts');
      const node = document.querySelector(sel);
      if (!node) return;
      const text = (node.value || node.textContent || '').trim();
      if (!text) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US'; u.rate = 1.0; u.pitch = 1.0;
      speechSynthesis.cancel(); speechSynthesis.speak(u);
    } catch (e) { console.warn('TTS error:', e); }
  });

  /* ===== Read-More Modal ===== */
  $(document).on('click', 'a[data-readsheet="1"]', function(e) {
    e.preventDefault();
    const url = this.href;
    fetch(url, { cache: 'no-cache' })
      .then(r => r.text())
      .then(txt => {
        Dialog.setup('Read more');
        Dialog.wiki('<div class="read-modal"><button class="read-close">Close</button><pre></pre></div>');
        $('.read-modal pre').text(txt);
        Dialog.open();
      })
      .catch(() => window.open(url, '_blank'));
  });
  $(document).on('click', '.read-close', e => { e.preventDefault(); Dialog.close(); });
});
