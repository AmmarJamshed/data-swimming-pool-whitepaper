#!/usr/bin/env node
/**
 * Verifies that every SUMMARY.md entry resolves to a file, that every relative
 * Markdown link and image path resolves, and that no chapter file is orphaned
 * from the table of contents.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const problems = [];
let checked = 0;

/* --- 1. SUMMARY entries resolve --------------------------------------- */

const summary = fs.readFileSync(path.join(ROOT, 'SUMMARY.md'), 'utf8');
const listed = new Set();
for (const m of summary.matchAll(/^\s*\*\s*\[[^\]]+\]\(([^)]+\.md)\)/gm)) {
  const rel = m[1];
  listed.add(path.resolve(ROOT, rel));
  if (!fs.existsSync(path.join(ROOT, rel))) problems.push(`SUMMARY.md -> missing file: ${rel}`);
  checked += 1;
}

/* --- 2. Walk every markdown file -------------------------------------- */

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    if (e.name === 'node_modules' || e.name === 'dist' || e.name.startsWith('.')) return [];
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });

const files = walk(ROOT);

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const src = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);

  // Links
  for (const m of src.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1];
    if (/^(https?:|mailto:|#|data:)/.test(target)) continue;
    const [filePart] = target.split('#');
    if (!filePart) continue;
    checked += 1;
    if (!fs.existsSync(path.resolve(dir, filePart))) {
      problems.push(`${rel} -> broken link: ${target}`);
    }
  }

  // Images
  for (const m of src.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const target = m[1];
    if (/^(https?:|data:)/.test(target)) continue;
    checked += 1;
    if (!fs.existsSync(path.resolve(dir, target))) {
      problems.push(`${rel} -> missing image: ${target}`);
    }
  }

  // Orphan check — root docs that are intentionally outside SUMMARY
  const allowedOrphans = new Set([
    path.join(ROOT, 'SUMMARY.md'),
    path.join(ROOT, 'PUBLISHING.md'),
  ]);
  if (!listed.has(file) && !allowedOrphans.has(file)) {
    problems.push(`${rel} -> not referenced in SUMMARY.md`);
  }

  // Unbalanced GitBook hint blocks (skip files that aren't chapters)
  if (!allowedOrphans.has(file)) {
    const open = (src.match(/\{%\s*hint/g) || []).length;
    const close = (src.match(/\{%\s*endhint/g) || []).length;
    if (open !== close) problems.push(`${rel} -> unbalanced hint blocks (${open} open, ${close} close)`);
  }
}

/* --- 3. Figure and table numbering ------------------------------------ */

const numbers = { Figure: [], Table: [], Listing: [] };
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\*\*(Figure|Table|Listing)\s+([A-Z]*-?\d+)\.\*\*/g)) {
    numbers[m[1]].push({ id: m[2], file: path.relative(ROOT, file).replace(/\\/g, '/') });
  }
}
for (const kind of ['Figure', 'Table']) {
  const seen = new Map();
  for (const n of numbers[kind]) {
    if (seen.has(n.id)) problems.push(`Duplicate ${kind} ${n.id}: ${seen.get(n.id)} and ${n.file}`);
    else seen.set(n.id, n.file);
  }
}

/* --- Report ------------------------------------------------------------ */

console.log(`checked ${checked} references across ${files.length} documents`);
console.log(`figures: ${numbers.Figure.length}  tables: ${numbers.Table.length}  listings: ${numbers.Listing.length}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error('  ✗ ' + p);
  process.exit(1);
}
console.log('✓ all references resolve');
