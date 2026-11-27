// Round 4c: isometric floor, 8 columns x 7 rows = 53 tech slabs + 3 equal AI pillars in the front corner cells.
// Run from the repo root: node design/r4-iso.mjs
import * as lib from './lib.mjs';
const { W, out, text, mix, icon, iconData, svg, linkCards, linkRow, header, CAT, CAT_ORDER, stack, F } = lib;

const BG = '#0d1117';
const COLS = 8, ROWS = 7;
const PX = 54, PY = 27;       // cell pitch: half the diamond width / height
const GAP = 4;                // even gap between slabs, measured along the diamond edge
const A = PX - GAP, B = PY - GAP / 2;  // slab top face half width / half height
const DEPTH = 14, ICON = 40;
const PILLAR = 26;   // taller and a pillar hides the lower part of the icon on the slab behind it
const X0 = W / 2 - ((COLS - ROWS) * PX) / 2, Y0 = 54;

const poly = (pts, fill, stroke, sw = 1) =>
  `<path d="M${pts.map((p) => p.map((n) => lib.r2(n)).join(' ')).join('L')}Z" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;

// A raised block: top-face centre is (cx, cy - h), the base diamond centre is (cx, cy).
function block(cx, cy, a, b, h, tone, edge, sw = 1) {
  const t = cy - h;
  return poly([[cx - a, t], [cx, t + b], [cx, cy + b], [cx - a, cy]], mix(BG, tone, 0.1), edge, sw) +
    poly([[cx + a, t], [cx, t + b], [cx, cy + b], [cx + a, cy]], mix(BG, tone, 0.05), edge, sw) +
    poly([[cx, t - b], [cx + a, t], [cx, t + b], [cx - a, t]], mix(BG, tone, 0.16), edge, sw);
}

let n = 0;
const standing = (item, cx, cy, h, bg, lift = 0.75) =>
  `<g class="b" style="animation-delay:${-((n++ * 0.7) % 6).toFixed(1)}s">${icon(item, cx - ICON / 2, cy - h - ICON * lift, ICON, bg)}</g>`;

// Placeholder for the owner's name: swap this one function later.
const label = (cx, y) => text(F.semi, 'MaKarastY', cx, y, 14, { anchor: 'middle', ls: 1, fill: '#8b949e' });

const techs = stack.filter((s) => s.tier !== 'ai')
  .map((s, i) => [s, i]).sort((p, q) => CAT_ORDER.indexOf(p[0].cat) - CAT_ORDER.indexOf(q[0].cat) || p[1] - q[1]).map((p) => p[0]);
const ai = stack.filter((s) => s.tier === 'ai');
if (techs.length + ai.length !== COLS * ROWS) throw new Error('floor is not full: ' + (techs.length + ai.length));

// The last three cells (the front corner) are the AI pillars.
const cells = [...techs, ...ai].map((s, i) => ({ s, c: i % COLS, r: Math.floor(i / COLS) }))
  .sort((p, q) => p.c + p.r - (q.c + q.r) || p.r - q.r); // back to front
let floor = '';
for (const { s, c, r } of cells) {
  const cx = X0 + (c - r) * PX, cy = Y0 + (c + r) * PY;
  if (s.tier === 'ai') {
    const brand = iconData(s).hex;
    floor += block(cx, cy, A, B, PILLAR, brand, brand, 1.4) + standing(s, cx, cy, PILLAR, mix(BG, brand, 0.16), 0.5);
  } else {
    const tone = CAT[s.cat][0];
    floor += block(cx, cy, A, B, DEPTH, tone, mix(BG, tone, 0.45)) + standing(s, cx, cy, DEPTH, mix(BG, tone, 0.16));
  }
}

const bottom = Y0 + (COLS - 1 + ROWS - 1) * PY + B + DEPTH; // front tip of the floor
floor += label(X0 + (COLS - ROWS) * PX, bottom + 24);
const H = Math.ceil(bottom + 24 + 10);

const css = '<style>@media (prefers-reduced-motion:no-preference){.b{animation:b 7s ease-in-out infinite}@keyframes b{50%{transform:translateY(-2px)}}}</style>';
out('variants/r4c/stack.svg', svg(W, H, floor, css));

linkCards('r4c', { bg: '#161b22', rx: 6, stroke: '#30363d', fg: '#e6edf3', h: 36 });
out('variants/r4c.md', `<!-- Изометрия -->\n${header}<div align="center">\n  <img alt="stack" src="r4c/stack.svg">\n</div>\n\n<br>\n\n${linkRow('r4c')}\n`);
console.log(`r4c: ${techs.length + ai.length} cells, ${H}px high`);
