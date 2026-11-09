/* sonder. — red social: inicio, explorar, publicaciones, notificaciones, configuración */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const H = SU.H;
  const esc = SU.esc;
  const social = SU.social = {};

  /* ---------- Publicaciones de cuentas visibles según el tiempo ---------- */
  social.acctPostAt = (a, p) => {
    const s = S();
    if (!p.d) return s.created - (p.ago || 10) * 60000;
    const fa = s.followedAt[a.id];
    return fa ? fa + p.d * H : Infinity;
  };
  social.visibleAcctPosts = (a, onlyFollowed) => {
    const s = S();
    const now = Date.now();
    const following = s.follows.includes(a.id);
    if (onlyFollowed && !following) return [];
    return (a.posts || []).map((p, i) => ({ a, p, i, key: a.id + ':' + i, at: social.acctPostAt(a, p) }))
      .filter((x) => x.at <= now && (following || !x.p.d));
  };
  social.findAcctPost = (key) => {
    const [id, i] = key.split(':');
    const a = SU.acc(id);
    if (!a || !a.posts[+i]) return null;
    const p = a.posts[+i];
    return { a, p, i: +i, key, at: social.acctPostAt(a, p) };
  };
  const baseLikes = (key) => (SU.hash(key) % 6) + 2;

  social.feedItems = () => {
    const s = S();
    const items = s.posts.map((p) => ({ kind: 'me', p, at: p.at }));
    s.follows.forEach((id) => {
      const a = SU.acc(id);
      if (a && a.posts) social.visibleAcctPosts(a, true).forEach((x) => items.push(Object.assign({ kind: 'acct' }, x)));
    });
    return items.sort((x, y) => y.at - x.at);
  };

  /* ---------- Tarjeta de publicación ---------- */
  social.postCard = (it) => {
    if (it.kind === 'me') {
      const p = it.p;
      const ratio = SU.clamp(p.ratio || 1, 0.75, 1.9);
      return `<article class="post" data-act="openPost" data-kind="me" data-id="${p.id}">
        <header class="post-head">${SU.meAvatar(38)}
          <div class="grow"><div class="post-name">${esc(SU.nameOf('me'))}</div>
          <div class="post-meta">@${esc(SU.userOf('me'))} · ${SU.timeAgo(p.at)}</div></div></header>
        ${p.text ? `<div class="post-text">${SU.text(p.text)}</div>` : ''}
        ${p.photo ? `<div class="photo-wrap" style="aspect-ratio:${ratio}"><img data-photo="${esc(p.photo)}" alt="Tu fotografía"></div>` : ''}
        <footer class="post-actions">
          <span class="pa ${p.likes.length ? 'on' : ''}">${SU.icon('heart', p.likes.length ? 'fill' : '')}<span>${p.likes.length}</span></span>
          <span class="pa">${SU.icon('chat')}<span>${p.comments.length}</span></span>
          ${p.likes.length ? `<span class="pa-likers">${p.likes.slice(0, 3).map((id) => SU.avatar(id, 20)).join('')}</span>` : ''}
        </footer></article>`;
    }
    const { a, p, key, at } = it;
    const liked = !!S().likes[key];
    const nCom = (p.c || []).length + (S().acctComments[key] || []).length;
    return `<article class="post" data-act="openPost" data-kind="acct" data-id="${key}">
      <header class="post-head"><span data-act="openAccount" data-id="${a.id}">${SU.avatar(a, 38)}</span>
        <div class="grow"><div class="post-name">${esc(a.name)}</div>
        <div class="post-meta">@${esc(a.user)} · ${SU.timeAgo(at)}</div></div></header>
      <div class="post-text">${SU.text(p.t)}</div>
      <footer class="post-actions">
        <button class="pa ${liked ? 'on' : ''}" data-act="likeAcct" data-key="${key}" aria-label="Me gusta">${SU.icon('heart', liked ? 'fill' : '')}<span>${baseLikes(key) + (liked ? 1 : 0)}</span></button>
        <span class="pa">${SU.icon('chat')}<span>${nCom}</span></span>
      </footer></article>`;
  };

  /* ================= INICIO ================= */
  SU.tabs.views.home = {
    render(el) {
      el.innerHTML = `<header class="bar">
          <div class="logo">sonder<span class="dot">.</span></div><div class="grow"></div>
          <button class="icon-btn" data-act="openNotifs" aria-label="Notificaciones">${SU.icon('bell')}<span class="badge" data-bell></span></button>
        </header>
        <button class="compose-cta" data-act="compose">${SU.meAvatar(36)}<span>¿Qué quieres compartir hoy?</span>${SU.icon('image', 'sm')}</button>
        <div id="feed"></div>`;
      this.update(el, 'all', true);
    },
    update(el, topic, force) {
      const feed = el.querySelector('#feed');
      const items = social.feedItems();
      const s = S();
      const sig = items.map((x) => x.kind === 'me' ? x.p.id + x.p.likes.length + '-' + x.p.comments.length : x.key + (s.likes[x.key] ? 1 : 0) + (s.acctComments[x.key] || []).length).join('|') + s.profile.avatar + s.profile.name;
      if (!force && feed._sig === sig && topic !== 'profile' && topic !== 'time') return;
      feed._sig = sig;
      const cta = el.querySelector('.compose-cta');
      if (cta) cta.querySelector('.av').outerHTML = SU.meAvatar(36);
      SU.renderKeep(feed, items.length ? items.map(social.postCard).join('') :
        `<div class="empty">${SU.icon('sparkle')}<p>Aún no hay publicaciones. Sigue algunas cuentas para ver lo que publican.</p>
         <button class="btn btn-soft btn-sm" data-act="tab" data-tab="explore">Ir a Explorar</button></div>`);
      SU.hydrate(cta);
    },
    onShow(el) { this.update(el, 'all'); }
  };

  /* ================= EXPLORAR ================= */
  const accountRow = (a) => {
    const f = S().follows.includes(a.id);
    return `<div class="acc-row" data-act="openAccount" data-id="${a.id}">
      ${SU.avatar(a, 46)}
      <div class="grow"><div class="acc-name">${esc(a.name)}</div><div class="acc-user">@${esc(a.user)}</div><div class="acc-bio ellipsis">${esc(a.bio)}</div></div>
      <button class="btn btn-sm ${f ? '' : 'btn-primary'}" data-act="toggleFollow" data-id="${a.id}">${f ? 'Siguiendo' : 'Seguir'}</button></div>`;
  };
  const exploreAccounts = (q) => {
    const s = S();
    const nq = SU.norm(q || '').trim();
    return SU.data.mainAccounts
      .filter((a) => !a.special || s.flags.carto)
      .filter((a) => !nq || SU.norm(a.name + ' ' + a.user + ' ' + a.bio).includes(nq));
  };
  SU.tabs.views.explore = {
    render(el) {
      el.innerHTML = `<header class="bar"><div class="bar-title" style="font-size:18px">Explorar</div></header>
        <div class="pad" style="padding-bottom:4px"><label class="search">${SU.icon('search', 'sm')}<input class="search-in" type="search" placeholder="Buscar cuentas" autocomplete="off" enterkeyhint="search"></label></div>
        <div class="section-title">Cuentas en sonder.</div>
        <div id="acc-list"></div>
        <div class="section-title">Más allá de esta red</div>
        <div class="pad" style="padding-top:0">
          <button class="portal" data-act="openUniverse">
            <span class="portal-sky">${Array.from({ length: 26 }, (_, i) => `<i style="left:${(SU.hash('s' + i) % 100)}%;top:${(SU.hash('t' + i) % 100)}%;animation-delay:${(i % 7) * 0.4}s"></i>`).join('')}
              ${SU.data.planets.map((p, i) => `<b style="left:${8 + i * 11.5}%;top:${30 + ((i * 37) % 45)}%;--a:${p.c1};--b:${p.c2};width:${10 + (p.r / 14)}px;height:${10 + (p.r / 14)}px"></b>`).join('')}</span>
            <span class="portal-text"><span class="portal-title">Hay un lugar con ocho mundos</span>
            <span class="portal-sub">Todos están visibles desde el principio. Ninguno te dice quién eres.</span>
            <span class="portal-go">Entrar ${SU.icon('planet', 'sm')}</span></span>
          </button>
        </div>`;
      el.querySelector('.search-in').addEventListener('input', (e) => this.list(el, e.target.value));
      this.list(el, '');
    },
    list(el, q) {
      const arr = exploreAccounts(q);
      SU.renderKeep(el.querySelector('#acc-list'), arr.length ? arr.map(accountRow).join('') : '<p class="empty" style="padding:24px">No encontramos cuentas con ese nombre.</p>');
    },
    update(el) { this.list(el, el.querySelector('.search-in').value); },
    onShow(el) { this.update(el); }
  };

  /* ================= PERFIL DE UNA CUENTA ================= */
  social.openAccount = (id) => {
    const a = SU.acc(id);
    if (!a) return;
    if (a.planet) { SU.forums.openAccount(id); return; }
    const body = () => {
      const s = S();
      const f = s.follows.includes(id);
      const posts = social.visibleAcctPosts(a, false).sort((x, y) => y.at - x.at);
      const followsYou = s.followers.includes(id);
      return `<div class="prof-head">
          ${SU.avatar(a, 88, 'av-ring')}
          <h2 class="prof-name">${esc(a.name)}</h2>
          <div class="prof-user">@${esc(a.user)} ${followsYou ? '<span class="tag">Te sigue</span>' : ''}</div>
          <p class="prof-bio">${SU.text(a.bio)}</p>
          <span class="tag tag-fict">${SU.icon('info', 'xs')} Cuenta ficticia · parte de la experiencia</span>
          <div class="prof-btns">
            <button class="btn ${f ? '' : 'btn-primary'}" data-act="toggleFollow" data-id="${id}">${f ? 'Siguiendo' : 'Seguir'}</button>
            ${a.dm ? `<button class="btn" data-act="openConvo" data-id="${id}">${SU.icon('chat', 'sm')} Mensaje</button>` : ''}
          </div></div>
        <div class="section-title">Publicaciones</div>
        ${posts.length ? posts.map((x) => social.postCard(Object.assign({ kind: 'acct' }, x))).join('') : '<p class="empty">Todavía no hay publicaciones.</p>'}
        ${!f && a.posts.some((p) => p.d) ? '<p class="hint" style="text-align:center;padding:0 20px 30px">Sigue esta cuenta para ver sus próximas publicaciones en tu inicio.</p>' : ''}`;
    };
    SU.nav.push({
      layer: 'social', cls: 'acct-screen',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">@${esc(a.user)}</div></header><div class="acct-body">${body()}</div>`;
      },
      update() { SU.renderKeep(this.el.querySelector('.acct-body'), body()); }
    });
  };

  /* ================= DETALLE DE PUBLICACIÓN ================= */
  social.openPost = (kind, id) => {
    let replyTo = null;
    const get = () => kind === 'me' ? S().posts.find((p) => p.id === id) : social.findAcctPost(id);
    if (!get()) return;
    const comments = () => {
      const x = get();
      if (!x) return [];
      if (kind === 'me') return x.comments;
      const seed = (x.p.c || []).map((c, i) => ({ id: 's' + i, by: c.by, t: c.t, at: x.at + (i + 1) * 23 * 60000 }));
      return seed.concat(S().acctComments[id] || []).filter((c) => c.at <= Date.now());
    };
    const cmtHTML = (c) => `<div class="cmt">${SU.avatar(c.by, 32)}
      <div class="grow"><div class="cmt-head"><b>${esc(SU.nameOf(c.by))}</b><span class="dim">${SU.timeAgo(c.at)}</span></div>
      <div class="cmt-text">${c.replyTo ? `<span class="mention">@${esc(SU.userOf(c.replyTo))}</span> ` : ''}${SU.text(c.t)}</div>
      ${c.by !== 'me' ? `<button class="cmt-reply" data-act="replyCmt" data-by="${c.by}">Responder</button>` : ''}</div></div>`;
    const bodyHTML = () => {
      const x = get();
      if (!x) return '<p class="empty">Esta publicación ya no existe.</p>';
      const card = kind === 'me' ? social.postCard({ kind: 'me', p: x, at: x.at }) : social.postCard(Object.assign({ kind: 'acct' }, x));
      const cs = comments();
      return card.replace('data-act="openPost"', '') + `<div class="cmts">${cs.length ? cs.map(cmtHTML).join('') : '<p class="dim" style="padding:8px 16px 20px;font-size:14px">Aún no hay comentarios.</p>'}</div>`;
    };
    SU.nav.push({
      layer: 'social', cls: 'post-screen',
      render(el, entry) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">Publicación</div>
          ${kind === 'me' ? `<button class="icon-btn" data-act="deletePost" data-id="${id}" aria-label="Eliminar">${SU.icon('trash', 'sm')}</button>` : ''}</header>
          <div class="post-detail">${bodyHTML()}</div>
          <form class="composer">
            <div class="reply-chip hidden"><span></span><button type="button" aria-label="Cancelar">${SU.icon('close', 'xs')}</button></div>
            <div class="composer-row">${SU.meAvatar(32)}<textarea class="composer-in autogrow" rows="1" placeholder="Escribe un comentario…" maxlength="500"></textarea>
            <button class="send-btn" type="submit" aria-label="Enviar">${SU.icon('send', 'sm')}</button></div></form>`;
        const form = el.querySelector('form');
        const ta = form.querySelector('textarea');
        const chip = form.querySelector('.reply-chip');
        entry.setReply = (by) => {
          replyTo = by;
          chip.classList.toggle('hidden', !by);
          chip.querySelector('span').textContent = by ? 'Respondiendo a @' + SU.userOf(by) : '';
          if (by) ta.focus();
        };
        chip.querySelector('button').addEventListener('click', () => entry.setReply(null));
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const t = ta.value.trim();
          if (!t) return;
          const c = { id: SU.uid('c'), by: 'me', t, at: Date.now(), replyTo: replyTo || undefined };
          if (kind === 'me') {
            const p = get();
            p.comments.push(c);
            SU.interact.onUserComment(p, c);
          } else {
            (S().acctComments[id] = S().acctComments[id] || []).push(c);
            const x = get();
            SU.interact.onUserCommentAcct(id, replyTo && SU.acc(replyTo) ? replyTo : x.a.id);
          }
          ta.value = ''; ta.style.height = '';
          entry.setReply(null);
          SU.store.save();
          SU.nav.refresh('post');
          const sc = el; setTimeout(() => { sc.scrollTop = sc.scrollHeight; }, 30);
        });
      },
      update() { SU.renderKeep(this.el.querySelector('.post-detail'), bodyHTML()); }
    });
  };
  SU.actions.replyCmt = (t) => { const top = SU.nav.top(); top && top.setReply && top.setReply(t.dataset.by); };
  SU.actions.deletePost = (t) => {
    SU.modal({
      title: '¿Eliminar publicación?', body: '<p>Se borrará de tu perfil y de tu inicio.</p>',
      actions: [{ label: 'Cancelar' }, { label: 'Eliminar', danger: true, fn: () => {
        const s = S();
        const p = s.posts.find((x) => x.id === t.dataset.id);
        if (p && p.photo) SU.photos.del(p.photo);
        s.posts = s.posts.filter((x) => x.id !== t.dataset.id);
        s.queue = s.queue.filter((i) => !(i.data && i.data.post === t.dataset.id));
        SU.store.save();
        SU.nav.back();
        SU.nav.refresh('post');
      } }]
    });
  };

  /* ================= CREAR PUBLICACIÓN ================= */
  social.openComposer = () => {
    if (SU.nav.stack.some((e) => e.cls === 'sheet compose-screen')) return;
    let photo = null;
    let published = false;
    SU.nav.push({
      layer: 'social', cls: 'sheet compose-screen',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
          <div class="bar-title">Nueva publicación</div>
          <button class="btn btn-primary btn-sm pub-btn" disabled>Publicar</button></header>
          <div class="pad"><div class="row" style="align-items:flex-start">${SU.meAvatar(40)}
          <textarea class="textarea compose-in" placeholder="¿Qué quieres compartir?" maxlength="1000" style="border:0;background:transparent;padding:8px 4px;min-height:130px"></textarea></div>
          <div class="compose-photo hidden"></div>
          <div class="compose-tools"><button class="btn btn-soft btn-sm add-photo">${SU.icon('image', 'sm')} Agregar foto</button>
          <span class="hint">Tus fotos se guardan solo en este navegador.</span></div></div>`;
        const ta = el.querySelector('.compose-in');
        const btn = el.querySelector('.pub-btn');
        const box = el.querySelector('.compose-photo');
        const valid = () => { btn.disabled = !(ta.value.trim() || photo); };
        ta.addEventListener('input', valid);
        const showPhoto = () => {
          box.classList.toggle('hidden', !photo);
          box.innerHTML = photo ? `<div class="photo-wrap" style="aspect-ratio:${SU.clamp(photo.ratio, 0.75, 1.9)}"><img data-photo="${photo.id}" alt=""></div>
            <button class="photo-x" aria-label="Quitar foto">${SU.icon('close', 'sm')}</button>` : '';
          SU.hydrate(box);
          const x = box.querySelector('.photo-x');
          x && x.addEventListener('click', () => { SU.photos.del(photo.id); photo = null; showPhoto(); valid(); });
          el.querySelector('.add-photo').innerHTML = `${SU.icon('image', 'sm')} ${photo ? 'Cambiar foto' : 'Agregar foto'}`;
        };
        el.querySelector('.add-photo').addEventListener('click', async () => {
          const r = await SU.pickPhoto();
          if (!r) return;
          if (photo) SU.photos.del(photo.id);
          photo = r; showPhoto(); valid();
        });
        btn.addEventListener('click', () => {
          const text = ta.value.trim();
          if (!text && !photo) return;
          const post = { id: SU.uid('p'), text, photo: photo ? photo.id : null, ratio: photo ? photo.ratio : null, at: Date.now(), likes: [], comments: [] };
          published = true;
          S().posts.unshift(post);
          SU.store.save();
          SU.interact.onUserPost(post);
          SU.nav.back();
          setTimeout(() => {
            if (SU.tabs.current !== 'home') SU.tabs.show('home');
            SU.nav.refresh('post');
            SU.tabs.roots.home.scrollTo({ top: 0 });
            SU.toast('Publicado ✨');
          }, 60);
        });
        setTimeout(() => ta.focus(), 350);
      },
      onClose() { if (!published && photo) SU.photos.del(photo.id); }
    });
  };

  /* ================= NOTIFICACIONES ================= */
  const notifIcon = { like: 'heart', comment: 'chat', follow: 'user', msg: 'send', hint: 'sparkle' };
  social.openNotifs = () => {
    const list = () => {
      const ns = S().notifs;
      if (!ns.length) return `<div class="empty">${SU.icon('bell')}<p>Aquí aparecerá la actividad de tus publicaciones y de las cuentas que sigues.</p></div>`;
      return ns.map((n, i) => `<button class="notif ${n.read ? '' : 'unread'}" data-act="notifGo" data-i="${i}">
        <span class="notif-av">${SU.avatar(n.by, 42)}<span class="notif-ic">${SU.icon(notifIcon[n.type] || 'sparkle', 'xs')}</span></span>
        <span class="grow notif-text"><b>${esc(SU.nameOf(n.by))}</b> ${esc(n.text)} <span class="dim">· ${SU.timeAgo(n.at)}</span></span></button>`).join('');
    };
    SU.nav.push({
      layer: 'social',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">Notificaciones</div></header>
          <p class="hint" style="padding:12px 18px 0">Actividad simulada de cuentas ficticias.</p><div class="notif-list">${list()}</div>`;
        setTimeout(() => { S().notifs.forEach((n) => { n.read = true; }); SU.store.save(); SU.tabs.badges(); }, 900);
      },
      update() { SU.renderKeep(this.el.querySelector('.notif-list'), list()); }
    });
  };
  SU.actions.notifGo = (t) => {
    const n = S().notifs[+t.dataset.i];
    if (!n) return;
    n.read = true;
    if (n.type === 'like' || n.type === 'comment') {
      if (n.refKind === 'acct') social.openPost('acct', n.ref);
      else if (S().posts.find((p) => p.id === n.ref)) social.openPost('me', n.ref);
    } else if (n.type === 'msg') SU.messages.openConvo(n.by);
    else social.openAccount(n.by);
  };

  /* ================= CONFIGURACIÓN ================= */
  social.openSettings = () => {
    const body = () => {
      const st = S().settings;
      return `<div class="set-group"><div class="section-title">Perfil</div>
        <button class="set-row" data-act="editProfile">${SU.icon('edit', 'sm')}<span class="grow">Editar perfil</span>${SU.icon('back', 'sm flip')}</button></div>
        <div class="set-group"><div class="section-title">Experiencia</div>
        <label class="set-row">${SU.icon('sparkle', 'sm')}<span class="grow">Efectos ambientales<span class="set-sub">Estrellas que titilan y fugaces en el universo</span></span>
          <input type="checkbox" class="switch" data-setting="ambient" ${st.ambient ? 'checked' : ''}></label>
        <label class="set-row">${SU.icon('target', 'sm')}<span class="grow">Reducir movimiento<span class="set-sub">Transiciones más simples</span></span>
          <input type="checkbox" class="switch" data-setting="reduceMotion" ${st.reduceMotion ? 'checked' : ''}></label></div>
        <div class="set-group"><div class="section-title">Tus datos</div>
        <ul class="facts" style="padding:0 18px">
          <li>${SU.icon('lock', 'sm')}<span>Todo lo que escribes y tus fotos se guardan solo en este navegador. Nada se envía a un servidor.</span></li>
          <li>${SU.icon('info', 'sm')}<span>Los datos no se sincronizan entre dispositivos.</span></li>
          <li>${SU.icon('user', 'sm')}<span>Tus publicaciones no son visibles para otras personas.</span></li>
          <li>${SU.icon('trash', 'sm')}<span>Si borras los datos del navegador, puede eliminarse el contenido guardado.</span></li>
          <li>${SU.icon('sparkle', 'sm')}<span>sonder. es una simulación: las cuentas, publicaciones y conversaciones son ficticias y forman parte de la experiencia.</span></li>
        </ul></div>
        <div class="set-group"><div class="section-title">Acerca de</div>
        <div class="about"><div class="logo" style="font-size:34px">sonder<span class="dot">.</span></div>
        <p>Una red pequeña, hecha a mano, para una sola persona.</p>
        <p class="dim">${S().origin.seen ? 'Ya sabes quién la hizo.' : '¿Quién la hizo? El mapa lo sabe.'}</p></div>
        ${S().origin.seen ? `<button class="set-row" data-act="openOrigin">${SU.icon('sparkle', 'sm')}<span class="grow">Volver a «El origen»</span>${SU.icon('back', 'sm flip')}</button>` : ''}</div>
        <div class="set-group" style="padding:10px 16px 40px"><button class="btn btn-danger btn-block" data-act="resetAll">Borrar todos mis datos</button></div>`;
    };
    SU.nav.push({
      layer: 'social',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">Configuración</div></header><div class="set-body">${body()}</div>`;
        el.addEventListener('change', (e) => {
          const k = e.target.dataset.setting;
          if (!k) return;
          S().settings[k] = e.target.checked;
          SU.store.save();
          SU.applySettings();
        });
      }
    });
  };
  SU.actions.resetAll = () => SU.modal({
    title: '¿Borrar todo?',
    body: '<p>Se eliminarán tu perfil, publicaciones, fotos, mensajes y tu progreso en el universo. No se puede deshacer.</p>',
    actions: [{ label: 'Cancelar' }, { label: 'Borrar todo', danger: true, fn: async () => { await SU.store.reset(); location.reload(); } }]
  });

  /* ---------- Acciones ---------- */
  SU.actions.compose = () => social.openComposer();
  SU.actions.openNotifs = () => social.openNotifs();
  SU.actions.openSettings = () => social.openSettings();
  SU.actions.openAccount = (t) => social.openAccount(t.dataset.id);
  SU.actions.openPost = (t) => social.openPost(t.dataset.kind, t.dataset.id);
  SU.actions.openUniverse = () => SU.universe.open();
  SU.actions.likeAcct = (t) => {
    const k = t.dataset.key;
    const s = S();
    if (s.likes[k]) delete s.likes[k]; else s.likes[k] = true;
    SU.store.save();
    const on = !!s.likes[k];
    t.classList.toggle('on', on);
    t.innerHTML = `${SU.icon('heart', on ? 'fill' : '')}<span>${baseLikes(k) + (on ? 1 : 0)}</span>`;
    if (on) { t.classList.add('pop'); setTimeout(() => t.classList.remove('pop'), 400); }
  };
  SU.actions.toggleFollow = (t) => {
    const id = t.dataset.id;
    if (S().follows.includes(id)) SU.interact.unfollow(id);
    else { SU.interact.follow(id); SU.toast('Ahora sigues a ' + esc(SU.nameOf(id))); }
    SU.nav.refresh('social');
  };
})(window.SU);
