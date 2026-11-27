// Drawing helpers shared by build.mjs (my variants) and any other variant script.
// Text is converted to outlines so every viewer sees the same widths, whatever fonts they have.
import fs from 'node:fs';
import opentype from 'opentype.js';
import * as si from 'simple-icons';
import * as si9 from 'si9';
import { stack as fullStack, links as allLinks, tiers } from './stack.mjs';
export { tiers, fullStack };
// Optional links (the Site button) only with env SITE=1.
export const links = allLinks.filter((l) => !l.optional || process.env.SITE === '1');

// Which items go in the main picture (env SET); the rest goes into the collapsed "more" block.
// Old, per the user (2026-11-27): EJS, MySQL, Pterodactyl, Firebase. Unscored items count as wanted.
export const OLD = new Set(['ejs', 'mysql', 'pterodactyl', 'firebase']);
export const SETS = {
  all: () => true,
  modern: (s) => !OLD.has(s.id),
  top: (s) => !OLD.has(s.id) && (s.score == null || s.score >= 8),
};
export const SET = process.env.SET ?? 'all';
if (!SETS[SET]) throw new Error(`unknown SET=${SET}`);
export const stack = fullStack.filter((s) => s.tier === 'ai' || SETS[SET](s));
export const rest = fullStack.filter((s) => s.tier !== 'ai' && !SETS[SET](s));
// Output folder under variants/ (env OUT), so one script can build several selections.
export const OUT_DIR = process.env.OUT;

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
  // Site button: a plain globe (the GitHub Pages mark reads as text at 16px)
  site: { raw: '<circle cx="12" cy="12" r="9" stroke="#58A6FF" stroke-width="1.8" fill="none"/><path d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z" stroke="#58A6FF" stroke-width="1.6" fill="none"/>', hex: '#58A6FF' },
  // GLSL: the only set marks are the OpenGL wordmark, unreadable at 20px
  glsl: { raw: '<rect x="1.5" y="5" width="21" height="14" rx="3.5" fill="#5586A4"/>' + text(F.bold, 'GLSL', 12, 14.6, 7.6, { anchor: 'middle', fill: '#FFFFFF' }), hex: '#5586A4' },
  // round 7 additions with no mark in any icon set (playwright only backs the colour logo below)
  playwright: { raw: '<circle cx="12" cy="12" r="9" fill="#2EAD33"/>', hex: '#2EAD33' },
  elysia: { raw: '<rect x="3" y="3" width="18" height="18" rx="5" fill="#6D3BBF"/>' + text(F.bold, 'E', 12, 16.8, 13, { anchor: 'middle', fill: '#F5E1FF' }), hex: '#B07CF0' },
  grammy: { raw: '<circle cx="12" cy="12" r="9.5" fill="#229ED9"/>' + text(F.bold, 'g', 12, 15.4, 13, { anchor: 'middle', fill: '#FFFFFF' }), hex: '#229ED9' },
  ytdlp: { raw: '<rect x="2.5" y="5" width="19" height="14" rx="4" fill="#E62117"/><path d="M12 8.2v6.4M9.2 12l2.8 2.9 2.8-2.9" stroke="#FFFFFF" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>', hex: '#E62117' },
  // round 6 additions with no mark in any icon set
  sql: { raw: '<ellipse cx="12" cy="5.5" rx="8" ry="3" fill="#F0A33A"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13c0 1.7-3.6 3-8 3s-8-1.3-8-3z" fill="#C97A1E"/><path d="M4 10c0 1.7 3.6 3 8 3s8-1.3 8-3M4 14.5c0 1.7 3.6 3 8 3s8-1.3 8-3" stroke="#F0A33A" stroke-width="1.2" fill="none"/>', hex: '#F0A33A' },
  properties: { raw: '<rect x="3" y="3" width="18" height="18" rx="3" fill="#3B4A5A"/><path d="M7 8h10M7 12h10M7 16h10" stroke="#9DB4C8" stroke-width="1.6"/><circle cx="10" cy="8" r="1.8" fill="#E6EDF3"/><circle cx="15" cy="12" r="1.8" fill="#E6EDF3"/><circle cx="9" cy="16" r="1.8" fill="#E6EDF3"/>', hex: '#9DB4C8' },
  batch: { raw: '<rect x="2.5" y="4" width="19" height="16" rx="2.5" fill="#1E1E1E" stroke="#9DA5AE" stroke-width="1.2"/><path d="M6 9l3.5 3L6 15" stroke="#7EE787" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.5 15.5h6" stroke="#E6EDF3" stroke-width="1.8" stroke-linecap="round"/>', hex: '#7EE787' },
  diff: { raw: '<rect x="3" y="3" width="18" height="8.2" rx="2" fill="#1A3D24"/><rect x="3" y="12.8" width="18" height="8.2" rx="2" fill="#4A1C1C"/><path d="M12 4.6v5M9.5 7.1h5" stroke="#7EE787" stroke-width="1.8" stroke-linecap="round"/><path d="M9.5 16.9h5" stroke="#FF7B72" stroke-width="1.8" stroke-linecap="round"/>', hex: '#7EE787' },
  // picture frame + a letter, so the two image formats do not look alike
  webp: { raw: '<rect x="2.5" y="3.5" width="19" height="17" rx="2.5" fill="#1F4D2E"/><path d="M4.5 18l5-6 3.5 4 2.5-3 4 5z" fill="#57C26A"/>' + text(F.bold, 'W', 16.5, 10.6, 7, { anchor: 'middle', fill: '#E6EDF3' }), hex: '#57C26A' },
  avif: { raw: '<rect x="2.5" y="3.5" width="19" height="17" rx="2.5" fill="#3D2357"/><path d="M4.5 18l5-6 3.5 4 2.5-3 4 5z" fill="#B57EDC"/>' + text(F.bold, 'A', 16.5, 10.6, 7, { anchor: 'middle', fill: '#E6EDF3' }), hex: '#B57EDC' },
  // no icon set has a CSV mark: a small sheet with a header row
  csv: { raw: '<rect x="3" y="4" width="18" height="16" rx="2" fill="#1F7A4D"/><path d="M3 9h18M9 4v16M15 4v16M3 14.5h18" stroke="#E6EDF3" stroke-width="1.4"/>', hex: '#1F7A4D' },
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
// Full-colour logos (Iconify "logos" CC0 and "devicon" MIT sets, or a local PNG); ids not listed keep
// the one-colour simple-icons mark. The user asked for the real colour logos (round 4).
const loadSet = (pkg) => JSON.parse(fs.readFileSync(new URL(`./node_modules/@iconify-json/${pkg}/icons.json`, import.meta.url), 'utf8'));
export const ICON_SETS = {
  logos: loadSet('logos'), devicon: loadSet('devicon'), vscode: loadSet('vscode-icons'),
  deviconplain: loadSet('devicon-plain'), skill: loadSet('skill-icons'), material: loadSet('material-icon-theme'),
};
const dataUri = (file, type) => `data:${type};base64,${fs.readFileSync(new URL(`./assets/${file}`, import.meta.url)).toString('base64')}`;
export const LOGOS = {
  claude: 'logos:claude-icon', gemini: 'logos:google-gemini-icon', chatgpt: 'logos:openai-icon',
  windows: 'logos:microsoft-windows-icon', vscode: 'logos:visual-studio-code', typescript: 'logos:typescript-icon',
  javascript: 'logos:javascript', nodejs: 'logos:nodejs-icon', bun: 'logos:bun', vue: 'logos:vue', nuxt: 'logos:nuxt-icon',
  java: 'logos:java', kotlin: 'logos:kotlin-icon', gradle: 'logos:gradle', git: 'logos:git-icon', actions: 'logos:github-actions',
  obsidian: 'logos:obsidian-icon', csharp: 'logos:c-sharp', python: 'logos:python', go: 'logos:go', rust: 'logos:rust',
  react: 'logos:react', html: 'logos:html-5', css: 'logos:css-3', sass: 'logos:sass', vite: 'logos:vitejs',
  tailwind: 'logos:tailwindcss-icon', discordjs: 'devicon:discordjs', postgresql: 'logos:postgresql', redis: 'logos:redis',
  firebase: 'logos:firebase-icon', mongodb: 'logos:mongodb-icon',
  docker: 'logos:docker-icon', nginx: 'logos:nginx', intellij: 'logos:intellij-idea', debian: 'logos:debian',
  ubuntu: 'logos:ubuntu', android: 'logos:android-icon', unity: 'logos:unity', sublime: 'logos:sublimetext-icon',
  figma: 'logos:figma', notion: 'logos:notion-icon', gdrive: 'logos:google-drive', 
  toml: 'logos:toml', telegram: 'logos:telegram', gmail: 'logos:google-gmail', npm: 'logos:npm-icon',
  codewars: 'devicon:codewars', mindustry: 'png:mindustry.png', minecraft: 'vscode:file-type-minecraft',
  oxc: 'logos:oxc-icon', playwright: 'logos:playwright', vitest: 'logos:vitest', zod: 'logos:zod', prisma: 'logos:prisma',
  mariadb: 'logos:mariadb-icon', fastify: 'logos:fastify-icon', pinia: 'logos:pinia',
  ffmpeg: 'logos:ffmpeg-icon', aseprite: 'vscode:file-type-aseprite',
  // round 8: official logos fetched from each project's own repo / Wikimedia (sources in assets/logos/SOURCES.md)
  lavalink: 'file:logos/lavalink.svg', elysia: 'file:logos/elysia.svg', grammy: 'file:logos/grammy.svg',
  ytdlp: 'png:logos/ytdlp.png', davinci: 'file:logos/davinci.svg', site: 'pngpx:logos/site.png',
  // round 8 icon review: these read better as the VS Code file-type marks (the user: "некоторые кринж")
  json: 'vscode:file-type-json', yaml: 'vscode:file-type-yaml', xml: 'vscode:file-type-xml',
  sqlite: 'vscode:file-type-sqlite', sql: 'vscode:file-type-sql',
  properties: 'vscode:file-type-config', webp: 'vscode:file-type-webp',
  avif: 'vscode:file-type-avif', drizzle: 'vscode:file-type-drizzle-orm',
  ejs: 'vscode:file-type-ejs', csv: 'vscode:file-type-csv', diff: 'vscode:file-type-diff',
  bash: 'logos:bash-icon', powershell: 'devicon:powershell', markdown: 'devicon:markdown',
  svg: 'logos:svg',
};
const LIGHT = '#E6EDF3';
// The user's own picks from variants/icons.html (round 10) win over LOGOS above.
const PICKS_FILE = new URL('./icon-picks.json', import.meta.url);
export const PICKS = fs.existsSync(PICKS_FILE) ? JSON.parse(fs.readFileSync(PICKS_FILE, 'utf8')) : {};
function colourLogo(id) {
  const ref = PICKS[id] ?? LOGOS[id];
  return ref ? logoFromRef(ref, id) : null;
}
// Draws any icon from a 'set:name' reference: an Iconify set, 'si:<simple-icons key>', 'custom:<CUSTOM key>',
// 'png:<file under assets/>' or 'file:<svg under assets/>'.
export function logoFromRef(ref, id = ref) {
  const [set, name] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)];
  if (set === 'custom') return { raw: CUSTOM[name].raw, vb: '0 0 24 24' };
  // pixel art (the site's 32px favicon): scale with hard pixels, not blur
  if (set === 'pngpx') return { raw: `<image href="${dataUri(name, 'image/png')}" width="24" height="24" style="image-rendering:pixelated"/>`, vb: '0 0 24 24' };
  if (set === 'si') {
    const s = si[name] ?? si9[name];
    if (!s) throw new Error(`no ${ref} for ${id}`);
    const hex = '#' + s.hex;
    return { raw: `<path d="${s.path}" fill="${lum(hex) < 0.05 ? LIGHT : hex}"/>`, vb: '0 0 24 24' };
  }
  if (set === 'png') return { raw: `<image href="${dataUri(name, 'image/png')}" width="24" height="24"/>`, vb: '0 0 24 24' };
  if (set === 'file') {
    // Official logo saved under assets/ (see assets/logos/SOURCES.md). Editor metadata is cut so the
    // inner markup stays valid without the inkscape/sodipodi namespaces.
    const src = fs.readFileSync(new URL(`./assets/${name}`, import.meta.url), 'utf8');
    const open = src.match(/<svg\b[^>]*>/);
    const vb = open[0].match(/viewBox="([^"]+)"/)?.[1];
    if (!vb) throw new Error(`no viewBox in ${name}`);
    const inner = src.slice(open.index + open[0].length, src.lastIndexOf('</svg>'))
      .replace(/<metadata[\s\S]*?<\/metadata>/g, '').replace(/<sodipodi:[\s\S]*?(\/>|<\/sodipodi:[a-z]+>)/g, '')
      .replace(/\s(inkscape|sodipodi):[\w-]+="[^"]*"/g, '').replace(/xlink:href=/g, 'href=');
    return { raw: inner, vb };
  }
  const s = ICON_SETS[set], ic = s.icons[name];
  if (!ic) throw new Error(`no ${ref} for ${id}`);
  let body = ic.body;
  // A logo drawn only in near-black (Rust, Unity...) vanishes on a dark tile: draw it light instead.
  const fills = [...body.matchAll(/fill="(#[0-9a-fA-F]{3,6}|currentColor)"/g)].map((m) => m[1]);
  const hex6 = (h) => (h.length === 4 ? '#' + [...h.slice(1)].map((c) => c + c).join('') : h);
  const dark = !/fill="url\(/.test(body) &&
    (fills.length === 0 || fills.every((f) => f === 'currentColor' || lum(hex6(f)) < 0.05));
  // The root <svg fill="none"> would blank every path that relies on the default black fill.
  body = dark ? `<g fill="${LIGHT}">${body.replace(/fill="(#[0-9a-fA-F]{3,6}|currentColor)"/g, `fill="${LIGHT}"`)}</g>`
    : `<g fill="#000">${body}</g>`;
  return { raw: body, vb: `0 0 ${ic.width ?? s.width} ${ic.height ?? s.height}` };
}
export function icon(item, x, y, size, bg, mono) {
  const logo = !mono && colourLogo(item.id);
  if (logo) return `<svg x="${r2(x)}" y="${r2(y)}" width="${size}" height="${size}" viewBox="${logo.vb}">${logo.raw}</svg>`;
  const data = iconData(item);
  const c = iconColor(item, bg, mono);
  const inner = data.raw
    ? data.raw.replace(/fill="#[0-9A-Fa-f]{6}"/g, (m) => (mono || c !== data.hex ? `fill="${c}"` : m))
    : `<path d="${data.d}" fill="${c}"/>`;
  return `<svg x="${r2(x)}" y="${r2(y)}" width="${size}" height="${size}" viewBox="${data.vb}">${inner}</svg>`;
}

// The user's GitHub avatar (downloaded with their OK, 2026-11-27), clipped by `clip` (a shape's markup)
// or a circle. `id` must be unique inside one SVG.
export const AVATAR = dataUri('avatar.jpg', 'image/jpeg');
export function me(cx, cy, r, { clip, id = 'me' } = {}) {
  const shape = clip ?? `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r}"/>`;
  return `<clipPath id="${id}">${shape}</clipPath>` +
    `<image href="${AVATAR}" x="${r2(cx - r)}" y="${r2(cy - r)}" width="${2 * r}" height="${2 * r}" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id})"/>`;
}

export const svg = (w, h, body, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${extra}${body}</svg>\n`;

// Inside a tier, things of one kind sit together; stack.mjs order (usage) decides within a kind.
export const CAT_ORDER = ['ai', 'lang', 'web', 'data', 'infra', 'editor', 'tool', 'apps', 'ui', 'media', 'os', 'game', 'format'];
// Higher user score first; unscored last; ties keep stack.mjs order (Array.sort is stable).
export const byScore = (a, b) => (b.score ?? 0) - (a.score ?? 0);
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
  const w = st.cardW ?? Math.floor((W - sepW * (linkGroups.length - 1) - (n + linkGroups.length - 2) * gap) / n), h = st.h ?? 32;
  const maxLabel = Math.max(...links.map((l) => measure(F.bold, l.name.toUpperCase(), 10, 0.9)));
  const size = Math.min(10, (10 * (w - 44)) / maxLabel);
  const m = 36; // 7 tiles + divider + GitHub's inline gaps fit a 294px-wide phone column
  // st.iconOnly: square icon tiles on desktop too; st.brand: each card filled with its brand colour.
  const brandBg = (l) => mix(iconColor(l, '#0d1117'), '#000000', 0.35);
  for (const l of links) {
    const bg = st.brand ? brandBg(l) : st.bg;
    const card = (fw, fh) => `<rect x="0.5" y="0.5" width="${fw - 1}" height="${fh - 1}" rx="${st.rx}" fill="${bg}"${st.stroke && !st.brand ? ` stroke="${st.stroke}"` : ''}/>`;
    // st.iconGroups: only these groups get icon squares, the rest stay cards ("combined").
    out(`variants/${dir}/link-${l.id}.svg`, st.iconOnly || st.iconGroups?.includes(l.group)
      ? svg(h, h, card(h, h) + icon(l, h * 0.27, h * 0.27, Math.round(h * 0.46), bg))
      : svg(w, h, card(w, h) + icon(l, 11, (h - 15) / 2, 15, bg, st.brand ? '#FFFFFF' : null) +
        text(F.bold, l.name.toUpperCase(), 33, h / 2 + size * 0.36, size, { ls: 0.9, fill: st.brand ? '#FFFFFF' : st.fg })));
    out(`variants/${dir}/link-${l.id}-m.svg`, svg(m, m, card(m, m) + icon(l, 10, 10, 16, bg, st.brand ? '#FFFFFF' : null)));
  }
  const line = (sw, sh) => `<rect x="${sw / 2 - 0.5}" y="${sh * 0.2}" width="1" height="${sh * 0.6}" fill="${st.stroke ?? '#4a4a48'}"/>`;
  out(`variants/${dir}/link-sep.svg`, svg(sepW, h, line(sepW, h)));
  out(`variants/${dir}/link-sep-m.svg`, svg(10, m, line(10, m)));
}
// A <picture> that swaps to the `-m` file on phones.
export const pic = (src, alt, title = '') =>
  `<picture><source media="${PHONE}" srcset="${src.replace(/\.svg$/, '-m.svg')}"><img alt="${alt}"${title ? ` title="${title}"` : ''} src="${src}"></picture>`;

// What the main picture leaves out, as one row-filling grid of tiles inside a collapsed <details>.
export function moreBlock(dir) {
  if (!rest.length) return '';
  const items = [...rest].sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || byScore(a, b));
  const tile = (it, x, y, c) => `<rect x="${r2(x + 0.5)}" y="${r2(y + 0.5)}" width="${r2(c - 1)}" height="${r2(c - 1)}" rx="${r2(c * 0.24)}" fill="#161b22" stroke="#30363d"/>` +
    icon(it, x + c * 0.25, y + c * 0.25, Math.round(c * 0.5), '#161b22');
  for (const [file, maxW, lo, hi, cell] of [['more', 840, 6, 14, 46], ['more-m', 360, 4, 7, 44]]) {
    const cols = Math.min(items.length, fullCols(items.length, lo, hi, hi)), gap = 8;
    const w = Math.min(maxW, cols * cell + (cols - 1) * gap);
    const g = grid(items, cols, cell, cell, gap, gap, 0, (it, x, y) => tile(it, x, y, cell), w);
    out(`variants/${dir}/${file}.svg`, svg(w, r2(g.h), g.body));
  }
  return `<details>\n<summary>+${items.length} more</summary>\n<br>\n\n<div align="center">\n  ${pic(`${dir}/more.svg`, 'more')}\n</div>\n\n</details>`;
}
export const linkRow = (dir) =>
  `<div align="center">\n` +
  linkGroups.map((g) => g.map((l) => `  <a href="${l.href}">${pic(`${dir}/link-${l.id}.svg`, l.name, l.name)}</a>`).join('\n'))
    .join(`\n  ${pic(`${dir}/link-sep.svg`, '')}\n`) +
  `\n</div>`;

// ---------- disc size (round 10) ----------
// The three AI differ by how much the user uses them (stack.mjs tag main / second / images):
// "отношения к ним разные" (2026-11-27) replaced the earlier "three AI equal".
// ChatGPT "хотя бы такой же, как у Gemini"; Claude still first but "можно немного уменьшить" (2026-11-27).
export const AI_K = { claude: 0.98, gemini: 0.86, chatgpt: 0.86 };
// Tech size by the user's 1-10 score.
export const SIZES = {
  equal: () => 1,
  soft: (s) => 0.64 + 0.051 * s, // 10 -> 1.15, 5 -> 0.9, 2 -> 0.74
  strong: (s) => 0.2 + 0.1 * s, // 10 -> 1.2, 8 -> 1, 5 -> 0.7, 2 -> 0.4
};
export function sizeK(it, size) {
  if (!SIZES[size]) throw new Error(`unknown SIZE=${size}`);
  return it.tier === 'ai' ? AI_K[it.id] : SIZES[size](it.score ?? 5);
}

// ---------- text for readers that cannot see the pictures (screen readers, AI agents, search) ----------
// The whole profile is images, so the alt text says everything the picture shows (the user: the agent must
// not be blind to the stack). No hidden text or comments aimed at AI: screeners flag hidden prompts in
// resumes and recruiters reject them (Duke/hireEZ study, NYT 2025).
// Grouped by kind, not by how often it is used: kind is a fact anyone can check, and it is how skill
// lists are read. Inside a kind, the user's score decides (higher first).
const KIND = { ai: 'AI', lang: 'Languages', web: 'Web', data: 'Data', infra: 'Infra', editor: 'Editors', tool: 'Tools',
  apps: 'Apps', ui: 'UI', media: 'Media', os: 'Platforms', game: 'Games', format: 'Formats' };
export const kinds = CAT_ORDER.map((c) => ({ c, title: KIND[c],
  items: fullStack.filter((s) => s.cat === c).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)) })).filter((k) => k.items.length);
for (const s of fullStack) if (!KIND[s.cat]) throw new Error(`no kind title for ${s.cat} (${s.id})`);
// The one visible line (TEXT=line): the main web stack, from the data, not hand-picked. Languages, web, data
// and infra with the user's score 9+, not old; tier first (every day before active), then score, then kind.
const TIER_RANK = { ai: 0, main: 1, active: 2, tried: 3 };
export const keyLine = fullStack
  .filter((s) => ['lang', 'web', 'data', 'infra'].includes(s.cat) && (s.score ?? 0) >= 9 && !OLD.has(s.id))
  .sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || b.score - a.score || CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat))
  .slice(0, 12);
export const stackAlt = `Tech stack of makarasty around their avatar. ` +
  kinds.map((k) => `${k.title}: ${k.items.map((s) => s.name).join(', ')}.`).join(' ');

// ---------- shared by the variants ----------
export const CAT = {
  ai: ['#D97757', 'ai'], lang: ['#A78BFA', 'languages'], web: ['#34D399', 'web'], data: ['#60A5FA', 'data'],
  tool: ['#FBBF24', 'tools'], os: ['#F472B6', 'platforms'], infra: ['#22D3EE', 'infra'], game: ['#A3E635', 'games'],
  format: ['#94A3B8', 'formats'], editor: ['#FB923C', 'editors'], apps: ['#E879F9', 'apps'], ui: ['#F87171', 'ui'],
  media: ['#2DD4BF', 'media'],
};
export const header = `<div align="center">\n  <a href="https://makarasty.github.io/">\n    <img alt="header" src="../makarasty.png">\n  </a>\n</div>\n\n<br>\n\n`;
