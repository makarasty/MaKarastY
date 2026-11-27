// Round 10: disc sizes and placement (A), and three ways to make every tech clickable (B).
// A GitHub README shows an SVG as <img>, so links inside one picture never work; B1-B3 are the ways around it.
// Run: node design/r10.mjs (then the review page is rebuilt by build.mjs).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { out, svg, icon, iconColor, mix, stack, CAT, CAT_ORDER, sizeK, AI_K, SIZES, linkCards, linkRow, pic, r2, me, stackAlt } from './lib.mjs';
import { hrefs } from './stack.mjs';

const sun = (OUT, NAME, env = {}) => execFileSync(process.execPath, [fileURLToPath(new URL('./r5-sun.mjs', import.meta.url))],
  { env: { ...process.env, SET: 'all', FRAME: 'none', SIZE: 'soft', PLACE: 'score', OUT, NAME, ...env }, stdio: 'inherit' });

sun('r10-a0', 'Как сейчас, только AI разного размера', { SIZE: 'equal' });
sun('r10-a1', 'Размер по оценке (мягко), лучшие ближе к центру');
sun('r10-a2', 'Размер по оценке (сильно), лучшие ближе к центру', { SIZE: 'strong' });
sun('r10-a3', 'По группам: кольцо на каждый вид (языки, веб, базы...)', { PLACE: 'kind' });
sun('r10-a4', 'По группам: сектор на каждый вид', { PLACE: 'sector' });
sun('r10-a5', 'Вперемешку: большие и маленькие по всему цветку', { PLACE: 'mixed' });
// B1: on GitHub the picture would link to makarasty.github.io/stack; here it opens the local mock of that page.
sun('r10-site', 'site mock', { LIVE: '1' });
sun('r10-b1', 'Клик по цветку открывает страницу на твоём сайте, там кликается каждая иконка (на GitHub: makarasty.github.io/stack)',
  { STACK_HREF: 'r10-site/index.html' });

// ---------- B2 / B3: one small picture per tech, each in its own <a> (like the old badges) ----------
const BG = '#0d1117', TILE = '#161b22', LINE = '#30363d';
const idx = new Map(stack.map((s, i) => [s, i]));
const order = [...stack.filter((s) => s.tier === 'ai'),
  ...stack.filter((s) => s.tier !== 'ai').sort((a, b) =>
    (b.score ?? 0) - (a.score ?? 0) || CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || idx.get(a) - idx.get(b))];
// Every tile file has the same box, so a row stays level; the disc inside follows the soft size.
// Claude fills the box, a score-10 tech gets 90% of it.
const maxTech = SIZES.soft(10);
function tiles(dir, box) {
  for (const it of order) {
    const ai = it.tier === 'ai', R = box / 2 - 1;
    const r = ai ? R * (AI_K[it.id] / AI_K.claude) : R * 0.9 * (sizeK(it, 'soft') / maxTech);
    const c = box / 2;
    let body;
    if (ai) {
      const col = iconColor(it, TILE);
      body = `<circle cx="${c}" cy="${c}" r="${r2(r)}" fill="${mix(BG, col, 0.16)}" stroke="${col}" stroke-opacity="0.85" stroke-width="1.5"/>` + icon(it, c - r * 0.5, c - r * 0.5, r2(r), TILE);
    } else {
      const sz = r2(r * 1.2);
      body = `<circle cx="${c}" cy="${c}" r="${r2(r)}" fill="${TILE}" stroke="${mix(BG, CAT[it.cat][0], 0.45)}"/>` + icon(it, c - sz / 2, c - sz / 2, sz, TILE);
    }
    out(`variants/${dir}/t-${it.id}.svg`, svg(box, box, body));
  }
  return `<div align="center">\n` + order.map((it) =>
    `  <a href="${hrefs[it.id]}"><img alt="${it.name}" title="${it.name}" src="${dir}/t-${it.id}.svg"></a>`).join('\n') + `\n</div>`;
}
const md = (name, ...blocks) => `<!-- ${name} -->\n` + blocks.join('\n\n<br>\n\n') + '\n';

// B2: the A1 flower stays as the picture, a row of small clickable icons under it.
out('variants/r10-b2.md', md('Цветок A1 + под ним ряд маленьких кликабельных иконок',
  `<div align="center">\n  ${pic('r10-a1/stack.svg', stackAlt)}\n</div>`, tiles('r10-b2', 30), linkRow('r10-a1')));

// B3: no flower; the avatar on top, then the clickable icons by score, bigger ones first.
const AV = 120;
out('variants/r10-b3/me.svg', svg(AV, AV, `<circle cx="${AV / 2}" cy="${AV / 2}" r="${AV / 2 - 1}" stroke="#e6edf3" stroke-opacity="0.08"/>` +
  me(AV / 2, AV / 2, AV / 2 - 10) + `<circle cx="${AV / 2}" cy="${AV / 2}" r="${AV / 2 - 10}" stroke="#e6edf3" stroke-opacity="0.35"/>`));
linkCards('r10-b3', { bg: TILE, rx: 18, stroke: LINE, fg: '#e6edf3', h: 36 });
out('variants/r10-b3.md', md('Без цветка: аватар и сетка кликабельных иконок (по оценке, размер по оценке)',
  `<div align="center">\n  <img alt="makarasty" src="r10-b3/me.svg">\n</div>`, tiles('r10-b3', 44), linkRow('r10-b3')));

assert.equal(order.length, stack.length);
execFileSync(process.execPath, [fileURLToPath(new URL('./build.mjs', import.meta.url))], { stdio: 'inherit' });
