// Study page enhancements — anchor link copy-to-clipboard + inline CTA dismiss.
// Plain vanilla, no framework. Runs on every /study/* page.

(function () {
  // Anchor link: copy URL to clipboard, flash ✓, update browser URL without scroll jump.
  document.querySelectorAll('.anchor-link').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var href = link.getAttribute('href');
      var url = window.location.origin + window.location.pathname + href;
      history.pushState(null, '', href);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          var orig = link.textContent;
          link.textContent = '✓';
          setTimeout(function () { link.textContent = orig; }, 1200);
        });
      }
    });
  });

  // Inline CTA dismissal — persisted in localStorage; applies to all study pages.
  var DISMISS_KEY = 'altitudepro:cta-dismissed-inline';
  var inline = document.querySelector('.study-cta-inline');
  if (inline) {
    try {
      if (localStorage.getItem(DISMISS_KEY) === '1') {
        inline.classList.add('hidden');
      }
    } catch (_) { /* localStorage blocked; leave CTA visible */ }
    var dismissBtn = inline.querySelector('[data-action="dismiss-inline-cta"]');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function () {
        inline.classList.add('hidden');
        try { localStorage.setItem(DISMISS_KEY, '1'); } catch (_) { /* ignore */ }
      });
    }
  }
})();
