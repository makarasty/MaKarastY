// Round 8: the bottom link buttons on their own, in five styles, so the user can pick them separately.
import { out, linkCards, linkRow, links } from './lib.mjs';

const styles = {
  'r8l-cards': ['Кнопки: карточки (как сейчас)', { bg: '#161b22', rx: 18, stroke: '#30363d', fg: '#e6edf3', h: 36 }],
  'r8l-classic': ['Кнопки: классика (как в старом профиле)', { bg: '#323330', rx: 2, fg: '#FFFFFF', h: 30 }],
  'r8l-icons': ['Кнопки: только иконки', { bg: '#161b22', rx: 22, stroke: '#30363d', h: 44, iconOnly: true }],
  'r8l-brand': ['Кнопки: цвет бренда', { rx: 18, h: 36, brand: true }],
};
for (const [dir, [name, st]] of Object.entries(styles)) {
  linkCards(dir, st);
  out(`variants/${dir}.md`, `<!-- ${name} -->\n${linkRow(dir)}\n`);
}
// Plain text links: no images at all, GitHub's own link colour, contact | other.
const group = (g) => links.filter((l) => l.group === g).map((l) => `<a href="${l.href}">${l.name}</a>`).join(' · ');
out('variants/r8l-text.md', `<!-- Кнопки: просто текст -->\n<p align="center">${group('contact')} &nbsp;|&nbsp; ${group('other')}</p>\n`);
console.log('built link styles:', [...Object.keys(styles), 'r8l-text'].join(' '));
