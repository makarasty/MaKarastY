// Variant "Соты": pointy-top hex cells in one big hexagon (5 rings), categories as pie wedges.
// Centre flower (ring 0-1) = the user's avatar; ring 2 = the three AI on its corners plus a quiet halo;
// rings 3-5 = the stack, one wedge per category, higher user score on the inner rings.
import { out, mix, icon, iconColor, svg, stack, CAT, CAT_ORDER, header, linkCards, linkRow, pic, me as avatar, byScore } from './lib.mjs';

const BG = '#0d1117', HALO = mix(BG, '#e6edf3', 0.17), HALO_EDGE = mix(BG, '#e6edf3', 0.38);
const SQ3 = Math.sqrt(3);
const RINGS = 5;

// Cells in axial coords; angle is clockwise from the top.
const cells = [];
for (let q = -RINGS; q <= RINGS; q++)
  for (let r = Math.max(-RINGS, -q - RINGS); r <= Math.min(RINGS, -q + RINGS); r++) {
    const x = SQ3 * (q + r / 2), y = 1.5 * r; // in units of circumradius
    const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
    const ang = ring ? (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI) : 0;
    cells.push({ q, r, x, y, ring, ang: ang > 2 * Math.PI - 1e-6 ? 0 : ang });
  }
if (cells.length !== 1 + 3 * RINGS * (RINGS + 1)) throw new Error('cell count');

const ai = stack.filter((s) => s.tier === 'ai');
const cats = CAT_ORDER.filter((c) => stack.some((s) => s.tier !== 'ai' && s.cat === c));
const near = (a, b) => Math.abs(a - b) < 1e-6;
const aiCell = (i) => cells.find((k) => k.ring === 2 && near(k.ang, ((30 + 120 * i) * Math.PI) / 180));
const rest = cells.filter((c) => c.ring > 2).sort((a, b) => (near(a.ang, b.ang) ? a.ring - b.ring : a.ang - b.ang));

// Walk the wedges: each category's cells, and the spare cells spread as seams between categories.
const techCount = stack.filter((s) => s.tier !== 'ai').length;
const spares = rest.length - techCount;
if (spares < 0 || spares > cats.length) throw new Error(`cells ${rest.length} vs techs ${techCount}`);
const seamAfter = new Set(Array.from({ length: spares }, (_, k) => Math.round(((k + 1) * cats.length) / spares) - 1));
const slot = new Map();
let at = 0;
cats.forEach((cat, ci) => {
  const items = stack.filter((s) => s.tier !== 'ai' && s.cat === cat).sort(byScore);
  const own = rest.slice(at, at + items.length).sort((a, b) => a.ring - b.ring || a.ang - b.ang);
  items.forEach((t, k) => slot.set(own[k], t));
  at += items.length + (seamAfter.has(ci) ? 1 : 0);
});
if (at !== rest.length) throw new Error(`walked ${at} of ${rest.length}`);

const hexPts = (cx, cy, r) => [0, 1, 2, 3, 4, 5].map((i) => {
  const a = (Math.PI / 3) * i - Math.PI / 2;
  return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
}).join(' ');
const hex = (cx, cy, r, fill, stroke, cls = '') =>
  `<polygon${cls ? ` class="${cls}"` : ''} points="${hexPts(cx, cy, r)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;

function build(file, width, w, iconRatio) {
  const R = w / SQ3, r = R - 2.5;
  const height = Math.ceil(12 + (1.5 * 2 * RINGS + 2) * R);
  const ox = width / 2, oy = height / 2;
  const pos = (c) => [ox + c.x * R, oy + c.y * R];
  const isz = w * iconRatio;
  // The avatar fills the 7-cell flower: one image clipped to the seven hexagons.
  const flower = cells.filter((c) => c.ring <= 1).map(pos);
  let body = flower.map(([x, y]) => hex(x, y, r, HALO, 'none')).join('') +
    avatar(ox, oy, 2.75 * R, { clip: flower.map(([x, y]) => `<polygon points="${hexPts(x, y, r)}"/>`).join('') }) +
    flower.map(([x, y]) => hex(x, y, r, 'none', HALO_EDGE)).join('');
  const aiCells = ai.map((_, i) => aiCell(i));
  for (const c of cells.filter((k) => k.ring === 2 && !aiCells.includes(k))) body += hex(...pos(c), r, HALO, HALO_EDGE);
  ai.forEach((it, i) => {
    const [x, y] = pos(aiCells[i]), col = iconColor(it, BG);
    body += hex(x, y, r, mix(BG, col, 0.14), col, 'ai') + icon(it, x - isz / 2, y - isz / 2, isz, BG);
  });
  for (const c of rest) {
    const [x, y] = pos(c), it = slot.get(c);
    if (!it) { body += hex(x, y, r, BG, mix(BG, '#e6edf3', 0.1)); continue; }
    const col = CAT[it.cat][0];
    body += hex(x, y, r, mix(BG, col, 0.12), mix(BG, col, 0.4)) + icon(it, x - isz / 2, y - isz / 2, isz, mix(BG, col, 0.12));
  }
  const css = `<style>@media (prefers-reduced-motion: no-preference){.ai{animation:p 5s ease-in-out infinite}@keyframes p{50%{stroke-opacity:.45}}}</style>`;
  out(`variants/r4b/${file}.svg`, svg(width, height, body, css));
}

build('stack', 840, 74, 0.46);
build('stack-m', 360, 31.5, 0.62);
linkCards('r4b', { bg: '#161b22', rx: 10, stroke: '#30363d', fg: '#e6edf3', h: 36 });
out('variants/r4b.md', `<!-- Соты -->\n${header}<div align="center">\n  ${pic('r4b/stack.svg', 'stack')}\n</div>\n\n<br>\n\n${linkRow('r4b')}\n`);
console.log(`built r4b | ${cells.length} cells, ${techCount} techs, ${spares} seams after ${[...seamAfter].map((i) => cats[i]).join(', ')}`);
