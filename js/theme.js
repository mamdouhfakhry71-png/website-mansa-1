/* =============================================================
   MFX Student — Theme system + micro-interactions
   Loads AFTER app.js. Does NOT touch any existing function.
   ============================================================= */
(function () {
  'use strict';

  // ===== Theme =====
  var STORAGE_KEY = 'mfx_theme';

  function getStored() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return (v === 'light' || v === 'dark') ? v : null;
    } catch (e) { return null; }
  }
  function systemTheme() {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  function applyTheme(theme, animate) {
    if (animate) {
      document.documentElement.classList.add('mfx-theme-anim');
      window.setTimeout(function () {
        document.documentElement.classList.remove('mfx-theme-anim');
      }, 600);
    }
    document.documentElement.setAttribute('data-theme', theme);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f7f7f5' : '#050505');
  }
  function setTheme(theme, animate) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
    applyTheme(theme, animate);
  }

  // Exposed globally for the toggle button
  window.toggleTheme = function () {
    var current = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(current === 'dark' ? 'light' : 'dark', true);
  };

  // Sync state on load (bootstrap script in <head> already applied it)
  applyTheme(getStored() || systemTheme(), false);

  // Follow system changes only if user has no preference
  try {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function (e) {
      if (!getStored()) applyTheme(e.matches ? 'light' : 'dark', true);
    });
  } catch (e) {}

  // ===== Hero particles =====
  function initHeroParticles() {
    var hero = document.querySelector('.hero');
    if (!hero || hero.querySelector('.hero-particles')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var layer = document.createElement('div');
    layer.className = 'hero-particles';
    var count = window.innerWidth < 640 ? 12 : 24;
    for (var i = 0; i < count; i++) {
      var dot = document.createElement('span');
      dot.style.left = (Math.random() * 100).toFixed(2) + '%';
      dot.style.top = (Math.random() * 100).toFixed(2) + '%';
      dot.style.animationDelay = (Math.random() * 8).toFixed(2) + 's';
      dot.style.animationDuration = (6 + Math.random() * 6).toFixed(2) + 's';
      dot.style.opacity = (0.2 + Math.random() * 0.5).toFixed(2);
      var size = (2 + Math.random() * 3).toFixed(1);
      dot.style.width = size + 'px';
      dot.style.height = size + 'px';
      layer.appendChild(dot);
    }
    hero.insertBefore(layer, hero.firstChild);
  }

  // ===== Scroll reveal =====
  function initReveal() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var targets = document.querySelectorAll(
      '.stat-card, .leaderboard-item, .feature-card, .card'
    );
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('reveal');
        var delay = Math.min(i * 50, 300);
        window.setTimeout(function () {
          el.classList.add('is-visible');
          // Drop the reveal classes once the fade-in finishes so the
          // normal hover lift / glow transitions work again.
          window.setTimeout(function () {
            el.classList.remove('reveal', 'is-visible');
          }, 900);
        }, delay);
        obs.unobserve(el);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    Array.prototype.forEach.call(targets, function (t) {
      if (t.dataset.revealInit) return;
      t.dataset.revealInit = '1';
      obs.observe(t);
    });
  }

  // ===== Animated counters for .stat-value =====
  function animateCounters() {
    if (!('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var els = document.querySelectorAll('.stat-value');
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.dataset.counted) return;
        var raw = (el.textContent || '').trim();
        var match = raw.match(/^(-?)(\d+)(.*)$/);
        if (!match) return;
        el.dataset.counted = '1';
        var sign = match[1], numStr = match[2], suffix = match[3];
        var target = parseInt(numStr, 10);
        if (!target) return;
        var duration = 900;
        var start = performance.now();
        function ease(t) { return 1 - Math.pow(1 - t, 3); }
        function tick(now) {
          var p = Math.min(1, (now - start) / duration);
          var val = Math.round(target * ease(p));
          el.textContent = sign + val + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = sign + target + suffix;
        }
        requestAnimationFrame(tick);
        obs.unobserve(el);
      });
    }, { threshold: 0.4 });
    Array.prototype.forEach.call(els, function (el) { obs.observe(el); });
  }

  // ===== Page enter fade =====
  function pageEnter() {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.35s ease';
    requestAnimationFrame(function () { document.body.style.opacity = '1'; });
  }

  // ===== Init =====
  function init() {
    initHeroParticles();
    initReveal();
    animateCounters();
    pageEnter();
    // Re-scan after data-driven renders (courses/dashboard populate later)
    window.setTimeout(function () {
      initReveal();
      animateCounters();
    }, 900);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
