// Round 10: an icon picker. For every stack item and link, every matching icon from every set, so the
// user picks the one they like; the picks go to design/icon-picks.json (read by lib.mjs) via the copy button.
import fs from 'node:fs';
import * as si from 'simple-icons';
import * as si9 from 'si9';
import { fullStack, ICON_SETS, LOGOS, PICKS, logoFromRef, out, svg } from './lib.mjs';
import { links as allLinks } from './stack.mjs';

// Search words per item when its id alone would miss (or over-match) the icon names.
const ALIAS = {
  claude: ['claude', 'anthropic'], gemini: ['google-gemini', 'gemini', 'googlegemini', 'google-bard'],
  chatgpt: ['openai', 'chatgpt'], windows: ['microsoft-windows', 'windows', 'windows11', 'windows8'],
  vscode: ['visual-studio-code', 'vscode', 'visualstudiocode'], typescript: ['typescript'], javascript: ['javascript'],
  nodejs: ['nodejs', 'node', 'nodedotjs'], vue: ['vue', 'vuejs', 'vuedotjs'], nuxt: ['nuxt', 'nuxtjs', 'nuxtdotjs'],
  java: ['java', 'openjdk'], actions: ['github-actions', 'githubactions'], csharp: ['c-sharp', 'csharp'],
  html: ['html-5', 'html5', 'html'], css: ['css-3', 'css3', 'css'], sass: ['sass', 'scss'], vite: ['vitejs', 'vite'],
  tailwind: ['tailwindcss', 'tailwind'], discordjs: ['discordjs', 'discord'], postgresql: ['postgresql', 'postgres'],
  intellij: ['intellij-idea', 'intellij', 'intellijidea'], sublime: ['sublimetext', 'sublime', 'sublime-text'],
  drawio: ['drawio', 'diagramsdotnet', 'diagrams-net'], gdrive: ['google-drive', 'googledrive'], env: ['dotenv', 'env'],
  oxc: ['oxc', 'oxlint'], ytdlp: ['yt-dlp', 'ytdlp'], davinci: ['davinciresolve', 'davinci'],
  obs: ['obs', 'obsstudio', 'obs-studio'], properties: ['properties', 'config', 'settings', 'ini'], webp: ['webp'],
  diff: ['diff', 'git-diff'], batch: ['bat', 'batch', 'cmd'], bash: ['bash', 'gnubash', 'shell', 'console'],
  glsl: ['glsl', 'opengl', 'shader'], sql: ['sql', 'database'], drizzle: ['drizzle', 'drizzle-orm'],
  elysia: ['elysia', 'elysiajs'], go: ['go', 'golang'], yaml: ['yaml', 'yml'], avalonia: ['avalonia', 'avaloniaui'],
  proton: ['protonmail', 'proton'], gmail: ['gmail', 'google-gmail'], services: ['uptimekuma', 'uptime-kuma'],
  site: ['githubpages', 'github-pages'],
};
const SUFFIX = /^(icon|original|plain|line|wordmark|dark|light|alt|colored|filled|outline|old|new|\d+)(-[a-z0-9-]*)?$/;
const SET_ORDER = ['logos', 'skill', 'devicon', 'deviconplain', 'vscode', 'material'];
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

function candidates(item) {
  const words = ALIAS[item.id] ?? [item.id];
  const refs = new Set();
  const current = PICKS[item.id] ?? LOGOS[item.id] ?? (item.icon.startsWith('custom:') ? item.icon : `si:${item.icon}`);
  refs.add(current);
  for (const set of SET_ORDER) {
    for (const key of Object.keys(ICON_SETS[set].icons)) {
      const k = set === 'vscode' ? key.replace(/^file-type-(light-)?/, '') : key;
      if (set === 'vscode' && !key.startsWith('file-type-')) continue;
      if (words.some((w) => k === w || (k.startsWith(w + '-') && SUFFIX.test(k.slice(w.length + 1))))) refs.add(`${set}:${key}`);
    }
  }
  for (const key of [...Object.keys(si), ...Object.keys(si9)])
    if (words.some((w) => norm(key) === 'si' + norm(w))) refs.add(`si:${key}`);
  // custom:playwright is only a fallback dot behind the real logo, not a choice.
  if (item.icon.startsWith('custom:') && item.icon !== 'custom:playwright') refs.add(item.icon);
  // Same drawing under two names shows once.
  const seen = new Set(), list = [];
  for (const ref of refs) {
    let o;
    try { o = logoFromRef(ref, item.id); } catch { continue; }
    const sig = o.raw.length + ':' + o.raw.slice(0, 200);
    if (seen.has(sig)) continue;
    seen.add(sig);
    const uri = 'data:image/svg+xml;base64,' + Buffer.from(svg(48, 48, `<svg width="48" height="48" viewBox="${o.vb}">${o.raw}</svg>`)).toString('base64');
    list.push({ ref, uri, current: ref === current });
  }
  return list;
}

const items = [...fullStack, ...allLinks].map((it) => ({ id: it.id, name: it.name, score: it.score ?? null, link: !('tier' in it), options: candidates(it) }));
const total = items.reduce((n, i) => n + i.options.length, 0);
const tpl = fs.readFileSync(new URL('./icons.tpl.html', import.meta.url), 'utf8');
out('variants/icons.html', tpl.replace('/*DATA*/', `const ITEMS = ${JSON.stringify(items)};`));
console.log(`icons page: ${items.length} items, ${total} options, single-option items: ${items.filter((i) => i.options.length === 1).map((i) => i.id).join(' ')}`);
