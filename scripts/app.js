/* sonder. — arranque, pantalla inicial y entrada simulada */
(function (SU) {
  'use strict';
  const $ = SU.$;
  const S = () => SU.store.s;
  const esc = SU.esc;

  /* ----- Instalar como app (PWA) ----- */
  SU.install = { prompt: null };
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    SU.install.prompt = e;
    SU.emit('installable');
  });
  SU.on('installable', () => {
    const s = SU.store.s;
    if (!s || !s.onboarded || s.flags.installTip) return;
    s.flags.installTip = Date.now(); SU.store.save();
    setTimeout(() => SU.toast('Tip: puedes agregar sonder. a tu pantalla de inicio desde Configuración.', SU.icon('plusSq', 'sm')), 4000);
  });
  window.addEventListener('appinstalled', () => { SU.install.prompt = null; SU.toast('sonder. ya está en tu pantalla de inicio ✨'); });
  SU.isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  SU.actions.installApp = async () => {
    const p = SU.install.prompt;
    if (p) {
      p.prompt();
      try { await p.userChoice; } catch (e) { /* nada */ }
      SU.install.prompt = null;
      return;
    }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    SU.modal({
      title: 'Agregar a tu pantalla',
      body: ios
        ? '<p>En Safari toca el botón <b>Compartir</b> (el cuadrito con la flecha) y luego <b>Agregar a pantalla de inicio</b>.</p>'
        : '<p>En Chrome toca el menú <b>⋮</b> (arriba a la derecha) y luego <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.</p>'
    });
  };
  function registerSW() {
    if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
    try { navigator.serviceWorker.register('sw.js').catch(() => {}); } catch (e) { /* visor sin service workers */ }
  }

  SU.applySettings = () => {
    document.body.classList.toggle('reduce-motion', !!S().settings.reduceMotion);
  };

  const starsHTML = (n) => Array.from({ length: n }, (_, i) =>
    `<span class="star-dot" style="left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-delay:${(Math.random() * 3).toFixed(2)}s;opacity:${(0.3 + Math.random() * 0.7).toFixed(2)}"></span>`).join('');

  function splash() {
    return new Promise((res) => {
      const el = document.createElement('div');
      el.className = 'splash';
      el.innerHTML = `<div class="splash-stars">${starsHTML(60)}</div>
        <div class="splash-logo"><div class="logo">sonder<span class="dot">.</span></div><div class="splash-tag">cada persona es un universo</div></div>`;
      $('#overlay').appendChild(el);
      setTimeout(() => { el.classList.add('out'); setTimeout(() => { el.remove(); }, 650); res(); }, S().onboarded ? 1300 : 2100);
    });
  }

  /* Entrada simulada: sin contraseñas ni credenciales reales */
  function onboarding() {
    return new Promise((done) => {
      const el = document.createElement('div');
      el.className = 'onb';
      $('#overlay').appendChild(el);
      const step = (html, bind) => {
        el.innerHTML = `<div class="onb-inner">${html}</div>`;
        bind && bind(el);
        el.scrollTop = 0;
      };
      const s1 = () => step(`
        <div class="logo" style="font-size:44px;margin-bottom:30px">sonder<span class="dot">.</span></div>
        <h1>Hola.<br>Bienvenida.</h1>
        <p class="lead">Una red social pequeña donde puedes publicar, compartir fotos y conocer algunas cuentas. Y quizá, si exploras, descubrir que hay algo más.</p>
        <button class="btn btn-primary btn-block" data-go>Crear mi espacio</button>`,
        (e) => e.querySelector('[data-go]').addEventListener('click', s2));
      let photo = null;
      const s2 = () => step(`
        <div class="step">Paso 1 de 2</div>
        <h1>¿Cómo quieres aparecer?</h1>
        <p class="lead">Puedes cambiarlo cuando quieras desde tu perfil.</p>
        <div class="onb-photo"><button class="slot-btn onb-ph" aria-label="Elegir foto de perfil">${SU.icon('camera')}</button><span class="hint">Foto de perfil (opcional)</span></div>
        <label class="field"><span class="field-label">Nombre visible</span><input class="input o-name" maxlength="40" placeholder="Tu nombre" autocomplete="off"></label>
        <label class="field"><span class="field-label">Nombre de usuario</span><span class="input-prefix"><span>@</span><input class="input o-user" maxlength="24" placeholder="tu_usuario" autocapitalize="off" autocomplete="off" spellcheck="false"></span>
          <span class="hint">No se te pedirá ninguna contraseña. Esto no es una cuenta real.</span></label>
        <button class="btn btn-primary btn-block o-next" disabled>Continuar</button>`,
        (e) => {
          const n = e.querySelector('.o-name'), u = e.querySelector('.o-user'), b = e.querySelector('.o-next');
          let touchedUser = false;
          const slug = (v) => SU.norm(v).replace(/\s+/g, '_').replace(/[^a-z0-9._]/g, '').slice(0, 24);
          const valid = () => { b.disabled = !(n.value.trim() && u.value.trim()); };
          n.addEventListener('input', () => { if (!touchedUser) u.value = slug(n.value); valid(); });
          u.addEventListener('input', () => { touchedUser = true; const v = u.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._]/g, ''); if (v !== u.value) u.value = v; valid(); });
          e.querySelector('.onb-ph').addEventListener('click', async (ev) => {
            const r = await SU.pickPhoto();
            if (!r) return;
            if (photo) SU.photos.del(photo);
            photo = r.id;
            ev.currentTarget.innerHTML = `<span class="photo-wrap"><img data-photo="${photo}" alt=""></span>`;
            SU.hydrate(e);
          });
          b.addEventListener('click', () => {
            S().profile.name = n.value.trim();
            S().profile.username = u.value.trim();
            if (photo) S().profile.avatar = photo;
            SU.store.save();
            s3();
          });
          setTimeout(() => n.focus(), 300);
        });
      const s3 = () => step(`
        <div class="step">Paso 2 de 2</div>
        <h1>Antes de entrar</h1>
        <p class="lead">Unas cosas importantes, ${esc(S().profile.name)}:</p>
        <ul class="facts">
          <li>${SU.icon('sparkle', 'sm')}<span>sonder. es una <b>simulación</b>, no una red social real. Las cuentas, sus publicaciones y las conversaciones son ficticias y forman parte de la experiencia.</span></li>
          <li>${SU.icon('lock', 'sm')}<span>Lo que escribes y tus fotos se guardan <b>solo en este navegador</b>. Nada se envía a ningún servidor.</span></li>
          <li>${SU.icon('user', 'sm')}<span>Tus publicaciones <b>no son visibles</b> para otras personas.</span></li>
          <li>${SU.icon('info', 'sm')}<span>Los datos no se sincronizan entre dispositivos, y borrar los datos del navegador puede eliminar lo que guardaste.</span></li>
        </ul>
        <button class="btn btn-primary btn-block o-enter">Entendido, entrar</button>`,
        (e) => e.querySelector('.o-enter').addEventListener('click', () => {
          S().onboarded = Date.now();
          S().created = Date.now();
          SU.store.flush();
          el.classList.add('out');
          setTimeout(() => el.remove(), 450);
          done(true);
        }));
      s1();
    });
  }

  /* Panel de pruebas para el creador: añade ?dev o #dev a la dirección */
  function devPanel() {
    const b = document.createElement('button');
    b.className = 'dev-btn';
    b.textContent = 'dev';
    document.body.appendChild(b);
    b.addEventListener('click', () => {
      SU.modal({
        title: 'Modo de prueba',
        body: '<p>Herramientas para probar la experiencia. No aparecen sin <code>?dev</code> o <code>#dev</code>.</p>',
        actions: [
          { label: 'Adelantar 24 h', fn: () => { const s = S(); s.created -= 24 * SU.H; Object.keys(s.followedAt).forEach((k) => { s.followedAt[k] -= 24 * SU.H; }); s.queue.forEach((q) => { q.at -= 24 * SU.H; }); SU.store.flush(); location.reload(); } },
          { label: 'Encender 8 líneas', fn: () => { SU.data.planets.forEach((p) => { S().forum.fragments[p.id] = S().forum.fragments[p.id] || Date.now(); }); S().origin.unlocked = true; SU.store.flush(); SU.universe.updateFrag(); SU.toast('Listo: el centro ya brilla.'); } },
          { label: 'Ver El origen', fn: () => SU.actions.openOrigin() },
          { label: 'Borrar todo', danger: true, fn: () => SU.actions.resetAll() },
          { label: 'Cerrar', primary: true }
        ]
      });
    });
  }

  async function boot() {
    SU.store.load();
    await SU.photos.open();
    SU.nav.init();
    SU.tabs.init();
    SU.universe.init();
    SU.applySettings();

    const sp = splash();
    if (!S().onboarded) { await sp; await onboarding(); } else { await sp; }
    SU.tabs.show('home');
    SU.tabs.badges();
    if (!S().flags.firstTip) {
      S().flags.firstTip = Date.now(); SU.store.save();
      setTimeout(() => SU.toast('Empieza siguiendo algunas cuentas desde Explorar.', SU.icon('compass', 'sm')), 900);
    }

    SU.sched.tick();
    setInterval(() => SU.sched.tick(), 2500);
    // refresca etiquetas de tiempo y publicaciones programadas
    let minute = Math.floor(Date.now() / 60000);
    setInterval(() => {
      const m = Math.floor(Date.now() / 60000);
      if (m !== minute) { minute = m; SU.tabs.refresh('time'); }
    }, 5000);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) { SU.sched.tick(); SU.tabs.refresh('time'); } });

    registerSW();
    if (/[?&]dev\b/.test(location.search) || location.hash === '#dev') devPanel();
    if (!SU.store.ok) SU.toast('Este navegador no permite guardar datos. Lo que hagas se perderá al cerrar.');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window.SU);
