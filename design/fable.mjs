// Two more variants (f1, f2), built from the same stack.mjs. Run: node design/fable.mjs
import assert from 'node:assert';
import * as lib from './lib.mjs';
const { F, out, text, measure, mix, icon, iconData, CUSTOM, contrast, hexToRgb, svg, byTier, linkCards, linkRow, header, stack, tiers, r2 } = lib;

const byId = Object.fromEntries(stack.map((s) => [s.id, s]));
const ids = (s) => s.split(' ').map((id) => byId[id] ?? assert.fail(`no stack item "${id}"`));
// One-colour logo. The Minecraft block is two colours by nature; in one colour it would be a blank square, so its dirt gets a half tone.
const mark = (it, x, y, size, bg, fg) =>
  it.id !== 'minecraft' ? icon(it, x, y, size, bg, fg)
    : `<svg x="${r2(x)}" y="${r2(y)}" width="${size}" height="${size}" viewBox="0 0 24 24">${CUSTOM.minecraft.raw.replaceAll('#8B5E3C', mix(bg, fg, 0.45)).replaceAll('#62B47A', fg)}</svg>`;
const reduce = '@media (prefers-reduced-motion:reduce){*{animation:none!important}}';
const md = (dir, name) =>
  out(`variants/${dir}.md`,
    `<!-- Fable: ${name} -->\n${header}<div align="center">\n  <picture>\n    <source media="(max-width: 600px)" srcset="${dir}/stack-phone.svg">\n    <img alt="stack" src="${dir}/stack.svg">\n  </picture>\n</div>\n\n<br>\n\n${linkRow(dir)}\n`);

// ---------- F1: bento. One 13-column grid; every tier is a full rectangle, every row one family ----------
// The row lists are hand-ordered on purpose; the assert below fails the build when stack.mjs gains or moves an item.
const BENTO = {
  main: ['typescript javascript nodejs bun vue nuxt vscode', 'java kotlin gradle git actions obsidian windows'],
  active: [
    'csharp python go rust intellij debian mindustry minecraft',
    'html css sass tailwind react vite discordjs lavalink',
    'postgresql mysql sqlite redis firebase lmdb docker nginx',
  ],
  tried: ['ubuntu android unity mongodb pterodactyl', 'sublime figma drawio notion gdrive', 'ejs json yaml toml env'],
};
for (const [tier, rows] of Object.entries(BENTO)) {
  const mine = rows.join(' ').split(' ').sort().join(' ');
  const theirs = stack.filter((s) => s.tier === tier).map((s) => s.id).sort().join(' ');
  assert.equal(mine, theirs, `f1: BENTO.${tier} no longer matches stack.mjs`);
}
assert.deepEqual(stack.filter((s) => s.tier === 'ai').map((s) => s.id), ['claude', 'gemini', 'chatgpt'], 'f1 is laid out for exactly these three AI tools');

function f1(Wd, { gap, ic, rx }) {
  const clay = '#D97757', ink = '#1F1E1D', ivory = '#FAF9F5';
  const tone = { ai: ['#3D3D3A', 1], main: ['#30302E', 1], active: ['#262624', 0.7], tried: ['#1F1E1D', 0.42] };
  const p = (Wd + gap) / 13, k = Wd / 840;
  const panel = (c, r, w, h, fill) =>
    `<rect x="${r2(c * p)}" y="${r2(r * p)}" width="${r2(w * p - gap)}" height="${r2(h * p - gap)}" rx="${rx}" fill="${fill}"/>`;
  const at = (it, c, r, tier) => {
    const [bg, t] = tone[tier];
    return mark(it, (c + 0.5) * p - gap / 2 - ic / 2, (r + 0.5) * p - gap / 2 - ic / 2, ic, bg, mix(bg, ivory, t));
  };
  const block = (tier, c0, r0) =>
    panel(c0, r0, BENTO[tier][0].split(' ').length, BENTO[tier].length, tone[tier][0]) +
    BENTO[tier].map((row, r) => ids(row).map((it, c) => at(it, c0 + c, r0 + r, tier)).join('')).join('');

  // Claude: the one coloured block and the one word in the picture.
  const cw = 4 * p - gap, ch = 2 * p - gap, big = 46 * k, fs = 36 * k, sp = 14 * k;
  const tw = measure(F.semi, 'Claude', fs), x0 = (cw - big - sp - tw) / 2;
  let body = panel(0, 0, 4, 2, clay) +
    icon(byId.claude, x0, ch / 2 - big / 2, big, clay, ink) +
    text(F.semi, 'Claude', x0 + big + sp, ch / 2 + fs * 0.35, fs, { fill: ink });
  for (const [i, id] of ['gemini', 'chatgpt'].entries()) {
    body += panel(4, i, 2, 1, tone.ai[0]) +
      icon(byId[id], 5 * p - gap / 2 - ic / 2, (i + 0.5) * p - gap / 2 - ic / 2, ic, tone.ai[0], ivory);
  }
  body += block('main', 6, 0) + block('active', 0, 2) + block('tried', 8, 2);
  return svg(Wd, r2(5 * p - gap), body);
}

// ---------- F2: one grid, three orders. The tiles re-sort themselves; Claude stays first in every order ----------
function hsl(hex) {
  const [r, g, b] = hexToRgb(hex), mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, d / (1 - Math.abs(2 * l - 1)), l];
}
const grey = (it) => { const [, s, l] = hsl(iconData(it).hex); return s < 0.2 || l < 0.15 || l > 0.9; };
// Black and white logos get a grey tile that shows on both GitHub themes.
const tile = (it) => (!grey(it) ? iconData(it).hex : hsl(iconData(it).hex)[2] < 0.5 ? '#3B4048' : '#C4C9D0');

const byUse = tiers.flatMap(byTier);
const CATS = ['ai', 'lang', 'web', 'data', 'infra', 'tool', 'os', 'game', 'format'];
const byKind = CATS.flatMap((c) => byUse.filter((s) => s.cat === c));
// Around the colour wheel starting at Claude's orange, greys last (light to dark).
const hue0 = hsl(iconData(byId.claude).hex)[0];
const wheel = (it) => (grey(it) ? 400 - hsl(iconData(it).hex)[2] : (hsl(iconData(it).hex)[0] - hue0 + 360) % 360);
const byColour = [...byUse].sort((a, b) => wheel(a) - wheel(b));
const ORDERS = [['color', byColour], ['usage', byUse], ['type', byKind]];
for (const [name, o] of ORDERS) {
  assert.equal(new Set(o).size, stack.length, `f2: order "${name}" lost an item`);
  assert.equal(o[0].id, 'claude', `f2: Claude is not first in "${name}"`);
}

function f2(Wd, cols, { gap, ic, rx, fs }) {
  const n = stack.length;
  assert.equal(n % cols, 0, `f2: ${n} items do not fill ${cols} columns`);
  const cell = (Wd - (cols - 1) * gap) / cols, rows = n / cols, gridH = rows * cell + (rows - 1) * gap;
  const pos = (i) => [r2((i % cols) * (cell + gap)), r2(Math.floor(i / cols) * (cell + gap))];
  // 30 s loop: hold 8 s, re-sort for 2 s (each tile moves 1.1 s, started in a wave along its new position).
  const T = 30, hold = 8, move = 1.1, wave = 0.9, pc = (t) => r2((t / T) * 100) + '%';
  let css = '.t{animation:30s cubic-bezier(.65,0,.35,1) infinite}', body = '';
  byUse.forEach((it, i) => {
    const at = ORDERS.map(([, o]) => pos(o.indexOf(it)));
    const tr = (j) => `{transform:translate(${at[j][0]}px,${at[j][1]}px)}`;
    let kf = `0%${tr(0)}`;
    for (let step = 0; step < 3; step++) {
      const to = (step + 1) % 3, t0 = hold + step * (hold + 2) + (ORDERS[to][1].indexOf(it) / (n - 1)) * wave;
      kf += `${pc(t0)}${tr(step)}${pc(t0 + move)}${tr(to)}`;
    }
    const bg = tile(it), fg = contrast('#FFFFFF', bg) >= 2.1 ? '#FFFFFF' : '#16181D';
    css += `@keyframes k${i}{${kf}}#i${i}{animation-name:k${i}}`;
    body += `<g id="i${i}" class="t" transform="translate(${at[0][0]} ${at[0][1]})">` +
      `<rect width="${r2(cell)}" height="${r2(cell)}" rx="${rx}" fill="${bg}"/>` +
      mark(it, (cell - ic) / 2, (cell - ic) / 2, ic, bg, fg) + `</g>`;
  });
  // The only text: which order is on screen now.
  const padX = fs * 0.75, th = fs * 1.9, tgap = fs * 0.35, ty = gridH + fs * 1.1;
  const ws = ORDERS.map(([name]) => measure(F.semi, name, fs) + 2 * padX);
  let tx = (Wd - ws.reduce((a, b) => a + b, 0) - 2 * tgap) / 2;
  ORDERS.forEach(([name], j) => {
    const on = hold + 1 + (j + 2) % 3 * (hold + 2), off = hold + 1 + j * (hold + 2), fade = 0.3;
    // Tab j is lit from the middle of the re-sort that leads to it until the middle of the next one.
    const kf = j === 0
      ? `0%,${pc(off - fade)}{opacity:1}${pc(off + fade)},${pc(on - fade)}{opacity:0}${pc(on + fade)},100%{opacity:1}`
      : `0%,${pc(on - fade)}{opacity:0}${pc(on + fade)},${pc(off - fade)}{opacity:1}${pc(off + fade)},100%{opacity:0}`;
    css += `@keyframes o${j}{${kf}}#o${j}{animation:o${j} ${T}s linear infinite}`;
    const mid = tx + ws[j] / 2, base = ty + th / 2 + fs * 0.35;
    body += text(F.semi, name, mid, base, fs, { anchor: 'middle', fill: '#8B949E' }) +
      `<g id="o${j}" opacity="${j ? 0 : 1}"><rect x="${r2(tx)}" y="${r2(ty)}" width="${r2(ws[j])}" height="${r2(th)}" rx="${r2(th / 2)}" fill="#6E7681"/>` +
      text(F.semi, name, mid, base, fs, { anchor: 'middle', fill: '#FFFFFF' }) + `</g>`;
    tx += ws[j] + tgap;
  });
  return svg(Wd, r2(ty + th), body, `<style>${css}${reduce}</style>`);
}

out('variants/f1/stack.svg', f1(840, { gap: 8, ic: 34, rx: 14 }));
out('variants/f1/stack-phone.svg', f1(360, { gap: 4, ic: 17, rx: 7 }));
linkCards('f1', { bg: '#30302E', rx: 10, fg: '#FAF9F5', h: 36 });
md('f1', 'Бенто');

out('variants/f2/stack.svg', f2(840, 14, { gap: 6, ic: 28, rx: 12, fs: 15 }));
out('variants/f2/stack-phone.svg', f2(360, 7, { gap: 5, ic: 24, rx: 10, fs: 12 }));
linkCards('f2', { bg: '#3B4048', rx: 12, fg: '#FFFFFF', h: 36 });
md('f2', 'Пересортировка');

console.log('built f1 f2 |', stack.length, 'items');
