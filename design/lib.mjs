// Drawing helpers shared by build.mjs (my variants) and any other variant script.
// Text is converted to outlines so every viewer sees the same widths, whatever fonts they have.
import fs from 'node:fs';
import opentype from 'opentype.js';
import * as si from 'simple-icons';
import * as si9 from 'si9';
import { stack, links, tiers } from './stack.mjs';
export { stack, links, tiers };

export const root = new URL('../', import.meta.url);
export const out = (p, s) => {
  const u = new URL(p, root);
  fs.mkdirSync(new URL('./', u), { recursive: true });
  fs.writeFileSync(u, s);
};
export const loadFont = (pkg, file) => {
  const b = fs.readFileSync(new URL(`./node_modules/@fontsource/${pkg}/files/${file}`, import.meta.url));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
};
export const F = {
  bold: loadFont('inter', 'inter-latin-700-normal.woff'),
  semi: loadFont('inter', 'inter-latin-600-normal.woff'),
  mid: loadFont('inter', 'inter-latin-500-normal.woff'),
  mono: loadFont('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'),
  monoB: loadFont('jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff'),
};

export const r2 = (n) => Math.round(n * 100) / 100;

// ---------- text ----------
export function measure(f, s, size, ls = 0) {
  return f.getAdvanceWidth(s, size) + ls * Math.max(0, [...s].length - 1);
}
export function text(f, s, x, y, size, { anchor = 'start', ls = 0, fill = '#fff', opacity } = {}) {
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
export const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
export const lum = (h) => {
  const [r, g, b] = hexToRgb(h).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
export const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
export const mix = (a, b, t) => {
  const A = hexToRgb(a), B = hexToRgb(b);
  return '#' + A.map((c, i) => Math.round((c * (1 - t) + B[i] * t) * 255).toString(16).padStart(2, '0')).join('');
};

// ---------- icons ----------
export const JAVA = fs.readFileSync(new URL('./java.svg.txt', import.meta.url), 'utf8');
// Simple stand-in marks for things simple-icons has no logo for.
export const CUSTOM = {
  mindustry: { raw: '<path d="M3 3h18v18H3zM6.5 6.5v11h11v-11zM10 10h4v4h-4z" fill="#D99D73" fill-rule="evenodd"/>', hex: '#D99D73' },
  lavalink: { raw: '<path d="M3.5 11h3.5v9H3.5zM10.25 4h3.5v16h-3.5zM17 8h3.5v12H17z" fill="#F25C54"/>', hex: '#F25C54' },
  // grass block: the simple-icons Minecraft mark is a wordmark and turns into a line at 16px
  minecraft: { raw: '<path d="M3 3h18v7H3z" fill="#62B47A"/><path d="M3 10h18v11H3z" fill="#8B5E3C"/><path d="M5 10h3v3H5zM12 10h3v2h-3zM17 10h2v4h-2z" fill="#62B47A"/>', hex: '#62B47A' },
};
export function iconData(item) {
  if (item.icon === 'java') return { raw: JAVA, vb: '0 0 256 346', hex: '#E76F00' };
  if (item.icon.startsWith('custom:')) return { ...CUSTOM[item.icon.slice(7)], vb: '0 0 24 24' };
  const s = si[item.icon] ?? si9[item.icon];
  if (!s) throw new Error(`no icon ${item.icon} for ${item.id}`);
  return { d: s.path, vb: '0 0 24 24', hex: item.color ?? '#' + s.hex };
}
// Brand colour unless it would vanish on the tile; mono forces one colour.
export function iconColor(item, bg, mono) {
  if (mono) return mono;
  const { hex } = iconData(item);
  return contrast(hex, bg) < 2.2 ? '#E6EDF3' : hex;
}
export function icon(item, x, y, size, bg, mono) {
  const data = iconData(item);
  const c = iconColor(item, bg, mono);
  const inner = data.raw
    ? data.raw.replace(/fill="#[0-9A-Fa-f]{6}"/g, (m) => (mono || c !== data.hex ? `fill="${c}"` : m))
    : `<path d="${data.d}" fill="${c}"/>`;
  return `<svg x="${r2(x)}" y="${r2(y)}" width="${size}" height="${size}" viewBox="${data.vb}">${inner}</svg>`;
}

export const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${extra}${body}</svg>\n`;

// Inside a tier, things of one kind sit together; stack.mjs order (usage) decides within a kind.
export const CAT_ORDER = ['ai', 'lang', 'web', 'data', 'infra', 'tool', 'os', 'game', 'format'];
export const byTier = (t) =>
  stack.filter((s) => s.tier === t).sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat));
export const W = 840;

// Column count in [min, max] that fills every row, nearest to `want`; falls back to `want`.
export function fullCols(n, min, max, want) {
  const fits = [];
  for (let c = min; c <= max; c++) if (n % c === 0) fits.push(c);
  return fits.sort((a, b) => Math.abs(a - want) - Math.abs(b - want) || b - a)[0] ?? want;
}

// Rows of `cols`; a short last row is centred.
export function grid(items, cols, cellW, cellH, gapX, gapY, y0, draw, width = W) {
  let body = '';
  items.forEach((it, i) => {
    const row = Math.floor(i / cols), col = i % cols;
    const inRow = Math.min(cols, items.length - row * cols);
    const rowW = inRow * cellW + (inRow - 1) * gapX;
    const x = (width - rowW) / 2 + col * (cellW + gapX);
    body += draw(it, x, y0 + row * (cellH + gapY), cellW, cellH);
  });
  const rows = Math.ceil(items.length / cols);
  return { body, h: rows * cellH + (rows - 1) * gapY };
}

// ---------- link cards (shared shape, per-variant colours) ----------
// Desktop: one row, "contact" | "other" split by a thin divider. Phone (<=600px): icon squares that fit one row.
export const PHONE = '(max-width: 600px)';
const linkGroups = [...new Set(links.map((l) => l.group))].map((g) => links.filter((l) => l.group === g));
export function linkCards(dir, st) {
  const n = links.length, gap = 4, sepW = 20; // gap: the space GitHub leaves between inline images
  const w = Math.floor((W - sepW * (linkGroups.length - 1) - (n + linkGroups.length - 2) * gap) / n), h = st.h ?? 32;
  const maxLabel = Math.max(...links.map((l) => measure(F.bold, l.name.toUpperCase(), 10, 0.9)));
  const size = Math.min(10, (10 * (w - 44)) / maxLabel);
  const frame = (fw, fh) => `<rect x="0.5" y="0.5" width="${fw - 1}" height="${fh - 1}" rx="${st.rx}" fill="${st.bg}"${st.stroke ? ` stroke="${st.stroke}"` : ''}/>`;
  const m = 36; // 7 tiles + divider + GitHub's inline gaps fit a 294px-wide phone column
  for (const l of links) {
    out(`variants/${dir}/link-${l.id}.svg`, svg(w, h,
      frame(w, h) + icon(l, 11, (h - 15) / 2, 15, st.bg) +
      text(F.bold, l.name.toUpperCase(), 33, h / 2 + size * 0.36, size, { ls: 0.9, fill: st.fg })));
    out(`variants/${dir}/link-${l.id}-m.svg`, svg(m, m, frame(m, m) + icon(l, 10, 10, 16, st.bg)));
  }
  const line = (sw, sh) => `<rect x="${sw / 2 - 0.5}" y="${sh * 0.2}" width="1" height="${sh * 0.6}" fill="${st.stroke ?? '#4a4a48'}"/>`;
  out(`variants/${dir}/link-sep.svg`, svg(sepW, h, line(sepW, h)));
  out(`variants/${dir}/link-sep-m.svg`, svg(10, m, line(10, m)));
}
// A <picture> that swaps to the `-m` file on phones.
export const pic = (src, alt, title = '') =>
  `<picture><source media="${PHONE}" srcset="${src.replace(/\.svg$/, '-m.svg')}"><img alt="${alt}"${title ? ` title="${title}"` : ''} src="${src}"></picture>`;
export const linkRow = (dir) =>
  `<div align="center">\n` +
  linkGroups.map((g) => g.map((l) => `  <a href="${l.href}">${pic(`${dir}/link-${l.id}.svg`, l.name, l.name)}</a>`).join('\n'))
    .join(`\n  ${pic(`${dir}/link-sep.svg`, '')}\n`) +
  `\n</div>`;

// ---------- shared by the variants ----------
export const CAT = {
  ai: ['#D97757', 'ai'], lang: ['#A78BFA', 'languages'], web: ['#34D399', 'web'], data: ['#60A5FA', 'data'],
  tool: ['#FBBF24', 'tools'], os: ['#F472B6', 'platforms'], infra: ['#22D3EE', 'infra'], game: ['#A3E635', 'games'],
  format: ['#94A3B8', 'formats'],
};
export const header = `<div align="center">\n  <a href="https://makarasty.github.io/">\n    <img alt="header" src="../makarasty.png">\n  </a>\n</div>\n\n<br>\n\n`;
