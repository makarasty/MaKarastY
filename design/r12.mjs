// Round 12 (2026-11-27): grey rings, smaller Claude, contacts as cards and the other links as small icons,
// no extra page. The variants differ only in how much of the stack is also real text on the page
// (the alt text always carries all of it).
// Run: node design/r12.mjs -> variants/r12-*.md and the review page.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const run = (file, env = {}) => execFileSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url))],
  { env: { ...process.env, ...env }, stdio: 'inherit' });
const sun = (OUT, NAME, TEXT) => run('./r5-sun.mjs',
  { SET: 'all', FRAME: 'none', SIZE: 'equal', PLACE: 'score', RING: 'grey', LINKS: 'contacts', OUT, NAME, TEXT });

sun('r12-a', 'Без текста: стек только в alt картинки (агент его читает, человек не видит)', 'none');
sun('r12-b', 'Одна маленькая строка главного стека под цветком', 'line');
// r12-c / r12-d (folded list) were rated out: "открывашки запрещено использовать" (2026-11-27).
sun('r12-e', 'Прикольная строка 1: про золотой угол подсолнуха', 'fun1');
sun('r12-f', 'Прикольная строка 2: про вращение и близость к центру', 'fun2');
run('./classic.mjs');
run('./build.mjs');
