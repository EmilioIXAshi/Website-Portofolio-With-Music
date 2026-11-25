/* Dijalankan di <head> sebelum halaman digambar, supaya tidak ada kedipan. */
(function () {
  var root = document.documentElement;
  var id = root.getAttribute('data-page');
  var S = window.SITE;
  var cur = S.pages.filter(function (p) { return p.id === id; })[0] || S.pages[0];
  root.style.setProperty('--accent', cur.color);
  root.style.setProperty('--on', cur.on);
  try {
    var ss = window.sessionStorage;
    if (ss.getItem('wipe') === '1') {
      root.classList.add('wipe-hold');
      root.style.setProperty('--wipe', ss.getItem('wipeColor') || cur.color);
      root.style.setProperty('--wipe-on', ss.getItem('wipeOn') || cur.on);
      root.style.setProperty('--wx', ss.getItem('wipeX') || '50%');
      root.style.setProperty('--wy', ss.getItem('wipeY') || '50%');
    } else if (id === 'home' && S.loader && S.loader.enabled && (S.loader.everyVisit || !ss.getItem('seen'))) {
      root.classList.add('has-loader');
    }
  } catch (e) {}
})();
