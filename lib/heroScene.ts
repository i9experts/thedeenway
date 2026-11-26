// The living hero scene: a tree that grows itself (roots and branches), leaves that bloom,
// sparks of light that travel from the roots to the leaves, drifting fireflies, and a
// "light" that follows the visitor's pointer. Pure canvas — no libraries.

type Pt = [number, number];
type Branch = { pts: Pt[]; w: number; t0: number; t1: number; parent: number; root: boolean; drawn: number };
type Leaf = { x: number; y: number; a: number; s: number; t: number; glow: number; gold: boolean };
type Route = { pts: Pt[]; cum: number[]; total: number };
type Pulse = { root: Route; tip: Route; leaf: number; d: number; speed: number; wait: number };
type Fly = { x: number; y: number; vx: number; vy: number; r: number; ph: number };

export type HeroScene = { destroy(): void; light(): { x: number; y: number }; setImage(src: string): void };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeRoute(pts: Pt[]): Route {
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, cum, total: cum[cum.length - 1] };
}

function at(r: Route, d: number): Pt {
  if (d <= 0) return r.pts[0];
  if (d >= r.total) return r.pts[r.pts.length - 1];
  let i = 1;
  while (r.cum[i] < d) i++;
  const f = (d - r.cum[i - 1]) / (r.cum[i] - r.cum[i - 1] || 1);
  return [r.pts[i - 1][0] + (r.pts[i][0] - r.pts[i - 1][0]) * f, r.pts[i - 1][1] + (r.pts[i][1] - r.pts[i - 1][1]) * f];
}

function glowSprite(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, color);
  grad.addColorStop(0.25, color.replace(/[\d.]+\)$/, "0.55)"));
  grad.addColorStop(1, color.replace(/[\d.]+\)$/, "0)"));
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return c;
}

export function startHeroScene(section: HTMLElement, canvas: HTMLCanvasElement, lit: HTMLCanvasElement, opts: { rtl: boolean; reduced: boolean }): HeroScene {
  const ctx = canvas.getContext("2d");
  const cache = document.createElement("canvas");
  const cctx = cache.getContext("2d");
  const light = { x: 0, y: 0, tx: 0, ty: 0, last: -1e9 };
  const lctx = lit.getContext("2d");
  const buf = document.createElement("canvas");
  const bctx = buf.getContext("2d");
  if (!ctx || !cctx || !lctx || !bctx) return { destroy() {}, light: () => light, setImage() {} };

  // The colour photo, revealed only inside the visitor's light.
  const images = new Map<string, HTMLImageElement>();
  let photo: HTMLImageElement | null = null;
  let R = 240;
  const mask = document.createElement("canvas");
  mask.width = mask.height = 256;
  {
    const m = mask.getContext("2d")!;
    const g = m.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.3, "rgba(0,0,0,1)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    m.fillStyle = g;
    m.fillRect(0, 0, 256, 256);
  }
  function drawLit() {
    lctx!.clearRect(0, 0, w, h);
    if (!photo || !photo.complete || !photo.naturalWidth) return;
    const scale = Math.max(w / photo.naturalWidth, h / photo.naturalHeight);
    const iw = photo.naturalWidth * scale, ih = photo.naturalHeight * scale;
    const x0 = Math.round(light.x - R), y0 = Math.round(light.y - R);
    bctx!.globalCompositeOperation = "source-over";
    bctx!.clearRect(0, 0, R * 2, R * 2);
    bctx!.drawImage(photo, (w - iw) / 2 - x0, (h - ih) / 2 - y0, iw, ih);
    bctx!.globalCompositeOperation = "destination-in";
    bctx!.drawImage(mask, 0, 0, R * 2, R * 2);
    lctx!.drawImage(buf, x0, y0, R * 2, R * 2);
  }

  const gold = glowSprite("rgba(255,226,140,1)");
  const lime = glowSprite("rgba(190,235,120,1)");

  let w = 0, h = 0, dpr = 1, S = 100;
  let base = { x: 0, y: 0 };
  let branches: Branch[] = [];
  let leaves: Leaf[] = [];
  let rootRoutes: Route[] = [];
  let tipRoutes: Route[] = [];
  let pulses: Pulse[] = [];
  let flies: Fly[] = [];
  let growEnd = 0;
  let t0 = performance.now();
  let raf = 0;
  let visible = true;
  let destroyed = false;

  function build() {
    const rect = section.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    R = Math.round(Math.max(150, Math.min(340, w * 0.24)));
    buf.width = buf.height = Math.round(R * 2 * dpr);
    bctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx!.setTransform(1, 0, 0, 1, 0, 0);
    for (const c of [canvas, cache, lit]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
    }
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    cctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    lctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    const desktop = w >= 1024;
    const fx = desktop ? 0.76 : 0.8;
    base = { x: (opts.rtl ? 1 - fx : fx) * w, y: h * (desktop ? 0.64 : 0.3) };
    S = Math.min(w, h) * (desktop ? 0.175 : 0.14);

    const rng = mulberry32(11);
    const speed = S * 1.12;
    branches = [];
    leaves = [];
    const tips: number[] = [];
    const rootTips: number[] = [];

    const grow = (x: number, y: number, ang: number, len: number, width: number, depth: number, root: boolean, start: number, parent: number) => {
      const pts: Pt[] = [[x, y]];
      const n = 6;
      let a = ang;
      const bend = (rng() - 0.5) * 0.7;
      for (let i = 0; i < n; i++) {
        a += bend / n + (root ? 0 : (-Math.PI / 2 - a) * 0.035);
        x += (Math.cos(a) * len) / n;
        y += (Math.sin(a) * len) / n;
        pts.push([x, y]);
      }
      const end = start + len / speed;
      const idx = branches.push({ pts, w: Math.max(0.8, width), t0: start, t1: end, parent, root, drawn: 0 }) - 1;
      growEnd = Math.max(growEnd, end);
      if (depth < (root ? 3 : 5)) {
        const kids = !root && depth === 0 ? 3 : rng() < 0.22 ? 3 : 2;
        for (let k = 0; k < kids; k++) {
          const spread = kids === 3 ? (k - 1) * (0.5 + rng() * 0.2) : (k ? 1 : -1) * (0.3 + rng() * 0.35);
          grow(x, y, a + spread + (rng() - 0.5) * 0.2, len * (0.66 + rng() * 0.14), width * 0.7, depth + 1, root, end, idx);
        }
      } else if (root) {
        rootTips.push(idx);
      } else {
        tips.push(idx);
        leaves.push({ x, y, a, s: S * (0.13 + rng() * 0.08), t: end, glow: 0, gold: false });
      }
    };

    growEnd = 0;
    grow(base.x, base.y, -Math.PI / 2, S, S * 0.055, 0, false, 0.2, -1);
    for (const a of [0.45, 1.05, -0.45, -1.05]) grow(base.x, base.y, Math.PI / 2 + a + (rng() - 0.5) * 0.2, S * 0.5, S * 0.03, 0, true, 0.2, -1);

    // The highest leaf is golden, like the school's tree emblem.
    let top = 0;
    leaves.forEach((l, i) => l.y < leaves[top].y && (top = i));
    if (leaves[top]) {
      leaves[top].gold = true;
      leaves[top].s *= 1.7;
      leaves[top].a = -Math.PI / 2;
    }

    const chain = (idx: number) => {
      const list: Branch[] = [];
      for (let i = idx; i >= 0; i = branches[i].parent) list.unshift(branches[i]);
      return makeRoute(list.flatMap((b, i) => (i ? b.pts.slice(1) : b.pts)));
    };
    tipRoutes = tips.map(chain);
    rootRoutes = rootTips.map(chain);

    const prng = mulberry32(5);
    pulses = Array.from({ length: desktop ? 16 : 8 }, () => newPulse(prng, true));
    flies = Array.from({ length: desktop ? 44 : 20 }, () => ({
      x: prng() * w, y: prng() * h, vx: (prng() - 0.5) * 8, vy: -(6 + prng() * 14), r: 1.5 + prng() * 3.5, ph: prng() * 6.28,
    }));

    cctx!.clearRect(0, 0, w, h);
    light.x = light.tx = base.x;
    light.y = light.ty = base.y - S;
  }

  const prand = mulberry32(99);
  function newPulse(rng: () => number = prand, initial = false): Pulse {
    const leaf = Math.floor(rng() * tipRoutes.length);
    return {
      root: rootRoutes[Math.floor(rng() * rootRoutes.length)],
      tip: tipRoutes[leaf],
      leaf,
      d: 0,
      speed: S * (0.7 + rng() * 0.7),
      wait: initial ? rng() * 4 : rng() * 1.5,
    };
  }

  function drawGrowth(time: number) {
    const c = cctx!;
    c.lineCap = "round";
    c.lineJoin = "round";
    c.shadowBlur = 10;
    for (const b of branches) {
      if (b.drawn >= 1 || time <= b.t0) continue;
      const frac = Math.min(1, (time - b.t0) / (b.t1 - b.t0));
      const n = b.pts.length - 1;
      const pos = (f: number): Pt => {
        const p = Math.min(n - 1e-6, f * n);
        const i = Math.floor(p);
        const k = p - i;
        return [b.pts[i][0] + (b.pts[i + 1][0] - b.pts[i][0]) * k, b.pts[i][1] + (b.pts[i + 1][1] - b.pts[i][1]) * k];
      };
      c.beginPath();
      const s = pos(b.drawn);
      c.moveTo(s[0], s[1]);
      for (let i = Math.floor(b.drawn * n) + 1; i < frac * n; i++) c.lineTo(b.pts[i][0], b.pts[i][1]);
      const e = frac >= 1 ? b.pts[n] : pos(frac);
      c.lineTo(e[0], e[1]);
      c.lineWidth = b.w;
      c.strokeStyle = b.root ? "rgba(214,176,70,0.8)" : "rgba(240,216,140,0.95)";
      c.shadowColor = b.root ? "rgba(201,162,39,0.7)" : "rgba(255,226,140,0.8)";
      c.stroke();
      b.drawn = frac;
    }
    c.shadowBlur = 0;
  }

  function frame(now: number, dt: number) {
    const c = ctx!;
    const time = opts.reduced ? 1e6 : (now - t0) / 1000;

    // The visitor's light: follows the pointer, wanders on its own when idle.
    if (!opts.reduced) {
      if (now - light.last > 2600) {
        const s = now / 1000;
        light.tx = base.x + Math.sin(s * 0.42) * w * 0.2 + Math.sin(s * 0.17) * w * 0.12;
        light.ty = h * 0.45 + Math.sin(s * 0.33 + 1) * h * 0.22;
      }
      light.x += (light.tx - light.x) * 0.09;
      light.y += (light.ty - light.y) * 0.09;
    }
    drawLit();

    drawGrowth(time);
    c.clearRect(0, 0, w, h);

    // Seed glow where the tree meets the ground, and the warm halo of the visitor's light.
    const breathe = 0.75 + Math.sin(now / 900) * 0.25;
    c.globalCompositeOperation = "lighter";
    c.globalAlpha = 0.16;
    c.drawImage(gold, light.x - R * 1.3, light.y - R * 1.3, R * 2.6, R * 2.6);
    c.globalAlpha = 0.5 * breathe * Math.min(1, time / 0.6);
    c.drawImage(gold, base.x - S * 0.9, base.y - S * 0.22, S * 1.8, S * 0.44);
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";

    c.drawImage(cache, 0, 0, w, h);

    // Leaves bloom at the tips, and swell when the light comes near.
    const near_r = Math.max(140, w * 0.16);
    for (const l of leaves) {
      const age = (time - l.t) / 0.7;
      if (age <= 0) continue;
      const p = Math.min(1, age);
      const bloom = 1 + 2.7 * Math.pow(p - 1, 3) + 1.7 * Math.pow(p - 1, 2); // ease-out-back
      const near = Math.max(0, 1 - Math.hypot(l.x - light.x, l.y - light.y) / near_r);
      l.glow = Math.max(0, l.glow - dt * 1.2);
      const k = bloom * (1 + near * 0.35 + l.glow * 0.4);
      const sway = opts.reduced ? 0 : Math.sin(now / 1100 + l.x * 0.05) * 0.08;
      c.save();
      c.translate(l.x, l.y);
      c.rotate(l.a + sway);
      c.scale(k, k);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(l.s * 0.5, -l.s * 0.46, l.s, 0);
      c.quadraticCurveTo(l.s * 0.5, l.s * 0.46, 0, 0);
      c.fillStyle = l.gold ? `rgba(240,205,95,${0.95})` : `rgba(${150 + near * 60 + l.glow * 60},${205 + near * 30},${80 + l.glow * 40},${0.72 + near * 0.2 + l.glow * 0.2})`;
      c.fill();
      c.restore();
      if (l.gold || l.glow > 0.05 || near > 0.5) {
        c.globalCompositeOperation = "lighter";
        c.globalAlpha = l.gold ? 0.55 * breathe : Math.max(l.glow, (near - 0.5) * 0.8) * 0.7;
        const g = l.s * (l.gold ? 3.4 : 2.6);
        c.drawImage(l.gold ? gold : lime, l.x - g / 2 + Math.cos(l.a) * l.s * 0.5, l.y - g / 2 + Math.sin(l.a) * l.s * 0.5, g, g);
        c.globalAlpha = 1;
        c.globalCompositeOperation = "source-over";
      }
    }

    if (opts.reduced) return;

    // Light travelling from the roots up to the leaves.
    c.globalCompositeOperation = "lighter";
    if (time > growEnd) {
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        if (p.wait > 0) {
          p.wait -= dt;
          continue;
        }
        p.d += p.speed * dt;
        const total = p.root.total + p.tip.total;
        if (p.d >= total) {
          if (leaves[p.leaf]) leaves[p.leaf].glow = 1;
          pulses[i] = newPulse();
          continue;
        }
        for (let k = 0; k < 5; k++) {
          const d = p.d - k * 7;
          if (d < 0) break;
          const [x, y] = d < p.root.total ? at(p.root, p.root.total - d) : at(p.tip, d - p.root.total);
          const size = 16 - k * 2.4;
          c.globalAlpha = 0.9 - k * 0.17;
          c.drawImage(gold, x - size / 2, y - size / 2, size, size);
        }
      }
    }

    // Fireflies drift upward and lean toward the light.
    for (const f of flies) {
      const dx = light.x - f.x, dy = light.y - f.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 260) {
        f.vx += (dx / dist) * 22 * dt;
        f.vy += (dy / dist) * 22 * dt;
      }
      f.vx *= 0.99;
      f.vy += (-(8 + f.r * 3) - f.vy) * 0.01;
      f.x += (f.vx + Math.sin(now / 700 + f.ph) * 6) * dt;
      f.y += f.vy * dt;
      if (f.y < -20) { f.y = h + 10; f.x = Math.random() * w; }
      if (f.x < -20) f.x = w + 10;
      if (f.x > w + 20) f.x = -10;
      c.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(now / 500 + f.ph * 3));
      const s = f.r * 4;
      c.drawImage(gold, f.x - s / 2, f.y - s / 2, s, s);
    }
    c.globalAlpha = 1;
    c.globalCompositeOperation = "source-over";
  }

  let last = performance.now();
  function loop(now: number) {
    if (destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (visible && !document.hidden) frame(now, dt);
    raf = requestAnimationFrame(loop);
  }

  const onMove = (e: PointerEvent) => {
    const r = section.getBoundingClientRect();
    light.tx = e.clientX - r.left;
    light.ty = e.clientY - r.top;
    light.last = performance.now();
  };
  let resizeTimer: ReturnType<typeof setTimeout>;
  let lastW = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Phones fire resize when the address bar hides; only rebuild when the width changes.
      if (Math.abs(section.clientWidth - lastW) < 2) return;
      lastW = section.clientWidth;
      build();
      t0 = performance.now() - (growEnd + 1) * 1000; // redraw fully grown
      if (opts.reduced) frame(performance.now(), 0);
    }, 200);
  };
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));

  build();
  lastW = section.clientWidth;
  t0 = performance.now();
  if (opts.reduced) {
    frame(t0, 0);
  } else {
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerdown", onMove, { passive: true });
    io.observe(section);
    raf = requestAnimationFrame(loop);
  }
  window.addEventListener("resize", onResize);

  return {
    light: () => light,
    setImage(src: string) {
      let im = images.get(src);
      if (!im) {
        im = new Image();
        im.decoding = "async";
        im.onload = () => opts.reduced && frame(performance.now(), 0);
        im.src = src;
        images.set(src, im);
      }
      photo = im;
      if (opts.reduced) frame(performance.now(), 0);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      io.disconnect();
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerdown", onMove);
      window.removeEventListener("resize", onResize);
    },
  };
}
