/**
 * Sync updated / new markdown pages into the live GitBook space and republish.
 * Uses GITBOOK_TOKEN from the environment.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TOKEN = process.env.GITBOOK_TOKEN;
const ORG = 'j7SVn4ixz3OLy2MIcSrV';
const SPACE = 'D0XdNfmAdgJP1jGZOoL0';
const SITE = 'site_wS097';
const API = 'https://api.gitbook.com/v1';

if (!TOKEN) { console.error('Set GITBOOK_TOKEN'); process.exit(1); }

const headers = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

async function api(method, p, body) {
  const res = await fetch(`${API}${p}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`${method} ${p} -> ${res.status}: ${text.slice(0, 600)}`);
  return json;
}

function stripYaml(md) {
  return md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
}

function rewriteAssets(md) {
  const toRaw = (src) => {
    const cleaned = src.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    if (cleaned.startsWith('assets/')) {
      return `https://raw.githubusercontent.com/AmmarJamshed/data-swimming-pool-whitepaper/main/${cleaned}`;
    }
    return src;
  };
  return md
    .replace(/(!\[[^\]]*\]\()([^)\s]+)(\))/g, (m, a, src, b) => a + toRaw(src) + b)
    .replace(/(src=")([^"]+)(")/g, (m, a, src, b) => a + toRaw(src) + b);
}

function walk(pages, map = new Map(), parentId = null) {
  for (const p of pages || []) {
    map.set(p.title, { id: p.id, parentId, path: p.path });
    walk(p.pages, map, p.id);
    // also index by path basename for fuzzy match
    if (p.path) map.set(`path:${p.path}`, { id: p.id, parentId, path: p.path, title: p.title });
  }
  return map;
}

async function main() {
  // Create change request
  const cr = await api('POST', `/spaces/${SPACE}/change-requests`, {
    subject: 'Website readability — Start Here + plain English entry points',
    description: 'Adds Start Here page and simplifies cover / how-to-read / exec summary / intro DSP',
  });
  const crId = String(cr.number);
  console.log(`› CR #${crId} created`);

  const content = await api('GET', `/spaces/${SPACE}/change-requests/${crId}/content`);
  const byTitle = walk(content.pages);
  console.log(`  pages indexed: ${[...byTitle.keys()].filter((k) => !k.startsWith('path:')).length}`);

  const updates = [
    { title: 'Data Swimming Pool', file: 'README.md' },
    { title: 'Data Swimming Pool — Cover', file: 'README.md' },
    { title: 'How to Read This Whitepaper', file: 'front-matter/how-to-read.md' },
    { title: '1. Executive Summary', file: 'part-1/01-executive-summary.md' },
    { title: '8. Introducing Data Swimming Pool', file: 'part-2/08-introducing-dsp.md' },
  ];

  const changes = [];

  // Update known pages
  for (const u of updates) {
    const hit = byTitle.get(u.title);
    if (!hit) {
      console.log(`  (no match for title "${u.title}" — will try insert if needed)`);
      continue;
    }
    const md = rewriteAssets(stripYaml(fs.readFileSync(path.join(ROOT, u.file), 'utf8')));
    changes.push({
      operation: 'update_page',
      page: hit.id,
      title: u.title === 'Data Swimming Pool — Cover' ? 'Data Swimming Pool' : u.title,
      document: { markdown: md },
    });
    console.log(`  update: ${u.title}`);
  }

  // Insert Start Here under Front Matter if missing
  if (!byTitle.has('Start Here — The Simple Version')) {
    const front = byTitle.get('Front Matter');
    const md = rewriteAssets(stripYaml(fs.readFileSync(path.join(ROOT, 'front-matter/start-here.md'), 'utf8')));
    const op = {
      operation: 'insert_page',
      title: 'Start Here — The Simple Version',
      document: { markdown: md },
      at: 0,
    };
    if (front) op.into = front.id;
    changes.push(op);
    console.log('  insert: Start Here — The Simple Version');
  } else {
    const hit = byTitle.get('Start Here — The Simple Version');
    const md = rewriteAssets(stripYaml(fs.readFileSync(path.join(ROOT, 'front-matter/start-here.md'), 'utf8')));
    changes.push({
      operation: 'update_page',
      page: hit.id,
      title: 'Start Here — The Simple Version',
      document: { markdown: md },
    });
    console.log('  update: Start Here — The Simple Version');
  }

  // Deduplicate updates that pointed at same page twice (cover aliases)
  const seen = new Set();
  const unique = [];
  for (const c of changes) {
    const key = c.page || `new:${c.title}`;
    if (seen.has(key) && c.operation === 'update_page') continue;
    seen.add(key);
    unique.push(c);
  }

  console.log(`› applying ${unique.length} changes`);
  await api('POST', `/spaces/${SPACE}/change-requests/${crId}/content`, { changes: unique });

  console.log('› merging');
  await api('POST', `/spaces/${SPACE}/change-requests/${crId}/merge`, {});

  console.log('› publishing');
  const site = await api('POST', `/orgs/${ORG}/sites/${SITE}/publish`, {});
  console.log(`PUBLIC URL: ${site.urls?.published}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
