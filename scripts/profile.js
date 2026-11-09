/* sonder. — perfil personal */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const esc = SU.esc;

  const photoSlot = (id, i, label) => id
    ? `<button class="gal-item photo-wrap" data-act="viewPhoto" data-id="${esc(id)}" aria-label="${label}"><img data-photo="${esc(id)}" alt=""></button>`
    : `<button class="gal-item gal-empty" data-act="editProfile" aria-label="Agregar foto">${SU.icon('plus')}<span>${label}</span></button>`;

  const profileHTML = () => {
    const s = S();
    const p = s.profile;
    const posts = s.posts;
    return `<div class="prof-head">
        ${SU.meAvatar(96, 'av-ring')}
        <h2 class="prof-name">${esc(p.name || 'Tu nombre')}</h2>
        <div class="prof-user">@${esc(p.username || 'tu_usuario')}</div>
        ${p.bio ? `<p class="prof-bio">${SU.text(p.bio)}</p>` : '<p class="prof-bio dim">Escribe algo sobre ti en tu biografía.</p>'}
        <div class="stats">
          <div><b>${posts.length}</b><span>publicaciones</span></div>
          <button data-act="peopleList" data-kind="followers"><b>${s.followers.length}</b><span>seguidores</span></button>
          <button data-act="peopleList" data-kind="follows"><b>${s.follows.length}</b><span>siguiendo</span></button>
        </div>
        <div class="prof-btns"><button class="btn" data-act="editProfile">${SU.icon('edit', 'sm')} Editar perfil</button></div>
      </div>
      <div class="section-title">Fotos</div>
      <div class="gallery">
        ${photoSlot(p.avatar, 0, 'Principal')}${photoSlot(p.extra[0], 1, 'Foto 2')}${photoSlot(p.extra[1], 2, 'Foto 3')}
      </div>
      <div class="section-title">Publicaciones</div>
      ${posts.length ? posts.map((x) => SU.social.postCard({ kind: 'me', p: x, at: x.at })).join('')
        : `<div class="empty" style="padding-top:20px"><p>Todavía no has publicado nada.</p><button class="btn btn-soft btn-sm" data-act="compose">Crear publicación</button></div>`}`;
  };

  SU.tabs.views.profile = {
    render(el) {
      el.innerHTML = `<header class="bar"><div class="bar-title" style="font-size:17px">@<span class="me-user"></span></div>
        <button class="icon-btn" data-act="openSettings" aria-label="Configuración">${SU.icon('gear')}</button></header>
        <div class="me-body"></div>`;
      this.update(el);
    },
    update(el) {
      el.querySelector('.me-user').textContent = S().profile.username || 'tu_usuario';
      SU.renderKeep(el.querySelector('.me-body'), profileHTML());
    },
    onShow(el) { this.update(el); }
  };

  /* Ver una foto en grande */
  SU.actions.viewPhoto = (t) => {
    SU.nav.push({
      layer: 'social', cls: 'photo-view',
      render(el) {
        el.innerHTML = `<button class="icon-btn photo-close" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
          <img data-photo="${esc(t.dataset.id)}" alt="">`;
        el.addEventListener('click', (e) => { if (e.target === el) SU.nav.back(); });
      }
    });
  };

  /* Seguidores / siguiendo */
  SU.actions.peopleList = (t) => {
    const kind = t.dataset.kind;
    const ids = () => (kind === 'followers' ? S().followers : S().follows);
    const html = () => ids().length ? ids().map((id) => {
      const a = SU.acc(id);
      return `<div class="acc-row" data-act="openAccount" data-id="${id}">${SU.avatar(a, 44)}
        <div class="grow"><div class="acc-name">${esc(a.name)}</div><div class="acc-user">@${esc(a.user)}</div></div></div>`;
    }).join('') : `<p class="empty">${kind === 'followers' ? 'Aún no te sigue nadie. Ya llegarán.' : 'Todavía no sigues a ninguna cuenta.'}</p>`;
    SU.nav.push({
      layer: 'social',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">${kind === 'followers' ? 'Seguidores' : 'Siguiendo'}</div></header><div class="pl">${html()}</div>`;
      },
      update() { SU.renderKeep(this.el.querySelector('.pl'), html()); }
    });
  };

  /* Editar perfil */
  SU.actions.editProfile = () => {
    const p = S().profile;
    const draft = { avatar: p.avatar, extra: p.extra.slice() };
    const created = [];
    let saved = false;
    SU.nav.push({
      layer: 'social', cls: 'sheet',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
          <div class="bar-title">Editar perfil</div><button class="btn btn-primary btn-sm save-btn">Guardar</button></header>
          <div class="pad">
            <div class="field-label">Tus tres fotografías</div>
            <div class="slots"></div>
            <p class="hint" style="margin-bottom:22px">La principal es tu foto de perfil. Se guardan solo en este navegador.</p>
            <label class="field"><span class="field-label">Nombre visible</span><input class="input f-name" maxlength="40" value="${esc(p.name)}"></label>
            <label class="field"><span class="field-label">Nombre de usuario</span><span class="input-prefix"><span>@</span><input class="input f-user" maxlength="24" value="${esc(p.username)}" autocapitalize="off" autocomplete="off" spellcheck="false"></span>
              <span class="hint">Letras, números, punto y guion bajo.</span></label>
            <label class="field"><span class="field-label">Biografía</span><textarea class="textarea f-bio" maxlength="160" placeholder="Algo sobre ti…">${esc(p.bio)}</textarea></label>
          </div>`;
        const slots = el.querySelector('.slots');
        const draw = () => {
          const one = (id, k, label) => `<div class="slot ${k === 'avatar' ? 'slot-main' : ''}">
            <button class="slot-btn" data-k="${k}">${id ? `<span class="photo-wrap"><img data-photo="${esc(id)}" alt=""></span>` : SU.icon('camera')}</button>
            <span class="slot-lbl">${label}</span>${id ? `<button class="slot-x" data-x="${k}" aria-label="Quitar">${SU.icon('close', 'xs')}</button>` : ''}</div>`;
          slots.innerHTML = one(draft.avatar, 'avatar', 'Principal') + one(draft.extra[0], 'e0', 'Foto 2') + one(draft.extra[1], 'e1', 'Foto 3');
          SU.hydrate(slots);
        };
        draw();
        slots.addEventListener('click', async (e) => {
          const x = e.target.closest('[data-x]');
          if (x) {
            const k = x.dataset.x;
            if (k === 'avatar') draft.avatar = null; else draft.extra[+k[1]] = null;
            draw(); return;
          }
          const b = e.target.closest('[data-k]');
          if (!b) return;
          const r = await SU.pickPhoto();
          if (!r) return;
          created.push(r.id);
          const k = b.dataset.k;
          if (k === 'avatar') draft.avatar = r.id; else draft.extra[+k[1]] = r.id;
          draw();
        });
        el.querySelector('.f-user').addEventListener('input', (e) => {
          const v = e.target.value.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9._ñ]/g, '');
          if (v !== e.target.value) e.target.value = v;
        });
        el.querySelector('.save-btn').addEventListener('click', () => {
          const name = el.querySelector('.f-name').value.trim();
          const user = el.querySelector('.f-user').value.trim();
          if (!name || !user) { SU.toast('Tu nombre y tu usuario no pueden quedar vacíos.'); return; }
          // borrar fotos que ya no se usan
          [p.avatar, ...p.extra].forEach((id) => { if (id && id !== draft.avatar && !draft.extra.includes(id)) SU.photos.del(id); });
          p.name = name; p.username = user; p.bio = el.querySelector('.f-bio').value.trim();
          p.avatar = draft.avatar; p.extra = draft.extra;
          saved = true;
          SU.store.save();
          SU.nav.back();
          setTimeout(() => { SU.nav.refresh('profile'); SU.toast('Perfil actualizado'); }, 50);
        });
      },
      onClose() {
        if (!saved) created.forEach((id) => { if (id !== p.avatar && !p.extra.includes(id)) SU.photos.del(id); });
      }
    });
  };
})(window.SU);
