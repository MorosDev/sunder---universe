/* sonder. — navegación con pila (conserva posición, scroll y contexto) */
(function (SU) {
  'use strict';
  const $ = SU.$;

  const nav = SU.nav = {
    stack: [],
    ignore: 0,
    hist: true,

    init() {
      try { history.replaceState({ su: 0 }, ''); } catch (e) { this.hist = false; }
      window.addEventListener('popstate', () => {
        if (this.ignore > 0) { this.ignore--; return; }
        this._pop();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.stack.length && !document.querySelector('.modal.in')) this.back();
      });
    },

    /* entry: { layer: 'social' | 'universe' | 'universe-root', render(el, entry), cls, update(topic), onClose(), anim } */
    push(entry) {
      if (entry.render) {
        const el = document.createElement('section');
        el.className = 'screen pushed ' + (entry.cls || '');
        const host = entry.layer === 'universe' ? $('#u-stack') : $('#s-stack');
        host.appendChild(el);
        entry.el = el;
        entry.render(el, entry);
        SU.hydrate(el);
        // doble rAF: garantiza que la transición se aplique
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('in')));
      }
      this.stack.push(entry);
      if (this.hist) {
        try { history.pushState({ su: this.stack.length }, ''); } catch (e) { this.hist = false; }
      }
      SU.emit('nav');
      return entry;
    },

    back() {
      if (!this.stack.length) return;
      if (this.hist) {
        try { history.back(); return; } catch (e) { this.hist = false; }
      }
      this._pop();
    },

    _pop() {
      const e = this.stack.pop();
      if (!e) return;
      this._close(e, false);
      SU.emit('nav');
    },

    _close(e, instant) {
      if (e.el) {
        const el = e.el;
        el.classList.remove('in');
        el.classList.add('out');
        setTimeout(() => el.remove(), instant ? 0 : 320);
      }
      if (e.onClose) { try { e.onClose(); } catch (err) { console.error(err); } }
    },

    /* deja solo n entradas en la pila */
    popTo(n) {
      const k = this.stack.length - n;
      if (k <= 0) return;
      const removed = this.stack.splice(n);
      removed.reverse().forEach((e) => this._close(e, true));
      if (this.hist) {
        this.ignore++;
        try { history.go(-k); } catch (e) { this.ignore--; }
      }
      SU.emit('nav');
    },

    top() { return this.stack[this.stack.length - 1]; },

    /* refresca pantallas abiertas cuando cambian datos */
    refresh(topic) {
      this.stack.forEach((e) => { if (e.update) { try { e.update(topic); } catch (err) { console.error(err); } } });
      SU.tabs && SU.tabs.refresh(topic);
    },

    /* ¿una pantalla tapa el universo? */
    universeCovered() {
      const t = this.top();
      return !!(t && t.layer === 'universe' && t.el);
    }
  };

  /* Re-render que conserva el scroll del contenedor */
  SU.renderKeep = (el, html) => {
    if (!el) return;
    const sc = el.closest('.screen') || el;
    const top = sc.scrollTop;
    el.innerHTML = html;
    sc.scrollTop = top;
    SU.hydrate(el);
  };

  /* ----- Pestañas de la red social ----- */
  const TABS = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'explore', label: 'Explorar', icon: 'compass' },
    { id: 'create', label: 'Crear', icon: 'plusSq' },
    { id: 'messages', label: 'Mensajes', icon: 'chat' },
    { id: 'profile', label: 'Perfil', icon: 'user' }
  ];

  SU.tabs = {
    current: null,
    roots: {},
    views: {},   // id -> { render(el), update(el, topic) }
    init() {
      const navEl = $('#bottomnav');
      navEl.innerHTML = TABS.map((t) =>
        `<button class="nav-btn" data-act="tab" data-tab="${t.id}" aria-label="${t.label}">
          ${SU.icon(t.icon)}<span class="nav-dot" data-dot="${t.id}"></span><span class="nav-lbl">${t.label}</span></button>`).join('');
      const host = $('#tabs');
      TABS.forEach((t) => {
        if (t.id === 'create') return;
        const el = document.createElement('section');
        el.className = 'screen tab-root';
        el.dataset.tab = t.id;
        host.appendChild(el);
        this.roots[t.id] = el;
      });
    },
    show(id) {
      if (id === 'create') { SU.social.openComposer(); return; }
      // cerrar pantallas apiladas de la red social
      if (nav.stack.length) nav.popTo(0);
      if (this.current === id) {
        this.roots[id].scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      this.current = id;
      Object.entries(this.roots).forEach(([k, el]) => el.classList.toggle('active', k === id));
      SU.$$('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === id));
      const el = this.roots[id];
      if (!el.dataset.rendered) {
        el.dataset.rendered = '1';
        this.views[id] && this.views[id].render(el);
        SU.hydrate(el);
      } else if (this.views[id] && this.views[id].onShow) {
        this.views[id].onShow(el);
      }
      SU.emit('tab', id);
    },
    refresh(topic) {
      Object.entries(this.roots).forEach(([id, el]) => {
        if (el.dataset.rendered && this.views[id] && this.views[id].update) {
          try { this.views[id].update(el, topic); } catch (e) { console.error(e); }
        }
      });
      this.badges();
    },
    badges() {
      const s = SU.store.s;
      const unreadMsgs = Object.values(s.convos).reduce((n, c) => n + (c.unread || 0), 0);
      const dot = $('[data-dot="messages"]');
      if (dot) { dot.textContent = unreadMsgs ? (unreadMsgs > 9 ? '9+' : unreadMsgs) : ''; dot.classList.toggle('on', unreadMsgs > 0); }
      const unreadN = s.notifs.filter((n) => !n.read).length;
      SU.$$('[data-bell]').forEach((b) => { b.textContent = unreadN ? (unreadN > 9 ? '9+' : unreadN) : ''; b.classList.toggle('on', unreadN > 0); });
    }
  };

  SU.actions.tab = (t) => SU.tabs.show(t.dataset.tab);
  SU.actions.back = () => nav.back();
})(window.SU);
