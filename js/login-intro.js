/* =============================================================
   MFX Student — Login intro controller.
   Standalone: does not touch app.js or any of its functions.
   Plays once per browser session (add ?intro=1 to force it).
   ============================================================= */
(function () {
  'use strict';
  var root = document.documentElement;
  var stage = document.getElementById('mfx-intro');
  var card = document.querySelector('.auth-card');
  if (!stage || !card || !root.classList.contains('mfx-intro')) return;

  var person = stage.querySelector('.mi-person');
  var bag = stage.querySelector('.mi-bag');
  var timers = [], extras = [], done = false;
  function T(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function finish(instant) {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    root.classList.remove('mfx-intro');
    try { sessionStorage.setItem('mfx_login_intro', '1'); } catch (e) {}
    stage.style.transition = 'opacity .4s';
    stage.style.opacity = '0';
    setTimeout(function () { stage.remove(); }, instant ? 0 : 1600);
    if (instant) stage.remove();
  }

  function origin() {
    var b = bag.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  }

  function burst(o) {
    bag.style.visibility = 'hidden';
    stage.classList.remove('shake');

    var flash = el('mi-flash', o, 60);
    flash.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(5)', opacity: .9, offset: .3 }, { transform: 'scale(8)', opacity: 0 }], { duration: 700, easing: 'ease-out', fill: 'forwards' });

    [0, 140].forEach(function (d) {
      var r = el('mi-ring', o, 50);
      r.animate([{ transform: 'scale(.2)', opacity: .9 }, { transform: 'scale(11)', opacity: 0 }], { duration: 900, delay: d, easing: 'cubic-bezier(.1,.7,.2,1)', fill: 'forwards' });
    });

    var glyphs = ['🎓', '📚', '✏️', '⭐', '✨', '📝', '🏆'];
    var colors = ['var(--accent)', 'var(--accent-light)', 'var(--accent-2)', 'var(--accent-2-light)'];
    var vw = Math.max(window.innerWidth, 360);
    for (var i = 0; i < 44; i++) {
      var p = el('mi-p', o);
      var kind = i % 3;
      if (kind === 0) { p.textContent = glyphs[i % glyphs.length]; p.style.fontSize = (18 + Math.random() * 16) + 'px'; }
      else if (kind === 1) { p.className += ' mi-dot'; var s = 6 + Math.random() * 8; p.style.width = p.style.height = s + 'px'; p.style.background = colors[i % colors.length]; }
      else { p.className += ' mi-sheet'; p.style.width = '16px'; p.style.height = '20px'; }
      var a = Math.random() * Math.PI * 2, d = (.25 + Math.random() * .6) * Math.min(vw * .6, 460);
      var dx = Math.cos(a) * d, dy = Math.sin(a) * d * .7;
      p.animate([
        { transform: 'translate(-50%,-50%) scale(.2) rotate(0)', opacity: 1 },
        { transform: 'translate(' + (dx * .75 - 8) + 'px,' + (dy * .75 - 70) + 'px) scale(1.1) rotate(' + (Math.random() * 300 - 150) + 'deg)', opacity: 1, offset: .45 },
        { transform: 'translate(' + dx + 'px,' + (dy + 150) + 'px) scale(.8) rotate(' + (Math.random() * 720 - 360) + 'deg)', opacity: 0 }
      ], { duration: 1100 + Math.random() * 600, easing: 'cubic-bezier(.2,.7,.4,1)', fill: 'forwards' });
    }

    stage.animate([{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,4px)' }, { transform: 'translate(6px,-5px)' }, { transform: 'translate(-4px,-3px)' }, { transform: 'translate(0,0)' }], { duration: 380 });

    stage.classList.remove('walking');
    person.animate([{ transform: 'translateX(0) rotate(0)', opacity: 1 }, { transform: 'translateX(-90px) translateY(-30px) rotate(-16deg)', opacity: 1, offset: .35 }, { transform: 'translateX(-70vw) rotate(-24deg)', opacity: 0 }], { duration: 1000, easing: 'ease-in', fill: 'forwards' });
  }

  function el(cls, o, size) {
    var n = document.createElement('div');
    n.className = cls;
    n.style.left = o.x + 'px'; n.style.top = o.y + 'px';
    if (size) { n.style.marginLeft = n.style.marginTop = (-size / 2) + 'px'; }
    stage.appendChild(n); extras.push(n);
    return n;
  }

  function reveal(o) {
    root.classList.remove('mfx-intro');
    ['.mi-skip', '.mi-ground'].forEach(function (q) { var n = stage.querySelector(q); if (n) { n.style.transition = 'opacity .3s'; n.style.opacity = '0'; n.style.pointerEvents = 'none'; } });
    var r = card.getBoundingClientRect();
    var dx = o.x - (r.left + r.width / 2), dy = o.y - (r.top + r.height / 2);
    card.animate([
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.04) rotate(-300deg)', opacity: 0 },
      { transform: 'translate(0,0) scale(1.06) rotate(5deg)', opacity: 1, offset: .72 },
      { transform: 'translate(0,0) scale(1) rotate(0)', opacity: 1 }
    ], { duration: 950, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'backwards' });
    var items = card.querySelectorAll('.logo, h2, p, .form-group, button');
    Array.prototype.forEach.call(items, function (n, i) {
      n.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 450, delay: 650 + i * 70, easing: 'ease-out', fill: 'backwards' });
    });
  }

  document.getElementById('mfx-skip').addEventListener('click', function () {
    var o = origin();
    if (!done) { reveal(o); finish(true); }
  });

  // ---- timeline ----
  stage.classList.add('walking');
  person.animate([{ transform: 'translateX(calc(-50vw - 140px))' }, { transform: 'translateX(0)' }], { duration: 3200, easing: 'cubic-bezier(.25,.6,.45,1)', fill: 'forwards' });
  T(function () { stage.classList.remove('walking'); stage.classList.add('shake'); }, 3300);
  T(function () { var o = origin(); burst(o); T(function () { reveal(o); }, 380); T(function () { finish(false); }, 1600); }, 4400);
})();
