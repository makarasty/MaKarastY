// The old profile (README on main: header + rows of shields.io badges), brought up to date for a fair
// side-by-side with the sunflower: every tech from stack.mjs, the user's own icon picks, one badge per tech
// drawn here (so every icon matches and nothing depends on shields.io), each badge its own link.
// Run: node design/classic.mjs -> variants/classic.md + variants/classic/*.svg
import assert from 'node:assert/strict';
import { F, out, text, measure, icon, svg, fullStack, links, kinds, r2 } from './lib.mjs';
import { hrefs } from './stack.mjs';

const D = 'classic', BG = '#323330', H = 28; // the old badges: shields.io "for-the-badge", colour 323330
// Rows in the old profile's order: platforms, editors, web, languages, data, formats, AI, apps, then the rest.
const ROWS = ['os', 'editor', 'web', 'lang', 'data', 'format', 'ai', 'apps', 'infra', 'tool', 'media', 'game', 'ui'];
assert.deepEqual([...ROWS].sort(), kinds.map((k) => k.c).sort(), 'classic: a kind has no row');

function badge(file, it) {
  const label = it.name.toUpperCase(), size = 10, ls = 1, pad = 10, is = 14;
  const w = Math.ceil(pad + is + 7 + measure(F.bold, label, size, ls) + pad);
  out(`variants/${D}/${file}.svg`, svg(w, H, `<rect width="${w}" height="${H}" fill="${BG}"/>` +
    icon(it, pad, (H - is) / 2, is, BG) + text(F.bold, label, pad + is + 7, H / 2 + size * 0.36, size, { ls, fill: '#FFFFFF' })));
}
// A long kind is split into balanced lines (14 -> 7 + 7), so no row ends in a lone wrapped badge.
const MAX = 8;
const row = (items, href, file) => {
  const lines = Math.ceil(items.length / MAX), per = Math.ceil(items.length / lines);
  return Array.from({ length: lines }, (_, i) => `<div align="center">\n` + items.slice(i * per, (i + 1) * per).map((it) => {
    badge(file(it), it);
    return `  <a href="${href(it)}"><img alt="${it.name}" title="${it.name}" src="${D}/${file(it)}.svg"></a>`;
  }).join('\n') + `\n</div>`).join('\n');
};

const rows = ROWS.map((c) => kinds.find((k) => k.c === c)).map((k) => row(k.items, (it) => hrefs[it.id], (it) => `t-${it.id}`));
const linkRow = row(links, (l) => l.href, (l) => `link-${l.id}`);
const header = `<div align="center">\n  <a href="https://makarasty.github.io/">\n    <img alt="makarasty" src="../makarasty.png">\n  </a>\n</div>`;
out(`variants/${D}.md`, `<!-- Старый профиль, допиленный: все технологии, твои иконки, каждая кнопка - ссылка -->\n` +
  [header, ...rows, linkRow].join('\n\n<br>\n\n') + '\n');
assert.equal(rows.join('').match(/<a /g).length, fullStack.length, 'classic: not every tech has a badge');
console.log('built classic |', fullStack.length, 'tech badges in', rows.length, 'rows +', links.length, 'links');
