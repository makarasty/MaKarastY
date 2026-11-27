// Builds the live profile: README.md + profile/ at the repo root, from r5-sun.mjs.
// Sunflower with every item (SET=all, 9/10), no frame (FRAME=none, 9/10), no header image;
// round 12: grey rings, contacts as cards and the other links as small icons, the stack also as text
// (TEXT=both: one line under the flower and the whole list folded, short alt). Any env set here can be
// overridden from the command line, e.g. TEXT=line node design/final.mjs.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// r5-sun writes to variants/<OUT>/..., so OUT=../profile lands in <repo>/profile/ and its page in <repo>/profile.md.
execFileSync(process.execPath, [fileURLToPath(new URL('./r5-sun.mjs', import.meta.url))], {
  env: { SET: 'all', FRAME: 'none', SIZE: 'equal', PLACE: 'score', RING: 'grey', LINKS: 'contacts', TEXT: 'both', ...process.env, OUT: '../profile', NAME: 'profile' },
  stdio: 'inherit',
});
const root = new URL('../', import.meta.url);
const page = new URL('profile.md', root);
// The page links ../profile/... (relative to variants/); from the repo root that is profile/...
const md = fs.readFileSync(page, 'utf8').replace(/^<!--.*-->\n/, '').replaceAll('../profile/', 'profile/');
fs.rmSync(page);
fs.writeFileSync(new URL('README.md', root), md);
console.log('README.md written');
