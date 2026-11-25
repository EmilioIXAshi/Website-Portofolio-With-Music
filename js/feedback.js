/* Kritik & saran bersama melalui Supabase REST API. */
window.Feedback = (function () {
  'use strict';
  var cfg = window.SITE.feedback || {};
  var supabase = cfg.supabase || {};
  var base = String(supabase.url || '').replace(/\/+$/, '');
  var apiKey = supabase.publishableKey || '';
  var configured = !!(base && apiKey);
  var MAX = cfg.maxLength || 400;
  var COOL = (cfg.cooldownSeconds || 20) * 1000;
  var LAST = 'portfolio-feedback-last';
  var PAGE_SIZE = 500;
  var items = [], seen = {}, initial = true, filter = 'all', el = {};
  var adminToken = '', loading = false, refreshQueued = false, refreshTimer = null;

  function $(s) { return document.querySelector(s); }

  function setStatus(kind, text) {
    el.status.className = 'status ' + kind;
    el.status.querySelector('span').textContent = text;
  }
  function setAdminStatus(text, kind) {
    el.adminStatus.textContent = text;
    el.adminStatus.removeAttribute('data-kind');
    if (kind) el.adminStatus.setAttribute('data-kind', kind);
  }
  function hint(text, kind) {
    el.hint.textContent = text || '';
    if (kind) el.hint.setAttribute('data-kind', kind); else el.hint.removeAttribute('data-kind');
  }
  function rel(timestamp) {
    var seconds = Math.max(0, (Date.now() - timestamp) / 1000);
    if (seconds < 45) return 'baru saja';
    if (seconds < 3600) return Math.round(seconds / 60) + ' menit lalu';
    if (seconds < 86400) return Math.round(seconds / 3600) + ' jam lalu';
    if (seconds < 86400 * 7) return Math.round(seconds / 86400) + ' hari lalu';
    return new Date(timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function request(path, method, body, token, extraHeaders) {
    var headers = {
      apikey: apiKey,
      Authorization: 'Bearer ' + (token || apiKey)
    };
    if (body !== null && body !== undefined) headers['Content-Type'] = 'application/json';
    Object.keys(extraHeaders || {}).forEach(function (key) { headers[key] = extraHeaders[key]; });
    var options = { method: method || 'GET', headers: headers };
    if (body !== null && body !== undefined) options.body = JSON.stringify(body);

    return fetch(base + path, options).then(function (response) {
      return response.text().then(function (text) {
        var result = text ? JSON.parse(text) : null;
        if (!response.ok) {
          var message = result && (result.message || result.msg || result.error_description || result.error);
          throw new Error(message || 'Permintaan gagal (HTTP ' + response.status + ').');
        }
        return result;
      });
    });
  }

  function fetchPage(offset, rows) {
    var path = '/rest/v1/feedback?select=id,name,type,msg,created_at&order=created_at.desc,id.desc';
    return request(path, 'GET', null, '', {
      'Range-Unit': 'items',
      Range: offset + '-' + (offset + PAGE_SIZE - 1)
    }).then(function (page) {
      if (!Array.isArray(page)) throw new Error('Format data komentar tidak valid.');
      var all = rows.concat(page);
      if (page.length < PAGE_SIZE) return all;
      return fetchPage(offset + page.length, all);
    });
  }

  function refresh() {
    if (!configured) return Promise.resolve();
    if (loading) { refreshQueued = true; return Promise.resolve(); }
    loading = true;
    if (initial) setStatus('', 'Memuat komentar');
    return fetchPage(0, []).then(function (rows) {
      items = rows;
      render();
      initial = false;
      setStatus('ok', items.length + ' komentar · diperbarui');
      el.note.textContent = 'Semua komentar tersimpan bersama dan dapat dilihat pengunjung lain.';
    }, function (error) {
      setStatus('bad', 'Gagal memuat komentar');
      el.note.textContent = 'Komentar tidak dapat dimuat: ' + error.message;
    }).then(function () {
      loading = false;
      if (refreshQueued) { refreshQueued = false; return refresh(); }
    });
  }

  function send(entry) {
    return request('/rest/v1/feedback?select=id,name,type,msg,created_at', 'POST', entry, '', {
      Prefer: 'return=representation'
    }).then(function (result) {
      if (!Array.isArray(result) || !result.length) throw new Error('Komentar tidak tersimpan.');
      return result[0];
    });
  }

  function render() {
    var normalized = items.map(function (item) {
      var timestamp = Date.parse(item.created_at);
      return {
        id: String(item.id),
        name: String(item.name || 'Anonim').slice(0, 40),
        type: item.type === 'kritik' ? 'kritik' : 'saran',
        msg: String(item.msg || '').slice(0, MAX),
        ts: isNaN(timestamp) ? Date.now() : timestamp
      };
    });
    var shown = normalized.filter(function (item) { return filter === 'all' || item.type === filter; });
    el.count.textContent = normalized.length ? '(' + normalized.length + ')' : '';
    el.list.textContent = '';
    shown.forEach(function (item) {
      var li = document.createElement('li');
      li.className = 'entry ' + item.type + (!initial && !seen[item.id] ? ' fresh' : '');
      var meta = document.createElement('div'); meta.className = 'meta';
      var name = document.createElement('strong'); name.textContent = item.name;
      var kind = document.createElement('span'); kind.className = 'kind'; kind.textContent = item.type === 'kritik' ? 'Kritik' : 'Saran';
      var time = document.createElement('time'); time.textContent = rel(item.ts); time.dateTime = new Date(item.ts).toISOString();
      meta.appendChild(name); meta.appendChild(kind); meta.appendChild(time);
      var message = document.createElement('p'); message.textContent = item.msg;
      li.appendChild(meta); li.appendChild(message);
      if (adminToken) {
        var remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'chip-btn delete-comment';
        remove.setAttribute('data-delete-id', item.id);
        remove.textContent = 'Hapus komentar';
        li.appendChild(remove);
      }
      el.list.appendChild(li);
    });
    normalized.forEach(function (item) { seen[item.id] = 1; });
    el.empty.hidden = shown.length > 0;
    el.empty.querySelector('strong').textContent = normalized.length && !shown.length ? 'Tidak ada yang cocok.' : 'Belum ada yang masuk.';
  }

  function init() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = null;
    el.form = $('#fbForm'); el.list = $('#fbList'); el.empty = $('#fbEmpty'); el.count = $('#fbCount');
    el.status = $('#fbStatus'); el.hint = $('#fbHint'); el.chars = $('#fbChars'); el.note = $('#fbNote');
    el.adminForm = $('#fbAdminForm'); el.adminStatus = $('#fbAdminStatus'); el.adminLogout = $('#fbAdminLogout');
    var f = el.form.elements, btn = $('#fbSend');

    f.msg.addEventListener('input', function () { el.chars.textContent = f.msg.value.length + '/' + MAX; hint(''); });

    $('.fb-filter').addEventListener('click', function (event) {
      var button = event.target.closest('button[data-f]');
      if (!button) return;
      filter = button.getAttribute('data-f');
      Array.prototype.forEach.call(document.querySelectorAll('.fb-filter button'), function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      render();
    });

    el.form.addEventListener('submit', function (event) {
      event.preventDefault();
      if (f.website.value) return;
      var msg = f.msg.value.trim();
      var entry = {
        name: f.who.value.trim().slice(0, 40) || 'Anonim',
        type: f.type.value === 'kritik' ? 'kritik' : 'saran',
        msg: msg.slice(0, MAX)
      };
      if (msg.length < 5) { hint('Tulis minimal 5 karakter supaya ada yang bisa saya tanggapi.', 'bad'); f.msg.focus(); return; }
      var lastSent = 0;
      try { lastSent = +localStorage.getItem(LAST) || 0; } catch (error) {}
      var wait = COOL - (Date.now() - lastSent);
      if (wait > 0) { hint('Tunggu ' + Math.ceil(wait / 1000) + ' detik sebelum mengirim lagi.', 'bad'); return; }
      btn.disabled = true; hint('Mengirim');
      send(entry).then(function (created) {
        try { localStorage.setItem(LAST, String(Date.now())); } catch (error) {}
        items.unshift(created);
        render();
        f.msg.value = ''; el.chars.textContent = '0/' + MAX;
        hint('Terkirim. Komentar dapat dilihat pengunjung lain.', 'ok');
        return refresh();
      }).catch(function (error) {
        hint('Gagal mengirim: ' + error.message, 'bad');
      }).then(function () { btn.disabled = false; });
    });

    el.adminForm.addEventListener('submit', function (event) {
      event.preventDefault();
      var admin = el.adminForm.elements;
      var loginButton = $('#fbAdminLogin');
      loginButton.disabled = true;
      setAdminStatus('Memeriksa login...');
      request('/auth/v1/token?grant_type=password', 'POST', {
        email: admin.email.value.trim(),
        password: admin.password.value
      }).then(function (session) {
        if (!session || !session.access_token) throw new Error('Login tidak berhasil.');
        return request('/rest/v1/feedback_admins?select=user_id&limit=1', 'GET', null, session.access_token).then(function (admins) {
          if (!Array.isArray(admins) || !admins.length) throw new Error('Akun ini belum diberi akses admin.');
          adminToken = session.access_token;
          admin.password.value = '';
          el.adminForm.hidden = true;
          el.adminLogout.hidden = false;
          setAdminStatus('Login admin aktif.');
          render();
        });
      }).catch(function (error) {
        admin.password.value = '';
        setAdminStatus('Login gagal: ' + error.message, 'bad');
      }).then(function () { loginButton.disabled = false; });
    });

    el.adminLogout.addEventListener('click', function () {
      adminToken = '';
      el.adminForm.hidden = false;
      el.adminLogout.hidden = true;
      setAdminStatus('Kamu sudah keluar dari mode admin.');
      render();
    });

    el.list.addEventListener('click', function (event) {
      var button = event.target.closest('button[data-delete-id]');
      if (!button || !adminToken || !window.confirm('Hapus komentar ini secara permanen?')) return;
      button.disabled = true;
      request('/rest/v1/feedback?id=eq.' + encodeURIComponent(button.getAttribute('data-delete-id')) + '&select=id',
        'DELETE', null, adminToken, { Prefer: 'return=representation' }).then(function (deleted) {
        if (!Array.isArray(deleted) || !deleted.length) throw new Error('Komentar tidak terhapus.');
        items = items.filter(function (item) { return item.id !== button.getAttribute('data-delete-id'); });
        render();
        hint('Komentar berhasil dihapus.', 'ok');
        return refresh();
      }).catch(function (error) {
        button.disabled = false;
        hint('Gagal menghapus komentar: ' + error.message, 'bad');
      });
    });

    if (!configured) {
      btn.disabled = true;
      $('#fbAdminLogin').disabled = true;
      setStatus('bad', 'Belum dikonfigurasi');
      el.note.textContent = 'Atur URL proyek dan publishable key Supabase di js/data.js untuk mengaktifkan komentar bersama.';
      return;
    }

    refresh();
    refreshTimer = window.setInterval(refresh, 30000);
  }

  function destroy() {
    if (refreshTimer) window.clearInterval(refreshTimer);
    refreshTimer = null;
  }

  return { init: init, destroy: destroy };
})();
