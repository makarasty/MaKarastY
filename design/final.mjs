// Builds the live profile from the round-8 winners: README.md + profile/ at the repo root.
// Sunflower with every item (SET=all, 9/10), no frame (FRAME=none, 9/10), no header image.
// Buttons: cards on desktop and icon squares on phones; `node final.mjs icons` uses icon squares everywhere.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const links = process.argv[2] === 'icons' ? 'icons' : 'cards';
// r5-sun writes to variants/<OUT>/..., so OUT=../profile lands in <repo>/profile/.
execFileSync(process.execPath, [fileURLToPath(new URL('./r5-sun.mjs', import.meta.url))], {
  env: { ...process.env, SET: 'all', FRAME: 'none', OUT: '../profile', LINKS: links, NAME: 'profile' },
  stdio: 'inherit',
});
const root = new URL('../', import.meta.url);
fs.rmSync(new URL('profile.md', root), { force: true }); // r5-sun's own page; README.md replaces it

const { pic, linkRow, stackAlt, aiNote } = await import('./lib.mjs');
fs.writeFileSync(new URL('README.md', root),
  `<div align="center">\n  ${pic('profile/stack.svg', stackAlt)}\n</div>\n\n<br>\n\n${linkRow('profile')}\n\n${aiNote}\n`);
console.log(`README.md written (buttons: ${links})`);
