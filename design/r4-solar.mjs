// Round 4, "Солнечная система": the user in the centre, the three AI on the first orbit as equals,
// categories as planets on the second orbit, each with its technologies as moons.
import { F, out, text, measure, mix, icon, iconColor, svg, stack, CAT, CAT_ORDER, header, linkCards, linkRow, pic, r2 } from './lib.mjs';

const BG = '#0d1117', TILE = '#161b22', LINE = '#30363d';
const ai = stack.filter((s) => s.tier === 'ai');
const systems = CAT_ORDER.filter((c) => c !== 'ai')
  .map((cat) => ({ cat, moons: stack.filter((s) => s.tier !== 'ai' && s.cat === cat) }))
  .filter((s) => s.moons.length);

const CSS = `<style>
@keyframes cw{to{transform:rotate(360deg)}}@keyframes ccw{to{transform:rotate(-360deg)}}
.up{transform-box:fill-box;transform-origin:center}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
</style>`;
// Spin a group around (x, y); `up` groups inside undo it so icons stay upright.
const spin = (x, y, sec, dir) => `style="transform-origin:${r2(x)}px ${r2(y)}px;animation:${dir} ${sec}s linear infinite"`;
const upright = (sec, dir) => `class="up" style="animation:${dir === 'cw' ? 'ccw' : 'cw'} ${sec}s linear infinite"`;
// Dark panel so the faint orbit lines read on GitHub's light theme too.
const panel = (w, h) => `<rect width="${w}" height="${h}" rx="16" fill="${BG}"/><rect x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="15.5" stroke="#21262d"/>`;

// The user. One function so it can become an avatar later.
function me(cx, cy, r) {
  const size = Math.min(14, (14 * r * 1.55) / measure(F.bold, 'MaKarastY', 14));
  return `<circle cx="${cx}" cy="${cy}" r="${r + 9}" stroke="#e6edf3" stroke-opacity="0.08"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#1b2028" stroke="#e6edf3" stroke-opacity="0.35"/>` +
    text(F.bold, 'MaKarastY', cx, cy + size * 0.36, size, { anchor: 'middle', fill: '#f0f6fc' });
}
function aiPlanet(it, x, y, r) {
  const c = iconColor(it, TILE);
  return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r}" fill="${mix(BG, c, 0.16)}" stroke="${c}" stroke-opacity="0.85"/>` +
    icon(it, x - r * 0.48, y - r * 0.48, Math.round(r * 0.96), TILE);
}
// One category: a labelled core and its moons on a ring that turns around it.
function system({ cat, moons }, x, y, ringR, moonR, outerSec = 0) {
  const c = CAT[cat][0], label = CAT[cat][1].replace('languages', 'lang').replace('platforms', 'os');
  const coreR = 17, fs = Math.min(8.5, (8.5 * coreR * 1.7) / measure(F.mono, label, 8.5));
  const keepUp = (inner, sec, dir) => (sec ? `<g ${upright(sec, dir)}>${inner}</g>` : inner);
  let g = `<circle cx="${r2(x)}" cy="${r2(y)}" r="${ringR}" stroke="${mix(BG, c, 0.3)}" stroke-dasharray="1 4"/>`;
  g += keepUp(`<circle cx="${r2(x)}" cy="${r2(y)}" r="${coreR}" fill="${mix(BG, c, 0.22)}" stroke="${mix(BG, c, 0.7)}"/>` +
    text(F.mono, label, x, y + fs * 0.36, fs, { anchor: 'middle', fill: mix(BG, c, 0.95) }), outerSec, 'ccw');
  let ring = `<g ${spin(x, y, 80, 'cw')}>`;
  moons.forEach((m, i) => {
    const a = (i / moons.length) * Math.PI * 2 - Math.PI / 2;
    const mx = x + ringR * Math.cos(a), my = y + ringR * Math.sin(a);
    const body = `<circle cx="${r2(mx)}" cy="${r2(my)}" r="${moonR}" fill="${TILE}" stroke="${mix(BG, c, 0.45)}"/>` +
      icon(m, mx - moonR * 0.56, my - moonR * 0.56, Math.round(moonR * 1.12), TILE);
    ring += `<g ${upright(80, 'cw')}>${keepUp(body, outerSec, 'ccw')}</g>`;
  });
  return g + ring + '</g>';
}

// Desktop: one picture, 840 wide.
function desktop() {
  const W = 840, H = 740, cx = W / 2, cy = H / 2, r1 = 108, r2o = 272;
  let body = panel(W, H) + `<circle cx="${cx}" cy="${cy}" r="${r1}" stroke="${LINE}"/>` +
    `<circle cx="${cx}" cy="${cy}" r="${r2o}" stroke="${LINE}" stroke-dasharray="2 6"/>`;
  let o1 = `<g ${spin(cx, cy, 120, 'cw')}>`;
  ai.forEach((it, i) => {
    const a = (i / ai.length) * Math.PI * 2 - Math.PI / 2;
    o1 += `<g ${upright(120, 'cw')}>${aiPlanet(it, cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), 28)}</g>`;
  });
  body += o1 + '</g>';
  let o2 = `<g ${spin(cx, cy, 300, 'ccw')}>`;
  systems.forEach((s, i) => {
    const a = (i / systems.length) * Math.PI * 2 - Math.PI / 2 + Math.PI / systems.length;
    o2 += system(s, cx + r2o * Math.cos(a), cy + r2o * Math.sin(a), 60, 13, 300);
  });
  body += o2 + '</g>' + me(cx, cy, 50);
  out('variants/r4a/stack.svg', svg(W, H, body, CSS));
}

// Phone: you and the three AI on top, the eight systems below in a 2 x 4 grid.
function phone() {
  const W = 360, top = 250, cell = 172, cols = 2, rows = Math.ceil(systems.length / cols), H = top + rows * cell;
  const cx = W / 2, cy = 118, r1 = 92;
  let body = panel(W, H) + `<circle cx="${cx}" cy="${cy}" r="${r1}" stroke="${LINE}"/>`;
  let o1 = `<g ${spin(cx, cy, 120, 'cw')}>`;
  ai.forEach((it, i) => {
    const a = (i / ai.length) * Math.PI * 2 - Math.PI / 2;
    o1 += `<g ${upright(120, 'cw')}>${aiPlanet(it, cx + r1 * Math.cos(a), cy + r1 * Math.sin(a), 24)}</g>`;
  });
  body += o1 + '</g>' + me(cx, cy, 44);
  systems.forEach((s, i) => {
    const x = (i % cols) * (W / cols) + W / cols / 2, y = top + Math.floor(i / cols) * cell + cell / 2;
    body += system(s, x, y, 62, 13);
  });
  out('variants/r4a/stack-m.svg', svg(W, H, body, CSS));
}

desktop();
phone();
linkCards('r4a', { bg: TILE, rx: 18, stroke: LINE, fg: '#e6edf3', h: 36 });
out('variants/r4a.md', `<!-- Солнечная система -->\n${header}<div align="center">\n  ${pic('r4a/stack.svg', 'stack')}\n</div>\n\n<br>\n\n${linkRow('r4a')}\n`);
console.log('built r4a |', systems.map((s) => `${s.cat}:${s.moons.length}`).join(' '));
