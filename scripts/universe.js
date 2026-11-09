/* sonder. — Sonder Universe: mapa espacial interactivo en Canvas */
(function (SU) {
  'use strict';
  const S = () => SU.store.s;
  const TAU = Math.PI * 2;
  const $ = SU.$;
  const U = SU.universe = { active: false, cam: { x: 0, y: 0, z: 0.4 }, sel: null, t: 0 };

  let cv, ctx, W = 0, H = 0, dpr = 1;
  let raf = null, stars = [], nebula = null, shooting = [];
  const pointers = new Map();
  let drag = null, pinch = null, vel = { x: 0, y: 0 }, tween = null, lastTap = null;
  let saveT = null;
  const thumbs = new Set();

  /* ---------- utilidades ---------- */
  const hexA = (hex, a) => {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  const fitZ = () => SU.clamp(Math.min(W, H) / 3100, 0.05, 1);
  const zMin = () => fitZ() * 0.75;
  const zMax = () => 2.6;
  const toScreen = (wx, wy) => [(wx - U.cam.x) * U.cam.z + W / 2, (wy - U.cam.y) * U.cam.z + H / 2];
  const toWorld = (sx, sy) => [(sx - W / 2) / U.cam.z + U.cam.x, (sy - H / 2) / U.cam.z + U.cam.y];
  const reduce = () => S().settings.reduceMotion;
  const ambient = () => S().settings.ambient;

  /* ---------- generación ---------- */
  function genStars() {
    const r = rng(7);
    const layers = [
      { f: 0.22, n: 230, s: [0.35, 1.0] },
      { f: 0.5, n: 150, s: [0.5, 1.4] },
      { f: 0.85, n: 90, s: [0.7, 1.9] }
    ];
    const T = 1500;
    stars = layers.map((L) => ({
      f: L.f, T,
      list: Array.from({ length: L.n }, () => ({
        x: r() * T, y: r() * T,
        s: L.s[0] + r() * (L.s[1] - L.s[0]),
        ph: r() * TAU, sp: 0.4 + r() * 1.6,
        c: r() < 0.12 ? '255,226,176' : (r() < 0.2 ? '190,200,255' : '255,255,255')
      }))
    }));
  }
  function genNebula() {
    const c = document.createElement('canvas');
    c.width = c.height = 512;
    const g = c.getContext('2d');
    const r = rng(42);
    const blobs = [['#5b46c9', 0.3], ['#9b5fae', 0.22], ['#2f4fa8', 0.28], ['#d48aa8', 0.14], ['#3d2c86', 0.3], ['#6fa6d8', 0.1]];
    for (let i = 0; i < 14; i++) {
      const [col, a] = blobs[i % blobs.length];
      const x = 80 + r() * 352, y = 80 + r() * 352, rad = 60 + r() * 150;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, hexA(col, a));
      gr.addColorStop(1, hexA(col, 0));
      g.fillStyle = gr;
      g.fillRect(0, 0, 512, 512);
    }
    nebula = c;
  }

  /* ---------- dibujo de planetas ---------- */
  function sphere(g, x, y, r, c1, c2) {
    const gr = g.createRadialGradient(x - r * 0.38, y - r * 0.42, r * 0.08, x, y, r);
    gr.addColorStop(0, c1); gr.addColorStop(1, c2);
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  }
  function shade(g, x, y, r, k) {
    const gr = g.createRadialGradient(x - r * 0.45, y - r * 0.5, r * 0.15, x, y, r * 1.02);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(0.6, `rgba(4,5,18,${0.12 * k})`);
    gr.addColorStop(1, `rgba(4,5,18,${0.7 * k})`);
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r + 0.5, 0, TAU); g.fill();
  }
  function glow(g, x, y, r, col, a, spread) {
    spread = spread || 1.9;
    const gr = g.createRadialGradient(x, y, r * 0.85, x, y, r * spread);
    gr.addColorStop(0, hexA(col, a));
    gr.addColorStop(1, hexA(col, 0));
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, r * spread, 0, TAU); g.fill();
  }
  function ring(g, x, y, rx, ry, rot, col, lw, half) {
    g.save();
    g.strokeStyle = col; g.lineWidth = lw;
    g.beginPath();
    if (half === 'back') g.ellipse(x, y, rx, ry, rot, Math.PI, TAU);
    else if (half === 'front') g.ellipse(x, y, rx, ry, rot, 0, Math.PI);
    else g.ellipse(x, y, rx, ry, rot, 0, TAU);
    g.stroke();
    g.restore();
  }
  const clip = (g, x, y, r) => { g.save(); g.beginPath(); g.arc(x, y, r, 0, TAU); g.clip(); };

  const STYLES = {
    lines(g, p, x, y, r, t) {
      ring(g, x, y, r * 1.6, r * 0.34, -0.22, 'rgba(225,220,255,.32)', Math.max(1, r * 0.02), 'back');
      glow(g, x, y, r, p.glow, 0.28);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      g.lineWidth = Math.max(0.6, r * 0.012);
      for (let i = -6; i <= 6; i++) {
        const yy = y + i * r * 0.15 + Math.sin(t * 0.35 + i) * r * 0.012;
        const hi = (Math.floor(t * 0.4) % 13) - 6 === i;
        g.strokeStyle = hi ? 'rgba(255,255,255,.55)' : 'rgba(255,255,255,.17)';
        g.beginPath(); g.moveTo(x - r, yy); g.lineTo(x + r, yy); g.stroke();
      }
      g.restore();
      shade(g, x, y, r, 1);
      ring(g, x, y, r * 1.6, r * 0.34, -0.22, 'rgba(225,220,255,.45)', Math.max(1, r * 0.02), 'front');
    },
    essence(g, p, x, y, r, t) {
      glow(g, x, y, r, p.glow, 0.45, 2.1);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      g.globalCompositeOperation = 'lighter';
      const cols = ['#ff8fd8', '#9d7bff', '#7fd8ff', '#ffd1f0'];
      for (let i = 0; i < 4; i++) {
        const a = t * 0.22 + i * TAU / 4;
        const bx = x + Math.cos(a) * r * 0.38, by = y + Math.sin(a * 1.3) * r * 0.32;
        const gr = g.createRadialGradient(bx, by, 0, bx, by, r * 0.62);
        gr.addColorStop(0, hexA(cols[i], 0.33)); gr.addColorStop(1, hexA(cols[i], 0));
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      g.globalCompositeOperation = 'source-over';
      g.restore();
      shade(g, x, y, r, 0.9);
    },
    details(g, p, x, y, r, t) {
      const moons = [0, 1, 2].map((i) => {
        const a = t * (0.35 + i * 0.17) + i * 2.1;
        const R = r * (1.55 + i * 0.32);
        return { x: x + Math.cos(a) * R, y: y + Math.sin(a) * R * 0.38, z: Math.sin(a), s: r * (0.13 + i * 0.03) };
      });
      const moon = (m) => { sphere(g, m.x, m.y, m.s, '#fff4ea', '#b98c8c'); shade(g, m.x, m.y, m.s, 0.8); };
      moons.filter((m) => m.z < 0).forEach(moon);
      glow(g, x, y, r, p.glow, 0.3);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      const rr = rng(3);
      for (let i = 0; i < 46; i++) {
        const a = rr() * TAU, d = Math.sqrt(rr()) * r;
        g.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,.28)' : 'rgba(120,50,70,.22)';
        g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.025 + rr() * 0.05), 0, TAU); g.fill();
      }
      g.restore();
      shade(g, x, y, r, 1);
      moons.filter((m) => m.z >= 0).forEach(moon);
    },
    horizon(g, p, x, y, r, t) {
      const rot = -0.35;
      [0.11, 0.07, 0.04].forEach((a, i) => ring(g, x, y, r * (1.75 + i * 0.22), r * (0.46 + i * 0.06), rot, `rgba(170,240,245,${a * 3})`, r * 0.07, 'back'));
      glow(g, x, y, r, p.glow, 0.3);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      for (let i = 0; i < 9; i++) {
        const yy = y - r + i * r * 0.24 + Math.sin(t * 0.25 + i * 1.7) * r * 0.03;
        g.fillStyle = i % 2 ? 'rgba(255,255,255,.07)' : 'rgba(10,40,70,.16)';
        g.fillRect(x - r, yy, r * 2, r * 0.12);
      }
      const hy = y + r * 0.12 + Math.sin(t * 0.3) * r * 0.02;
      const hg = g.createLinearGradient(0, hy - r * 0.08, 0, hy + r * 0.08);
      hg.addColorStop(0, 'rgba(255,220,170,0)'); hg.addColorStop(0.5, 'rgba(255,220,170,.4)'); hg.addColorStop(1, 'rgba(255,220,170,0)');
      g.fillStyle = hg; g.fillRect(x - r, hy - r * 0.08, r * 2, r * 0.16);
      g.restore();
      shade(g, x, y, r, 1);
      [0.11, 0.07, 0.04].forEach((a, i) => ring(g, x, y, r * (1.75 + i * 0.22), r * (0.46 + i * 0.06), rot, `rgba(170,240,245,${a * 3.6})`, r * 0.07, 'front'));
    },
    counter(g, p, x, y, r, t) {
      glow(g, x, y, r, p.glow, 0.22);
      clip(g, x, y, r);
      g.fillStyle = p.c2; g.fillRect(x - r, y - r, r * 2, r * 2);
      g.save();
      g.translate(x, y); g.rotate(t * 0.07 + 0.6);
      const lg = g.createLinearGradient(0, 0, r, 0);
      lg.addColorStop(0, '#f6f6fb'); lg.addColorStop(1, '#a9adc2');
      g.fillStyle = lg; g.fillRect(0, -r, r, r * 2);
      g.strokeStyle = 'rgba(160,140,246,.9)'; g.lineWidth = Math.max(1, r * 0.025);
      g.beginPath(); g.moveTo(0, -r); g.lineTo(0, r); g.stroke();
      g.restore();
      g.restore();
      shade(g, x, y, r, 0.75);
      g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 1;
      g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke();
    },
    refuge(g, p, x, y, r, t) {
      glow(g, x, y, r, p.glow, 0.42, 2.3);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      for (let i = 0; i < 6; i++) {
        const yy = y - r * 0.8 + i * r * 0.32;
        const off = ((t * r * 0.03 * (i % 2 ? 1 : -0.7) + i * r * 0.5) % (r * 2.4)) - r * 1.2;
        g.fillStyle = 'rgba(255,255,255,.11)';
        g.beginPath(); g.ellipse(x + off, yy, r * 0.75, r * 0.09, 0, 0, TAU); g.fill();
        g.beginPath(); g.ellipse(x + off - r * 1.2, yy + r * 0.05, r * 0.5, r * 0.07, 0, 0, TAU); g.fill();
      }
      g.restore();
      shade(g, x, y, r, 0.85);
      const at = g.createRadialGradient(x, y, r * 0.92, x, y, r * 1.12);
      at.addColorStop(0, 'rgba(180,205,255,.35)'); at.addColorStop(1, 'rgba(180,205,255,0)');
      g.fillStyle = at; g.beginPath(); g.arc(x, y, r * 1.12, 0, TAU); g.fill();
    },
    chaos(g, p, x, y, r, t) {
      glow(g, x, y, r, p.glow, 0.32);
      const cols = ['#f7a8cc', '#ffd27a', '#a08cf6', '#8fe3cf', '#f58f9a', '#c9a6ff'];
      clip(g, x, y, r);
      g.fillStyle = '#5b2a7a'; g.fillRect(x - r, y - r, r * 2, r * 2);
      const bh = r * 0.24;
      for (let i = -1; i < 10; i++) {
        g.fillStyle = cols[(i + 6) % cols.length];
        const y0 = y - r + i * bh;
        g.beginPath(); g.moveTo(x - r, y0 + bh);
        for (let k = 0; k <= 12; k++) {
          const xx = x - r + (k / 12) * r * 2;
          g.lineTo(xx, y0 + Math.sin(k * 0.9 + t * 0.6 + i) * r * 0.05);
        }
        g.lineTo(x + r, y0 + bh); g.closePath(); g.fill();
      }
      g.restore();
      shade(g, x, y, r, 0.95);
      const rr = rng(11);
      for (let i = 0; i < 16; i++) {
        const a = t * (0.2 + rr() * 0.4) + rr() * TAU;
        const R = r * (1.25 + rr() * 0.7);
        const cx = x + Math.cos(a) * R, cy = y + Math.sin(a) * R * 0.85;
        g.save(); g.translate(cx, cy); g.rotate(t * 2 + i);
        g.fillStyle = cols[i % cols.length];
        const s = r * 0.05;
        g.fillRect(-s, -s * 0.5, s * 2, s);
        g.restore();
      }
    },
    sonder(g, p, x, y, r, t) {
      glow(g, x, y, r, p.glow, 0.18, 2.0);
      sphere(g, x, y, r, p.c1, p.c2);
      clip(g, x, y, r);
      const rr = rng(21);
      for (let i = 0; i < 90; i++) {
        const a = rr() * TAU, d = Math.sqrt(rr()) * r * 0.97;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.5 + rr() * 1.5) + rr() * 9));
        g.fillStyle = `rgba(255,217,160,${(0.25 + 0.7 * tw).toFixed(3)})`;
        g.beginPath(); g.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.01 + rr() * 0.02), 0, TAU); g.fill();
      }
      g.restore();
      shade(g, x, y, r, 0.7);
      g.strokeStyle = 'rgba(255,217,160,.55)'; g.lineWidth = Math.max(1, r * 0.03);
      g.beginPath(); g.arc(x, y, r * 0.99, Math.PI * 0.95, Math.PI * 1.6); g.stroke();
    }
  };
  U.drawPlanet = (g, p, x, y, r, t) => (STYLES[p.style] || STYLES.lines)(g, p, x, y, r, t);

  /* Miniaturas animadas para los foros */
  U.hydrateThumbs = (root) => {
    SU.$$('canvas[data-thumb]', root).forEach((c) => {
      if (c._ok) return;
      c._ok = true;
      const size = +c.dataset.size || 120;
      const d = Math.min(2, window.devicePixelRatio || 1);
      c.width = size * d; c.height = size * d;
      c.style.width = size + 'px'; c.style.height = size + 'px';
      c._p = SU.planet(c.dataset.thumb);
      c._d = d; c._size = size;
      thumbs.add(c);
      drawThumb(c, U.t);
    });
  };
  function drawThumb(c, t) {
    const g = c.getContext('2d');
    g.setTransform(c._d, 0, 0, c._d, 0, 0);
    g.clearRect(0, 0, c._size, c._size);
    U.drawPlanet(g, c._p, c._size / 2, c._size / 2, c._size * 0.21, t);
  }

  /* ---------- cámara ---------- */
  function fit() {
    const z = SU.clamp(Math.min(W, H) / 3100, zMin(), 1);
    U.cam = { x: -100, y: 0, z };
  }
  function zoomAt(sx, sy, f) {
    const [wx, wy] = toWorld(sx, sy);
    const nz = SU.clamp(U.cam.z * f, zMin(), zMax());
    U.cam.z = nz;
    U.cam.x = wx - (sx - W / 2) / nz;
    U.cam.y = wy - (sy - H / 2) / nz;
    clampCam();
  }
  function clampCam() {
    // el centro de la pantalla nunca se aleja más allá del borde de la galaxia
    // límites de la galaxia (con un margen): la vista nunca se sale de ellos
    const X0 = -1700, X1 = 1500, Y0 = -1400, Y1 = 1400;
    const hw = W / 2 / U.cam.z, hh = H / 2 / U.cam.z;
    U.cam.x = (X1 - X0) / 2 <= hw ? (X0 + X1) / 2 : SU.clamp(U.cam.x, X0 + hw, X1 - hw);
    U.cam.y = (Y1 - Y0) / 2 <= hh ? (Y0 + Y1) / 2 : SU.clamp(U.cam.y, Y0 + hh, Y1 - hh);
  }
  function animateTo(x, y, z, dur) {
    if (reduce()) { U.cam = { x, y, z }; persist(); return; }
    tween = { from: Object.assign({}, U.cam), to: { x, y, z }, t0: performance.now(), dur: dur || 650 };
  }
  function persist() {
    clearTimeout(saveT);
    saveT = setTimeout(() => { S().universe = { x: U.cam.x, y: U.cam.y, z: U.cam.z }; SU.store.save(); }, 300);
  }

  /* ---------- entrada del usuario ---------- */
  function hit(sx, sy) {
    const [wx, wy] = toWorld(sx, sy);
    let best = null, bd = Infinity;
    SU.data.planets.forEach((p) => {
      const d = Math.hypot(wx - p.x, wy - p.y);
      const lim = Math.max(p.r * 1.2, 30 / U.cam.z);
      if (d < lim && d < bd) { bd = d; best = { kind: 'planet', p }; }
    });
    if (!best) {
      const d = Math.hypot(wx, wy);
      if (d < Math.max(70, 34 / U.cam.z)) best = { kind: 'origin' };
    }
    return best;
  }

  function onTap(x, y) {
    const now = performance.now();
    const h = hit(x, y);
    if (lastTap && now - lastTap.t < 320 && Math.hypot(x - lastTap.x, y - lastTap.y) < 34) {
      lastTap = null;
      // doble toque: acercarse
      if (h && h.kind === 'planet') {
        animateTo(h.p.x, h.p.y + h.p.r * 0.4, SU.clamp(Math.max(U.cam.z * 1.8, Math.min(W, H) / (h.p.r * 6)), zMin(), zMax()));
      } else {
        const [wx, wy] = toWorld(x, y);
        const nz = SU.clamp(U.cam.z * 2, zMin(), zMax());
        animateTo(wx - (x - W / 2) / nz, wy - (y - H / 2) / nz, nz);
      }
      return;
    }
    lastTap = { t: now, x, y };
    if (h && h.kind === 'planet') select(h.p.id);
    else if (h && h.kind === 'origin') tapOrigin();
    else select(null);
  }

  function bind() {
    cv.addEventListener('pointerdown', (e) => {
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* nada */ }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      tween = null; vel = { x: 0, y: 0 };
      hideHelpSoon();
      if (pointers.size === 1) {
        drag = { sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, t: performance.now(), lt: performance.now(), moved: false };
        pinch = null;
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 };
        if (drag) drag.moved = true;
      }
    });
    cv.addEventListener('pointermove', (e) => {
      if (!pointers.has(e.pointerId)) {
        if (e.pointerType === 'mouse') cv.style.cursor = hit(e.clientX, e.clientY) ? 'pointer' : 'grab';
        return;
      }
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size >= 2 && pinch) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        U.cam.x -= (mx - pinch.mx) / U.cam.z;
        U.cam.y -= (my - pinch.my) / U.cam.z;
        if (pinch.d > 0) zoomAt(mx, my, d / pinch.d);
        pinch.d = d; pinch.mx = mx; pinch.my = my;
        persist();
      } else if (drag) {
        const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
        if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 7) drag.moved = true;
        if (drag.moved) {
          U.cam.x -= dx / U.cam.z; U.cam.y -= dy / U.cam.z; clampCam();
          const now = performance.now(), dt = Math.max(1, now - drag.lt);
          vel = { x: (dx / dt) * 16, y: (dy / dt) * 16 };
          drag.lt = now;
          cv.style.cursor = 'grabbing';
          persist();
        }
        drag.lx = e.clientX; drag.ly = e.clientY;
      }
    });
    const up = (e) => {
      if (!pointers.has(e.pointerId)) return;
      pointers.delete(e.pointerId);
      if (pointers.size === 1) {
        // terminó el pellizco: continuar arrastre con el dedo restante sin tocar planetas
        const [a] = [...pointers.values()];
        drag = { sx: a.x, sy: a.y, lx: a.x, ly: a.y, t: performance.now(), lt: performance.now(), moved: true };
        pinch = null; vel = { x: 0, y: 0 };
        return;
      }
      if (pointers.size === 0 && drag) {
        const dt = performance.now() - drag.t;
        if (!drag.moved && dt < 400 && e.type !== 'pointercancel') onTap(e.clientX, e.clientY);
        else if (performance.now() - drag.lt > 80 || reduce()) vel = { x: 0, y: 0 };
        drag = null;
        cv.style.cursor = 'grab';
      }
    };
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', up);
    cv.addEventListener('wheel', (e) => {
      e.preventDefault();
      tween = null;
      const k = e.ctrlKey ? 0.01 : 0.0016;
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * k));
      persist();
      hideHelpSoon();
    }, { passive: false });
    const layer = $('#universe');
    const stop = (e) => { if (U.active && !SU.nav.universeCovered()) e.preventDefault(); };
    ['gesturestart', 'gesturechange', 'gestureend'].forEach((ev) => document.addEventListener(ev, stop, { passive: false }));
    layer.addEventListener('touchmove', (e) => { if (e.touches.length > 1 || e.target === cv) stop(e); }, { passive: false });
    cv.addEventListener('touchstart', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });
    window.addEventListener('resize', () => { if (U.active) resize(); });
    layer.addEventListener('dblclick', (e) => e.preventDefault());
    if (window.visualViewport) window.visualViewport.addEventListener('resize', () => { if (U.active) resize(); });
    document.addEventListener('keydown', (e) => {
      if (!U.active || SU.nav.universeCovered()) return;
      if (e.key === '+' || e.key === '=') { zoomAt(W / 2, H / 2, 1.25); persist(); }
      if (e.key === '-') { zoomAt(W / 2, H / 2, 0.8); persist(); }
    });
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth || window.innerWidth;
    H = cv.clientHeight || window.innerHeight;
    cv.width = Math.round(W * dpr);
    cv.height = Math.round(H * dpr);
  }

  /* ---------- bucle ---------- */
  function frame(ts) {
    U.t = ts / 1000;
    if (!U.active) { raf = null; return; }
    raf = requestAnimationFrame(frame);
    if (SU.nav.universeCovered()) {
      // solo animar miniaturas visibles
      thumbs.forEach((c) => { if (!document.body.contains(c)) thumbs.delete(c); else if (!reduce()) drawThumb(c, U.t); });
      return;
    }
    // física
    if (tween) {
      const k = SU.clamp((ts - tween.t0) / tween.dur, 0, 1);
      const e = ease(k);
      U.cam.x = tween.from.x + (tween.to.x - tween.from.x) * e;
      U.cam.y = tween.from.y + (tween.to.y - tween.from.y) * e;
      U.cam.z = Math.exp(Math.log(tween.from.z) + (Math.log(tween.to.z) - Math.log(tween.from.z)) * e);
      if (k >= 1) { tween = null; persist(); }
    } else if (!drag && (Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05)) {
      U.cam.x -= vel.x / U.cam.z; U.cam.y -= vel.y / U.cam.z;
      vel.x *= 0.93; vel.y *= 0.93;
      clampCam(); persist();
    }
    draw(U.t);
  }

  function draw(t) {
    const g = ctx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bg = g.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#070916'); bg.addColorStop(1, '#0c0f22');
    g.fillStyle = bg; g.fillRect(0, 0, W, H);
    const z = U.cam.z;

    // nebulosa (parallax suave)
    if (nebula) {
      const nz = Math.pow(z, 0.7), f = 0.7;
      const size = 5600 * nz;
      const cx = W / 2 - U.cam.x * f * nz, cy = H / 2 - U.cam.y * f * nz;
      g.globalAlpha = 0.85;
      g.drawImage(nebula, cx - size / 2, cy - size / 2, size, size);
      g.globalAlpha = 1;
    }

    // estrellas en capas
    const amb = ambient() && !reduce();
    stars.forEach((L) => {
      const ze = Math.pow(z, L.f);
      const ts = L.T * ze;
      const ox = ((W / 2 - U.cam.x * L.f * ze) % ts + ts) % ts;
      const oy = ((H / 2 - U.cam.y * L.f * ze) % ts + ts) % ts;
      for (let tx = ox - ts; tx < W; tx += ts) {
        for (let ty = oy - ts; ty < H; ty += ts) {
          for (let i = 0; i < L.list.length; i++) {
            const s = L.list[i];
            const x = tx + s.x * ze, y = ty + s.y * ze;
            if (x < -3 || y < -3 || x > W + 3 || y > H + 3) continue;
            const a = amb ? 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph)) : 0.75;
            const rad = s.s * (0.75 + 0.35 * ze);
            g.fillStyle = `rgba(${s.c},${(a * (0.45 + L.f * 0.55)).toFixed(3)})`;
            if (rad < 1.1) g.fillRect(x - rad / 2, y - rad / 2, rad, rad);
            else { g.beginPath(); g.arc(x, y, rad / 2, 0, TAU); g.fill(); }
          }
        }
      }
    });

    // estrellas fugaces (efecto ambiental opcional)
    if (amb) {
      if (Math.random() < 0.004 && shooting.length < 2) {
        shooting.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vx: 6 + Math.random() * 4, vy: 2 + Math.random() * 2, life: 1 });
      }
      shooting = shooting.filter((s) => s.life > 0);
      shooting.forEach((s) => {
        const gr = g.createLinearGradient(s.x, s.y, s.x - s.vx * 12, s.y - s.vy * 12);
        gr.addColorStop(0, `rgba(255,240,220,${0.8 * s.life})`); gr.addColorStop(1, 'rgba(255,240,220,0)');
        g.strokeStyle = gr; g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 12, s.y - s.vy * 12); g.stroke();
        s.x += s.vx; s.y += s.vy; s.life -= 0.018;
      });
    }

    const frags = S().forum.fragments;
    const nFrag = Object.keys(frags).length;
    const [ox, oy] = toScreen(0, 0);

    // constelación: líneas desde el centro hacia los mundos visitados
    SU.data.planets.forEach((p) => {
      if (!frags[p.id]) return;
      const [px, py] = toScreen(p.x, p.y);
      const gr = g.createLinearGradient(ox, oy, px, py);
      gr.addColorStop(0, 'rgba(255,226,176,.55)'); gr.addColorStop(1, hexA(p.glow, 0.25));
      g.strokeStyle = gr; g.lineWidth = 1.2;
      g.setLineDash([2, 7]); g.lineDashOffset = -t * 8;
      g.beginPath(); g.moveTo(ox, oy); g.lineTo(px, py); g.stroke();
      g.setLineDash([]);
    });

    // el origen
    drawOrigin(g, ox, oy, nFrag, t, z);

    // planetas
    SU.data.planets.forEach((p) => {
      const [x, y] = toScreen(p.x, p.y);
      const r = p.r * z;
      const m = r * 2.3 + 40;
      if (x < -m || y < -m || x > W + m || y > H + m) return;
      U.drawPlanet(g, p, x, y, r, reduce() ? 0 : t);
      if (U.sel === p.id) {
        g.save();
        g.strokeStyle = hexA(p.glow, 0.85); g.lineWidth = 1.5;
        g.setLineDash([4, 6]); g.lineDashOffset = -t * 12;
        g.beginPath(); g.arc(x, y, r * 1.28 + 8, 0, TAU); g.stroke();
        g.restore();
      }
      // indicador de respuestas nuevas
      if (SU.forums && SU.forums.planetUnread(p.id)) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 4);
        g.fillStyle = `rgba(242,165,180,${pulse})`;
        g.beginPath(); g.arc(x + r * 0.78, y - r * 0.78, Math.max(4, r * 0.08), 0, TAU); g.fill();
      }
      // nombre
      const fs = SU.clamp(11 + z * 16, 12, 26);
      g.font = `600 ${fs}px "Cormorant Garamond", Georgia, serif`;
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillStyle = 'rgba(244,239,231,.92)';
      g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 8;
      g.fillText(p.name, x, y + r * (p.style === 'horizon' || p.style === 'lines' ? 1.1 : 1.2) + 8);
      if (z > 0.55) {
        g.font = `500 ${SU.clamp(fs * 0.5, 10, 13)}px Manrope, system-ui, sans-serif`;
        g.fillStyle = 'rgba(155,161,182,.9)';
        g.fillText(p.concept, x, y + r * 1.2 + 10 + fs);
      }
      g.shadowBlur = 0;
    });
  }

  function drawOrigin(g, x, y, n, t, z) {
    const k = n / 8;
    const done = n >= 8;
    const pulse = 0.5 + 0.5 * Math.sin(t * (done ? 2.2 : 1.2));
    const base = (8 + 26 * k) * Math.max(0.6, Math.sqrt(z * 2));
    const gr = g.createRadialGradient(x, y, 0, x, y, base * (2.2 + pulse * 0.6));
    gr.addColorStop(0, `rgba(255,236,200,${0.25 + 0.6 * k})`);
    gr.addColorStop(0.3, `rgba(255,214,160,${0.08 + 0.3 * k})`);
    gr.addColorStop(1, 'rgba(255,214,160,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(x, y, base * 3, 0, TAU); g.fill();
    g.fillStyle = `rgba(255,248,232,${0.35 + 0.65 * k})`;
    g.beginPath(); g.arc(x, y, 1.6 + 3.2 * k, 0, TAU); g.fill();
    if (k > 0) {
      g.strokeStyle = `rgba(255,236,200,${0.25 + 0.5 * k})`; g.lineWidth = 1;
      const L = (6 + 14 * k) * (0.9 + pulse * 0.2);
      g.beginPath(); g.moveTo(x - L, y); g.lineTo(x + L, y); g.moveTo(x, y - L); g.lineTo(x, y + L); g.stroke();
    }
    if (done) {
      g.strokeStyle = `rgba(255,226,176,${0.3 + 0.4 * pulse})`; g.lineWidth = 1.2;
      g.beginPath(); g.arc(x, y, base * 1.6 + pulse * 6, 0, TAU); g.stroke();
      g.font = `600 ${SU.clamp(13 + z * 10, 14, 22)}px "Cormorant Garamond", Georgia, serif`;
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.fillStyle = 'rgba(255,236,200,.95)';
      g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 8;
      g.fillText('El origen', x, y + base * 1.6 + 14);
      g.shadowBlur = 0;
    }
  }

  /* ---------- interfaz sobre el mapa ---------- */
  function renderUI() {
    const ui = $('#u-ui');
    const touch = SU.isTouch();
    ui.innerHTML = `
      <button class="u-back" data-act="exitUniverse" aria-label="Volver a la red social">${SU.icon('back', 'sm')}<span>sonder<span class="dot">.</span></span></button>
      <div class="u-top-right">
        <button class="u-chip u-frag" data-act="fragInfo" aria-label="Progreso">${SU.icon('sparkle', 'xs')}<span class="u-frag-n"></span></button>
        <button class="u-round" data-act="uFit" aria-label="Ver todo el universo">${SU.icon('target', 'sm')}</button>
        <button class="u-round" data-act="uHelp" aria-label="Ayuda">${SU.icon('help', 'sm')}</button>
      </div>
      <div class="u-help">${touch ? 'Arrastra para moverte · Pellizca para acercar o alejar · Toca un planeta' : 'Arrastra para moverte · Rueda del ratón para acercar · Clic en un planeta'}</div>
      <div class="u-card" aria-live="polite"></div>`;
    updateFrag();
  }
  function updateFrag() {
    const el = $('.u-frag-n');
    if (el) el.textContent = Object.keys(S().forum.fragments).length + '/8';
  }
  U.updateFrag = updateFrag;
  let helpT = null;
  function showHelp() {
    const h = $('.u-help');
    if (!h) return;
    h.classList.add('on');
    clearTimeout(helpT);
    helpT = setTimeout(() => h.classList.remove('on'), 6500);
  }
  function hideHelpSoon() {
    const h = $('.u-help');
    if (h && h.classList.contains('on')) { clearTimeout(helpT); helpT = setTimeout(() => h.classList.remove('on'), 1800); }
  }

  function select(id) {
    U.sel = id;
    const card = $('.u-card');
    if (!card) return;
    if (!id) { card.classList.remove('on'); return; }
    const p = SU.planet(id);
    const visited = S().forum.visited[id];
    card.style.setProperty('--pc', p.glow);
    card.innerHTML = `<button class="u-card-x" data-act="uDeselect" aria-label="Cerrar">${SU.icon('close', 'sm')}</button>
      <div class="u-card-row"><canvas data-thumb="${p.id}" data-size="76"></canvas>
      <div class="grow"><div class="u-card-name">${SU.esc(p.name)}</div><div class="u-card-concept">${SU.esc(p.concept)}</div></div></div>
      <p class="u-card-desc">${SU.esc(p.desc)}</p>
      <div class="u-card-foot"><span class="u-card-accs">${p.accounts.map((a) => SU.avatar(a, 26)).join('')}</span>
      <button class="btn u-enter" data-act="enterPlanet" data-id="${p.id}">${visited ? 'Volver a entrar' : 'Entrar al planeta'}</button></div>`;
    SU.hydrate(card);
    card.classList.remove('on');
    void card.offsetWidth;
    card.classList.add('on');
  }
  U.select = select;

  function tapOrigin() {
    const n = Object.keys(S().forum.fragments).length;
    select(null);
    if (n >= 8) { SU.origin.open(); return; }
    SU.modal({
      title: 'Una luz muy pequeña',
      body: `<p>Está justo en el centro del mapa. Brilla un poco más con cada mundo que visitas.</p><p class="dim">Mundos visitados: ${n} de 8.</p>`
    });
  }

  /* ---------- abrir / cerrar ---------- */
  U.open = () => {
    if (U.active) return;
    const lay = $('#universe');
    lay.classList.remove('hidden');
    U.active = true;
    resize();
    const saved = S().universe;
    if (saved && isFinite(saved.z)) U.cam = { x: saved.x, y: saved.y, z: SU.clamp(saved.z, zMin(), zMax()) };
    else fit();
    clampCam();
    renderUI();
    requestAnimationFrame(() => lay.classList.add('in'));
    if (!raf) raf = requestAnimationFrame(frame);
    SU.nav.push({ layer: 'universe-root', onClose: U.close });
    if (!S().flags.uIntro) intro(); else showHelp();
    document.title = 'Sonder Universe';
  };
  U.close = () => {
    const lay = $('#universe');
    U.active = false;
    S().universe = { x: U.cam.x, y: U.cam.y, z: U.cam.z };
    SU.store.save();
    lay.classList.remove('in');
    setTimeout(() => { if (!U.active) lay.classList.add('hidden'); }, 450);
    document.title = 'sonder.';
  };
  U.exit = () => {
    const i = SU.nav.stack.findIndex((e) => e.layer === 'universe-root');
    if (i >= 0) SU.nav.popTo(i);
  };
  U.screenPos = (id) => { const p = SU.planet(id); return toScreen(p.x, p.y); };

  function intro() {
    const box = document.createElement('div');
    box.className = 'u-intro';
    box.innerHTML = `<div class="u-intro-card">
      <div class="u-intro-kicker">Sonder Universe</div>
      <h2>Ocho mundos.<br>Ninguno te dice quién eres.</h2>
      <p>Cada planeta es un espacio distinto, con su propio foro y sus propias cuentas. Tú decides qué quieres compartir en cada uno.</p>
      <ul>
        <li>${SU.icon('planet', 'sm')} ${SU.isTouch() ? 'Toca un planeta para verlo.' : 'Haz clic en un planeta para verlo.'}</li>
        <li>${SU.icon('target', 'sm')} ${SU.isTouch() ? 'Pellizca para alejarte o acercarte. Doble toque para acercarte rápido.' : 'Usa la rueda del ratón para acercarte o alejarte.'}</li>
        <li>${SU.icon('sparkle', 'sm')} Hay algo más, pero eso se descubre caminando.</li>
      </ul>
      <button class="btn btn-primary btn-block">Comenzar a explorar</button></div>`;
    $('#u-ui').appendChild(box);
    requestAnimationFrame(() => box.classList.add('in'));
    box.querySelector('button').addEventListener('click', () => {
      S().flags.uIntro = Date.now(); SU.store.save();
      box.classList.remove('in');
      setTimeout(() => box.remove(), 400);
      showHelp();
    });
  }

  /* ---------- acciones ---------- */
  SU.actions.exitUniverse = () => U.exit();
  SU.actions.uDeselect = () => select(null);
  SU.actions.uHelp = () => showHelp();
  SU.actions.uFit = () => { const z = SU.clamp(Math.min(W, H) / 3100, zMin(), 1); animateTo(-100, 0, z, 800); };
  SU.actions.fragInfo = () => {
    const n = Object.keys(S().forum.fragments).length;
    SU.modal({
      title: n >= 8 ? 'El mapa está completo' : 'Mundos visitados',
      body: n >= 8 ? '<p>Las ocho líneas están encendidas. En el centro del mapa hay algo esperándote.</p>'
        : `<p>Cada vez que entras a un planeta y lees una de sus discusiones, se enciende una línea en el mapa.</p><p class="dim">${n} de 8 encendidas.</p>`
    });
  };
  SU.actions.enterPlanet = (t) => SU.forums.openPlanet(t.dataset.id);

  U.init = () => {
    cv = $('#u-canvas');
    ctx = cv.getContext('2d');
    genStars();
    genNebula();
    bind();
  };
})(window.SU);
