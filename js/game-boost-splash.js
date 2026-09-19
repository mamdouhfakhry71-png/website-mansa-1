/* Game Boost intro — plays once on the login page, then reveals the login form.
   Visual layer only: does not touch app.js or any login logic. */
(function () {
  var splash = document.getElementById('gb-splash');
  if (!splash) return;

  var anim = null;
  var finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    splash.classList.add('gb-hide');
    setTimeout(function () {
      try { if (anim) anim.destroy(); } catch (e) {}
      if (splash.parentNode) splash.parentNode.removeChild(splash);
    }, 700);
  }

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // If the animation library/data isn't available (offline, blocked CDN)
  // or the user prefers reduced motion, go straight to the login form.
  if (reduceMotion || !window.lottie || !window.GAME_BOOST_DATA) {
    finish();
    return;
  }

  try {
    anim = window.lottie.loadAnimation({
      container: document.getElementById('gb-anim'),
      renderer: 'svg',
      loop: false,
      autoplay: true,
      animationData: window.GAME_BOOST_DATA,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' }
    });
    anim.addEventListener('complete', finish);
    anim.addEventListener('data_failed', finish);
  } catch (e) {
    finish();
    return;
  }

  var skip = document.getElementById('gb-skip');
  if (skip) skip.addEventListener('click', finish);
  splash.addEventListener('click', finish);

  // Safety net: never leave the user stuck on the intro.
  setTimeout(finish, 9000);
})();
