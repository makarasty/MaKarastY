// Round 5, "Подсолнух": the user in the centre, everything else on Vogel's phyllotaxis spiral
// (angle n * 137.508 deg), so density is even. AI first, then techs in the PLACE order.
// Round 10 (env): SIZE = disc size per tech by the user's score, PLACE = where each tech sits,
// LIVE=1 = every disc is a link (for an HTML page; GitHub shows an SVG as <img>, so links there never work),
// STACK_HREF = a link around the whole picture in the .md.
import assert from 'node:assert/strict';
import { out, mix, icon, iconColor, svg, stack, CAT, CAT_ORDER, linkCards, linkRow, pic, r2, me as avatar, OUT_DIR, SET, sizeK, stackAlt, keyLine, kinds } from './lib.mjs';
import { hrefs } from './stack.mjs';
// Output folder and title follow the selection (env SET / OUT, see lib.mjs).
const D = OUT_DIR ?? 'r5d';
const TITLE = 'Подсолнух' + (SET === 'all' ? '' : ' · ' + { top: '8-10', modern: 'без старого' }[SET]);

const BG = '#0d1117', TILE = '#161b22', LINE = '#30363d';
const GOLDEN = (137.508 * Math.PI) / 180;
const idx = new Map(stack.map((s, i) => [s, i]));
const ai = stack.filter((s) => s.tier === 'ai'), techs = stack.filter((s) => s.tier !== 'ai');
const nAi = ai.length;

const SIZE = process.env.SIZE ?? 'equal', PLACE = process.env.PLACE ?? 'score', LIVE = process.env.LIVE === '1';
const kOf = (it) => sizeK(it, SIZE);

const byScore = (a, b) => (b.score ?? 0) - (a.score ?? 0) || CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || idx.get(a) - idx.get(b);
// Fixed seed, so "mixed" is the same picture on every build.
function shuffled(list, seed = 7) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const ORDERS = {
  score: () => [...techs].sort(byScore), // higher score = closer to the centre
  kind: () => [...techs].sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || byScore(a, b)), // one band per kind
  mixed: () => shuffled(techs), // big and small spread over the whole flower
  sector: () => [...techs].sort((a, b) => kOf(b) - kOf(a) || byScore(a, b)), // slots only; items go to wedges below
};
if (!ORDERS[PLACE]) throw new Error(`unknown PLACE=${PLACE}`);

const CSS = `<style>
@keyframes cw{to{transform:rotate(360deg)}}@keyframes ccw{to{transform:rotate(-360deg)}}
.up{transform-box:fill-box;transform-origin:center}
${LIVE ? 'a{cursor:pointer}a:hover .d,a:focus .d{stroke:#e6edf3;stroke-opacity:1;stroke-width:2}' : ''}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
const SEC = 240;
const upright = `class="up" style="animation:ccw ${SEC}s linear infinite"`;
// Frame around the spiral (env FRAME): box = dark card with an edge, flat = card without the edge,
// circle = one dark disc behind the spiral, none = no background at all.
const FRAME = process.env.FRAME ?? 'box';
const panel = (w, h) => {
  const r = Math.min(w, h) / 2;
  const frames = {
    box: `<rect width="${w}" height="${h}" rx="16" fill="${BG}"/><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="15.5" stroke="#21262d"/>`,
    flat: `<rect width="${w}" height="${h}" rx="16" fill="${BG}"/>`,
    circle: `<circle cx="${w / 2}" cy="${h / 2}" r="${r}" fill="${BG}"/><circle cx="${w / 2}" cy="${h / 2}" r="${r - 0.5}" stroke="#21262d"/>`,
    none: '',
  };
  if (!(FRAME in frames)) throw new Error(`unknown FRAME=${FRAME}`);
  return frames[FRAME];
};

// The user: GitHub avatar in a ring.
function me(cx, cy, r) {
  return `<circle cx="${cx}" cy="${cy}" r="${r + 9}" stroke="#e6edf3" stroke-opacity="0.08"/>` +
    avatar(cx, cy, r) + `<circle cx="${cx}" cy="${cy}" r="${r}" stroke="#e6edf3" stroke-opacity="0.35"/>`;
}

// o: panel w/h, avatar radius, AI disc radius, tech disc radius, icon size ratio, first orbit radius r0.
function build(file, o) {
  const { W, H, meR, aiR, tR, r0 } = o, cx = W / 2, cy = H / 2;
  const rMax = Math.min(W, H) / 2 - o.margin - aiR; // keeps the whole turning spiral inside the panel
  const seq = [...ai, ...ORDERS[PLACE]()];
  const base = (it) => (it.tier === 'ai' ? aiR : tR) * kOf(it);
  // Each slot takes ring area in proportion to its disc's area; with equal sizes this is r0 + c * sqrt(n).
  const cum = [0];
  seq.forEach((it, n) => n && cum.push(cum[n - 1] + (base(seq[n - 1]) ** 2 + base(it) ** 2) / 2));
  const slots = seq.map((it, n) => {
    const a = n * GOLDEN, r = r0 + (rMax - r0) * Math.sqrt(cum[n] / cum[seq.length - 1]);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r0: r, a: ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) };
  });
  let items = seq;
  if (PLACE === 'sector') {
    // One wedge per kind, sized by how many items it has; inside a wedge, higher score sits closer to the centre.
    items = [...ai];
    const free = slots.slice(nAi).map((s, i) => ({ s, i: i + nAi })).sort((p, q) => p.s.a - q.s.a);
    const assigned = [];
    let at = 0;
    for (const cat of CAT_ORDER) {
      const group = techs.filter((t) => t.cat === cat).sort(byScore);
      const wedge = free.slice(at, at + group.length).sort((p, q) => p.s.r0 - q.s.r0);
      wedge.forEach((w, k) => (assigned[w.i] = group[k]));
      at += group.length;
    }
    items = seq.map((it, n) => (n < nAi ? it : assigned[n]));
    assert.equal(new Set(items).size, seq.length, `${file}: sector lost an item`);
  }
  const place = (s) => items.map((it, n) => ({ it, ...slots[n], r: base(it) * s }));
  // No overlaps (2px gap) with each other and with the avatar ring; always inside the panel, at any rotation.
  const fits = (discs) => discs.every((d, i) =>
    d.r0 + d.r <= Math.min(W, H) / 2 - 4 && Math.hypot(d.x - cx, d.y - cy) >= d.r + meR + 9 + 2 &&
    discs.slice(i + 1).every((e) => Math.hypot(d.x - e.x, d.y - e.y) >= d.r + e.r + 2));
  // The largest scale that still fits; equal sizes never grow past the rated layout (scale 1).
  let s = 1;
  if (SIZE !== 'equal' || !fits(place(1))) {
    let lo = 0.3, hi = SIZE === 'equal' ? 1 : 1.3;
    for (let k = 0; k < 30; k++) { const m = (lo + hi) / 2; if (fits(place(m))) lo = m; else hi = m; }
    s = Math.floor(lo * 1000) / 1000;
  }
  const discs = place(s);
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
  // Claude biggest; ChatGPT at least as big as Gemini (the user, 2026-11-27), on the picture, not only in AI_K.
  const rOf = (id) => discs.find((d) => d.it.id === id).r;
  assert(rOf('claude') > rOf('gemini') && rOf('chatgpt') >= rOf('gemini'), `${file}: AI sizes out of order`);
  let spiral = `<g style="transform-origin:${cx}px ${cy}px;animation:cw ${SEC}s linear infinite">`;
  discs.forEach(({ it, x, y, r }) => {
    let body;
    if (it.tier === 'ai') {
      const col = iconColor(it, TILE);
      body = `<circle class="d" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${mix(BG, col, 0.16)}" stroke="${col}" stroke-opacity="0.85" stroke-width="1.5"/>` +
        icon(it, x - r * 0.5, y - r * 0.5, Math.round(r), TILE);
    } else {
      // env RING=grey: one neutral edge for every tech instead of the colour of its kind.
      const col = CAT[it.cat][0], sz = Math.round(r * o.icon);
      const edge = process.env.RING === 'grey' ? LINE : mix(BG, col, 0.45);
      body = `<circle class="d" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}" fill="${TILE}" stroke="${edge}"/>` +
        icon(it, x - sz / 2, y - sz / 2, sz, TILE);
    }
    if (LIVE) body = `<a href="${hrefs[it.id]}" target="_blank" rel="noopener" data-id="${it.id}" aria-label="${it.name}">${body}</a>`;
    spiral += `<g ${upright}>${body}</g>`;
  });
  const picture = svg(W, H, panel(W, H) + spiral + '</g>' + me(cx, cy, meR), CSS);
  out(file, picture);
  return { file, picture, s, gap: r2(min) };
}

const res = [
  build(`variants/${D}/stack.svg`, { W: 840, H: 680, meR: 48, aiR: 31, tR: 20, icon: 1.2, r0: 100, margin: 14 }),
  build(`variants/${D}/stack-m.svg`, { W: 360, H: 360, meR: 25, aiR: 18, tR: 11, icon: 1.55, r0: 55, margin: 4 }),
];
// LIVE: stack-page.mjs puts the linked flower (variants/<OUT>/stack.svg) into the page on the user's site.
// env LINKS: cards (round 8 tie 9/9 with icons), icons, small = small icon squares,
// combined = contacts as small icon squares and the rest as cards, smallcards = lower cards (round 11).
const LINK_STYLES = {
  cards: { bg: TILE, rx: 18, stroke: LINE, fg: '#e6edf3', h: 36 },
  icons: { bg: TILE, rx: 22, stroke: LINE, h: 44, iconOnly: true },
  small: { bg: TILE, rx: 16, stroke: LINE, h: 32, iconOnly: true },
  combined: { bg: TILE, rx: 16, stroke: LINE, fg: '#e6edf3', h: 32, iconGroups: ['contact'] },
  smallcards: { bg: TILE, rx: 14, stroke: LINE, fg: '#e6edf3', h: 28 },
  // round 12: "акцент на Телеграме, Протоне и Gmail", npm/Codewars/... small; one height, so the row stays level
  contacts: { bg: TILE, rx: 18, stroke: LINE, fg: '#e6edf3', h: 36, iconGroups: ['other'], cardW: 150 },
};
const LINKS = process.env.LINKS ?? 'cards';
if (!LINK_STYLES[LINKS]) throw new Error(`unknown LINKS=${LINKS}`);
linkCards(D, LINK_STYLES[LINKS]);
// env TEXT (round 12, the stack as real text on the page as well as in the alt):
// line = one small line of the main web stack under the flower, details = the whole stack by kind, folded,
// both = the two together with a short alt, since the text below then carries the list (screen readers
// read a long alt in full, and every agent pipeline keeps plain text).
// fun1 / fun2 = a playful small line instead of the tech list ("можно написать что-то более прикольное");
// both only say what the picture really does.
const FUN = {
  fun1: `${stack.length} tools, one sunflower: each icon sits 137.5° after the last, like real seeds`,
  fun2: 'One slow turn every 4 minutes. The more I like a tool, the closer it sits to me',
};
const TEXT = process.env.TEXT ?? 'none';
if (!['none', 'line', 'details', 'both', ...Object.keys(FUN)].includes(TEXT)) throw new Error(`unknown TEXT=${TEXT}`);
assert.equal(SEC, 240, 'fun2 says one turn every 4 minutes');
const alt = TEXT === 'both' ? `Tech stack of makarasty: ${stack.length} tool icons around their avatar, listed as text below` : stackAlt;
const line = FUN[TEXT] ?? (['line', 'both'].includes(TEXT) ? keyLine.map((s) => s.name).join(' · ') : '');
const text = line ? `\n  <br>\n  <sub>${line}</sub>` : '';
const folded = ['details', 'both'].includes(TEXT) ? `\n\n<details>\n<summary><sub>Stack as text</sub></summary>\n\n` +
  kinds.map((k) => `**${k.title}:** ${k.items.map((s) => s.name).join(', ')}`).join('<br>\n') + `\n\n</details>` : '';
// Round 8: no header image and no "+N more" block (the user: "шапку видимо прийдеться убрать", "+21 more фигня").
const stackPic = pic(`${D}/stack.svg`, alt, process.env.STACK_HREF ? 'stack: click for the clickable version' : '');
const top = process.env.STACK_HREF ? `<a href="${process.env.STACK_HREF}">${stackPic}</a>` : stackPic;
out(`variants/${D}.md`, `<!-- ${process.env.NAME ?? TITLE} -->\n<div align="center">\n  ${top}${text}\n</div>\n\n<br>\n\n${linkRow(D)}${folded}\n`);
console.log(`built ${D} | SIZE=${SIZE} PLACE=${PLACE} |`, stack.length, 'items |', res.map((r) => `${r.file} scale=${r.s} min gap=${r.gap}`).join(' | '));
