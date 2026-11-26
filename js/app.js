/* Kerangka, transisi halaman, layar pembuka, dan isi tiap halaman.
   Yang perlu kamu ubah ada di js/data.js. */
(function () {
  'use strict';
  var S = window.SITE;
  var root = document.documentElement;
  var pageId = root.getAttribute('data-page');
  var main = document.getElementById('main');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function showToast(message) {
    var toast = $('#toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }
  function pageOf(id) { return S.pages.filter(function (p) { return p.id === id; })[0]; }
  var cur = pageOf(pageId) || S.pages[0];

  /* Rute halaman. Di http(s) memakai alamat file biasa. Saat dibuka langsung dari
     disk (file://) browser menolak pushState ke file lain, jadi dipakai #hash.
     Dengan begitu pindah halaman TIDAK PERNAH memuat ulang dokumen dan musik terus jalan. */
  function fileNow() {
    var h = location.hash.replace(/^#\/?/, '');
    if (/\.html$/.test(h)) return h;
    return location.pathname.split('/').pop() || 'index.html';
  }
  function pageByFile(f) { return S.pages.filter(function (p) { return p.href === f; })[0]; }
  (function () {
    var t = pageByFile(fileNow());
    if (t && t.id !== pageId) {
      pageId = t.id; cur = t;
      root.setAttribute('data-page', t.id);
      root.style.setProperty('--accent', t.color);
      root.style.setProperty('--on', t.on);
      root.classList.remove('has-loader');
    }
  })();
  var revealed = false;
  var musicController = { start: function () { return Promise.resolve(false); } };

  /* ---------- Kerangka: merek, menu, jam ---------- */
  function buildShell() {
    $('.brand').innerHTML = esc(S.name) + '<small>' + esc(S.role) + '</small>';
    var nav = $('#nav');
    nav.innerHTML = '<ul>' + S.pages.map(function (p) {
      return '<li><a href="' + esc(p.href) + '"' + (p.id === pageId ? ' aria-current="page"' : '') + '>' + esc(p.label) + '</a></li>';
    }).join('') + '</ul>';
    $('#railFoot').innerHTML =
      '<p class="status' + (S.status && S.status.open ? ' ok' : '') + '"><i></i><span>' + esc(S.status ? S.status.text : '') + '</span></p>' +
      '<p>Jam <span id="clock"></span> di ' + esc(S.location) + '</p>';
    var musicPlayer = document.createElement('aside');
    musicPlayer.className = 'music-player';
    musicPlayer.setAttribute('aria-label', 'Pemutar musik');
    musicPlayer.innerHTML =
      '<p class="music-player-title">' + esc(S.music.title) + '</p>' +
      '<audio controls loop preload="none" aria-label="Putar Béntang Sagara">' +
        '<source src="' + esc(S.music.src) + '" type="audio/mpeg">' +
      '</audio>' +
      '<p class="music-player-status" role="status" aria-live="polite">Tekan putar untuk mendengarkan.</p>';
    var music = musicPlayer.querySelector('audio');
    var musicStatus = musicPlayer.querySelector('.music-player-status');
    var musicStateKey = 'portfolio-music-state';
    var musicWasPlaying = false;
    var savedMusic = null;
    var musicRestored = false;
    var deferMusicForLoader = pageId === 'home' && root.classList.contains('has-loader');
    try {
      savedMusic = JSON.parse(sessionStorage.getItem(musicStateKey) || 'null');
      musicWasPlaying = !!(savedMusic && savedMusic.playing);
    } catch (err) {}
    function saveMusicState() {
      try {
        sessionStorage.setItem(musicStateKey, JSON.stringify({
          time: music.currentTime || 0,
          playing: musicWasPlaying
        }));
      } catch (err) {}
    }
    function restoreMusicState() {
      if (!savedMusic || musicRestored) return;
      var time = Number(savedMusic.time);
      if (isFinite(time) && time > 0) music.currentTime = time;
      musicRestored = true;
      if (!musicWasPlaying || deferMusicForLoader) return;
      musicController.start().then(function (played) {
        if (played) musicStatus.textContent = 'Musik dilanjutkan.';
      });
    }
    musicController.start = function (force) {
      var playingMessage = savedMusic && musicWasPlaying ? 'Musik dilanjutkan.' : 'Musik diputar.';
      if (savedMusic && !musicRestored) {
        if (music.readyState >= 1) restoreMusicState();
        else {
          music.addEventListener('loadedmetadata', restoreMusicState, { once: true });
          return new Promise(function (resolve) {
            music.addEventListener('loadedmetadata', function () {
              if (!musicWasPlaying && !force) { resolve(false); return; }
              music.play().then(function () {
                musicStatus.textContent = playingMessage;
                resolve(true);
              }).catch(function () {
                musicStatus.textContent = 'Browser memblokir pemutaran otomatis. Tekan Putar untuk melanjutkan.';
                resolve(false);
              });
            }, { once: true });
            music.addEventListener('error', function () {
              resolve(false);
            }, { once: true });
            music.load();
          });
        }
      }
      if (savedMusic && !musicWasPlaying && !force) return Promise.resolve(false);
      return music.play().then(function () {
        musicStatus.textContent = playingMessage;
        return true;
      }).catch(function () {
        musicStatus.textContent = 'Browser memblokir pemutaran otomatis. Tekan Putar untuk melanjutkan.';
        return false;
      });
    };
    if (savedMusic) {
      music.preload = 'auto';
      music.addEventListener('loadedmetadata', restoreMusicState, { once: true });
      if (music.readyState >= 1 && !deferMusicForLoader) restoreMusicState();
      else music.load();
    }
    var unloading = false;
    window.addEventListener('beforeunload', function () { unloading = true; });
    window.addEventListener('pagehide', function () { unloading = true; });
    music.addEventListener('play', function () {
      musicWasPlaying = true;
      music.preload = 'auto'; /* terus menyangga data supaya tidak tersendat */
      saveMusicState();
    });
    music.addEventListener('pause', function () {
      if (!unloading && document.visibilityState === 'visible') musicWasPlaying = false;
      saveMusicState();
    });
    music.addEventListener('timeupdate', saveMusicState);
    window.addEventListener('pagehide', saveMusicState);
    music.addEventListener('error', function () {
      musicStatus.textContent = 'Musik tidak dapat dimuat.';
    });
    nav.appendChild(musicPlayer);
    document.title = pageId === 'home' ? S.name + ', ' + S.role : cur.label + ' | ' + S.name;

    var btn = $('#menuBtn');
    function setMenu(open) {
      root.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Tutup' : 'Menu';
    }
    btn.addEventListener('click', function () { setMenu(!root.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

    var clock = $('#clock');
    function tick() {
      try {
        clock.textContent = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: S.timezone }).format(new Date());
      } catch (e) { clock.textContent = new Date().toTimeString().slice(0, 5); }
    }
    tick(); setInterval(tick, 20000);
  }

  /* ---------- Transisi antar halaman ----------
     Tirai dua lapis: kolom gelap naik lebih dulu, disusul kolom berwarna halaman tujuan.
     Isi halaman diganti saat layar tertutup penuh, lalu tirai terus naik membuka halaman baru.
     Elemen musik berada di luar <main>, jadi tidak pernah tersentuh. */
  var go = function (href) { location.href = href; };

  function setupTransitions() {
    var wipe = $('#wipe');
    var cols = $$('i', wipe);
    var label = $('b', wipe);
    var ink = document.createElement('div');
    ink.className = 'wipe-ink';
    ink.setAttribute('aria-hidden', 'true');
    ink.innerHTML = cols.map(function () { return '<i></i>'; }).join('');
    wipe.parentNode.insertBefore(ink, wipe);
    var inkCols = $$('i', ink);

    var EASE = 'cubic-bezier(.76,0,.24,1)';
    var COVER = 460, REVEAL = 520, STEP = 36, INK = 80;
    var busy = false, queued = null, hashMode = false, running = [];

    if (pageId !== 'work' || !(S.workComingSoon && S.workComingSoon.enabled)) {
      try { sessionStorage.setItem('lastPage', fileNow()); } catch (err) {}
    }

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function fin(a) { return a.finished || new Promise(function (r) { a.onfinish = r; }); }
    function slide(els, from, to, dur, extra) {
      return Promise.all(els.map(function (el, i) {
        var a = el.animate([{ transform: from }, { transform: to }],
          { duration: dur, delay: i * STEP + extra, easing: EASE, fill: 'both' });
        running.push(a);
        return fin(a);
      }));
    }
    function fade(from, to, dur, delay, easing) {
      var a = label.animate([from, to], { duration: dur, delay: delay, easing: easing, fill: 'both' });
      running.push(a);
      return fin(a);
    }
    function setLabel(t) {
      label.innerHTML = '<small>' + pad(S.pages.indexOf(t) + 1) + ' / ' + pad(S.pages.length) + '</small><span>' + esc(t.label) + '</span>';
    }
    function cleanup() {
      running.forEach(function (a) { try { a.cancel(); } catch (err) {} });
      running = [];
      wipe.classList.remove('on');
      ink.classList.remove('on');
    }
    function closeMenu() {
      root.classList.remove('nav-open');
      var mb = $('#menuBtn');
      mb.setAttribute('aria-expanded', 'false');
      mb.textContent = 'Menu';
    }

    function cover(t) {
      root.style.setProperty('--wipe', t.color);
      root.style.setProperty('--wipe-on', t.on);
      setLabel(t);
      wipe.classList.add('on');
      ink.classList.add('on');
      return Promise.all([
        slide(inkCols, 'translateY(100%)', 'translateY(0)', COVER, 0),
        slide(cols, 'translateY(100%)', 'translateY(0)', COVER, INK),
        fade({ opacity: 0, transform: 'translateY(1.6rem)' }, { opacity: 1, transform: 'none' }, 380, 300, 'cubic-bezier(.16,1,.3,1)')
      ]);
    }
    function uncover() {
      wipe.classList.add('on');
      ink.classList.add('on');
      return Promise.all([
        fade({ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-1.6rem)' }, 240, 0, 'ease-in'),
        slide(cols, 'translateY(0)', 'translateY(-101%)', REVEAL, 70),
        slide(inkCols, 'translateY(0)', 'translateY(-101%)', REVEAL, 70 + INK)
      ]).then(cleanup);
    }

    function pushRoute(href, t) {
      var st = { page: t.id };
      if (!hashMode) {
        try { history.pushState(st, '', href); return true; } catch (err) { hashMode = true; }
      }
      try { history.pushState(st, '', '#' + t.href); return true; } catch (err) { return false; }
    }

    function transition(t, href, push) {
      if (busy) { if (!push) queued = t; return; }
      busy = true;
      closeMenu();
      function swap() {
        if (push && !pushRoute(href, t)) {
          /* Cadangan terakhir bila history benar-benar tidak bisa dipakai */
          try {
            sessionStorage.setItem('wipe', '1');
            sessionStorage.setItem('wipeColor', t.color);
            sessionStorage.setItem('wipeOn', t.on);
          } catch (err) {}
          location.href = href;
          return false;
        }
        renderPage(t);
        if (main.focus) main.focus({ preventScroll: true });
        return true;
      }
      function done() {
        busy = false;
        if (queued) {
          var q = queued; queued = null;
          if (q.id !== pageId) transition(q, null, false);
        }
      }
      if (reduce || !wipe.animate) { swap(); done(); return; }
      cover(t).then(function () {
        if (swap() === false) return null;
        return uncover().then(done);
      }).catch(function () { cleanup(); done(); });
    }
    go = function (href, target) { transition(target, href, true); };

    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if ((a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u;
      try { u = new URL(a.href, location.href); } catch (err) { return; }
      if (u.protocol !== location.protocol || u.origin !== location.origin) return;
      var file = u.pathname.split('/').pop() || 'index.html';
      var target = pageByFile(file);
      if (!target) return;
      if (file === fileNow()) { if (!u.hash) e.preventDefault(); return; }
      e.preventDefault();
      transition(target, u.href, true);
    });

    try { history.replaceState({ page: pageId }, '', location.href); } catch (err) {}
    window.addEventListener('popstate', function () {
      var target = pageByFile(fileNow());
      if (!target) { location.reload(); return; }
      if (target.id === pageId && !busy) return;
      transition(target, null, false);
    });

    window.addEventListener('pageshow', function (e) {
      if (e.persisted) { cleanup(); busy = false; }
    });

    /* Dimuat setelah pindah halaman darurat: tirai masih menutup, buka perlahan */
    if (root.classList.contains('wipe-hold')) {
      setLabel(cur);
      try { sessionStorage.removeItem('wipe'); } catch (err) {}
      if (reduce || !wipe.animate) { root.classList.remove('wipe-hold'); return; }
      busy = true;
      var p = uncover();
      root.classList.remove('wipe-hold');
      requestAnimationFrame(function () { requestAnimationFrame(reveal); });
      p.then(function () { busy = false; });
    }
  }

  /* ---------- Layar pembuka ---------- */
  function runLoader() {
    var L = $('#loader');
    if (!L || !root.classList.contains('has-loader')) return false;
    var cfg = S.loader;
    var msgs = cfg.messages && cfg.messages.length ? cfg.messages : [''];
    var bar = $('.loader-bar i', L), count = $('.loader-count', L), msg = $('.loader-msg', L);
    $('.loader-name', L).innerHTML = Array.prototype.map.call(S.name, function (c, i) {
      return '<span style="--i:' + i + '">' + (c === ' ' ? '&nbsp;' : esc(c)) + '</span>';
    }).join('');

    var dur = cfg.duration || 2600, t0 = performance.now(), finished = false, lastIdx = -1;
    function ease(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }

    function finish() {
      if (finished) return;
      finished = true;
      try { sessionStorage.setItem('seen', '1'); } catch (e) {}
      bar.style.transform = 'scaleX(1)'; count.textContent = '100';
      var playback = musicController.start(true);
      Promise.resolve(playback).then(function () {
        setTimeout(function () {
          L.classList.add('done');
          setTimeout(reveal, 450);
          setTimeout(function () { L.remove(); root.classList.remove('has-loader'); }, 1000);
        }, 2000);
      });
    }
    function frame(now) {
      if (finished) return;
      var t = Math.min(1, (now - t0) / dur), p = ease(t);
      bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      count.textContent = t < 1 ? String(Math.min(99, Math.round(p * 100))) : '100';
      var idx = Math.min(msgs.length - 1, Math.floor(p * msgs.length));
      if (idx !== lastIdx) { msg.textContent = msgs[idx]; lastIdx = idx; }
      if (t < 1) requestAnimationFrame(frame); else finish();
    }
    requestAnimationFrame(frame);
    L.addEventListener('click', finish);
    document.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') finish(); });
    return true;
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    root.classList.add('ready');
  }

  /* ---------- Potongan HTML bersama ---------- */
  function lines(arr) {
    return arr.map(function (t, i) { return '<span class="ln" style="--l:' + i + '"><span>' + esc(t) + '</span></span>'; }).join('');
  }
  function head(p) {
    return '<header class="page-head"><h1>' + lines(p.title) + '</h1><p class="sub">' + esc(p.sub) + '</p></header>';
  }
  function foot() {
    return '<footer class="foot"><span>&copy; ' + new Date().getFullYear() + ' ' + esc(S.name) + '</span><span>' + esc(S.footerNote) + '</span></footer>';
  }
  function photo(src, cls) {
    return '<img class="' + cls + '" src="' + esc(src) + '" alt="Foto ' + esc(S.name) + '" width="800" height="1000" onerror="this.onerror=null;this.src=\'assets/placeholder.svg\'">';
  }
  function tagList(arr) {
    return '<ul class="tags">' + arr.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>';
  }

  /* ---------- Halaman ---------- */
  var pages = {};
  var pageTimer = null;
  var menuCleanup = null;
function loadScript(src) {
  return new Promise(function (resolve, reject) {
    if (window.mountInfiniteMenu) return resolve();
    var s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

  pages.home = function () {
    var items = S.home.marquee.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('');
    main.innerHTML =
      '<section class="hero">' +
        '<div><h1>' + lines(S.home.headline) + '</h1>' +
        '<p class="lead">' + esc(S.home.intro) + '</p>' +
        '<div class="actions">' +
          '<a class="btn btn-solid" href="karya.html">Lihat karya saya</a>' +
          '<a class="btn" href="kritik-saran.html">Kirim kritik &amp; saran</a>' +
          (S.cv ? '<a class="link" href="' + esc(S.cv) + '" download>Unduh CV</a>' : '<a class="link" href="kontak.html">Ajak saya ngobrol</a>') +
        '</div></div>' +
        '<figure class="portrait">' + photo(S.home.photo, '') + '<figcaption>' + esc(S.home.caption) + '</figcaption></figure>' +
      '</section>' +
      '<div class="marquee" aria-label="Yang sedang saya lakukan"><div class="track">' + items + items + '</div></div>' +
      '<section class="paths"><h2 class="sec">' + esc(S.home.pathsTitle) + '</h2><ul>' +
        S.pages.filter(function (p) { return p.id !== 'home'; }).map(function (p) {
          return '<li><a href="' + esc(p.href) + '" style="--c:' + p.color + ';--o:' + p.on + '"><span class="t">' + esc(p.label) + '</span><span class="d">' + esc(p.hint) + '</span></a></li>';
        }).join('') +
      '</ul></section>' + foot();

    var hero = $('.hero');
    if (!reduce && window.matchMedia('(pointer:fine)').matches) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width - .5) * 2).toFixed(2));
        hero.style.setProperty('--my', (((e.clientY - r.top) / r.height - .5) * 2).toFixed(2));
      });
      hero.addEventListener('pointerleave', function () { hero.style.setProperty('--mx', 0); hero.style.setProperty('--my', 0); });
    }
    $$('.hero .lead, .hero .actions, .portrait, .marquee, .paths, .foot').forEach(function (el) { el.classList.add('fx'); });
  };

  pages.about = function () {
    var A = S.about;
    main.innerHTML = head(cur) +
      '<div class="about">' +
        '<aside class="about-side">' + photo(A.photo, '') +
          '<dl class="facts">' + A.facts.map(function (f) { return '<div><dt>' + esc(f.k) + '</dt><dd>' + esc(f.v) + '</dd></div>'; }).join('') + '</dl>' +
        '</aside>' +
        '<div class="about-body">' +
          '<div class="bio">' + A.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
          '<section><h2 class="sec">Perjalanan</h2><ol class="timeline">' +
            A.timeline.map(function (t) { return '<li><span class="yr">' + esc(t.year) + '</span><div><h3>' + esc(t.title) + '</h3><p>' + esc(t.text) + '</p></div></li>'; }).join('') +
          '</ol></section>' +
          '<section><h2 class="sec">Alat dan kebiasaan</h2><div class="skills">' +
            A.skills.map(function (g) { return '<div><h3>' + esc(g.group) + '</h3>' + tagList(g.items) + '</div>'; }).join('') +
          '</div></section>' +
        '</div>' +
      '</div>' + foot();
    $$('.page-head .sub, .about, .foot').forEach(function (el) { el.classList.add('fx'); });
  };
    pages.gallery = function () {
  var photos = S.gallery.photos;
  main.innerHTML = head(cur) +
    '<section class="gallery-view" aria-label="Galeri foto">' +
      '<div class="menu-host" id="menuHost"></div>' +
    '</section>' + foot();
  $$('.page-head .sub, .gallery-view, .foot').forEach(function (el) { el.classList.add('fx'); });

  var host = $('#menuHost');
  loadScript('js/infinite-menu.js').then(function () {
    if (!host.isConnected) return; // pengunjung sudah pindah halaman
    menuCleanup = window.mountInfiniteMenu(host, {
      items: photos.map(function (p) {
        return { image: p.image, title: p.title, description: p.description };
      }),
      theme: 'light',
      accentColor: '#0e1a2b',
      backgroundColor: '#fff',
      autoplay: reduce ? 0 : 3
    });
  });
};

  /* Karya ditahan: layar Coming soon, lalu kembali ke halaman sebelumnya */
  function comingSoon() {
    var cfg = S.workComingSoon, secs = cfg.seconds || 4;
    var last = 'index.html';
    try { last = sessionStorage.getItem('lastPage') || last; } catch (err) {}
    var back = S.pages.filter(function (p) { return p.href === last && p.id !== 'work'; })[0] || S.pages[0];
    var band = '';
    for (var i = 0; i < 10; i++) band += '<span>Coming soon</span>';

    main.innerHTML =
      '<section class="soon">' +
        '<h1>' + lines(cfg.title) + '</h1>' +
        '<p class="soon-note">' + esc(cfg.note) + ' Kamu akan kembali ke <b>' + esc(back.label) + '</b> dalam <span id="soonCount">' + secs + '</span> detik.</p>' +
        '<div class="soon-bar" aria-hidden="true"><i style="animation-duration:' + secs + 's"></i></div>' +
        '<a class="link" href="' + esc(back.href) + '">Kembali sekarang</a>' +
      '</section>' +
      '<div class="marquee" aria-hidden="true"><div class="track">' + band + band + '</div></div>';
    $$('.soon-note, .soon-bar, .soon .link, .marquee').forEach(function (el) { el.classList.add('fx'); });

    var left = secs, count = $('#soonCount');
    pageTimer = setInterval(function () {
      left--;
      count.textContent = String(Math.max(left, 0));
      if (left <= 0) {
        clearInterval(pageTimer);
        pageTimer = null;
        go(back.href, back, window.innerWidth / 2, window.innerHeight / 2);
      }
    }, 1000);
  }

  pages.work = function () {
    if (S.workComingSoon && S.workComingSoon.enabled) return comingSoon();
    var P = S.projects;
    var palette = S.pages.map(function (p) { return { c: p.color, o: p.on }; });
    var allTags = [];
    P.forEach(function (p) { p.tags.forEach(function (t) { if (allTags.indexOf(t) < 0) allTags.push(t); }); });
    var tag = '', sel = 0;

    main.innerHTML = head(cur) +
      '<div class="work">' +
        '<div class="filters" role="group" aria-label="Saring proyek">' +
          ['Semua'].concat(allTags).map(function (t, i) {
            return '<button type="button" class="chip-btn" aria-pressed="' + (i === 0) + '" data-tag="' + (i ? esc(t) : '') + '">' + esc(t) + '</button>';
          }).join('') +
        '</div>' +
        '<div class="work-grid"><ol class="work-list" id="wlist"></ol><article class="detail" id="detail" aria-live="polite"></article></div>' +
      '</div>' + foot();
    $$('.page-head .sub, .work, .foot').forEach(function (el) { el.classList.add('fx'); });

    var list = $('#wlist'), detail = $('#detail');
    function visible() { return P.filter(function (p) { return !tag || p.tags.indexOf(tag) >= 0; }); }

    function showDetail(p, animate) {
      var idx = P.indexOf(p), col = p.color ? { c: p.color, o: p.on || '#0e1a2b' } : palette[(idx + 1) % palette.length];
      var links = (p.links || []).filter(function (l) { return l.href; }).map(function (l) {
        return '<a class="link" href="' + esc(l.href) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
      }).join('');
      detail.innerHTML =
        '<div class="visual" style="--pc:' + col.c + ';--po:' + col.o + '">' +
          (p.image ? '<img src="' + esc(p.image) + '" alt="Tampilan ' + esc(p.title) + '">' : '<b>' + esc(p.headline || p.title) + '</b>') +
        '</div>' +
        '<div class="body"><h2>' + esc(p.title) + '</h2><p class="meta">' + esc(p.role) + ', ' + esc(p.year) + '</p>' +
          '<h3>Masalahnya</h3><p>' + esc(p.problem) + '</p>' +
          '<h3>Yang saya kerjakan</h3><p>' + esc(p.did) + '</p>' +
          '<h3>Hasilnya</h3><p>' + esc(p.result) + '</p>' +
          tagList(p.tags) + (links ? '<div class="links">' + links + '</div>' : '') +
        '</div>';
      if (animate && !reduce) { detail.classList.remove('swap'); void detail.offsetWidth; detail.classList.add('swap'); }
    }

    function renderList(animate) {
      var vis = visible();
      if (sel >= vis.length) sel = 0;
      list.innerHTML = vis.map(function (p, i) {
        return '<li><button type="button" data-i="' + i + '"' + (i === sel ? ' aria-current="true"' : '') + '>' +
          '<span><span class="t">' + esc(p.title) + '</span><span class="s">' + esc(p.summary) + '</span></span>' +
          '<span class="y">' + esc(p.year) + '</span></button></li>';
      }).join('');
      showDetail(vis[sel], animate);
    }
    function select(i, focus) {
      var vis = visible();
      if (i < 0 || i >= vis.length) return;
      sel = i;
      $$('button', list).forEach(function (b, k) { if (k === i) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      showDetail(vis[i], true);
      if (focus) $$('button', list)[i].focus();
      if (window.matchMedia('(max-width:60rem)').matches) detail.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }

    list.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-i]'); if (b) select(+b.getAttribute('data-i'), false);
    });
    list.addEventListener('keydown', function (e) {
      var b = e.target.closest('button[data-i]'); if (!b) return;
      var i = +b.getAttribute('data-i');
      if (e.key === 'ArrowDown') { e.preventDefault(); select(i + 1, true); }
      if (e.key === 'ArrowUp') { e.preventDefault(); select(i - 1, true); }
    });
    $('.filters').addEventListener('click', function (e) {
      var b = e.target.closest('.chip-btn'); if (!b) return;
      tag = b.getAttribute('data-tag'); sel = 0;
      $$('.chip-btn').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderList(true);
    });
    renderList(false);
  };

  pages.contact = function () {
    var C = S.contact;
    main.innerHTML = head(cur) +
      '<div class="contact">' +
        '<section><p class="note">' + esc(C.note) + '</p>' +
          '<a class="mail" href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a>' +
          '<div class="actions"><button class="btn btn-solid" id="copyBtn" type="button">Salin alamat surel</button>' +
          '<a class="btn" href="mailto:' + esc(S.email) + '">Buka aplikasi surel</a></div>' +
          '<p class="help" id="copyMsg" role="status"></p>' +
        '</section>' +
        '<div class="contact-col">' +
          '<section><h2 class="sec">Atau lewat sini</h2><ul class="socials">' +
            C.socials.map(function (s) {
              var comingSoon = s.comingSoon ? ' data-coming-soon="' + esc(s.comingSoon) + '"' : '';
              var attrs = s.comingSoon ? '' : ' target="_blank" rel="noopener"';
              return '<li><a href="' + esc(s.href) + '"' + attrs + comingSoon + '><b>' + esc(s.name) + '</b><span>' + esc(s.handle) + '</span></a></li>';
            }).join('') +
          '</ul></section>' +
          '<section><h2 class="sec">Tulis dari sini</h2>' +
            '<form id="mailForm">' +
              '<label class="field"><span>Nama kamu</span><input name="who" autocomplete="name" required></label>' +
              '<label class="field"><span>Topik</span><input name="topic" required></label>' +
              '<label class="field"><span>Pesan</span><textarea name="msg" rows="5" required></textarea></label>' +
              '<button class="btn btn-solid" type="submit">Siapkan surel</button>' +
              '<p class="help">Tombol ini membuka aplikasi surel di perangkatmu dengan isi yang sudah terisi.</p>' +
            '</form></section>' +
        '</div>' +
      '</div>' + foot();
    $$('.page-head .sub, .contact, .foot').forEach(function (el) { el.classList.add('fx'); });

    $$('[data-coming-soon]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        showToast(link.getAttribute('data-coming-soon'));
      });
    });

    $('#copyBtn').addEventListener('click', function () {
      var msg = $('#copyMsg');
      function ok() { msg.textContent = 'Tersalin: ' + S.email; }
      function fallback() {
        var t = document.createElement('textarea'); t.value = S.email; document.body.appendChild(t); t.select();
        try { document.execCommand('copy'); ok(); } catch (e) { msg.textContent = 'Tidak bisa menyalin otomatis. Salin manual dari tulisan di atas.'; }
        t.remove();
      }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(S.email).then(ok, fallback); else fallback();
    });
    $('#mailForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target.elements;
      var body = f.msg.value.trim() + '\n\nSalam,\n' + f.who.value.trim();
      location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(f.topic.value.trim()) + '&body=' + encodeURIComponent(body);
    });
  };

  pages.feedback = function () {
    var max = (S.feedback && S.feedback.maxLength) || 400;
    main.innerHTML = head(cur) +
      '<div class="fb">' +
        '<form class="fb-form" id="fbForm" novalidate>' +
          '<fieldset class="seg"><legend>Jenis masukan</legend><div class="seg-row">' +
            '<label><input type="radio" name="type" value="kritik" checked><span>Kritik</span></label>' +
            '<label><input type="radio" name="type" value="saran"><span>Saran</span></label>' +
          '</div></fieldset>' +
          '<label class="field"><span>Nama (boleh dikosongkan)</span><input name="who" maxlength="40" autocomplete="nickname"></label>' +
          '<label class="field"><span>Pesan</span><textarea name="msg" rows="7" maxlength="' + max + '" required></textarea></label>' +
          '<div class="field-foot"><span id="fbChars">0/' + max + '</span><span id="fbHint" role="status"></span></div>' +
          '<input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
          '<button class="btn btn-solid" type="submit" id="fbSend">Kirim sekarang</button>' +
        '</form>' +
        '<section aria-labelledby="fbTitle">' +
          '<div class="fb-bar"><h2 class="sec" id="fbTitle">Komentar pengunjung <span id="fbCount"></span></h2>' +
            '<p class="status" id="fbStatus"><i></i><span>Menyambung</span></p></div>' +
          '<div id="fbNote"></div>' +
          '<details class="admin-panel">' +
            '<summary>Akses admin</summary>' +
            '<form id="fbAdminForm" novalidate>' +
              '<label class="field"><span>Email admin</span><input type="email" name="email" autocomplete="username" required></label>' +
              '<label class="field"><span>Kata sandi</span><input type="password" name="password" autocomplete="current-password" required></label>' +
              '<button class="btn" type="submit" id="fbAdminLogin">Login admin</button>' +
            '</form>' +
            '<p class="admin-status" id="fbAdminStatus" role="status" aria-live="polite"></p>' +
            '<button class="btn" type="button" id="fbAdminLogout" hidden>Keluar admin</button>' +
          '</details>' +
          '<div class="fb-filter" role="group" aria-label="Saring masukan">' +
            '<button type="button" class="chip-btn" data-f="all" aria-pressed="true">Semua</button>' +
            '<button type="button" class="chip-btn" data-f="kritik" aria-pressed="false">Kritik</button>' +
            '<button type="button" class="chip-btn" data-f="saran" aria-pressed="false">Saran</button>' +
          '</div>' +
          '<ul id="fbList" aria-live="polite"></ul>' +
          '<div class="empty" id="fbEmpty"><strong>Belum ada yang masuk.</strong>Jadilah yang pertama. Kritik paling tajam pun boleh.</div>' +
        '</section>' +
      '</div>' + foot();
    $$('.page-head .sub, .fb, .foot').forEach(function (el) { el.classList.add('fx'); });
    if (window.Feedback) window.Feedback.init();
  };

  function renderPage(target) {
    if (menuCleanup) { menuCleanup(); menuCleanup = null; }
    if (pageTimer) { clearInterval(pageTimer); pageTimer = null; }
    if (pageId === 'feedback' && target.id !== 'feedback' && window.Feedback && window.Feedback.destroy) {
      window.Feedback.destroy();
    }
    pageId = target.id;
    cur = target;
    root.setAttribute('data-page', pageId);
    root.style.setProperty('--accent', target.color);
    root.style.setProperty('--on', target.on);
    document.title = pageId === 'home' ? S.name + ', ' + S.role : target.label + ' | ' + S.name;
    $$('#nav a').forEach(function (link) {
      if (link.getAttribute('href') === target.href) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
    if (pageId !== 'work' || !(S.workComingSoon && S.workComingSoon.enabled)) {
      try { sessionStorage.setItem('lastPage', target.href); } catch (err) {}
    }
    if (pageId === 'feedback' && !window.Feedback) {
      location.href = target.href;
      return;
    }
    revealed = false;
    root.classList.remove('ready');
    main.innerHTML = '';
    (pages[pageId] || pages.home)();
    window.scrollTo(0, 0);
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  }

  /* ---------- Mulai ---------- */
  buildShell();
  (pages[pageId] || pages.home)();
  setupTransitions();
  var loading = runLoader();
  if (!loading && !root.classList.contains('wipe-hold') ) {
    requestAnimationFrame(function () { requestAnimationFrame(reveal); });
  }
  setTimeout(reveal, 6000);
})();
