/* sonder. — foros de los ocho planetas (separados de la red social) */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const F = () => SU.store.s.forum;
  const H = SU.H;
  const esc = SU.esc;
  const forums = SU.forums = { viewing: null };

  /* ---------- datos ---------- */
  const seededAt = (d) => d.ago ? S().created - d.ago * H : S().created + (d.after || 0) * H;

  forums.thread = (id) => {
    const d = SU.data.discussionMap[id];
    if (d) return Object.assign({ seeded: true, at: seededAt(d) }, d);
    const u = F().threads.find((x) => x.id === id);
    return u ? Object.assign({ seeded: false }, u) : null;
  };

  forums.threadsFor = (pid) => {
    const now = Date.now();
    const seeded = SU.data.discussions.filter((d) => d.planet === pid).map((d) => forums.thread(d.id)).filter((d) => d.at <= now);
    const mine = F().threads.filter((t) => t.planet === pid).map((t) => forums.thread(t.id));
    return seeded.concat(mine).map((t) => Object.assign(t, { last: lastActivity(t) })).sort((a, b) => b.last - a.last);
  };

  forums.repliesFor = (tid) => {
    const t = forums.thread(tid);
    if (!t) return [];
    const now = Date.now();
    const seeded = (t.seeded ? (SU.data.discussionMap[tid].replies || []) : [])
      .map((r, i) => ({ id: tid + '-r' + i, by: r.by, t: r.t, at: t.at + r.h * H, seeded: true }));
    return seeded.concat(F().replies[tid] || []).filter((r) => r.at <= now).sort((a, b) => a.at - b.at);
  };
  const lastActivity = (t) => {
    const rs = forums.repliesFor(t.id);
    return rs.length ? Math.max(t.at, rs[rs.length - 1].at) : t.at;
  };

  forums.planetUnread = (pid) => Object.keys(F().unread).some((tid) => {
    const t = forums.thread(tid);
    return t && t.planet === pid;
  });

  const reactCount = (key, base) => (base ? (SU.hash(key) % 5) + 1 : 0) + (F().reacts[key] ? 1 : 0);

  /* ---------- fragmentos y descubrimientos ---------- */
  forums.unlockFragment = (pid) => {
    const fr = F().fragments;
    if (fr[pid]) return;
    fr[pid] = Date.now();
    const n = Object.keys(fr).length;
    SU.store.save();
    SU.universe.updateFrag();
    setTimeout(() => {
      if (n >= 8) {
        S().origin.unlocked = true; SU.store.save();
        SU.toast('Algo cambió en el centro del universo.', SU.icon('sparkle', 'sm'));
      } else {
        SU.toast(`Se encendió una línea en el mapa · ${n}/8`, SU.icon('sparkle', 'sm'));
      }
    }, 700);
    SU.interact.milestone(n);
  };

  forums.discover = (pid, trigger, delay) => {
    const p = SU.planet(pid);
    const d = p.discoveries.find((x) => x.trigger === trigger);
    if (!d) return;
    const got = F().discoveries[pid] || [];
    if (got.some((x) => x.id === d.id)) return;
    if (SU.sched.pending((i) => i.type === 'discovery' && i.data.id === d.id).length) return;
    SU.sched.add('discovery', { pid, id: d.id }, delay == null ? 6000 : delay);
  };
  SU.sched.on('discovery', (d, item) => {
    const list = F().discoveries[d.pid] = F().discoveries[d.pid] || [];
    if (list.some((x) => x.id === d.id)) return;
    list.push({ id: d.id, at: item.at });
    if (SU.universe.active) SU.toast('Nuevo descubrimiento en ' + esc(SU.planet(d.pid).name), SU.icon('sparkle', 'sm'));
    return 'forum';
  });

  SU.sched.on('forumReply', (d, item) => {
    const list = F().replies[d.tid] = F().replies[d.tid] || [];
    list.push({ id: SU.uid('fr'), by: d.by, t: d.t, at: item.at, parent: d.parent });
    if (forums.viewing !== d.tid) {
      F().unread[d.tid] = true;
      if (SU.universe.active) {
        const t = forums.thread(d.tid);
        SU.toast(`<b>@${esc(SU.userOf(d.by))}</b> respondió en ${esc(SU.planet(t.planet).name)}`);
      }
    }
    return 'forum';
  });

  /* Programa respuestas de las cuentas del planeta */
  function scheduleReplies(pid, tid, text, parentReply, isNewThread, myReplyId) {
    const p = SU.planet(pid);
    let order = SU.shuffle(p.accounts);
    if (parentReply && parentReply.by !== 'me' && p.accounts.includes(parentReply.by)) {
      order = [parentReply.by].concat(order.filter((a) => a !== parentReply.by));
    }
    const n = isNewThread ? SU.randInt(2, 3) : (Math.random() < 0.6 ? 2 : 1);
    const delays = isNewThread ? [9, 45, 160] : [6, 38, 120];
    const used = [];
    order.slice(0, n).forEach((acc, i) => {
      let t;
      if (isNewThread && i === 0) t = SU.pickU('tw:' + pid, p.threadWelcomes);
      else t = SU.compose(acc, pid, text, { usedTopics: used, exclude: used.slice() });
      const crisis = SU.isCrisis(text);
      if (crisis && i > 0) return; // un solo mensaje claro basta
      if (crisis) t = SU.data.crisis.text;
      SU.sched.add('forumReply', { tid, by: acc, t, parent: myReplyId || null, planet: pid }, delays[i] * 1000 * SU.rand(0.8, 1.25));
    });
  }

  /* ---------- tarjetas ---------- */
  const typeTag = (t) => `<span class="th-type">${esc(t.type || 'Discusión')}</span>`;
  const threadCard = (t) => {
    const rs = forums.repliesFor(t.id);
    const unread = F().unread[t.id];
    return `<button class="th-card" data-act="openThread" data-id="${t.id}">
      <div class="row" style="gap:8px">${typeTag(t)}${t.by === 'me' ? '<span class="th-type th-mine">Tuya</span>' : ''}${unread ? '<span class="th-new">Nuevo</span>' : ''}</div>
      <div class="th-title">${esc(t.title)}</div>
      <div class="th-meta">${SU.avatar(t.by, 22)}<span class="ellipsis">${esc(SU.nameOf(t.by))}</span><span>· ${SU.timeAgo(t.at)}</span>
      <span class="grow"></span><span class="th-count">${SU.icon('chat', 'xs')} ${rs.length}</span></div></button>`;
  };

  /* ================= PLANETA ================= */
  forums.openPlanet = (pid) => {
    const p = SU.planet(pid);
    const now = Date.now();
    const v = F().visited[pid];
    if (!v) F().visited[pid] = { first: now, last: now, count: 1 };
    else {
      if (now - v.last > 2 * 60000) { v.count++; if (v.count >= 2) forums.discover(pid, 'revisit', 4000); }
      v.last = now;
    }
    const firstVisit = !F().welcomed[pid];
    F().welcomed[pid] = true;
    SU.store.save();
    const [ox, oy] = SU.universe.screenPos(pid);

    const bodyHTML = () => {
      const threads = forums.threadsFor(pid);
      const disc = (F().discoveries[pid] || []).map((x) => ({ x, d: p.discoveries.find((y) => y.id === x.id) })).filter((o) => o.d);
      return `
        <div class="pl-welcome ${firstVisit ? 'first' : ''}">
          <div class="pl-label">${SU.icon('sparkle', 'xs')} Mensaje de bienvenida</div>
          <div class="row" style="align-items:flex-start;gap:12px">${SU.avatar(p.welcome.by, 38)}
          <div class="grow"><button class="pl-author" data-act="openPAccount" data-id="${p.welcome.by}">@${esc(SU.userOf(p.welcome.by))}</button>
          <p>${esc(p.welcome.text)}</p></div></div></div>
        ${disc.map((o) => `<div class="pl-disc"><div class="pl-label">${SU.icon('sparkle', 'xs')} Descubrimiento · ${SU.timeAgo(o.x.at)}</div>
          <div class="row" style="align-items:flex-start;gap:12px">${SU.avatar(o.d.by, 32)}<p class="grow">${esc(o.d.text)}</p></div></div>`).join('')}
        <div class="pl-sec">Destacadas</div>
        <div class="pl-feat">${p.featured.map((f) => `<div class="feat-card">${SU.icon('sparkle', 'xs')}<p>${esc(f.text)}</p>
          <button class="feat-by" data-act="openPAccount" data-id="${f.by}">${SU.avatar(f.by, 20)} @${esc(SU.userOf(f.by))}</button></div>`).join('')}</div>
        <div class="pl-sec">Cuentas de este planeta</div>
        <div class="pl-accs">${p.accounts.map((a) => `<button class="pl-acc" data-act="openPAccount" data-id="${a}">${SU.avatar(a, 50)}<span>${esc(SU.nameOf(a))}</span></button>`).join('')}</div>
        <div class="pl-sec row"><span class="grow">Discusiones</span></div>
        <div class="pad" style="padding-top:0;padding-bottom:6px"><button class="btn pl-new btn-block" data-act="newThread" data-id="${pid}">${SU.icon('plus', 'sm')} Iniciar una discusión</button></div>
        <div class="th-list">${threads.map(threadCard).join('')}</div>
        <p class="hint" style="text-align:center;padding:12px 24px 40px">Las cuentas y sus respuestas son ficticias y forman parte de la experiencia.</p>`;
    };

    SU.nav.push({
      layer: 'universe', cls: 'planet-screen ' + (SU.store.s.settings.reduceMotion ? '' : 'planet-enter'),
      render(el) {
        el.style.setProperty('--ox', ox + 'px');
        el.style.setProperty('--oy', oy + 'px');
        el.style.setProperty('--pc', p.glow);
        el.style.setProperty('--p1', p.c1);
        el.style.setProperty('--p2', p.c2);
        el.dataset.planet = pid;
        el.innerHTML = `<div class="pl-hero">
            <header class="pl-bar"><button class="icon-btn" data-act="back" aria-label="Volver al universo">${SU.icon('back')}</button>
            <span class="grow"></span><span class="pl-bar-hint">Sonder Universe</span></header>
            <canvas class="pl-planet" data-thumb="${pid}" data-size="170"></canvas>
            <div class="pl-kicker">Planeta</div>
            <h1 class="pl-name">${esc(p.name)}</h1>
            <p class="pl-concept">${esc(p.concept)}</p>
            <p class="pl-desc">${esc(p.desc)}</p>
          </div><div class="pl-body"></div>`;
        SU.renderKeep(el.querySelector('.pl-body'), bodyHTML());
      },
      update(topic) { if (topic === 'forum' || topic === 'all') SU.renderKeep(this.el.querySelector('.pl-body'), bodyHTML()); }
    });
  };

  /* ================= DISCUSIÓN ================= */
  forums.openThread = (tid) => {
    const t0 = forums.thread(tid);
    if (!t0) return;
    const pid = t0.planet;
    const p = SU.planet(pid);
    let replyTo = null;
    delete F().unread[tid];
    F().opened[tid] = true;
    SU.store.save();
    forums.unlockFragment(pid);

    const reactBtn = (key, base) => {
      const on = !!F().reacts[key];
      const n = reactCount(key, base);
      return `<button class="react ${on ? 'on' : ''}" data-act="react" data-key="${key}" data-base="${base ? 1 : 0}"><span class="react-ic">${esc(p.reaction.icon)}</span>${esc(p.reaction.label)}${n ? `<b>${n}</b>` : ''}</button>`;
    };
    const pollHTML = (t) => {
      if (!t.poll) return '';
      const mine = F().polls[tid];
      const votes = t.poll.votes.map((v, i) => v + (mine === i ? 1 : 0));
      const total = votes.reduce((a, b) => a + b, 0) || 1;
      return `<div class="poll">${t.poll.options.map((o, i) => {
        const pct = Math.round((votes[i] / total) * 100);
        return `<button class="poll-opt ${mine === i ? 'on' : ''}" data-act="vote" data-i="${i}">
          ${mine != null ? `<span class="poll-bar" style="width:${pct}%"></span>` : ''}
          <span class="poll-txt">${esc(o)}</span>${mine != null ? `<span class="poll-pct">${pct}%</span>` : ''}</button>`;
      }).join('')}<div class="hint">${mine != null ? 'Votos de cuentas ficticias + el tuyo. Toca otra opción para cambiar tu voto.' : 'Toca una opción para votar.'}</div></div>`;
    };
    const seen = new Set();
    let firstDraw = true;
    const replyHTML = (r, child) => `<div class="rp ${child ? 'rp-child' : ''} ${r.by === 'me' ? 'rp-me' : ''} ${!firstDraw && !seen.has(r.id) ? 'anim' : ''}" id="rp-${r.id}">
      <button class="rp-av" ${r.by === 'me' ? '' : `data-act="openPAccount" data-id="${r.by}"`}>${SU.avatar(r.by, child ? 28 : 34)}</button>
      <div class="grow"><div class="rp-head"><b>${esc(SU.nameOf(r.by))}</b><span class="dim">@${esc(SU.userOf(r.by))} · ${SU.timeAgo(r.at)}</span></div>
      <div class="rp-text">${SU.text(r.t)}</div>
      <div class="rp-actions">${reactBtn('r:' + r.id, r.seeded)}<button class="rp-reply" data-act="replyTo" data-id="${r.id}">${SU.icon('reply', 'xs')} Responder</button></div></div></div>`;

    const repliesHTML = () => {
      const rs = forums.repliesFor(tid);
      const byId = {}; rs.forEach((r) => { byId[r.id] = r; });
      const root = (r) => { let x = r; let guard = 0; while (x.parent && byId[x.parent] && guard++ < 20) x = byId[x.parent]; return x; };
      const tops = rs.filter((r) => !r.parent || !byId[r.parent]);
      const kids = {};
      rs.forEach((r) => { if (r.parent && byId[r.parent]) { const top = root(r); (kids[top.id] = kids[top.id] || []).push(r); } });
      const typing = SU.sched.pending((i) => i.type === 'forumReply' && i.data.tid === tid && i.at - Date.now() < 7000);
      const out = (tops.length ? tops.map((r) => replyHTML(r) + (kids[r.id] || []).map((k) => replyHTML(k, true)).join('')).join('')
        : '<p class="dim" style="padding:6px 18px 10px;font-size:14px">Aún no hay respuestas. Puedes ser la primera.</p>')
        + (typing.length ? `<div class="th-typing"><span class="typing"><i></i><i></i><i></i></span> @${esc(SU.userOf(typing[0].data.by))} está escribiendo…</div>` : '');
      rs.forEach((r) => seen.add(r.id));
      firstDraw = false;
      return out;
    };
    const mainHTML = () => {
      const t = forums.thread(tid);
      return `<div class="th-main">
        <div class="row" style="gap:8px">${typeTag(t)}${t.by === 'me' ? '<span class="th-type th-mine">Tuya</span>' : ''}</div>
        <h1 class="th-h">${esc(t.title)}</h1>
        <div class="th-author"><button class="row" style="gap:9px" ${t.by === 'me' ? '' : `data-act="openPAccount" data-id="${t.by}"`}>${SU.avatar(t.by, 30)}<b>${esc(SU.nameOf(t.by))}</b></button><span class="dim">· ${SU.timeAgo(t.at)}</span></div>
        ${t.body ? `<p class="th-body">${SU.text(t.body)}</p>` : ''}
        ${pollHTML(t)}
        <div class="rp-actions">${reactBtn('d:' + tid, t.seeded)}</div></div>
        <div class="pl-sec" style="margin-top:6px">Respuestas</div>`;
    };

    SU.nav.push({
      layer: 'universe', cls: 'thread-screen',
      render(el, entry) {
        el.style.setProperty('--pc', p.glow);
        el.style.setProperty('--p1', p.c1);
        el.style.setProperty('--p2', p.c2);
        el.innerHTML = `<header class="bar th-bar"><button class="icon-btn" data-act="back" aria-label="Volver al planeta">${SU.icon('back')}</button>
          <canvas data-thumb="${pid}" data-size="30"></canvas><div class="bar-title">${esc(p.name)}</div></header>
          <div class="th-top"></div><div class="th-replies"></div>
          <form class="composer th-composer">
            <div class="reply-chip hidden"><span></span><button type="button" aria-label="Cancelar">${SU.icon('close', 'xs')}</button></div>
            <div class="composer-row"><textarea class="composer-in autogrow" rows="1" placeholder="Escribe tu respuesta…" maxlength="1500"></textarea>
            <button class="send-btn" type="submit" aria-label="Enviar">${SU.icon('send', 'sm')}</button></div></form>`;
        el.querySelector('.th-top').innerHTML = mainHTML();
        el.querySelector('.th-replies').innerHTML = repliesHTML();
        const ta = el.querySelector('textarea');
        const chip = el.querySelector('.reply-chip');
        entry.setReply = (rid) => {
          const r = rid ? forums.repliesFor(tid).find((x) => x.id === rid) : null;
          replyTo = r || null;
          chip.classList.toggle('hidden', !r);
          chip.querySelector('span').textContent = r ? 'Respondiendo a @' + SU.userOf(r.by) : '';
          if (r) ta.focus();
        };
        chip.querySelector('button').addEventListener('click', () => entry.setReply(null));
        el.querySelector('form').addEventListener('submit', (e) => {
          e.preventDefault();
          const text = ta.value.trim();
          if (!text) return;
          const firstInPlanet = !Object.entries(F().replies).some(([k, arr]) => { const th = forums.thread(k); return th && th.planet === pid && arr.some((r) => r.by === 'me'); });
          const r = { id: SU.uid('fr'), by: 'me', t: text, at: Date.now(), parent: replyTo ? replyTo.id : null };
          (F().replies[tid] = F().replies[tid] || []).push(r);
          scheduleReplies(pid, tid, text, replyTo, false, r.id);
          if (firstInPlanet) forums.discover(pid, 'firstReply', 14000);
          ta.value = ''; ta.style.height = '';
          entry.setReply(null);
          SU.store.save();
          entry.drawReplies(true);
          SU.nav.refresh('forum');
        });
        entry.drawReplies = (toEnd) => {
          const box = el.querySelector('.th-replies');
          const sig = forums.repliesFor(tid).map((x) => x.id + (F().reacts['r:' + x.id] ? 1 : 0)).join('|') + SU.sched.pending((i) => i.type === 'forumReply' && i.data.tid === tid && i.at - Date.now() < 7000).length;
          if (box._sig === sig && !toEnd) return;
          box._sig = sig;
          SU.renderKeep(box, repliesHTML());
          if (toEnd) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 30);
        };
        entry.timer = setInterval(() => {
          const pend = SU.sched.pending((i) => i.type === 'forumReply' && i.data.tid === tid).length;
          if (pend || entry._hadTyping) { entry._hadTyping = pend > 0; entry.drawReplies(false); }
        }, 1500);
        forums.viewing = tid;
      },
      update(topic) {
        if (topic !== 'forum' && topic !== 'all') return;
        delete F().unread[tid];
        SU.renderKeep(this.el.querySelector('.th-top'), mainHTML());
        this.drawReplies(false);
      },
      onClose() {
        clearInterval(this.timer);
        if (forums.viewing === tid) forums.viewing = null;
      }
    });
  };

  SU.actions.openThread = (t) => forums.openThread(t.dataset.id);
  SU.actions.replyTo = (t) => { const top = SU.nav.top(); top && top.setReply && top.setReply(t.dataset.id); };
  SU.actions.react = (t) => {
    const k = t.dataset.key;
    if (F().reacts[k]) delete F().reacts[k]; else F().reacts[k] = true;
    SU.store.save();
    const on = !!F().reacts[k];
    t.classList.toggle('on', on);
    const n = reactCount(k, t.dataset.base === '1');
    const b = t.querySelector('b');
    if (n) { if (b) b.textContent = n; else t.insertAdjacentHTML('beforeend', `<b>${n}</b>`); } else if (b) b.remove();
    if (on) { t.classList.add('pop'); setTimeout(() => t.classList.remove('pop'), 450); }
  };
  SU.actions.vote = (t) => {
    const top = SU.nav.top();
    const tid = forums.viewing;
    if (!tid) return;
    F().polls[tid] = +t.dataset.i;
    SU.store.save();
    top && top.update && top.update('forum');
  };

  /* ================= NUEVA DISCUSIÓN ================= */
  const TYPES = ['Pregunta', 'Hilo', 'Reflexión', 'Reto', 'Algo random'];
  SU.actions.newThread = (btn) => {
    const pid = btn.dataset.id;
    const p = SU.planet(pid);
    let type = 'Pregunta';
    SU.nav.push({
      layer: 'universe', cls: 'sheet new-thread',
      render(el) {
        el.style.setProperty('--pc', p.glow);
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
          <div class="bar-title">Nueva discusión · ${esc(p.name)}</div><button class="btn btn-primary btn-sm nt-pub" disabled>Publicar</button></header>
          <div class="pad">
            <div class="field-label">Tipo</div>
            <div class="nt-types">${TYPES.map((t) => `<button class="nt-type ${t === type ? 'on' : ''}" data-t="${t}">${t}</button>`).join('')}</div>
            <label class="field" style="margin-top:16px"><span class="field-label">Título</span><input class="input nt-title" maxlength="120" placeholder="¿Sobre qué quieres conversar?"></label>
            <label class="field"><span class="field-label">Texto (opcional)</span><textarea class="textarea nt-body" maxlength="1500" placeholder="Cuéntalo como quieras."></textarea></label>
            <p class="hint">${esc(p.concept)} Aquí puedes escribir con libertad: nadie más lo verá.</p>
          </div>`;
        const pub = el.querySelector('.nt-pub');
        const title = el.querySelector('.nt-title');
        const body = el.querySelector('.nt-body');
        title.addEventListener('input', () => { pub.disabled = !title.value.trim(); });
        el.querySelector('.nt-types').addEventListener('click', (e) => {
          const b = e.target.closest('[data-t]');
          if (!b) return;
          type = b.dataset.t;
          SU.$$('.nt-type', el).forEach((x) => x.classList.toggle('on', x === b));
        });
        pub.addEventListener('click', () => {
          const t = { id: SU.uid('ut'), planet: pid, type, title: title.value.trim(), body: body.value.trim(), by: 'me', at: Date.now() };
          if (!t.title) return;
          F().threads.push(t);
          scheduleReplies(pid, t.id, t.title + ' ' + t.body, null, true);
          forums.discover(pid, 'firstThread', 20000);
          SU.store.save();
          SU.nav.back();
          setTimeout(() => { SU.nav.refresh('forum'); forums.openThread(t.id); }, 340);
        });
        setTimeout(() => title.focus(), 350);
      }
    });
  };

  /* ================= CUENTA DE UN PLANETA ================= */
  forums.openAccount = (id) => {
    const a = SU.acc(id);
    if (!a) return;
    const p = SU.planet(a.planet);
    const theirs = SU.data.discussions.filter((d) => d.by === id).map((d) => forums.thread(d.id)).filter((t) => t.at <= Date.now());
    SU.nav.push({
      layer: 'universe', cls: 'pacc-screen',
      render(el) {
        el.style.setProperty('--pc', p.glow);
        el.style.setProperty('--p1', p.c1);
        el.style.setProperty('--p2', p.c2);
        el.innerHTML = `<header class="bar th-bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <div class="bar-title">@${esc(a.user)}</div></header>
          <div class="prof-head">${SU.avatar(a, 92, 'av-ring')}
            <h2 class="prof-name">${esc(a.name)}</h2><div class="prof-user">@${esc(a.user)}</div>
            <div class="pacc-planet"><canvas data-thumb="${p.id}" data-size="22"></canvas> ${esc(p.name)}</div>
            <p class="prof-bio">${esc(a.bio)}</p>
            <p class="pacc-voice"><span class="dim">Personalidad:</span> ${esc(a.voice)}</p>
            <span class="tag tag-fict">${SU.icon('info', 'xs')} Cuenta ficticia · respuestas preparadas</span></div>
          <div class="pl-sec">Discusiones que inició</div>
          <div class="th-list">${theirs.length ? theirs.map(threadCard).join('') : '<p class="dim" style="padding:0 18px">Por ahora solo responde en otras discusiones.</p>'}</div>
          <div style="height:40px"></div>`;
      }
    });
  };
  SU.actions.openPAccount = (t) => forums.openAccount(t.dataset.id);
})(window.SU);
