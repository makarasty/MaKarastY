// The clickable stack page for the user's site (makarasty.github.io/stack/): the same flower as the README,
// but inline, so every disc is a link. A README picture is an <img> on GitHub and cannot hold per-icon links.
// Hover or focus shows what the tool is (about.mjs); the full list sits in the page as text too,
// for phones (discs are too small to tap there) and for screen readers, search and AI agents.
// Run: node design/stack-page.mjs (env SIZE / RING / PLACE as for r5-sun.mjs) -> site/stack/index.html
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { root, out, groups, fullStack } from './lib.mjs';
import { hrefs } from './stack.mjs';
import { about } from './about.mjs';

const DIR = process.env.PAGE_SRC ?? 'r11-live';
execFileSync(process.execPath, [fileURLToPath(new URL('./r5-sun.mjs', import.meta.url))],
  { env: { ...process.env, SET: 'all', FRAME: 'none', OUT: DIR, LIVE: '1', NAME: 'live' }, stdio: 'inherit' });
const flower = fs.readFileSync(new URL(`variants/${DIR}/stack.svg`, root), 'utf8').trim()
  .replace('<svg ', '<svg role="img" aria-label="Tech stack, every icon is a link" ');

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
for (const s of fullStack) assert(about[s.id] && hrefs[s.id], `stack page: no text or link for ${s.id}`);
const host = (u) => new URL(u).hostname.replace(/^www\./, '');
const data = Object.fromEntries(fullStack.map((s) => [s.id, { n: s.name, a: about[s.id], h: host(hrefs[s.id]) }]));
const list = groups.map((g) => `<section><h2>${esc(g.title[0].toUpperCase() + g.title.slice(1))}</h2><ul>` +
  g.items.map((s) => `<li><a href="${esc(hrefs[s.id])}" target="_blank" rel="noopener">${esc(s.name)}</a> <span>${esc(about[s.id])}</span></li>`).join('') +
  `</ul></section>`).join('\n');
const ld = { '@context': 'https://schema.org', '@type': 'ProfilePage', url: 'https://makarasty.github.io/stack/',
  mainEntity: { '@type': 'Person', name: 'makarasty', url: 'https://github.com/makarasty', sameAs: ['https://makarasty.github.io/'],
    knowsAbout: fullStack.map((s) => s.name) } };

out('site/stack/index.html', `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>makarasty · stack</title>
<meta name="description" content="The tools makarasty uses, each one a link with a one-line explanation.">
<link rel="canonical" href="https://makarasty.github.io/stack/">
<link rel="icon" href="/common/icons/mky.png">
<meta name="theme-color" content="#0d1117">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>
<style>
:root{color-scheme:dark;--bg:#0d1117;--tile:#161b22;--line:#30363d;--fg:#e6edf3;--mute:#8b949e;--acc:#58a6ff}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
main{max-width:880px;margin:0 auto;padding:16px 16px 48px}
header{display:flex;justify-content:space-between;align-items:baseline;gap:12px;color:var(--mute);font-size:14px}
header a{color:var(--mute)}
a{color:var(--acc)}
.flower svg{display:block;width:100%;height:auto}
/* hold still while the pointer is on the flower, so a moving icon is easy to click */
.flower:hover g,.flower:focus-within g{animation-play-state:paused!important}
.flower a:focus-visible{outline:none}
#card{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);max-width:min(560px,calc(100vw - 32px));padding:10px 14px;
  background:var(--tile);border:1px solid var(--line);border-radius:12px;box-shadow:0 8px 24px #0008;pointer-events:none;
  opacity:0;transition:opacity .12s}
#card.on{opacity:1}
#card b{margin-right:6px}#card i{color:var(--mute);font-style:normal;font-size:13px;margin-left:6px}
details{margin-top:8px;border-top:1px solid var(--line);padding-top:12px}
summary{cursor:pointer;color:var(--mute)}
h2{font-size:15px;margin:20px 0 6px}
ul{margin:0;padding-left:18px}li{margin:2px 0}li span{color:var(--mute)}
.touch{display:none}@media (hover:none){.mouse{display:none}.touch{display:inline}}
footer{margin-top:24px;color:var(--mute);font-size:13px;text-align:center}
@media (prefers-reduced-motion:reduce){#card{transition:none}}
</style>
</head>
<body>
<main>
<header><span class="mouse">Hover an icon to see what it is, click to open it</span><span class="touch">Tap an icon to open it, or read the list below</span><a href="https://github.com/makarasty">github.com/makarasty</a></header>
<div class="flower">${flower}</div>
<details id="list"><summary>All ${fullStack.length} as a list</summary>
${list}
</details>
<footer>Each icon sits 137.5° after the one before it, the golden angle sunflower seeds grow at.</footer>
</main>
<div id="card" role="status" aria-live="polite"></div>
<script>
const D = ${JSON.stringify(data).replace(/</g, '\\u003c')};
const card = document.getElementById('card');
const show = (e) => {
  const d = D[e.currentTarget.dataset.id];
  card.replaceChildren(Object.assign(document.createElement('b'), { textContent: d.n }), d.a,
    Object.assign(document.createElement('i'), { textContent: d.h }));
  card.classList.add('on');
};
const hide = () => card.classList.remove('on');
for (const a of document.querySelectorAll('.flower a[data-id]')) {
  a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
  a.addEventListener('mouseleave', hide); a.addEventListener('blur', hide);
}
// Phones: the discs are too small to tap, so the list starts open.
if (matchMedia('(max-width: 600px)').matches) document.getElementById('list').open = true;
</script>
</body>
</html>
`);
console.log('site/stack/index.html written |', fullStack.length, 'links');
