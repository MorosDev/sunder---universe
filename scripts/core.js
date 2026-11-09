/* sonder. — utilidades compartidas */
window.SU = window.SU || {};
(function (SU) {
  'use strict';

  SU.data = SU.data || {};
  SU.$ = (sel, root) => (root || document).querySelector(sel);
  SU.$$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  SU.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);
  SU.text = (s) => SU.esc(s).replace(/\n/g, '<br>');
  SU.uid = (p) => (p || '') + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  SU.now = () => Date.now();
  SU.H = 3600 * 1000;
  SU.rand = (a, b) => a + Math.random() * (b - a);
  SU.randInt = (a, b) => Math.floor(SU.rand(a, b + 1));
  SU.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  SU.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  SU.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  SU.norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  SU.hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

  SU.timeAgo = (ts) => {
    const d = (Date.now() - ts) / 1000;
    if (d < 45) return 'ahora';
    if (d < 3600) return `hace ${Math.max(1, Math.round(d / 60))} min`;
    if (d < 86400) return `hace ${Math.round(d / 3600)} h`;
    const days = Math.round(d / 86400);
    if (days === 1) return 'ayer';
    if (days < 7) return `hace ${days} días`;
    try { return new Date(ts).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }); } catch (e) { return `hace ${days} días`; }
  };

  /* --- Bus de eventos --- */
  const subs = {};
  SU.on = (ev, fn) => { (subs[ev] = subs[ev] || []).push(fn); };
  SU.emit = (ev, d) => { (subs[ev] || []).forEach((f) => { try { f(d); } catch (e) { console.error(e); } }); };

  /* --- Acciones delegadas: data-act="nombre" --- */
  SU.actions = {};
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    const fn = SU.actions[t.dataset.act];
    if (fn) { e.preventDefault(); fn(t, e); }
  });

  /* --- Iconos --- */
  const IC = {
    home: '<path d="M3.5 10.5 12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6H9v6H4.5a1 1 0 0 1-1-1z"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    plusSq: '<rect x="3.5" y="3.5" width="17" height="17" rx="5.5"/><path d="M12 8.5v7M8.5 12h7"/>',
    chat: '<path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12z"/>',
    bell: '<path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    gear: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    heart: '<path d="M12 20.3 4.3 12.8a4.8 4.8 0 0 1 6.8-6.8l.9.9.9-.9a4.8 4.8 0 0 1 6.8 6.8z"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-4.5-4.5-8.5 8"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    sparkle: '<path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    reply: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v4"/>',
    planet: '<circle cx="12" cy="12" r="5.5"/><path d="M5.2 14.8C2.6 17 2.5 18.6 4.6 19c2.6.5 7.4-1.6 11-4.4 3.6-2.8 5.2-5.6 3.6-6.5-.6-.4-1.6-.4-2.9 0"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.6v.1"/>',
    trash: '<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    camera: '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    target: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="2.5"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6M12 16.6v.1"/>',
    lock: '<rect x="5" y="11" width="14" height="9.5" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    leave: '<path d="M14 4.5h4.5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H14"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    dots: '<circle cx="5.5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="18.5" cy="12" r="1.2"/>'
  };
  SU.icon = (n, cls) => `<svg class="ic ${cls || ''}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ''}</svg>`;

  /* --- Cuentas --- */
  SU.acc = (id) => (SU.data.accountMap && SU.data.accountMap[id]) || null;

  SU.avatar = (who, size, extraCls) => {
    size = size || 40;
    if (who === 'me') return SU.meAvatar(size, extraCls);
    const a = typeof who === 'string' ? SU.acc(who) : who;
    if (!a) return `<span class="av" style="width:${size}px;height:${size}px"></span>`;
    const [c1, c2] = a.colors;
    const isInitial = a.main && !a.glyphOnly;
    const g = isInitial ? SU.esc(a.name.charAt(0)) : SU.esc(a.glyph);
    return `<span class="av ${isInitial ? 'av-ini' : ''} ${extraCls || ''}" style="width:${size}px;height:${size}px;--c1:${c1};--c2:${c2};font-size:${Math.round(size * (isInitial ? 0.46 : 0.44))}px">${g}</span>`;
  };

  SU.meAvatar = (size, extraCls) => {
    const p = SU.store && SU.store.s ? SU.store.s.profile : {};
    if (p.avatar) {
      return `<span class="av av-me ${extraCls || ''}" style="width:${size}px;height:${size}px"><img alt="" data-photo="${SU.esc(p.avatar)}"></span>`;
    }
    const ini = SU.esc((p.name || '·').trim().charAt(0).toUpperCase() || '·');
    return `<span class="av av-ini av-me ${extraCls || ''}" style="width:${size}px;height:${size}px;--c1:#b9a6ff;--c2:#7c5f9e;font-size:${Math.round(size * 0.46)}px">${ini}</span>`;
  };

  SU.nameOf = (who) => {
    if (who === 'me') return SU.store.s.profile.name || 'Tú';
    const a = SU.acc(who); return a ? a.name : '';
  };
  SU.userOf = (who) => {
    if (who === 'me') return SU.store.s.profile.username || 'tu_usuario';
    const a = SU.acc(who); return a ? a.user : '';
  };

  /* --- Fotos: rellena <img data-photo> --- */
  SU.hydrate = (root) => {
    if (!root || !SU.photos) return;
    SU.$$('img[data-photo]', root).forEach((img) => {
      if (img.dataset.ok) return;
      img.dataset.ok = '1';
      SU.photos.url(img.dataset.photo).then((u) => {
        if (u) { img.src = u; } else { img.closest('.photo-wrap, .av')?.classList.add('photo-missing'); }
      });
    });
    if (SU.universe && SU.universe.hydrateThumbs) SU.universe.hydrateThumbs(root);
  };

  /* --- Toast --- */
  SU.toast = (msg, icon) => {
    const box = SU.$('#toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `${icon ? `<span class="toast-ic">${icon}</span>` : ''}<span>${msg}</span>`;
    box.appendChild(t);
    while (box.children.length > 2) box.firstElementChild.remove();
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => { t.classList.remove('in'); setTimeout(() => t.remove(), 400); }, 3400);
  };

  /* --- Modal propio (alert/confirm están bloqueados en algunos visores) --- */
  SU.modal = ({ title, body, actions }) => {
    const root = SU.$('#modal-root');
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="modal-back"></div><div class="modal-card" role="dialog" aria-modal="true">
      ${title ? `<h3 class="modal-title">${title}</h3>` : ''}
      <div class="modal-body">${body || ''}</div>
      <div class="modal-actions">${(actions || [{ label: 'Entendido', primary: true }]).map((a, i) =>
        `<button class="btn ${a.primary ? 'btn-primary' : ''} ${a.danger ? 'btn-danger' : ''}" data-i="${i}">${a.label}</button>`).join('')}</div></div>`;
    root.appendChild(m);
    requestAnimationFrame(() => m.classList.add('in'));
    const close = () => { m.classList.remove('in'); setTimeout(() => m.remove(), 250); };
    m.querySelector('.modal-back').addEventListener('click', close);
    m.querySelectorAll('.modal-actions button').forEach((b) => b.addEventListener('click', () => {
      const a = (actions || [])[+b.dataset.i];
      close();
      if (a && a.fn) a.fn();
    }));
    return close;
  };

  /* --- Auto-crecimiento de textareas --- */
  document.addEventListener('input', (e) => {
    if (e.target.matches && e.target.matches('textarea.autogrow')) {
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
    }
  });

  SU.isTouch = () => window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
})(window.SU);
