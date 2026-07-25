#!/usr/bin/env node
/**
 * Parses every ```mermaid block with the real Mermaid parser in a headless
 * browser and reports syntax errors with file and diagram position.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

const blocks = [];
for (const file of walk(ROOT)) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  let idx = 0;
  for (const m of src.matchAll(/```mermaid\r?\n([\s\S]*?)```/g)) {
    idx += 1;
    const line = src.slice(0, m.index).split('\n').length;
    blocks.push({ file: rel, n: idx, line, code: m[1] });
  }
}

console.log(`parsing ${blocks.length} mermaid diagrams`);

const { default: puppeteer } = await import('puppeteer');
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setContent(`<!doctype html><html><body><script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose' });
window.__parse = async (code) => {
  try { await mermaid.parse(code); return null; }
  catch (e) { return String(e && e.message ? e.message : e); }
};
window.__ready = true;
</script></body></html>`, { waitUntil: 'networkidle0' });
await page.waitForFunction('window.__ready === true', { timeout: 60000 });

const failures = [];
for (const b of blocks) {
  const err = await page.evaluate((code) => window.__parse(code), b.code);
  if (err) failures.push({ ...b, err });
}
await browser.close();

if (failures.length) {
  console.error(`\n${failures.length} diagram(s) failed to parse:`);
  for (const f of failures) {
    console.error(`\n  ✗ ${f.file}:${f.line}  (diagram #${f.n})`);
    console.error('    ' + f.err.split('\n').slice(0, 6).join('\n    '));
  }
  process.exit(1);
}
console.log('✓ all diagrams parse');
