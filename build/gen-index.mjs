#!/usr/bin/env node
/**
 * Regenerates front-matter/figures-and-tables.md from the actual captions
 * present in the manuscript, in SUMMARY.md order.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const summary = fs.readFileSync(path.join(ROOT, 'SUMMARY.md'), 'utf8');
const order = [...summary.matchAll(/^\s*\*\s*\[([^\]]+)\]\(([^)]+\.md)\)/gm)].map((m) => ({
  title: m[1],
  file: m[2],
}));

const figures = [];
const tables = [];
const listings = [];

const firstSentence = (s) =>
  s
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=\.)\s/)[0]
    .replace(/\.$/, '');

for (const { title, file } of order) {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) continue;
  const src = fs.readFileSync(abs, 'utf8');
  for (const m of src.matchAll(/\*\*(Figure|Table|Listing)\s+([A-Z]*-?\d+)\.\*\*\s*([^\n]*)/g)) {
    const entry = { id: m[2], caption: firstSentence(m[3]), chapter: title, file };
    if (m[1] === 'Figure') figures.push(entry);
    else if (m[1] === 'Table') tables.push(entry);
    else listings.push(entry);
  }
}

const rows = (arr, kind) =>
  arr
    .map((e) => `| **${kind} ${e.id}** | ${e.caption} | [${e.chapter}](../${e.file}) |`)
    .join('\n');

const doc = `# Index of Figures and Tables

---

{% hint style="info" %}
This index is generated from the manuscript. Figures, tables, and listings are numbered sequentially across the whole document, independent of chapter number. Executive Summary items carry an \`ES-\` prefix; appendix listings carry a \`C-\` prefix.
{% endhint %}

## Figures

| # | Caption | Chapter |
| --- | --- | --- |
${rows(figures, 'Figure')}

## Tables

| # | Caption | Chapter |
| --- | --- | --- |
${rows(tables, 'Table')}

## Listings

| # | Caption | Chapter |
| --- | --- | --- |
${rows(listings, 'Listing')}

---

**Totals:** ${figures.length} figures · ${tables.length} tables · ${listings.length} schema listings.

---

**Next:** [1. Executive Summary →](../part-1/01-executive-summary.md)
`;

fs.writeFileSync(path.join(ROOT, 'front-matter', 'figures-and-tables.md'), doc, 'utf8');
console.log(`✓ index regenerated: ${figures.length} figures, ${tables.length} tables, ${listings.length} listings`);
