// Round 13 (2026-11-27): the fun line 2 under the flower (the user's pick), Gemini and ChatGPT pulled in next to
// Claude (AIR=ring), Claude's lead smaller (AIK=near), and the flower drawn in (TIGHT=1).
// Run: node design/r13.mjs -> variants/r13-*.md, the classic profile and the review page.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const run = (file, env = {}) => execFileSync(process.execPath, [fileURLToPath(new URL(file, import.meta.url))],
  { env: { ...process.env, ...env }, stdio: 'inherit' });
const sun = (OUT, NAME, env) => run('./r5-sun.mjs', { SET: 'all', FRAME: 'none', SIZE: 'equal', PLACE: 'score', RING: 'grey',
  LINKS: 'contacts', TEXT: 'fun2', AIR: 'ring', AIK: 'now', OUT, NAME, ...env });

sun('r13-a', 'Все три AI на одной орбите вокруг тебя, Claude чуть крупнее');
sun('r13-b', 'Все три AI на одной орбите, почти одного размера (Gemini и ChatGPT подросли)', { AIK: 'near' });
sun('r13-c', 'Как B, но цветок прижат к центру (на 5%, плотнее не влезает без наложений)', { AIK: 'near', TIGHT: '1' });
run('./classic.mjs');
run('./build.mjs');
