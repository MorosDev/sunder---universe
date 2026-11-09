/* sonder. — interacciones simuladas: programador, temas, respuestas preparadas */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const H = SU.H;

  /* ---------- Coincidencias de texto ---------- */
  const prep = (t) => ' ' + SU.norm(t).replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
  const hasPrefix = (pt, k) => pt.includes(' ' + k);
  const hasWord = (pt, k) => pt.includes(' ' + k.trim() + ' ');
  SU.match = { prep, hasPrefix, hasWord };

  SU.detectTopics = (text) => {
    const pt = prep(text);
    return SU.data.topics
      .map((tp, i) => ({ tp, i, n: tp.k.reduce((n, k) => n + (hasPrefix(pt, k) ? 1 : 0), 0) }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n || a.i - b.i)
      .map((x) => x.tp);
  };
  SU.isCrisis = (text) => { const pt = prep(text); return SU.data.crisis.k.some((k) => hasPrefix(pt, k)); };

  /* Elige un elemento sin repetir hasta agotar la lista */
  SU.pickU = (key, arr) => {
    if (!arr || !arr.length) return '';
    const used = S().used[key] || [];
    let free = arr.map((_, i) => i).filter((i) => !used.includes(i));
    if (!free.length) { free = arr.map((_, i) => i); used.length = 0; }
    const i = SU.pick(free);
    used.push(i);
    S().used[key] = used;
    return arr[i];
  };

  /* Compone una respuesta con la voz de una cuenta */
  SU.compose = (accId, planetId, text, opts) => {
    opts = opts || {};
    const acc = SU.acc(accId);
    if (!acc) return '';
    if (SU.isCrisis(text)) return SU.data.crisis.text;
    const words = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    const topics = SU.detectTopics(text).filter((t) => !(opts.exclude || []).includes(t.id));
    let out;
    if (topics.length && words >= 3 && Math.random() < 0.85) {
      const tp = topics[0];
      if (opts.usedTopics) opts.usedTopics.push(tp.id);
      const line = SU.pickU('t:' + tp.id, tp.lines);
      const op = (acc.openers && Math.random() < 0.55) ? SU.pickU('o:' + accId, acc.openers) : '';
      out = op ? op + ' ' + line : line;
    } else {
      out = SU.pickU('a:' + accId, acc.lines || acc.textComments || ['✨']);
    }
    if (planetId && opts.followUp !== false && Math.random() < 0.35) {
      const p = SU.planet(planetId);
      if (p) out += ' ' + SU.pickU('f:' + planetId, p.followUps);
    }
    return out;
  };

  /* ---------- Programador de interacciones ----------
     Todo se guarda con su hora: si la usuaria cierra la página, al volver
     las interacciones pendientes aparecen con la hora en que "ocurrieron". */
  SU.sched = {
    handlers: {},
    on(type, fn) { this.handlers[type] = fn; },
    add(type, data, delay) {
      S().queue.push({ id: SU.uid('q'), type, data, at: Date.now() + Math.max(0, delay || 0) });
      SU.store.save();
    },
    pending(pred) { return S().queue.filter(pred); },
    cancel(pred) { S().queue = S().queue.filter((i) => !pred(i)); SU.store.save(); },
    tick() {
      const now = Date.now();
      const q = S().queue;
      if (!q.length) return;
      const due = q.filter((i) => i.at <= now).sort((a, b) => a.at - b.at);
      if (!due.length) return;
      S().queue = q.filter((i) => i.at > now);
      const topics = new Set();
      due.forEach((i) => {
        const h = this.handlers[i.type];
        if (!h) return;
        try { const t = h(i.data, i); if (t) topics.add(t); } catch (e) { console.error(e); }
      });
      SU.store.save();
      topics.forEach((t) => SU.nav.refresh(t));
      SU.tabs.badges();
      SU.emit('tick-done', topics);
    }
  };

  /* ---------- Notificaciones de la red social ---------- */
  SU.notify = (n) => {
    S().notifs.unshift(Object.assign({ id: SU.uid('n'), read: false, at: Date.now() }, n));
    if (S().notifs.length > 100) S().notifs.length = 100;
  };

  const I = SU.interact = {};

  /* ===== Publicaciones ===== */
  I.onUserPost = (post) => {
    const pool = SU.data.mainAccounts.filter((a) => !a.special);
    const follows = S().follows;
    const ordered = SU.shuffle(pool).sort((a, b) => (follows.includes(b.id) ? 1 : 0) - (follows.includes(a.id) ? 1 : 0));
    const nLikes = SU.randInt(2, Math.min(5, ordered.length));
    const likeDelays = [6, 22, 70, 190, 520];
    ordered.slice(0, nLikes).forEach((a, i) => SU.sched.add('postLike', { post: post.id, by: a.id }, likeDelays[i] * 1000 * SU.rand(0.7, 1.3)));
    const nCom = post.photo ? SU.randInt(2, 3) : SU.randInt(1, 2);
    const comDelays = [16, 85, 300];
    SU.shuffle(ordered.slice(0, Math.max(nLikes, nCom))).slice(0, nCom)
      .forEach((a, i) => SU.sched.add('postComment', { post: post.id, by: a.id }, comDelays[i] * 1000 * SU.rand(0.75, 1.3)));
    I.maybeCartographer();
  };

  const findPost = (id) => S().posts.find((p) => p.id === id);

  SU.sched.on('postLike', (d, item) => {
    const p = findPost(d.post);
    if (!p || p.likes.includes(d.by)) return;
    p.likes.push(d.by);
    SU.notify({ type: 'like', by: d.by, ref: p.id, at: item.at, text: 'le dio me gusta a tu publicación.' });
    return 'post';
  });

  SU.sched.on('postComment', (d, item) => {
    const p = findPost(d.post);
    if (!p) return;
    const a = SU.acc(d.by);
    let t;
    if (p.photo) t = SU.pickU('pc:' + a.id, a.photoComments);
    else {
      const tps = SU.detectTopics(p.text || '');
      t = (tps.length && Math.random() < 0.5) ? SU.pickU('t:' + tps[0].id, tps[0].lines) : SU.pickU('tc:' + a.id, a.textComments);
    }
    p.comments.push({ id: SU.uid('c'), by: a.id, t, at: item.at });
    SU.notify({ type: 'comment', by: a.id, ref: p.id, at: item.at, text: 'comentó: «' + t + '»' });
    return 'post';
  });

  /* La usuaria responde a un comentario en su publicación */
  I.onUserComment = (post, comment) => {
    if (comment.replyTo && SU.acc(comment.replyTo) && Math.random() < 0.75) {
      SU.sched.add('commentThanks', { post: post.id, by: comment.replyTo, own: true }, SU.rand(8, 22) * 1000);
    }
  };
  /* La usuaria comenta en la publicación de una cuenta */
  I.onUserCommentAcct = (key, accId) => {
    SU.sched.add('commentThanks', { key, by: accId, own: false }, SU.rand(10, 40) * 1000);
  };
  SU.sched.on('commentThanks', (d, item) => {
    const a = SU.acc(d.by);
    const t = Math.random() < 0.55 ? SU.pickU('thanks', SU.data.thanks) : SU.pickU('tc:' + a.id, a.textComments);
    if (d.own) {
      const p = findPost(d.post);
      if (!p) return;
      p.comments.push({ id: SU.uid('c'), by: a.id, t, at: item.at, replyTo: 'me' });
      SU.notify({ type: 'comment', by: a.id, ref: p.id, at: item.at, text: 'respondió a tu comentario: «' + t + '»' });
    } else {
      const list = S().acctComments[d.key] = S().acctComments[d.key] || [];
      list.push({ id: SU.uid('c'), by: a.id, t, at: item.at, replyTo: 'me' });
      SU.notify({ type: 'comment', by: a.id, ref: d.key, refKind: 'acct', at: item.at, text: 'respondió a tu comentario: «' + t + '»' });
    }
    return 'post';
  });

  /* ===== Seguir ===== */
  I.follow = (id) => {
    const s = S();
    if (s.follows.includes(id)) return;
    s.follows.push(id);
    s.followedAt[id] = Date.now();
    if (!s.followers.includes(id) && !SU.sched.pending((i) => i.type === 'followBack' && i.data.by === id).length) {
      SU.sched.add('followBack', { by: id }, SU.rand(14, 50) * 1000);
    }
    const a = SU.acc(id);
    if (a.dm && !s.convos[id] && !SU.sched.pending((i) => i.type === 'dmOpen' && i.data.by === id).length) {
      SU.sched.add('dmOpen', { by: id }, SU.rand(45, 110) * 1000);
    }
    SU.store.save();
    I.maybeCartographer();
  };
  I.unfollow = (id) => {
    const s = S();
    s.follows = s.follows.filter((x) => x !== id);
    SU.store.save();
  };

  SU.sched.on('followBack', (d, item) => {
    if (S().followers.includes(d.by)) return;
    S().followers.push(d.by);
    SU.notify({ type: 'follow', by: d.by, ref: d.by, at: item.at, text: 'empezó a seguirte.' });
    return 'social';
  });

  /* El Cartógrafo aparece cuando la usuaria ya se movió un poco por la red */
  I.maybeCartographer = () => {
    const s = S();
    if (s.flags.carto) return;
    const nf = s.follows.filter((x) => x !== 'cartografo').length;
    if (s.posts.length >= 1 || nf >= 2) {
      s.flags.carto = Date.now();
      SU.sched.add('followBack', { by: 'cartografo' }, SU.rand(35, 60) * 1000);
      SU.sched.add('dmOpen', { by: 'cartografo' }, SU.rand(80, 130) * 1000);
      SU.store.save();
    }
  };

  /* ===== Mensajes directos ===== */
  const convo = (id) => {
    const s = S();
    if (!s.convos[id]) s.convos[id] = { msgs: [], step: 0, unread: 0, opened: false, started: Date.now() };
    return s.convos[id];
  };
  I.convo = convo;

  SU.sched.on('dmOpen', (d, item) => {
    const a = SU.acc(d.by);
    const c = convo(d.by);
    if (c.opened) return;
    c.opened = true;
    a.dm.open.forEach((t, i) => c.msgs.push({ from: d.by, t, at: item.at + i * 1500 }));
    c.unread += a.dm.open.length;
    SU.notify({ type: 'msg', by: d.by, ref: d.by, at: item.at, text: 'te envió un mensaje.' });
    return 'dm';
  });

  SU.sched.on('dmMsg', (d, item) => {
    const c = convo(d.by);
    c.opened = true;
    c.msgs.push({ from: d.by, t: d.t, at: item.at });
    if (!(SU.messages && SU.messages.viewing === d.by)) {
      c.unread += 1;
      if (d.notify) SU.notify({ type: 'msg', by: d.by, ref: d.by, at: item.at, text: 'te envió un mensaje.' });
    }
    return 'dm';
  });

  I.userDM = (id, text) => {
    const a = SU.acc(id);
    const c = convo(id);
    c.msgs.push({ from: 'me', t: text, at: Date.now() });
    const pt = prep(text);
    const replies = [];
    if (!c.opened) {
      // escribió antes de que la cuenta la saludara
      c.opened = true;
      SU.sched.cancel((i) => i.type === 'dmOpen' && i.data.by === id);
      replies.push('¡Hola! 👋', a.dm.open[a.dm.open.length - 1]);
    } else if (SU.isCrisis(text)) {
      replies.push(SU.data.crisis.text);
    } else {
      const hard = SU.data.dmGlobal.find((r) => !r.soft && r.k.some((k) => hasPrefix(pt, k)));
      if (hard) replies.push(hard.r);
      else if (c.step < a.dm.steps.length) {
        const st = a.dm.steps[c.step];
        const rule = (st.rules || []).find((r) => r.k.some((k) => hasWord(pt, k)));
        replies.push(rule ? rule.r : st.def);
        if (st.next) replies.push(st.next);
        c.step++;
      } else {
        const soft = SU.data.dmGlobal.find((r) => r.soft && r.k.some((k) => hasPrefix(pt, k)));
        replies.push(soft ? soft.r : SU.pickU('fb:' + id, a.dm.fallback));
      }
    }
    let delay = SU.rand(1500, 2600);
    replies.forEach((t) => {
      SU.sched.add('dmMsg', { by: id, t }, delay);
      delay += SU.rand(1800, 3200) + Math.min(2500, t.length * 25);
    });
    SU.store.save();
  };

  /* ===== Hitos del universo (pistas a través del Cartógrafo) ===== */
  I.milestone = (n) => {
    const s = S();
    const send = (key, t, delay) => {
      if (s.flags[key]) return;
      s.flags[key] = Date.now();
      if (!s.flags.carto) { s.flags.carto = Date.now(); }
      if (!s.followers.includes('cartografo') && !SU.sched.pending((i) => i.type === 'followBack' && i.data.by === 'cartografo').length) {
        SU.sched.add('followBack', { by: 'cartografo' }, 5000);
      }
      const c = s.convos.cartografo;
      if (!(c && c.opened)) {
        SU.sched.cancel((i) => i.type === 'dmOpen' && i.data.by === 'cartografo');
        SU.sched.add('dmOpen', { by: 'cartografo' }, Math.max(2000, delay - 9000));
      }
      SU.sched.add('dmMsg', { by: 'cartografo', t, notify: true }, delay);
    };
    if (n >= 4) send('m4', 'Veo que el mapa ya tiene varias líneas encendidas. Vas muy bien. ✧', 25000);
    if (n >= 8) send('m8', 'El centro ya brilla. Creo que ya sabes a dónde ir.', 12000);
    SU.store.save();
  };
})(window.SU);
