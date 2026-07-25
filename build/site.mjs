#!/usr/bin/env node
/**
 * Static website builder for the Data Swimming Pool whitepaper.
 *
 * Produces a colour-coded, searchable reading site in `site/`:
 *   - custom landing page with hero and part cards
 *   - one page per chapter, grouped and colour-coded by Part
 *   - sticky header with a persistent "Download PDF" action
 *   - sidebar navigation, on-this-page rail, prev/next, client-side search
 *
 *   node build/site.mjs            -> site/
 *   SITE_BASE=/ node build/site.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'site');
const BASE = (process.env.SITE_BASE ?? '/data-swimming-pool-whitepaper').replace(/\/$/, '');

const TITLE = 'Data Swimming Pool';
const SUBTITLE = 'An Intelligent Enterprise Data Ecosystem for Connected, Living Data';
const AUTHOR = 'Ammar Jamshed';
const PDF_NAME = 'data-swimming-pool-whitepaper.pdf';
const GITHUB = 'https://github.com/AmmarJamshed/data-swimming-pool-whitepaper';
const LINKEDIN = 'https://www.linkedin.com/in/ammarjamshed/';

/* ------------------------------------------------------------------ */
/* Part identity — each Part gets its own colour so readers always     */
/* know where they are in the document.                                */
/* ------------------------------------------------------------------ */

const PARTS = {
  Overview: {
    key: 'ovw', hue: '#0e6a86', hue2: '#1ba0bd', tint: '#e6f4f9',
    icon: '📘', blurb: 'Publication details, citation, licence, and how the document is put together.',
  },
  'Front Matter': {
    key: 'front', hue: '#0e8ba8', hue2: '#28c2d8', tint: '#e6f7fb',
    icon: '🧭', blurb: 'Orientation, plain-English tour, and the disclaimers that frame everything else.',
  },
  'Part I — Context and Motivation': {
    key: 'p1', hue: '#5b52d6', hue2: '#8b7bf0', tint: '#eeecfd',
    icon: '🔍', blurb: 'Why six decades of data architecture still leave one gap wide open.',
  },
  'Part II — The Data Swimming Pool': {
    key: 'p2', hue: '#0b8ea3', hue2: '#22c1d6', tint: '#e4f7fa',
    icon: '🏊', blurb: 'The proposed architecture, layer by layer — the core of the whitepaper.',
  },
  'Part III — Enterprise Qualities': {
    key: 'p3', hue: '#0f8a5f', hue2: '#2fbd85', tint: '#e6f7ef',
    icon: '🛡️', blurb: 'Security, privacy, governance, scale, availability, and performance.',
  },
  'Part IV — Illustrative Enterprise Scenarios': {
    key: 'p4', hue: '#c2701c', hue2: '#eda03f', tint: '#fdf2e3',
    icon: '🏭', blurb: 'Twelve synthetic industry stories, from banking to aviation.',
  },
  'Part V — Evaluation and Outlook': {
    key: 'p5', hue: '#c2445f', hue2: '#e8748c', tint: '#fdeef1',
    icon: '⚖️', blurb: 'How it compares, what it promises, where it breaks, and what comes next.',
  },
  Appendices: {
    key: 'apx', hue: '#7b4fc9', hue2: '#a681e6', tint: '#f2ecfd',
    icon: '📎', blurb: 'Glossary, blueprint, schemas, readiness assessment, licensing, author.',
  },
};

const DEFAULT_PART = { key: 'front', hue: '#0e8ba8', hue2: '#28c2d8', tint: '#e6f7fb', icon: '📄', blurb: '' };

/* ------------------------------------------------------------------ */
/* Read the table of contents                                          */
/* ------------------------------------------------------------------ */

function readOrder() {
  const summary = fs.readFileSync(path.join(ROOT, 'SUMMARY.md'), 'utf8');
  const items = [];
  let group = null;
  for (const line of summary.split(/\r?\n/)) {
    const g = line.match(/^##\s+(.+?)\s*$/);
    if (g) { group = g[1]; continue; }
    const link = line.match(/^\s*\*\s*\[([^\]]+)\]\(([^)]+\.md)\)/);
    // The GitBook cover becomes an "about" page here; the site has its own landing page.
    const title = link && link[2] === 'README.md' ? 'About This Publication' : link?.[1];
    if (link) items.push({ title, file: link[2], group: group || 'Overview' });
  }
  return items;
}

const slugForFile = (file) =>
  file === 'README.md'
    ? 'about'
    : file.replace(/\.md$/, '').replace(/\/README$/, '').toLowerCase();

const urlFor = (file) => `${BASE}/${slugForFile(file)}/`;

/* ------------------------------------------------------------------ */
/* Markdown pipeline                                                   */
/* ------------------------------------------------------------------ */

const HINTS = {
  info: { label: 'Note', icon: 'i' },
  success: { label: 'In plain English', icon: '✓' },
  warning: { label: 'Important', icon: '!' },
  danger: { label: 'Read this carefully', icon: '!' },
};

function preprocess(md, file) {
  const dir = path.dirname(path.join(ROOT, file));
  let out = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

  out = out.replace(
    /\{%\s*hint\s+style="(\w+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_m, style, body) => {
      const s = HINTS[style] ? style : 'info';
      const inner = body.trim();
      const hasHeading = /^#{1,6}\s/.test(inner);
      const head = hasHeading
        ? ''
        : `<p class="cal-label"><span class="cal-dot">${HINTS[s].icon}</span>${HINTS[s].label}</p>\n\n`;
      return `\n<div class="cal cal-${s}">\n\n${head}${inner}\n\n</div>\n`;
    }
  );
  out = out.replace(/\{%[\s\S]*?%\}/g, '');
  out = out.replace(/%%\{init:[\s\S]*?\}%%\s*/g, '');

  // Assets -> site-relative
  const asset = (src) => {
    const cleaned = src.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');
    return cleaned.startsWith('assets/') ? `${BASE}/${cleaned}` : src;
  };
  out = out.replace(/(!\[[^\]]*\]\()([^)\s]+)(\))/g, (m, a, s, b) => a + asset(s) + b);
  out = out.replace(/(<img\b[^>]*\bsrc=")([^"]+)(")/g, (m, a, s, b) => a + asset(s) + b);

  // Internal .md links -> pretty site URLs
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+\.md)(#[^)]*)?\)/g, (m, text, target, frag) => {
    if (/^https?:/.test(target)) return m;
    const abs = path.resolve(dir, target);
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    return `[${text}](${BASE}/${slugForFile(rel)}/${frag || ''})`;
  });

  return out;
}

const mdit = new MarkdownIt({ html: true, linkify: true, typographer: true })
  .use(anchor, { level: [2, 3], permalink: anchor.permalink.linkInsideHeader({ symbol: '#', placement: 'after' }) });

const baseFence = mdit.renderer.rules.fence.bind(mdit.renderer.rules);
mdit.renderer.rules.fence = (tokens, idx, opts, env, self) => {
  const t = tokens[idx];
  if ((t.info || '').trim().toLowerCase() === 'mermaid') {
    return `<div class="figure"><pre class="mermaid">${mdit.utils.escapeHtml(t.content)}</pre></div>\n`;
  }
  return baseFence(tokens, idx, opts, env, self);
};

// Wrap tables so they scroll on mobile instead of breaking layout
const openTable = mdit.renderer.rules.table_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
mdit.renderer.rules.table_open = (t, i, o, e, s) => `<div class="tbl">${openTable(t, i, o, e, s)}`;
const closeTable = mdit.renderer.rules.table_close || ((t, i, o, e, s) => s.renderToken(t, i, o));
mdit.renderer.rules.table_close = (t, i, o, e, s) => `${closeTable(t, i, o, e, s)}</div>`;

/* ------------------------------------------------------------------ */
/* Page helpers                                                        */
/* ------------------------------------------------------------------ */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function plainText(md) {
  return md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\{%[\s\S]*?%\}/g, ' ')
    .replace(/\|[^\n]*\|/g, ' ')
    .replace(/[#*_>`\[\]()]/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).length / 220));

/** Extract h2 headings for the on-this-page rail. */
function outline(html) {
  const out = [];
  const re = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = m[2].replace(/<[^>]+>/g, '').trim();
    if (text) out.push({ id: m[1], text });
  }
  return out;
}

function shell({ title, description, bodyClass, part, content, nav, toc, current }) {
  const p = part || DEFAULT_PART;
  return `<!doctype html>
<html lang="en" data-part="${p.key}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} · ${TITLE}</title>
<meta name="description" content="${esc(description)}">
<meta name="author" content="${AUTHOR}">
<meta property="og:title" content="${esc(title)} — ${TITLE}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${BASE}/assets/cover-illustration.png">
<meta property="og:type" content="article">
<meta name="theme-color" content="#062a38">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🏊</text></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${BASE}/styles.css">
<style>:root{--part:${p.hue};--part2:${p.hue2};--part-tint:${p.tint}}</style>
</head>
<body class="${bodyClass || ''}">
<a class="skip" href="#main">Skip to content</a>

<header class="topbar">
  <button class="burger" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
  <a class="brand" href="${BASE}/">
    <span class="brand-mark" aria-hidden="true">🏊</span>
    <span class="brand-text"><b>Data Swimming Pool</b><i>Whitepaper · v1.0</i></span>
  </a>

  <div class="searchwrap">
    <input id="q" type="search" placeholder="Search the whitepaper…  (press /)" autocomplete="off" aria-label="Search">
    <div id="results" class="results" hidden></div>
  </div>

  <div class="topactions">
    <button class="iconbtn" id="themebtn" title="Toggle dark mode" aria-label="Toggle dark mode">◐</button>
    <a class="ghost" href="${GITHUB}" target="_blank" rel="noopener">GitHub</a>
    <a class="pdfbtn" href="${BASE}/${PDF_NAME}" download>
      <span class="pdf-ico" aria-hidden="true">⤓</span>
      <span class="pdf-txt">Download PDF</span>
      <span class="pdf-sub">333 pages · 7 MB</span>
    </a>
  </div>
</header>
<div class="progress"><i id="bar"></i></div>

<div class="layout">
  <nav class="sidebar" id="sidebar" aria-label="Chapters">
    <div class="sb-inner">${nav}</div>
  </nav>
  <div class="scrim" id="scrim"></div>

  <main id="main">
${content}
  </main>

  ${toc || ''}
</div>

<footer class="foot">
  <div class="foot-grid">
    <div>
      <b>${TITLE}</b>
      <p>${SUBTITLE}</p>
      <p class="muted">An independent conceptual framework. Not an industry standard, not a product.</p>
    </div>
    <div>
      <b>Read</b>
      <a href="${BASE}/front-matter/start-here/">Start Here (simple version)</a>
      <a href="${BASE}/part-1/01-executive-summary/">Executive Summary</a>
      <a href="${BASE}/part-5/39-challenges-and-limitations/">Challenges &amp; Limitations</a>
    </div>
    <div>
      <b>Get it</b>
      <a href="${BASE}/${PDF_NAME}" download>Download PDF</a>
      <a href="${GITHUB}" target="_blank" rel="noopener">Source on GitHub</a>
      <a href="https://livestockmon.gitbook.io/data-swimming-pool/" target="_blank" rel="noopener">GitBook edition</a>
    </div>
    <div>
      <b>Author</b>
      <a href="${LINKEDIN}" target="_blank" rel="noopener">Ammar Jamshed</a>
      <p class="muted">Independent Data Scientist · AI Researcher</p>
      <p class="muted">CC BY 4.0 · 2026</p>
    </div>
  </div>
</footer>

<script>window.SITE_BASE=${JSON.stringify(BASE)};window.CURRENT=${JSON.stringify(current || '')};</script>
<script src="${BASE}/app.js" type="module"></script>
</body>
</html>`;
}

function buildNav(items, currentFile) {
  const groups = [];
  for (const it of items) {
    let g = groups.find((x) => x.name === it.group);
    if (!g) { g = { name: it.group, items: [] }; groups.push(g); }
    g.items.push(it);
  }
  const home = `<a class="sb-home${currentFile ? '' : ' on'}" href="${BASE}/"><span>🏠</span>Home</a>`;
  return home + groups
    .map((g) => {
      const p = PARTS[g.name] || DEFAULT_PART;
      const open = g.items.some((i) => i.file === currentFile) ? ' open' : '';
      const links = g.items
        .map((i) => {
          const active = i.file === currentFile ? ' class="on"' : '';
          return `<a href="${urlFor(i.file)}"${active}>${esc(i.title)}</a>`;
        })
        .join('');
      return `<details class="sb-group"${open} style="--part:${p.hue};--part2:${p.hue2};--part-tint:${p.tint}">
  <summary><span class="sb-ico">${p.icon}</span>${esc(g.name)}<span class="sb-count">${g.items.length}</span></summary>
  <div class="sb-links">${links}</div>
</details>`;
    })
    .join('\n');
}

/* ------------------------------------------------------------------ */
/* Landing page                                                        */
/* ------------------------------------------------------------------ */

function landing(items, nav) {
  const groups = [...new Set(items.map((i) => i.group))];
  const cards = groups
    .map((name) => {
      const p = PARTS[name] || DEFAULT_PART;
      const list = items.filter((i) => i.group === name);
      const first = list[0];
      return `<a class="pcard" href="${urlFor(first.file)}" style="--part:${p.hue};--part2:${p.hue2};--part-tint:${p.tint}">
  <span class="pcard-ico">${p.icon}</span>
  <h3>${esc(name)}</h3>
  <p>${esc(p.blurb)}</p>
  <span class="pcard-meta">${list.length} chapter${list.length > 1 ? 's' : ''} <b>→</b></span>
</a>`;
    })
    .join('\n');

  const content = `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Independent research whitepaper · Version 1.0</p>
    <h1>Data<br>Swimming Pool</h1>
    <p class="lede">${SUBTITLE}</p>
    <p class="byline">by <a href="${LINKEDIN}" target="_blank" rel="noopener">Ammar Jamshed</a> · Independent Data Scientist &amp; AI Researcher</p>
    <div class="cta">
      <a class="btn primary" href="${BASE}/front-matter/start-here/">Start here — the simple version</a>
      <a class="btn solid" href="${BASE}/${PDF_NAME}" download>⤓ Download PDF</a>
      <a class="btn ghost" href="${BASE}/part-1/01-executive-summary/">Executive summary</a>
    </div>
    <ul class="stats">
      <li><b>333</b><span>pages</span></li>
      <li><b>54</b><span>chapters</span></li>
      <li><b>63</b><span>diagrams</span></li>
      <li><b>95</b><span>tables</span></li>
      <li><b>150</b><span>references</span></li>
    </ul>
  </div>
  <div class="hero-art">
    <img src="${BASE}/assets/cover-illustration.png" alt="Data flowing into a luminous pool containing an interconnected knowledge graph">
  </div>
</section>

<section class="pitch">
  <div class="pitch-item">
    <span class="pitch-num">01</span>
    <h3>The problem</h3>
    <p>Organisations store data brilliantly and <b>connect</b> it badly. The clue that predicted the fraud, the failure, or the churn already exists — in four different systems, noticed by nobody.</p>
  </div>
  <div class="pitch-item">
    <span class="pitch-num">02</span>
    <h3>The idea</h3>
    <p>A data lake <b>stores</b>. A Data Swimming Pool <b>connects</b>: relationships between events become saved, scored, governed assets instead of one-off spreadsheet joins.</p>
  </div>
  <div class="pitch-item">
    <span class="pitch-num">03</span>
    <h3>The honesty</h3>
    <p>This is a <b>proposed design</b>, not a product and not an industry standard. A whole chapter is devoted to why you might reasonably decide <b>not</b> to build it.</p>
  </div>
</section>

<section class="section">
  <h2 class="sec-title">Explore by part</h2>
  <p class="sec-sub">Each part has its own colour throughout the site, so you always know where you are.</p>
  <div class="pgrid">${cards}</div>
</section>

<section class="section">
  <h2 class="sec-title">Not sure where to begin?</h2>
  <div class="tgrid">
    <a class="tcard" href="${BASE}/front-matter/start-here/"><b>I'm not technical</b><span>An 8-minute plain-English tour with no jargon.</span></a>
    <a class="tcard" href="${BASE}/part-1/01-executive-summary/"><b>I'm a leader, 25 minutes</b><span>Thesis, evidence, risk profile, comparison table.</span></a>
    <a class="tcard" href="${BASE}/part-4/29-banking/"><b>Show me my industry</b><span>Banking, healthcare, manufacturing, retail, cyber and more.</span></a>
    <a class="tcard" href="${BASE}/part-2/14-correlation-engine/"><b>I want the architecture</b><span>The Correlation Engine is the heart of the proposal.</span></a>
    <a class="tcard" href="${BASE}/part-5/39-challenges-and-limitations/"><b>Convince me it's wrong</b><span>Fundamental limits, failure modes, and when not to adopt.</span></a>
    <a class="tcard" href="${BASE}/${PDF_NAME}" download><b>Just give me the PDF</b><span>Typeset A4 edition, 333 pages, full-bleed cover.</span></a>
  </div>
</section>

<section class="notice">
  <h3>Disclaimer</h3>
  <p>This document presents an <b>independent conceptual framework proposed by the author</b>. The “Data Swimming Pool” architecture is an original architectural concept intended to stimulate discussion and future research. It <b>should not be interpreted as an existing industry standard or commercially deployed architecture</b>, and it has not been commissioned, reviewed, endorsed, sponsored, or approved by any organization with which the author is or was associated. Any organizations, products, technologies, or trademarks mentioned are used solely for educational and illustrative purposes.</p>
</section>
`;

  return shell({
    title: 'Data Swimming Pool — an intelligent enterprise data ecosystem',
    description: SUBTITLE,
    bodyClass: 'home',
    part: PARTS['Part II — The Data Swimming Pool'],
    content,
    nav,
    current: '',
  });
}

/* ------------------------------------------------------------------ */
/* Build                                                               */
/* ------------------------------------------------------------------ */

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name);
    const d = path.join(dest, e.name);
    if (e.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function main() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  const items = readOrder();
  console.log(`› ${items.length} pages from SUMMARY.md`);

  // Static assets
  copyDir(path.join(ROOT, 'assets'), path.join(OUT, 'assets'));
  fs.copyFileSync(path.join(__dirname, 'site.css'), path.join(OUT, 'styles.css'));
  fs.copyFileSync(path.join(__dirname, 'site.js'), path.join(OUT, 'app.js'));
  const pdfSrc = path.join(ROOT, 'dist', PDF_NAME);
  if (fs.existsSync(pdfSrc)) {
    fs.copyFileSync(pdfSrc, path.join(OUT, PDF_NAME));
    console.log(`  copied PDF (${(fs.statSync(pdfSrc).size / 1024 / 1024).toFixed(1)} MB)`);
  } else {
    console.warn('  ! PDF not found — run npm run build:pdf first');
  }
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, 'CNAME.example'), '# rename to CNAME and add a custom domain if you have one\n');

  const index = [];

  // Landing
  fs.writeFileSync(path.join(OUT, 'index.html'), landing(items, buildNav(items, null)), 'utf8');

  // Chapters
  items.forEach((item, i) => {
    const abs = path.join(ROOT, item.file);
    if (!fs.existsSync(abs)) { console.warn(`  ! missing ${item.file}`); return; }
    const raw = fs.readFileSync(abs, 'utf8');
    const text = plainText(raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, ''));
    const html = mdit.render(preprocess(raw, item.file));
    const part = PARTS[item.group] || DEFAULT_PART;
    const heads = outline(html);
    const prev = items[i - 1];
    const next = items[i + 1];

    const tocRail = heads.length > 2
      ? `<aside class="rail"><div class="rail-in"><p class="rail-t">On this page</p><nav>${heads
          .map((h) => `<a href="#${h.id}">${esc(h.text)}</a>`)
          .join('')}</nav>
        <a class="rail-pdf" href="${BASE}/${PDF_NAME}" download>⤓ Download full PDF</a>
        </div></aside>`
      : '';

    const pager = `<nav class="pager">
      ${prev ? `<a class="pg prev" href="${urlFor(prev.file)}"><span>← Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}
      ${next ? `<a class="pg next" href="${urlFor(next.file)}"><span>Next →</span><b>${esc(next.title)}</b></a>` : '<span></span>'}
    </nav>`;

    const content = `
<article class="doc">
  <header class="chead">
    <p class="crumb"><a href="${BASE}/">Home</a> <em>/</em> <span>${esc(item.group)}</span></p>
    <h1>${esc(item.title)}</h1>
    <p class="cmeta"><span class="chip">${part.icon} ${esc(item.group)}</span><span class="dot">·</span>${readingTime(text)} min read</p>
  </header>
  <div class="prose">
${html}
  </div>
  ${pager}
</article>`;

    const dir = path.join(OUT, slugForFile(item.file));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      shell({
        title: item.title,
        description: text.slice(0, 180),
        part,
        content,
        nav: buildNav(items, item.file),
        toc: tocRail,
        current: urlFor(item.file),
      }),
      'utf8'
    );

    index.push({
      t: item.title,
      g: item.group,
      u: urlFor(item.file),
      c: part.key,
      x: text.slice(0, 1400),
    });
  });

  fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(index), 'utf8');

  // 404
  fs.writeFileSync(
    path.join(OUT, '404.html'),
    shell({
      title: 'Page not found',
      description: 'That page does not exist.',
      part: DEFAULT_PART,
      nav: buildNav(items, null),
      content: `<article class="doc"><header class="chead"><h1>Page not found</h1>
        <p class="cmeta">The link may be out of date.</p></header>
        <div class="prose"><p><a href="${BASE}/">Return to the home page</a> or use the search box above.</p></div></article>`,
      current: '',
    }),
    'utf8'
  );

  // Sitemap
  const urls = [`${BASE}/`, ...items.map((i) => urlFor(i.file))];
  fs.writeFileSync(
    path.join(OUT, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>https://ammarjamshed.github.io${u}</loc></url>`)
      .join('\n')}\n</urlset>\n`,
    'utf8'
  );

  const files = index.length + 2;
  console.log(`› wrote ${files} pages to site/`);
  console.log(`  base path: ${BASE || '/'}`);
}

main();
