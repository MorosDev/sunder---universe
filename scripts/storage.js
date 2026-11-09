/* sonder. — almacenamiento local (localStorage + IndexedDB para fotos) */
(function (SU) {
  'use strict';
  const KEY = 'sonder.universe.v1';

  const defaults = () => ({
    v: 1,
    created: Date.now(),
    onboarded: false,
    profile: { name: '', username: '', bio: '', avatar: null, extra: [null, null] },
    posts: [],            // publicaciones de la usuaria
    likes: {},            // likes de la usuaria a publicaciones de cuentas: postKey -> true
    acctComments: {},     // comentarios de la usuaria en publicaciones de cuentas: postKey -> [..]
    follows: [],          // cuentas que sigue
    followedAt: {},
    followers: [],        // cuentas que la siguen
    notifs: [],
    convos: {},           // accId -> { msgs: [], step, unread, started }
    queue: [],            // interacciones programadas
    used: {},             // control de respuestas repetidas
    flags: {},            // pistas, hitos
    forum: {
      visited: {},        // planetId -> { first, last, count }
      threads: [],        // discusiones creadas por la usuaria
      replies: {},        // threadId -> [respuestas añadidas]
      reacts: {},         // key -> true
      polls: {},          // threadId -> índice votado
      discoveries: {},    // planetId -> [ids]
      fragments: {},      // planetId -> ts
      opened: {},         // threadId -> true
      unread: {},         // threadId -> true
      welcomed: {}
    },
    universe: null,       // { x, y, z }
    settings: { ambient: true, reduceMotion: false },
    origin: { unlocked: false, seen: false }
  });

  function merge(base, saved) {
    if (!saved || typeof saved !== 'object') return base;
    Object.keys(saved).forEach((k) => {
      const v = saved[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && base[k] && typeof base[k] === 'object' && !Array.isArray(base[k])) {
        base[k] = merge(base[k], v);
      } else {
        base[k] = v;
      }
    });
    return base;
  }

  let timer = null;
  SU.store = {
    s: null,
    ok: true,
    load() {
      let saved = null;
      try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { this.ok = false; }
      this.s = merge(defaults(), saved);
      return this.s;
    },
    save() {
      clearTimeout(timer);
      timer = setTimeout(() => this.flush(), 200);
    },
    flush() {
      clearTimeout(timer);
      try { localStorage.setItem(KEY, JSON.stringify(this.s)); this.ok = true; }
      catch (e) { this.ok = false; console.warn('No se pudo guardar', e); }
    },
    async reset() {
      try { localStorage.removeItem(KEY); } catch (e) { /* nada */ }
      await SU.photos.clear();
      this.s = defaults();
    }
  };
  window.addEventListener('pagehide', () => SU.store.flush());
  document.addEventListener('visibilitychange', () => { if (document.hidden) SU.store.flush(); });

  /* ---------- Fotos en IndexedDB ---------- */
  SU.photos = {
    db: null,
    mem: {},
    urls: {},
    volatile: false,
    open() {
      return new Promise((res) => {
        try {
          const r = indexedDB.open('sonder-photos', 1);
          r.onupgradeneeded = () => r.result.createObjectStore('p');
          r.onsuccess = () => { this.db = r.result; res(true); };
          r.onerror = () => { this.volatile = true; res(false); };
          r.onblocked = () => res(false);
        } catch (e) { this.volatile = true; res(false); }
      });
    },
    async put(blob) {
      const id = SU.uid('ph');
      this.mem[id] = blob;
      if (!this.db) { this.volatile = true; return id; }
      await new Promise((res) => {
        try {
          const tx = this.db.transaction('p', 'readwrite');
          tx.objectStore('p').put(blob, id);
          tx.oncomplete = () => res();
          tx.onerror = () => { this.volatile = true; res(); };
        } catch (e) { this.volatile = true; res(); }
      });
      return id;
    },
    async get(id) {
      if (!id) return null;
      if (this.mem[id]) return this.mem[id];
      if (!this.db) return null;
      return new Promise((res) => {
        try {
          const r = this.db.transaction('p').objectStore('p').get(id);
          r.onsuccess = () => res(r.result || null);
          r.onerror = () => res(null);
        } catch (e) { res(null); }
      });
    },
    async url(id) {
      if (!id) return null;
      if (this.urls[id]) return this.urls[id];
      const b = await this.get(id);
      if (!b) return null;
      const u = URL.createObjectURL(b);
      this.urls[id] = u;
      return u;
    },
    del(id) {
      if (!id) return;
      delete this.mem[id];
      if (this.urls[id]) { URL.revokeObjectURL(this.urls[id]); delete this.urls[id]; }
      try { this.db && this.db.transaction('p', 'readwrite').objectStore('p').delete(id); } catch (e) { /* nada */ }
    },
    clear() {
      this.mem = {};
      Object.values(this.urls).forEach((u) => URL.revokeObjectURL(u));
      this.urls = {};
      return new Promise((res) => {
        try {
          if (!this.db) return res();
          const tx = this.db.transaction('p', 'readwrite');
          tx.objectStore('p').clear();
          tx.oncomplete = () => res();
          tx.onerror = () => res();
        } catch (e) { res(); }
      });
    },
    /* Reduce la foto en el propio teléfono antes de guardarla (nunca sale del navegador). */
    async fromFile(file, max) {
      max = max || 1600;
      const src = URL.createObjectURL(file);
      try {
        const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
        const w = img.naturalWidth, h = img.naturalHeight;
        const sc = Math.min(1, max / Math.max(w, h));
        const c = document.createElement('canvas');
        c.width = Math.max(1, Math.round(w * sc));
        c.height = Math.max(1, Math.round(h * sc));
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.86));
        return { blob: blob || file, ratio: w / h };
      } catch (e) {
        return { blob: file, ratio: 1 };
      } finally {
        URL.revokeObjectURL(src);
      }
    }
  };

  /* Selector de archivo reutilizable */
  SU.pickPhoto = () => new Promise((res) => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.style.display = 'none';
    document.body.appendChild(inp);
    inp.addEventListener('change', async () => {
      const f = inp.files && inp.files[0];
      inp.remove();
      if (!f) return res(null);
      const { blob, ratio } = await SU.photos.fromFile(f);
      const id = await SU.photos.put(blob);
      if (SU.photos.volatile && !SU.flagVolatileShown) {
        SU.flagVolatileShown = true;
        SU.toast('Este navegador no permite guardar fotos de forma permanente. Se verán hasta que cierres la página.');
      }
      res({ id, ratio });
    });
    inp.click();
  });
})(window.SU);
