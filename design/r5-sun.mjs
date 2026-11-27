// Round 5, "Подсолнух": the user in the centre, everything else on Vogel's phyllotaxis spiral
// (angle n * 137.508 deg, radius r0 + c * sqrt(n)), so density is even. AI first, then techs by score.
import assert from 'node:assert/strict';
import { F, out, text, measure, mix, icon, iconColor, svg, stack, CAT, CAT_ORDER, header, linkCards, linkRow, pic, r2, me as avatar } from './lib.mjs';

const BG = '#0d1117', TILE = '#161b22', LINE = '#30363d';
const GOLDEN = (137.508 * Math.PI) / 180;
const idx = new Map(stack.map((s, i) => [s, i]));
const order = [
  ...stack.filter((s) => s.tier === 'ai'),
  ...stack.filter((s) => s.tier !== 'ai').sort((a, b) =>
    (b.score ?? 0) - (a.score ?? 0) || CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || idx.get(a) - idx.get(b)),
];
const nAi = stack.filter((s) => s.tier === 'ai').length;

const CSS = `<style>
@keyframes cw{to{transform:rotate(360deg)}}@keyframes ccw{to{transform:rotate(-360deg)}}
.up{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
const SEC = 240;
const upright = `class="up" style="animation:ccw ${SEC}s linear infinite"`;
const panel = (w, h) => `<rect width="${w}" height="${h}" rx="16" fill="${BG}"/><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="15.5" stroke="#21262d"/>`;

// The user. One function so it can become an avatar later.
// The user: GitHub avatar in a ring.
function me(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r + 9}" stroke="#e6edf3" stroke-opacity="0.08"/>` +
    avatar(cx, cy, r) + `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="#e6edf3" stroke-opacity="0.35"/>`;
}

// o: panel w/h, avatar radius, AI disc radius, tech disc radius, icon size ratio, first orbit radius r0.
function build(file, o) {
  const { W, H, meR, aiR, tR, r0 } = o, cx = W / 2, cy = H / 2;
  const rMax = Math.min(W, H) / 2 - o.margin - aiR; // keeps the whole turning spiral inside the panel
  const c = (rMax - r0) / Math.sqrt(order.length - 1);
  const discs = order.map((it, n) => {
    const a = n * GOLDEN, r = r0 + c * Math.sqrt(n);
    return { it, x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r: n < nAi ? aiR : tR, r0: r };
  });
  // No overlaps (2px gap) with each other and with the avatar ring; always inside the panel, at any rotation.
  let min = Infinity;
  discs.forEach((d, i) => {
    assert(d.r0 + d.r <= Math.min(W, H) / 2 - 4, `${file}: disc ${d.it.id} leaves the panel`);
    assert(Math.hypot(d.x - cx, d.y - cy) >= d.r + meR + 9 + 2, `${file}: disc ${d.it.id} hits the avatar`);
    for (const e of discs.slice(i + 1)) {
      const dist = Math.hypot(d.x - e.x, d.y - e.y);
      min = Math.min(min, dist - d.r - e.r);
      assert(dist >= d.r + e.r + 2, `${file}: ${d.it.id} overlaps ${e.it.id} (${r2(dist)} < ${d.r + e.r + 2})`);
    }
  });
  let spiral = `<g style="transform-origin:${cx}px ${cy}px;animation:cw ${SEC}s linear infinite">`;
  discs.forEach(({ it, x, y, r }, n) => {
    let body;
    if (n < nAi) {
      const col = iconColor(it, TILE);
      body = `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${mix(BG, col, 0.16)}" stroke="${col}" stroke-opacity="0.85" stroke-width="1.5"/>` +
        icon(it, x - r * 0.5, y - r * 0.5, Math.round(r), TILE);
    } else {
      const col = CAT[it.cat][0], s = Math.round(r * o.icon);
      body = `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${TILE}" stroke="${mix(BG, col, 0.45)}"/>` +
        icon(it, x - s / 2, y - s / 2, s, TILE);
    }
    spiral += `<g ${upright}>${body}</g>`;
  });
  out(file, svg(W, H, panel(W, H) + spiral + '</g>' + me(cx, cy, meR), CSS));
  return { file, c: r2(c), gap: r2(min) };
}

const res = [
  build('variants/r5d/stack.svg', { W: 840, H: 680, meR: 48, aiR: 31, tR: 20, icon: 1.2, r0: 100, margin: 14 }),
  build('variants/r5d/stack-m.svg', { W: 360, H: 360, meR: 27, aiR: 19, tR: 13, icon: 1.45, r0: 58, margin: 4 }),
];
linkCards('r5d', { bg: TILE, rx: 18, stroke: LINE, fg: '#e6edf3', h: 36 });
out('variants/r5d.md', `<!-- Подсолнух -->\n${header}<div align="center">\n  ${pic('r5d/stack.svg', 'stack')}\n</div>\n\n<br>\n\n${linkRow('r5d')}\n`);
console.log('built r5d |', order.length, 'items |', res.map((r) => `${r.file} c=${r.c} min gap=${r.gap}`).join(' | '));
