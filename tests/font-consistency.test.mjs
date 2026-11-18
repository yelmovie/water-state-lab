import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
async function sources(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  const groups = await Promise.all(items.filter(e => !e.name.startsWith('._')).map(async e => {
    const file = new URL(e.name + (e.isDirectory() ? '/' : ''), dir);
    return e.isDirectory() ? sources(file) : /\.(css|js|ts)$/.test(e.name) ? [[file.pathname, await readFile(file, 'utf8')]] : [];
  }));
  return groups.flat();
}
test('font shorthand keeps NanumSquareNeo for dynamic and activity labels', async () => {
  for (const [file, source] of await sources(new URL('../src/', import.meta.url))) {
    for (const [font] of source.matchAll(/\bfont\s*:[^;}]+/g)) {
      // reward-cards.css is a shared file copied unchanged; its one system-ui rule (the "?" of an empty slot) is overridden in experience.css.
      if (file.endsWith('/reward-cards.css') && font === 'font: 800 14px/1 system-ui, sans-serif') continue;
      if (/sans-serif|system-ui|Malgun|Georgia|serif/.test(font)) {
        assert.match(font, /NanumSquareNeo|var\(--font/, file + ': ' + font);
      }
    }
  }
});
test('achievement card slots use the app font', async () => {
  assert.match(await readFile(new URL('../src/experience.css', import.meta.url), 'utf8'), /\.topbar \.rc-slot\{font-family:inherit\}/);
});
