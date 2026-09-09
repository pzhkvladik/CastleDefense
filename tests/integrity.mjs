import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(
  await readFile(path.join(projectRoot, 'tests', 'source-manifest.json'), 'utf8'),
);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const readProjectFile = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), 'utf8');

const css = await readProjectFile(manifest.cssFile);
const scripts = await Promise.all(
  manifest.scripts.map(({ file }) => readProjectFile(file)),
);
const html = await readProjectFile('index.html');

const checks = [
  {
    name: 'CSS is byte-for-byte identical to the original inline block',
    pass: sha256(css) === manifest.inlineCssSha256,
  },
  {
    name: 'Combined JavaScript matches the approved project source hash',
    pass: sha256(scripts.join('')) === manifest.currentScriptSha256,
  },
  {
    name: 'Every JavaScript chunk matches its recorded source hash',
    pass: manifest.scripts.every(
      ({ sha256: expected }, index) => sha256(scripts[index]) === expected,
    ),
  },
  {
    name: 'HTML references the extracted stylesheet',
    pass: html.includes(`<link rel="stylesheet" href="${manifest.cssFile}">`),
  },
  {
    name: 'HTML loads JavaScript chunks in the original order',
    pass: manifest.scripts.every(({ file }, index) => {
      const position = html.indexOf(`<script src="${file}"></script>`);
      const previous = index === 0
        ? -1
        : html.indexOf(`<script src="${manifest.scripts[index - 1].file}"></script>`);
      return position > previous;
    }),
  },
  {
    name: 'No executable inline style or script block remains',
    pass: !/<style(?:\s|>)/i.test(html) && !/<script(?![^>]*\bsrc=)[^>]*>/i.test(html),
  },
  {
    name: 'HTML exposes the x12 test speed control',
    pass: html.includes('data-speed="12" onclick="setGameSpeed(12)"'),
  },
  {
    name: 'Ground enemies are explicitly re-anchored after viewport changes',
    pass: scripts.join('').includes('if(!e.flying)e.y=groundY()-7;'),
  },
];

for (const check of checks) {
  console.log(`${check.pass ? 'PASS' : 'FAIL'}  ${check.name}`);
}

if (checks.some(({ pass }) => !pass)) {
  process.exitCode = 1;
}
