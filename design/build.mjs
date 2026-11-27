// Builds the profile SVGs and the variant READMEs from stack.mjs.
// Text is converted to outlines so every viewer sees the same widths, whatever fonts they have.
import fs from 'node:fs';
import opentype from 'opentype.js';
import * as si from 'simple-icons';
import * as si9 from 'si9';
import { stack, links, tiers } from './stack.mjs';

const root = new URL('../', import.meta.url);
const out = (p, s) => {
  const u = new URL(p, root);
  fs.mkdirSync(new URL('./', u), { recursive: true });
  fs.writeFileSync(u, s);
};
const loadFont = (pkg, file) => {
  const b = fs.readFileSync(new URL(`./node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
const F = {
  bold: loadFont('inter', 'inter-latin-700-normal.woff'),
  semi: loadFont('inter', 'inter-latin-600-normal.woff'),
  mid: loadFont('inter', 'inter-latin-500-normal.woff'),
  mono: loadFont('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
  monoB: loadFont('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'),
};

const r2 = (n) => Math.round(n * 100) / 100;

// ---------- text ----------
function measure(f, s, size, ls = 0) {
  return f.getAdvanceWidth(s, size) + ls * Math.max(0, [...s].length - 1);
}
function text(f, s, x, y, size, { anchor = 'start', ls = 0, fill = '#fff', opacity } = {}) {
  const w = measure(f, s, size, ls);
  let cx = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  let d;
  if (!ls) d = f.getPath(s, cx, y, size).toPathData(2);
  else {
    d = '';
    for (const ch of s) {
      const g = f.charToGlyph(ch);
      d += g.getPath(cx, y, size).toPathData(2);
      cx += (g.advanceWidth * size) / f.unitsPerEm + ls;
    }
  }
  return `<path d="${d}" fill="${fill}"${opacity != null ? ` opacity="${opacity}"` : ''}/>`;
}

// ---------- colour ----------
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const lum = (h) => {
  const [r, g, b] = hexToRgb(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((c, i) => Math.round((c * (1 - t) + B[i] * t) * 255).toString(16).padStart(2, '0')).join('');
};

// ---------- icons ----------
const JAVA = fs.readFileSync(new URL('./java.svg.txt', import.meta.url), 'utf8');
// Simple stand-in marks for things simple-icons has no logo for.
const CUSTOM = {
  mindustry: { raw: '<path d="M3 3h18v18H3zM6.5 6.5v11h11v-11zM10 10h4v4h-4z" fill="#D99D73" fill-rule="evenodd"/>', hex: '#D99D73' },
  lavalink: { raw: '<path d="M3.5 11h3.5v9H3.5zM10.25 4h3.5v16h-3.5zM17 8h3.5v12H17z" fill="#F25C54"/>', hex: '#F25C54' },
  // grass block: the simple-icons Minecraft mark is a wordmark and turns into a line at 16px
  minecraft: { raw: '<path d="M3 3h18v7H3z" fill="#62B47A"/><path d="M3 10h18v11H3z" fill="#8B5E3C"/><path d="M5 10h3v3H5zM12 10h3v2h-3zM17 10h2v4h-2z" fill="#62B47A"/>', hex: '#62B47A' },
};
function iconData(item) {
  if (item.icon === 'java') return { raw: JAVA, vb: '0 0 256 346', hex: '#E76F00' };
  if (item.icon.startsWith('custom:')) return { ...CUSTOM[item.icon.slice(7)], vb: '0 0 24 24' };
  const s = si[item.icon] ?? si9[item.icon];
  if (!s) throw new Error(`no icon ${item.icon} for ${item.id}`);
  return { d: s.path, vb: '0 0 24 24', hex: item.color ?? '#' + s.hex };
}
// Brand colour unless it would vanish on the tile; mono forces one colour.
function iconColor(item, bg, mono) {
  if (mono) return mono;
  const { hex } = iconData(item);
  return contrast(hex, bg) < 2.2 ? '#E6EDF3' : hex;
}
function icon(item, x, y, size, bg, mono) {
  const data = iconData(item);
  const c = iconColor(item, bg, mono);
  const inner = data.raw
    ? data.raw.replace(/fill="#[0-9A-Fa-f]{6}"/g, (m) => (mono || c !== data.hex ? `fill="${c}"` : m))
    : `<path d="${data.d}" fill="${c}"/>`;
  return `<svg x="${r2(x)}" y="${r2(y)}" width="${size}" height="${size}" viewBox="${data.vb}">${inner}</svg>`;
}

const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${extra}${body}</svg>\n`;

const byTier = (t) => stack.filter((s) => s.tier === t);
const W = 840;

// Column count in [min, max] that fills every row, nearest to `want`; falls back to `want`.
function fullCols(n, min, max, want) {
  const fits = [];
  for (let c = min; c <= max; c++) if (n % c === 0) fits.push(c);
  return fits.sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || b - a)[0] ?? want;
}

// Rows of `cols`; a short last row is centred.
function grid(items, cols, cellW, cellH, gapX, gapY, y0, draw) {
  let body = '';
  items.forEach((it, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, items.length - row * cols);
    const rowW = inRow * cellW + (inRow - 1) * gapX;
    const x = (W - rowW) / 2 + col * (cellW + gapX);
    body += draw(it, x, y0 + row * (cellH + gapY), cellW, cellH);
  });
  const rows = Math.ceil(items.length / cols);
  return { body, h: rows * cellH + (rows - 1) * gapY };
}

// ---------- link cards (shared shape, per-variant colours) ----------
function linkCards(dir, st) {
  const n = links.length, gap = 8;
  const w = Math.floor((W - (n - 1) * gap) / n), h = st.h ?? 32;
  const maxLabel = Math.max(...links.map((l) => measure(F.bold, l.name.toUpperCase(), 10, 0.9)));
  const size = Math.min(10, (10 * (w - 44)) / maxLabel);
  for (const l of links) {
    const body =
      `<rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${st.rx}" fill="${st.bg}"${st.stroke ? ` stroke="${st.stroke}"` : ''}/>` +
      icon(l, 11, (h - 15) / 2, 15, st.bg) +
      text(F.bold, l.name.toUpperCase(), 33, h / 2 + size * 0.36, size, { ls: 0.9, fill: st.fg });
    out(`variants/${dir}/link-${l.id}.svg`, svg(w, h, body));
  }
}
const linkRow = (dir) =>
  `<div align="center">\n` +
  links.map((l) => `  <a href="${l.href}"><img alt="${l.name}" title="${l.name}" src="${dir}/link-${l.id}.svg"></a>`).join('\n') +
  `\n</div>`;

// ---------- V1: same dark cards as today, one width, rows by tier ----------
function v1() {
  const bg = '#323330', dimBg = '#2a2a29';
  let y = 0, body = '';
  const ai = byTier('ai');
  const aw = (W - 2 * 8) / 3, ah = 44;
  ai.forEach((it, i) => {
    const x = i * (aw + 8);
    body += `<rect x="${r2(x)}" y="${y}" width="${r2(aw)}" height="${ah}" rx="2" fill="${bg}"/>` +
      icon(it, x + 14, y + 11, 22, bg) +
      text(F.bold, it.name.toUpperCase(), x + 48, y + 27, 13, { ls: 1.3 }) +
      text(F.mono, it.tag.toUpperCase(), x + aw - 14, y + 26.5, 10, { anchor: 'end', ls: 1, fill: '#8b949e' });
  });
  y += ah + 18;
  const blocks = ['main', 'active', 'tried'].map((t) => {
    const items = byTier(t), cols = fullCols(items.length, 5, 7, 6);
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
      text(F.bold, it.name.toUpperCase(), x + 36, yy + 16 + size * 0.36, size, { ls: (1.1 * size) / 10.5, fill: dim ? '#9da5ae' : '#fff' }));
    body += g.body;
    y += g.h + 18;
  }
  out('variants/v1/stack.svg', svg(W, y - 18, body));
  linkCards('v1', { bg, rx: 2, fg: '#fff' });
}

// ---------- V2: icons only, square tiles ----------
function v2() {
  const bg = '#161b22', stroke = '#30363d';
  // One block in usage order. AI tiles carry their brand outline, main ones are lighter, tried ones dashed grey.
  const all = tiers.flatMap(byTier);
  const cols = fullCols(all.length, 12, 16, 14), cell = 50, gap = (W - cols * cell) / (cols - 1);
  const g = grid(all, cols, cell, cell, gap, gap, 0, (it, x, yy, w, h) => {
    const dim = it.tier === 'tried', main = it.tier === 'main', ai = it.tier === 'ai';
    const edge = ai ? iconColor(it, bg) : main ? '#3d444d' : stroke;
    return `<rect x="${r2(x + 0.5)}" y="${yy + 0.5}" width="${w - 1}" height="${h - 1}" rx="12" fill="${main || ai ? '#1f262f' : bg}" stroke="${edge}"${ai ? ' stroke-opacity="0.8"' : ''}${dim ? ' stroke-dasharray="3 3"' : ''}/>` +
      icon(it, x + 13, yy + 13, 24, bg, dim ? '#6e7681' : null);
  });
  out('variants/v2/stack.svg', svg(W, g.h, g.body));
  linkCards('v2', { bg, rx: 10, stroke, fg: '#e6edf3', h: 36 });
}

// ---------- V3: periodic table, number = usage rank ----------
const CAT = {
  ai: ['#D97757', 'ai'], lang: ['#A78BFA', 'languages'], web: ['#34D399', 'web'], data: ['#60A5FA', 'data'],
  tool: ['#FBBF24', 'tools'], os: ['#F472B6', 'platforms'], infra: ['#22D3EE', 'infra'], game: ['#A3E635', 'games'],
  format: ['#94A3B8', 'formats'],
};
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

const header = `<div align="center">\n  <a href="https://makarasty.github.io/">\n    <img alt="header" src="../makarasty.png">\n  </a>\n</div>\n\n<br>\n\n`;
const names = { v1: 'Ровная сетка', v2: 'Иконки', v3: 'Таблица', v4: 'Клавиатура', v5: 'Орбиты' };
for (const [k, fn] of Object.entries({ v1, v2, v3, v4, v5 })) {
  fn();
  out(`variants/${k}.md`,
    `<!-- ${names[k]} -->\n${header}<div align="center">\n  <img alt="stack" src="${k}/stack.svg">\n</div>\n\n<br>\n\n${linkRow(k)}\n`);
}

// Local review page: each variant inside a GitHub-sized README box, with a 1-10 mark and a comment.
const readme = fs.readFileSync(new URL('README.md', root), 'utf8').replaceAll('src="https://raw.githubusercontent.com/makarasty/MaKarastY/main/makarasty.png"', 'src="../makarasty.png"');
const entries = [['v0', 'Сейчас (для сравнения)', readme], ...Object.entries(names).map(([k, n]) => [k, n, fs.readFileSync(new URL(`variants/${k}.md`, root), 'utf8')])];
out('variants/preview.html', fs.readFileSync(new URL('./preview.tpl.html', import.meta.url), 'utf8')
  .replace('/*DATA*/', `const VARIANTS = ${JSON.stringify(entries.map(([id, name, html]) => ({ id, name, html })))};`));

console.log('built', Object.keys(names).join(' '), '|', stack.length, 'stack items,', links.length, 'links |',
  tiers.map((t) => `${t}:${byTier(t).length}`).join(' '));
