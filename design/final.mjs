// Builds the live profile: README.md + profile/ at the repo root, from r5-sun.mjs, and the two vote pages.
// Sunflower with every item (SET=all, 9/10), no frame (FRAME=none, 9/10), no header image;
// round 12: grey rings, contacts as cards and the other links as small icons, the whole stack in the alt text,
// no folded blocks ("открывашки запрещено использовать"); round 13: the fun line 2 under the flower,
// the three AI on one orbit at nearly one size (r13-b). Any env set here can be overridden from the
// command line, e.g. AIK=now node design/final.mjs.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// r5-sun writes to variants/<OUT>/..., so OUT=../profile lands in <repo>/profile/ and its page in <repo>/profile.md.
execFileSync(process.execPath, [fileURLToPath(new URL('./r5-sun.mjs', import.meta.url))], {
  env: { SET: 'all', FRAME: 'none', SIZE: 'equal', PLACE: 'score', RING: 'grey', LINKS: 'contacts', TEXT: 'fun2',
    AIR: 'ring', AIK: 'near', ...process.env, OUT: '../profile', NAME: 'profile' },
  stdio: 'inherit',
});
execFileSync(process.execPath, [fileURLToPath(new URL('./classic.mjs', import.meta.url))], { stdio: 'inherit' });
const root = new URL('../', import.meta.url);
const page = new URL('profile.md', root);
const noTitle = (s) => s.replace(/^<!--.*-->\n/, '');
// The page links ../profile/... (relative to variants/); from the repo root that is profile/...
const readme = noTitle(fs.readFileSync(page, 'utf8')).replaceAll('../profile/', 'profile/');
fs.rmSync(page);
fs.writeFileSync(new URL('README.md', root), readme);
// Vote pages (the user sends two links to friends): GitHub renders any .md in the repo like a README.
// vote/new.md = this README, vote/old.md = the old badge profile brought up to date (classic.mjs).
fs.mkdirSync(new URL('vote/', root), { recursive: true });
fs.writeFileSync(new URL('vote/new.md', root), readme.replaceAll('profile/', '../profile/'));
fs.writeFileSync(new URL('vote/old.md', root), noTitle(fs.readFileSync(new URL('variants/classic.md', root), 'utf8'))
  .replaceAll('src="classic/', 'src="../variants/classic/'));
console.log('README.md, vote/new.md, vote/old.md written');
