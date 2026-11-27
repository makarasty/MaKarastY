// Round 11 (2026-11-27 feedback): no duplicate icon rows; ChatGPT as big as Gemini; the flower itself is the
// link, to a page on the user's site where every icon is clickable (stack-page.mjs); smaller link buttons.
// Run: node design/r11.mjs -> variants/r11-*.md, site/stack/index.html, the review page.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const run = (file, env = {}) => execFileSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url))],
  { env: { ...process.env, ...env }, stdio: 'inherit' });
// On the review page the flower opens the local copy of the site page; final.mjs links the real one.
const sun = (OUT, NAME, env) => run('./r5-sun.mjs',
  { SET: 'all', FRAME: 'none', SIZE: 'equal', PLACE: 'score', STACK_HREF: '../site/stack/index.html', OUT, NAME, ...env });

sun('r11-a', 'Цветок как сейчас, кнопки маленькими иконками', { LINKS: 'small' });
sun('r11-b', 'Цветок как сейчас, кнопки комбинированные: контакты иконками, остальное карточками', { LINKS: 'combined' });
sun('r11-c', 'Цветок как сейчас, кнопки низкими карточками', { LINKS: 'smallcards' });
sun('r11-d', 'Размер по оценке (мягко), кнопки маленькими иконками', { SIZE: 'soft', LINKS: 'small' });
sun('r11-e', 'Серые ободки вместо цветных, кнопки маленькими иконками', { RING: 'grey', LINKS: 'small' });
run('./stack-page.mjs');
run('./build.mjs');
