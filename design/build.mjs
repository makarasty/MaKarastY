// Builds my variants (v1..v5) and the review page from stack.mjs.
import fs from 'node:fs';
import * as lib from './lib.mjs';
const { F, W, root, out, text, measure, mix, icon, iconColor, svg, byTier, fullCols, grid, linkCards, linkRow, header, CAT, stack, links, tiers, r2, pic } = lib;

// ---------- V1: same dark cards as today, one width, rows by tier ----------
// phone: a 360-wide copy for <picture>; AI cards stack, blocks use 2-3 columns.
function v1(W = 840, file = 'stack', phone = false) {
  const bg = '#323330', dimBg = '#2a2a29';
  let y = 0, body = '';
  const ai = byTier('ai'), aiCols = phone ? 1 : 3;
  const aw = (W - (aiCols - 1) * 8) / aiCols, ah = phone ? 38 : 44;
  ai.forEach((it, i) => {
    const x = (i % aiCols) * (aw + 8), yy = y + Math.floor(i / aiCols) * (ah + 8);
    body += `<rect x="${r2(x)}" y="${yy}" width="${r2(aw)}" height="${ah}" rx="2" fill="${bg}"/>` +
      icon(it, x + 14, yy + (ah - 22) / 2, 22, bg) +
      text(F.bold, it.name.toUpperCase(), x + 48, yy + ah / 2 + 5, 13, { ls: 1.3 }) +
      text(F.mono, it.tag.toUpperCase(), x + aw - 14, yy + ah / 2 + 4.5, 10, { anchor: 'end', ls: 1, fill: '#8b949e' });
  });
  y += Math.ceil(ai.length / aiCols) * (ah + 8) - 8 + 18;
  const blocks = ['main', 'active', 'tried'].map((t) => {
    const items = byTier(t), cols = phone ? fullCols(items.length, 2, 3, 3) : fullCols(items.length, 5, 7, 6);
    return { t, items, cols, cw: (W - (cols - 1) * 8) / cols };
  });
  // One label size for every card: the tightest fit across blocks decides it.
  const size = Math.min(10.5, ...blocks.map(({ items, cw }) =>
    (10.5 * (cw - 46)) / Math.max(...items.map((it) => measure(F.bold, it.name.toUpperCase(), 10.5, 1.1)))));
  for (const { t, items, cols, cw } of blocks) {
    const dim = t === 'tried';
    const g = grid(items, cols, cw, 32, 8, 8, y, (it, x, yy, w, h) =>
      `<rect x="${r2(x)}" y="${yy}" width="${r2(w)}" height="${h}" rx="2" fill="${dim ? dimBg : bg}"/>` +
      icon(it, x + 11, yy + 8, 16, bg, dim ? '#7d8590' : null) +
      text(F.bold, it.name.toUpperCase(), x + 36, yy + 16 + size * 0.36, size, { ls: (1.1 * size) / 10.5, fill: dim ? '#9da5ae' : '#fff' }), W);
    body += g.body;
    y += g.h + 18;
  }
  out(`variants/v1/${file}.svg`, svg(W, y - 18, body));
  if (!phone) { v1(360, 'stack-m', true); linkCards('v1', { bg, rx: 2, fg: '#fff' }); }
}

// ---------- V2: icons only, one grid; `style` changes only how a tile is drawn ----------
// base: AI tiles in brand outline, main lighter, tried dashed grey (round-2 winner)
// mono: one icon colour, the tier is the brightness; tint: tile tinted with the brand colour
// label: bigger tiles with the name under the icon; round: circles instead of squares
const V2_DIR = { base: 'v2', mono: 'v2b', tint: 'v2c', label: 'v2d', round: 'v2e' };
function v2(style = 'base', W = 840, file = 'stack', phone = false) {
  const bg = '#161b22', stroke = '#30363d', dir = V2_DIR[style];
  const all = tiers.flatMap(byTier);
  const label = style === 'label';
  const cols = label ? (phone ? 4 : fullCols(all.length, 7, 8, 8))
    : phone ? fullCols(all.length, 6, 8, 7) : fullCols(all.length, 12, 16, 14);
  const gap = 8;
  const cw = label || phone ? (W - (cols - 1) * gap) / cols : 50, gx = label || phone ? gap : (W - cols * cw) / (cols - 1);
  const ch = label ? Math.round(cw * (phone ? 0.78 : 0.72)) : cw;
  const is = Math.round((label ? ch * 0.36 : cw * 0.48));
  const tone = { ai: '#e6edf3', main: '#e6edf3', active: '#9da5ae', tried: '#5d646d' };
  const g = grid(all, cols, cw, ch, gx, gx, 0, (it, x, yy, w, h) => {
    const dim = it.tier === 'tried', main = it.tier === 'main', ai = it.tier === 'ai';
    const brand = iconColor(it, bg);
    let fill = main || ai ? '#1f262f' : bg, edge = ai ? brand : main ? '#3d444d' : stroke, mono = dim ? '#6e7681' : null, dash = dim;
    if (style === 'mono') { fill = bg; edge = ai ? brand : stroke; mono = ai ? null : tone[it.tier]; dash = false; }
    if (style === 'tint' && !dim) { fill = mix('#0d1117', brand, ai ? 0.22 : 0.13); edge = mix('#0d1117', brand, ai ? 0.7 : 0.35); }
    const attrs = `fill="${fill}" stroke="${edge}"${ai && style !== 'tint' ? ' stroke-opacity="0.8"' : ''}${dash ? ' stroke-dasharray="3 3"' : ''}`;
    const shape = style === 'round'
      ? `<circle cx="${r2(x + w / 2)}" cy="${r2(yy + h / 2)}" r="${r2(w / 2 - 0.5)}" ${attrs}/>`
      : `<rect x="${r2(x + 0.5)}" y="${r2(yy + 0.5)}" width="${r2(w - 1)}" height="${r2(h - 1)}" rx="${phone ? 10 : 12}" ${attrs}/>`;
    const iy = label ? yy + h * 0.2 : yy + (h - is) / 2;
    return shape + icon(it, x + (w - is) / 2, iy, is, bg, mono) +
      (label ? text(F.mid, it.name, x + w / 2, yy + h * 0.8, phone ? 10 : 11, { anchor: 'middle', fill: dim ? '#6e7681' : '#9da5ae' }) : '');
  }, W);
  out(`variants/${dir}/${file}.svg`, svg(W, r2(g.h), g.body));
  if (!phone) { v2(style, 360, 'stack-m', true); linkCards(dir, { bg, rx: style === 'round' ? 18 : 10, stroke, fg: '#e6edf3', h: 36 }); }
}

// ---------- V3: periodic table, number = usage rank ----------
function v3() {
  const items = tiers.flatMap(byTier);
  const cols = fullCols(items.length, 8, 12, 10), gap = 6, w = (W - (cols - 1) * gap) / cols, h = 86;
  const g = grid(items, cols, w, h, gap, gap, 0, (it, x, y) => {
    const n = items.indexOf(it) + 1;
    const [c] = CAT[it.cat];
    const dim = it.tier === 'tried';
    const bg = mix('#0d1117', c, 0.14);
    return `<g${dim ? ' opacity="0.55"' : ''}>` +
      `<rect x="${r2(x + 0.5)}" y="${y + 0.5}" width="${r2(w - 1)}" height="${h - 1}" rx="4" fill="${bg}" stroke="${mix('#0d1117', c, 0.55)}"/>` +
      text(F.mono, String(n), x + 8, y + 16, 10, { fill: mix('#0d1117', c, 0.85) }) +
      icon(it, x + w - 22, y + 6, 14, bg) +
      text(F.bold, it.sym, x + w / 2, y + 52, 26, { anchor: 'middle', fill: '#f0f6fc' }) +
      text(F.mid, it.name, x + w / 2, y + 73, 9.5, { anchor: 'middle', fill: '#9da5ae' }) +
      `</g>`;
  });
  // legend: only categories present
  const cats = [...new Set(items.map((i) => i.cat))];
  const ly = g.h + 26;
  const parts = cats.map((k) => ({ k, w: 18 + measure(F.mid, CAT[k][1], 11) }));
  const total = parts.reduce((a, p) => a + p.w, 0) + (parts.length - 1) * 22;
  let lx = (W - total) / 2, legend = '';
  for (const p of parts) {
    legend += `<rect x="${r2(lx)}" y="${ly - 9}" width="10" height="10" rx="2" fill="${CAT[p.k][0]}"/>` +
      text(F.mid, CAT[p.k][1], lx + 18, ly, 11, { fill: '#8b949e' });
    lx += p.w + 22;
  }
  out('variants/v3/stack.svg', svg(W, ly + 6, g.body + legend));
  linkCards('v3', { bg: '#161b22', rx: 4, stroke: '#30363d', fg: '#e6edf3' });
}

// ---------- V4: keyboard, AI on the space row ----------
function v4() {
  // Keys: a number is a free key, ['text', u] a printed legend, ['@id', u] a fixed item,
  // ['_', u] empty space, ['~f1', u] a free key that prints f1 when nothing lands on it.
  const u = 54, pad = 15, gap = 5, fGap = 14, H = 6 * u + fGap + 2 * pad;
  const fKeys = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => [`~f${a + i}`, 1]);
  const rows = [
    [['esc', 1], ['_', 0.5], ...fKeys(1, 4), ['_', 0.25], ...fKeys(5, 8), ['_', 0.25], ...fKeys(9, 12), ['del', 1]],
    [['~', 1], ...Array(12).fill(1), ['back', 2]],
    [['tab', 1.5], ...Array(12).fill(1), 1.5],
    [['caps', 1.75], ...Array(11).fill(1), ['enter', 2.25]],
    [['shift', 2.25], ...Array(10).fill(1), ['shift', 2.75]],
    [['ctrl', 1.25], ['@windows', 1.25], ['@gemini', 1.25], ['@claude', 6.25], ['@chatgpt', 1.25], ['fn', 1.25], ['menu', 1.25], ['ctrl', 1.25]],
  ];
  // Free keys fill in rank order: QWERTY row, home row, bottom row, number row, then the F row.
  const pinned = new Set(['windows', 'gemini', 'claude', 'chatgpt']);
  const queue = [...byTier('main'), ...byTier('active'), ...byTier('tried')].filter((s) => !pinned.has(s.id));
  const free = (k) => typeof k === 'number' || k[0].startsWith('~f');
  const slots = rows.map(() => []);
  for (const r of [2, 3, 4, 1, 0]) for (const k of rows[r]) if (free(k)) slots[r].push(queue.shift() ?? null);
  if (queue.length) throw new Error('keyboard: no key for ' + queue.map((q) => q.id).join(', '));
  const find = (id) => stack.find((s) => s.id === id);

  let body = `<rect width="${W}" height="${H}" rx="14" fill="#16181c"/><rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="13" stroke="#2a2d33"/>`;
  rows.forEach((row, ri) => {
    let x = pad;
    const y = pad + ri * u + (ri ? fGap : 0);
    const fill = [...slots[ri]];
    for (const k of row) {
      if (k[0] === '_') { x += k[1] * u; continue; }
      let [label, units] = typeof k === 'number' ? [null, k] : k;
      let item;
      if (free(k)) { item = fill.shift(); label = item ? null : label?.slice(1); }
      else if (label.startsWith('@')) item = find(label.slice(1));
      const kw = units * u - gap, kh = u - gap, kx = x + gap / 2, ky = y + gap / 2;
      const isClaude = item?.id === 'claude';
      const top = isClaude ? '#3b2a24' : '#2b2e34';
      const dim = item?.tier === 'tried';
      body += `<rect x="${r2(kx)}" y="${r2(ky)}" width="${r2(kw)}" height="${kh}" rx="7" fill="${isClaude ? '#24130d' : '#1d1f23'}"/>` +
        `<rect x="${r2(kx + 3)}" y="${r2(ky + 2)}" width="${r2(kw - 6)}" height="${kh - 9}" rx="5" fill="${top}"${isClaude ? ' stroke="#D97757" stroke-opacity="0.5"' : ''}/>`;
      const cx = kx + kw / 2, cy = ky + (kh - 7) / 2 + 1;
      if (isClaude) {
        const tw = measure(F.semi, 'claude', 14);
        body += icon(item, cx - (22 + 10 + tw) / 2, cy - 11, 22, top) + text(F.semi, 'claude', cx - (22 + 10 + tw) / 2 + 32, cy + 5, 14, { fill: '#f0d9cf' });
      } else if (item) {
        body += icon(item, cx - 11, cy - 11, 22, top, dim ? '#6e7681' : null);
      } else if (label) {
        body += text(F.mono, label, kx + 10, ky + 18, 10, { fill: '#7d8590' });
      }
      x += units * u;
    }
  });
  out('variants/v4/stack.svg', svg(W, H, body));
  linkCards('v4', { bg: '#1d1f23', rx: 7, stroke: '#2a2d33', fg: '#c9d1d9', h: 36 });
}

// ---------- V5: orbits, Claude in the centre ----------
function v5() {
  const H = 720, cx = W / 2, cy = H / 2;
  const rings = [
    { r: 100, items: byTier('ai').slice(1), s: 40, dur: 0 },
    { r: 172, items: byTier('main'), s: 34, dur: 240 },
    { r: 248, items: byTier('active'), s: 32, dur: 320 },
    { r: 326, items: byTier('tried'), s: 30, dur: 400, dim: true },
  ];
  let body = `<rect width="${W}" height="${H}" rx="16" fill="#0d1117"/><rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="15.5" stroke="#21262d"/>`;
  let css = '<style>@keyframes s{to{transform:rotate(360deg)}}@keyframes c{to{transform:rotate(-360deg)}}@media (prefers-reduced-motion:reduce){*{animation:none!important}}</style>';
  rings.forEach((ring, ri) => {
    body += `<circle cx="${cx}" cy="${cy}" r="${ring.r}" stroke="#30363d" stroke-dasharray="${ri === 3 ? '2 6' : '1 0'}"/>`;
    const dir = ri % 2 ? 'reverse' : 'normal';
    const spin = ring.dur ? ` style="transform-origin:${cx}px ${cy}px;animation:s ${ring.dur}s linear infinite ${dir}"` : '';
    let g = `<g${spin}>`;
    ring.items.forEach((it, i) => {
      const a = (i / ring.items.length) * Math.PI * 2 - Math.PI / 2 + ri * 0.35;
      const x = cx + ring.r * Math.cos(a), y = cy + ring.r * Math.sin(a);
      const keep = ring.dur ? ` style="transform-box:fill-box;transform-origin:center;animation:s ${ring.dur}s linear infinite ${ri % 2 ? 'normal' : 'reverse'}"` : '';
      g += `<g${keep}><circle cx="${r2(x)}" cy="${r2(y)}" r="${ring.s / 2 + 7}" fill="#161b22" stroke="#30363d"${ring.dim ? ' stroke-dasharray="2 3"' : ''}/>` +
        icon(it, x - ring.s / 4 - 3, y - ring.s / 4 - 3, ring.s / 2 + 6, '#161b22', ring.dim ? '#6e7681' : null) + `</g>`;
    });
    body += g + '</g>';
  });
  const claude = stack.find((s) => s.id === 'claude');
  body += `<circle cx="${cx}" cy="${cy}" r="58" fill="#1c120e" stroke="#D97757" stroke-opacity="0.6"/>` +
    `<circle cx="${cx}" cy="${cy}" r="66" stroke="#D97757" stroke-opacity="0.18"/>` +
    icon(claude, cx - 26, cy - 26, 52, '#1c120e');
  out('variants/v5/stack.svg', svg(W, H, body, css));
  linkCards('v5', { bg: '#161b22', rx: 16, stroke: '#30363d', fg: '#e6edf3' });
}

const names = { v1: 'Ровная сетка', v2: 'Иконки', v3: 'Таблица', v4: 'Клавиатура', v5: 'Орбиты' };
const phoneCopy = new Set(['v1', 'v2']);
const stackImg = (k) => (phoneCopy.has(k) ? pic(`${k}/stack.svg`, 'stack') : `<img alt="stack" src="${k}/stack.svg">`);
const center = (inner) => `<div align="center">\n  ${inner}\n</div>`;
for (const [k, fn] of Object.entries({ v1, v2, v3, v4, v5 })) {
  fn();
  out(`variants/${k}.md`, `<!-- ${names[k]} -->\n${header}${center(stackImg(k))}\n\n<br>\n\n${linkRow(k)}\n`);
}

// V6: orbits always shown, the other views one click away (GitHub keeps <details>).
const more = (label, k) => `<details>\n<summary>${label}</summary>\n<br>\n\n${center(stackImg(k))}\n\n</details>`;
out('variants/v6.md', `<!-- Переключатель -->\n${header}${center(stackImg('v5'))}\n\n` +
  [more('keyboard', 'v4'), more('periodic table', 'v3'), more('cards', 'v1')].join('\n\n') + `\n\n<br>\n\n${linkRow('v5')}\n`);

// Round 3: the V2 grid drawn four other ways.
const r3 = { mono: 'Монохром', tint: 'Мягкий цвет', label: 'С подписями', round: 'Круги' };
for (const [style, name] of Object.entries(r3)) {
  v2(style);
  const k = V2_DIR[style];
  out(`variants/${k}.md`, `<!-- ${name} -->\n${header}${center(pic(`${k}/stack.svg`, 'stack'))}\n\n<br>\n\n${linkRow(k)}\n`);
}

// Local review page: each variant inside a GitHub-sized README box, with a 1-10 mark and a comment.
const readme = fs.readFileSync(new URL('README.md', root), 'utf8').replaceAll('src="https://raw.githubusercontent.com/makarasty/MaKarastY/main/makarasty.png"', 'src="../makarasty.png"');
// The page shows the current round only; older variants stay in variants/ and in git.
const ROUND = ['v2', 'v2b', 'v2c', 'v2d', 'v2e'];
const files = ROUND.map((k) => `${k}.md`);
const entries = [['v0', 'Сейчас (для сравнения)', readme], ...files.map((f) => {
  const html = fs.readFileSync(new URL(`variants/${f}`, root), 'utf8');
  return [f.slice(0, -3), html.match(/^<!-- (.+?) -->/)?.[1] ?? f, html];
})];
out('variants/preview.html', fs.readFileSync(new URL('./preview.tpl.html', import.meta.url), 'utf8')
  .replace('/*DATA*/', `const VARIANTS = ${JSON.stringify(entries.map(([id, name, html]) => ({ id, name, html })))};`));

console.log('built', Object.keys(names).join(' '), '|', stack.length, 'stack items,', links.length, 'links |',
  tiers.map((t) => `${t}:${byTier(t).length}`).join(' '));
