/* sonder. — bandeja de entrada (conversaciones simuladas, separadas de los foros) */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const esc = SU.esc;
  const M = SU.messages = { viewing: null };

  const inboxHTML = () => {
    const cs = Object.entries(S().convos).filter(([, c]) => c.msgs.length)
      .sort((a, b) => b[1].msgs[b[1].msgs.length - 1].at - a[1].msgs[a[1].msgs.length - 1].at);
    if (!cs.length) return `<div class="empty">${SU.icon('chat')}<p>Aún no tienes mensajes. Cuando sigas a alguien, quizá te escriba.</p>
      <button class="btn btn-soft btn-sm" data-act="newMsg">Escribir un mensaje</button></div>`;
    return cs.map(([id, c]) => {
      const a = SU.acc(id);
      const last = c.msgs[c.msgs.length - 1];
      return `<button class="inbox-row ${c.unread ? 'unread' : ''}" data-act="openConvo" data-id="${id}">${SU.avatar(a, 50)}
        <span class="grow"><span class="row"><b class="grow ellipsis">${esc(a.name)}</b><span class="dim inbox-time">${SU.timeAgo(last.at)}</span></span>
        <span class="inbox-last ellipsis">${last.from === 'me' ? 'Tú: ' : ''}${esc(last.t)}</span></span>
        ${c.unread ? `<span class="inbox-dot">${c.unread}</span>` : ''}</button>`;
    }).join('');
  };

  SU.tabs.views.messages = {
    render(el) {
      el.innerHTML = `<header class="bar"><div class="bar-title" style="font-size:18px">Mensajes</div>
        <button class="icon-btn" data-act="newMsg" aria-label="Nuevo mensaje">${SU.icon('edit')}</button></header>
        <p class="hint" style="padding:12px 18px 4px">Conversaciones simuladas con cuentas ficticias. Las respuestas están preparadas de antemano.</p>
        <div class="inbox"></div>`;
      this.update(el);
    },
    update(el) { SU.renderKeep(el.querySelector('.inbox'), inboxHTML()); },
    onShow(el) { this.update(el); }
  };

  SU.actions.newMsg = () => {
    const list = SU.data.mainAccounts.filter((a) => a.dm && (!a.special || S().flags.carto));
    SU.nav.push({
      layer: 'social', cls: 'sheet',
      render(el) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Cerrar">${SU.icon('close')}</button>
          <div class="bar-title">Nuevo mensaje</div></header>
          <div class="section-title">¿A quién quieres escribirle?</div>
          ${list.map((a) => `<button class="acc-row" style="width:100%;text-align:left" data-act="openConvoFromNew" data-id="${a.id}">${SU.avatar(a, 44)}
            <span class="grow"><span class="acc-name" style="display:block">${esc(a.name)}</span><span class="acc-user">@${esc(a.user)}</span></span></button>`).join('')}`;
      }
    });
  };
  SU.actions.openConvoFromNew = (t) => { SU.nav.back(); setTimeout(() => M.openConvo(t.dataset.id), 80); };
  SU.actions.openConvo = (t) => M.openConvo(t.dataset.id);

  const typingFor = (id) => SU.sched.pending((i) => (i.type === 'dmMsg' || i.type === 'dmOpen') && i.data.by === id && i.at - Date.now() < 6000).length > 0;

  M.openConvo = (id) => {
    const a = SU.acc(id);
    if (!a || !a.dm) return;
    const msgsHTML = () => {
      const c = S().convos[id];
      const ms = c ? c.msgs.filter((m) => m.at <= Date.now() + 1000) : [];
      let html = `<div class="dm-intro">${SU.avatar(a, 64)}<b>${esc(a.name)}</b><span class="dim">@${esc(a.user)}</span>
        <span class="tag tag-fict">${SU.icon('info', 'xs')} Conversación simulada · respuestas preparadas</span></div>`;
      let lastDay = '';
      const shown = msgsHTML.shown == null ? ms.length : msgsHTML.shown;
      msgsHTML.shown = ms.length;
      ms.forEach((m, i) => {
        const d = new Date(m.at);
        const day = d.toDateString();
        if (day !== lastDay) {
          lastDay = day;
          html += `<div class="dm-day">${d.toDateString() === new Date().toDateString() ? 'Hoy' : d.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}</div>`;
        }
        const next = ms[i + 1];
        const tail = !next || next.from !== m.from;
        html += `<div class="bubble ${m.from === 'me' ? 'me' : 'them'} ${tail ? 'tail' : ''} ${i >= shown ? 'anim' : ''}">${SU.text(m.t)}${tail ? `<span class="b-time">${d.toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</span>` : ''}</div>`;
      });
      if (typingFor(id)) html += '<div class="bubble them typing"><i></i><i></i><i></i></div>';
      return html;
    };
    SU.nav.push({
      layer: 'social', cls: 'dm-screen',
      render(el, entry) {
        el.innerHTML = `<header class="bar"><button class="icon-btn" data-act="back" aria-label="Regresar">${SU.icon('back')}</button>
          <button class="row grow dm-who" data-act="openAccount" data-id="${id}">${SU.avatar(a, 34)}<span class="grow" style="text-align:left"><b class="ellipsis" style="display:block">${esc(a.name)}</b><span class="dim" style="font-size:12px">Cuenta ficticia</span></span></button></header>
          <div class="dm-list"></div>
          <form class="composer"><div class="composer-row">
            <textarea class="composer-in autogrow" rows="1" placeholder="Escribe un mensaje…" maxlength="600"></textarea>
            <button class="send-btn" type="submit" aria-label="Enviar">${SU.icon('send', 'sm')}</button></div></form>`;
        const list = el.querySelector('.dm-list');
        entry.draw = (stick) => {
          const near = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
          const c0 = S().convos[id];
          const sig = (c0 ? c0.msgs.filter((m) => m.at <= Date.now() + 1000).length : 0) + '-' + typingFor(id);
          if (list._sig === sig && !stick) return;
          list._sig = sig;
          list.innerHTML = msgsHTML();
          if (stick || near) el.scrollTop = el.scrollHeight;
        };
        entry.draw(true);
        const c = S().convos[id];
        if (c) { c.unread = 0; SU.store.save(); SU.tabs.badges(); }
        M.viewing = id;
        const ta = el.querySelector('textarea');
        el.querySelector('form').addEventListener('submit', (e) => {
          e.preventDefault();
          const t = ta.value.trim();
          if (!t) return;
          SU.interact.userDM(id, t);
          ta.value = ''; ta.style.height = '';
          entry.draw(true);
          SU.nav.refresh('dm-list');
          setTimeout(() => entry.draw(true), 900);
        });
        ta.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey && !SU.isTouch()) { e.preventDefault(); el.querySelector('form').requestSubmit(); }
        });
        entry.timer = setInterval(() => entry.draw(false), 1200);
      },
      update(topic) {
        if (topic === 'dm' || topic === 'dm-list') {
          this.draw(false);
          const c = S().convos[id];
          if (c && c.unread) { c.unread = 0; SU.store.save(); SU.tabs.badges(); }
        }
      },
      onClose() { clearInterval(this.timer); if (M.viewing === id) M.viewing = null; }
    });
  };
})(window.SU);
