// Round 4 variant "Соты": 61 pointy-top hex cells in one big hexagon (4 rings), categories as pie wedges.
import fs from 'node:fs';
import { F, out, text, measure, mix, icon, iconColor, svg, stack, CAT, CAT_ORDER, header, linkCards, linkRow, pic, me as avatar } from './lib.mjs';

const BG = '#0d1117';
const SQ3 = Math.sqrt(3);
const RINGS = 4;

// Cells in axial coords; angle is clockwise from the top.
const cells = [];
for (let q = -RINGS; q <= RINGS; q++)
  for (let r = Math.max(-RINGS, -q - RINGS); r <= Math.min(RINGS, -q + RINGS); r++) {
    const x = SQ3 * (q + r / 2), y = 1.5 * r; // in units of circumradius
    const ring = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
    const ang = ring ? (Math.atan2(x, -y) + 2 * Math.PI) % (2 * Math.PI) : 0;
    cells.push({ q, r, x, y, ring, ang: ang > 2 * Math.PI - 1e-6 ? 0 : ang });
  }
if (cells.length !== 61) throw new Error('expected 61 cells');

const ai = stack.filter((s) => s.tier === 'ai');
const techs = stack.filter((s) => s.tier !== 'ai').sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
const near = (a, b) => Math.abs(a - b) < 1e-6;
const isAi = (c) => c.ring === 1 && [30, 150, 270].some((d) => near(c.ang, (d * Math.PI) / 180));
// ring 1: three AI cells and three petals styled like the centre; wedges: by angle from the top, then ring; the one spare cell ends the list, so it is a seam before the first category
const rest = cells.filter((c) => c.ring > 1).sort((a, b) => (near(a.ang, b.ang) ? a.ring - b.ring : a.ang - b.ang));
if (rest.length !== techs.length + 1) throw new Error(`cells ${rest.length} vs techs ${techs.length}`);

// The centre cell. One place to swap the text for an avatar later.
function centre(cx, cy, w, r, label) {
  const fill = mix(BG, '#e6edf3', 0.2), stroke = mix(BG, '#e6edf3', 0.45);
  const cell = hex(cx, cy, r, fill, stroke);
  return cell + avatar(cx, cy, r, { clip: cell.replace(/ (fill|stroke|stroke-width|stroke-linejoin)="[^"]*"/g, '') }) + hex(cx, cy, r, 'none', stroke);
}
const hex = (cx, cy, r, fill, stroke, cls = '') => {
  const pts = [0, 1, 2, 3, 4, 5].map((i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
  }).join(' ');
  return `<polygon${cls ? ` class="${cls}"` : ''} points="${pts}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
};

function build(file, width, w, iconRatio, label) {
  const R = w / SQ3, r = R - 2.5;
  const height = Math.ceil(12 + (1.5 * 2 * RINGS + 2) * R);
  const ox = width / 2, oy = height / 2;
  const pos = (c) => [ox + c.x * R, oy + c.y * R];
  const isz = w * iconRatio;
  let body = centre(ox, oy, w, r, label);
  for (const c of cells.filter((k) => k.ring === 1 && !isAi(k))) { const [x, y] = pos(c); body += hex(x, y, r, mix(BG, '#e6edf3', 0.14), mix(BG, '#e6edf3', 0.45)); }
  ai.forEach((it, i) => {
    const c = cells.find((k) => k.ring === 1 && near(k.ang, ((30 + 120 * i) * Math.PI) / 180));
    const [x, y] = pos(c), col = iconColor(it, BG);
    body += hex(x, y, r, mix(BG, col, 0.12), col, 'ai') + icon(it, x - isz / 2, y - isz / 2, isz, BG);
  });
  rest.forEach((c, i) => {
    const [x, y] = pos(c), it = techs[i];
    if (!it) { body += hex(x, y, r, BG, mix(BG, '#e6edf3', 0.1)); return; }
    const col = CAT[it.cat][0];
    body += hex(x, y, r, mix(BG, col, 0.12), mix(BG, col, 0.4)) + icon(it, x - isz / 2, y - isz / 2, isz, mix(BG, col, 0.12));
  });
  const css = `<style>@media (prefers-reduced-motion: no-preference){.ai{animation:p 5s ease-in-out infinite}@keyframes p{50%{stroke-opacity:.45}}}</style>`;
  out(`variants/r4b/${file}.svg`, svg(width, height, body, css));
}

build('stack', 840, 84, 0.44, 'MaKarastY');
build('stack-m', 360, 38, 0.62, 'MK');
linkCards('r4b', { bg: '#161b22', rx: 10, stroke: '#30363d', fg: '#e6edf3', h: 36 });
out('variants/r4b.md', `<!-- Соты -->\n${header}<div align="center">\n  ${pic('r4b/stack.svg', 'stack')}\n</div>\n\n<br>\n\n${linkRow('r4b')}\n`);

// self-check: every category is one contiguous run in wedge order
const runs = techs.map((t) => t.cat).filter((c, i, a) => c !== a[i - 1]);
if (new Set(runs).size !== runs.length) throw new Error('category split');
