(function () {
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Films play only while on screen.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting && !still) e.target.play().catch(function () {}); else e.target.pause(); });
    }, { threshold: 0.15 });
    document.querySelectorAll('video.auto').forEach(function (v) { io.observe(v); });

    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    document.querySelectorAll('.rv').forEach(function (el) { ro.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function (el) { el.classList.add('in'); });
  }

  // Subtle 3D: cards tilt a few degrees toward the pointer.
  if (!still && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('[data-tilt]').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        el.style.setProperty('--ry', ((e.clientX - b.left) / b.width - 0.5) * 7 + 'deg');
        el.style.setProperty('--rx', -((e.clientY - b.top) / b.height - 0.5) * 5 + 'deg');
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
  }

  // Categories: hovering or focusing a row swaps the preview film. Clicking opens it full screen.
  document.querySelectorAll('[data-index]').forEach(function (wrap) {
    var v = wrap.querySelector('.preview video'), rows = wrap.querySelectorAll('[data-film]');
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
      if (es[0].isIntersecting && !still) v.play().catch(function () {}); else v.pause();
    }, { threshold: 0.15 }).observe(v);
    function show(row) {
      if (row.getAttribute('aria-current') === 'true') return;
      rows.forEach(function (r) { r.setAttribute('aria-current', r === row ? 'true' : 'false'); });
      v.poster = 'media/' + row.dataset.film + '.jpg'; v.src = 'media/' + row.dataset.film + '.mp4';
      if (!still) v.play().catch(function () {});
    }
    rows.forEach(function (r) { r.addEventListener('pointerenter', function () { show(r); }); r.addEventListener('focus', function () { show(r); }); });
  });

  // Phone: the hero plays its clips one after another, 2.5s each.
  var reel = document.querySelector('.reel');
  if (reel && !still && window.matchMedia('(max-width: 560px)').matches) {
    var clips = reel.querySelectorAll('video'), cur = 0;
    reel.classList.add('cycle');
    clips.forEach(function (v) { v.preload = 'auto'; });
    clips[0].classList.add('on');
    setInterval(function () {
      if (document.hidden) return;
      var next = (cur + 1) % clips.length;
      try { clips[next].currentTime = 0; } catch (e) {}
      clips[next].play().catch(function () {});
      clips[next].classList.add('on'); clips[cur].classList.remove('on');
      cur = next;
    }, 2500);
  }

  // Phone: swipe row dots for the work films.
  var row = document.querySelector('.work-grid.six'), dots = document.querySelector('.dots');
  if (row && dots) {
    var cards = row.querySelectorAll('.card');
    cards.forEach(function () { dots.appendChild(document.createElement('i')); });
    var mark = function () {
      var i = Math.round(row.scrollLeft / (cards[0].offsetWidth + 10));
      dots.querySelectorAll('i').forEach(function (d, k) { d.classList.toggle('on', k === Math.min(i, cards.length - 1)); });
    };
    row.addEventListener('scroll', mark, { passive: true }); mark();
  }

  // Phone: Book a call bar shows after the hero and hides at the contact section.
  var bar = document.querySelector('.mbar'), hero = document.querySelector('.hero'), contact = document.getElementById('contact');
  if (bar && hero && contact && 'IntersectionObserver' in window) {
    var pastHero = false, atContact = false;
    var set = function () { bar.classList.toggle('show', pastHero && !atContact); };
    new IntersectionObserver(function (es) { pastHero = !es[0].isIntersecting; set(); }).observe(hero);
    new IntersectionObserver(function (es) { atContact = es[0].isIntersecting; set(); }).observe(contact);
  }

  // How we work film: muted autoplay, one tap for sound (restarts so the full offer is heard).
  document.querySelectorAll('.film .sound').forEach(function (b) {
    var v = b.parentNode.querySelector('video');
    b.addEventListener('click', function () {
      var on = v.muted;
      v.muted = !on;
      if (on) { v.currentTime = 0; v.play().catch(function () {}); }
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      b.textContent = on ? 'Sound off' : 'Sound on';
    });
  });

  // Lightbox.
  var box = document.getElementById('box'), bv = box.querySelector('video');
  document.querySelectorAll('[data-play]').forEach(function (b) {
    b.addEventListener('click', function () {
      bv.src = 'media/' + b.dataset.play + ('full' in b.dataset ? '-full' : '') + '.mp4';
      if (box.showModal) { box.showModal(); bv.play().catch(function () {}); }
    });
  });
  box.querySelector('button').addEventListener('click', function () { box.close(); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('close', function () { bv.pause(); bv.removeAttribute('src'); bv.load(); });
})();
