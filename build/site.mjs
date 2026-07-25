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
const ASSET_VERSION = '20260726-1';

/* ------------------------------------------------------------------ */
/* Part identity — each Part gets its own colour so readers always     */
/* know where they are in the document.                                */
/* ------------------------------------------------------------------ */

const PARTS = {
  Overview: {
    key: 'ovw', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: '00', blurb: 'Publication details, citation, licence, and document structure.',
  },
  'Front Matter': {
    key: 'front', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'FM', blurb: 'Orientation, plain-language introduction, and framing disclaimers.',
  },
  'Part I — Context and Motivation': {
    key: 'p1', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'I', blurb: 'Why six decades of enterprise data architecture still leave a structural gap.',
  },
  'Part II — The Data Swimming Pool': {
    key: 'p2', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'II', blurb: 'The proposed architecture, specified layer by layer.',
  },
  'Part III — Enterprise Qualities': {
    key: 'p3', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'III', blurb: 'Security, privacy, governance, scale, availability, and performance.',
  },
  'Part IV — Illustrative Enterprise Scenarios': {
    key: 'p4', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'IV', blurb: 'Synthetic industry scenarios from banking to aviation.',
  },
  'Part V — Evaluation and Outlook': {
    key: 'p5', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'V', blurb: 'Comparison, benefits, limitations, and research roadmap.',
  },
  Appendices: {
    key: 'apx', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6',
    label: 'A', blurb: 'Glossary, reference blueprint, schemas, maturity assessment, and licensing.',
  },
};

const DEFAULT_PART = { key: 'front', hue: '#1a6f86', hue2: '#2489a3', tint: '#e8f3f6', label: '', blurb: '' };

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
  info: { label: 'Definition' },
  success: { label: 'Plain language' },
  warning: { label: 'Caution' },
  danger: { label: 'Illustrative only' },
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
        : `<p class="cal-label">${HINTS[s].label}</p>\n\n`;
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

/** Convert manuscript Markdown into natural text for browser speech synthesis. */
function narrationText(md) {
  return md
    .replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
    .replace(/^#\s+.+$/m, '')
    .replace(/```mermaid[\s\S]*?```/g, '\nFigure described in the surrounding text.\n')
    .replace(/```[\s\S]*?```/g, '\nCode or schema listing omitted from audio.\n')
    .replace(/\{%\s*hint[^%]*%\}|\{%\s*endhint\s*%\}/g, '')
    .replace(/<figure>[\s\S]*?<figcaption>([\s\S]*?)<\/figcaption>[\s\S]*?<\/figure>/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/gm, '')
    .replace(/\|/g, '. ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_`>~]/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/&(?:nbsp|ensp|emsp);/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
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
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='3' fill='%230a2a36'/%3E%3Cpath d='M8 20c3-6 13-6 16 0' fill='none' stroke='%232489a3' stroke-width='2.2'/%3E%3Ccircle cx='16' cy='14' r='2.2' fill='%23e8f3f6'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Public+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${BASE}/styles.css?v=${ASSET_VERSION}">
<style>:root{--part:${p.hue};--part2:${p.hue2};--part-tint:${p.tint}}</style>
</head>
<body class="${bodyClass || ''}">
<a class="skip" href="#main">Skip to content</a>

<header class="topbar">
  <button class="burger" aria-label="Open navigation" aria-expanded="false"><span></span><span></span><span></span></button>
  <a class="brand" href="${BASE}/">
    <span class="brand-mark" aria-hidden="true"></span>
    <span class="brand-text"><b>Data Swimming Pool</b><i>Whitepaper · Version 1.0</i></span>
  </a>

  <div class="searchwrap">
    <input id="q" type="search" placeholder="Search chapters, terms, topics…" autocomplete="off" aria-label="Search">
    <div id="results" class="results" hidden></div>
  </div>

  <div class="topactions">
    <button class="audiobtn" id="listenbtn" type="button" aria-haspopup="dialog" aria-controls="audioPanel">
      <span class="audio-wave" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      Listen
    </button>
    <button class="iconbtn" id="themebtn" title="Toggle colour theme" aria-label="Toggle colour theme">Aa</button>
    <a class="ghost" href="${GITHUB}" target="_blank" rel="noopener">Source</a>
    <a class="pdfbtn" href="${BASE}/${PDF_NAME}" download>
      <span class="pdf-ico" aria-hidden="true">PDF</span>
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

<section class="audio-panel" id="audioPanel" role="dialog" aria-labelledby="audioTitle" hidden>
  <div class="audio-head">
    <div>
      <p class="audio-kicker">Text-to-speech</p>
      <h2 id="audioTitle">Audio reader</h2>
    </div>
    <button class="audio-close" id="audioClose" type="button" aria-label="Close audio reader">Close</button>
  </div>
  <p class="audio-intro">Listen to this chapter or continue through the complete whitepaper using a voice installed on your device.</p>
  <div class="audio-fields">
    <label>Reading selection
      <select id="audioScope">
        <option value="current">Current chapter</option>
        <option value="full">Complete whitepaper</option>
      </select>
    </label>
    <label>Voice
      <select id="audioVoice" aria-label="Narrator voice"></select>
    </label>
    <label>Speed
      <select id="audioRate" aria-label="Reading speed">
        <option value="0.8">0.8×</option>
        <option value="1" selected>1.0×</option>
        <option value="1.2">1.2×</option>
        <option value="1.5">1.5×</option>
        <option value="1.8">1.8×</option>
      </select>
    </label>
  </div>
  <div class="audio-controls">
    <button class="audio-primary" id="audioPlay" type="button">Start reading</button>
    <button id="audioPause" type="button" disabled>Pause</button>
    <button id="audioStop" type="button" disabled>Stop</button>
  </div>
  <div class="audio-progress" aria-hidden="true"><i id="audioBar"></i></div>
  <p class="audio-status" id="audioStatus" aria-live="polite">Ready to read.</p>
  <p class="audio-note">Audio is generated by your browser. Keep this tab open while listening. Voice availability varies by device.</p>
</section>
<div class="audio-backdrop" id="audioBackdrop" hidden></div>

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
<script src="${BASE}/app.js?v=${ASSET_VERSION}" type="module"></script>
</body>
</html>`;
}

function buildNav(items, currentFile) {
  const home = `<a class="sb-home${currentFile ? '' : ' on'}" href="${BASE}/">Home</a>`;
  const label = `<div class="sb-label"><span>Pages</span><span>${items.length}</span></div>`;
  const links = items
    .map((item, i) => {
      const active = item.file === currentFile ? ' class="on"' : '';
      const num = String(i + 1).padStart(2, '0');
      // Prefer a clean title: drop leading chapter numbers already in the name
      // so the sidebar number is the only number readers need.
      const title = item.title.replace(/^\d+[A-Za-z]?\.\s+/, '');
      return `<a href="${urlFor(item.file)}"${active}><span class="sb-num">${num}</span><span class="sb-title">${esc(title)}</span></a>`;
    })
    .join('\n');
  return `${home}${label}<nav class="sb-flat" aria-label="Pages">${links}</nav>`;
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
  <span class="pcard-kicker">Section ${esc(p.label || '—')}</span>
  <h3>${esc(name)}</h3>
  <p>${esc(p.blurb)}</p>
  <span class="pcard-meta">${list.length} chapter${list.length > 1 ? 's' : ''}</span>
</a>`;
    })
    .join('\n');

  const content = `
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Independent research whitepaper · Version 1.0</p>
    <h1>Data<br>Swimming Pool</h1>
    <p class="lede">${SUBTITLE}</p>
    <p class="byline">Ammar Jamshed · Independent Data Scientist &amp; AI Researcher</p>
    <div class="cta">
      <a class="btn primary" href="${BASE}/front-matter/start-here/">Begin with the overview</a>
      <a class="btn solid" href="${BASE}/${PDF_NAME}" download>Download PDF</a>
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
    <img src="${BASE}/assets/cover-illustration.png" alt="Abstract visualisation of connected enterprise data flowing into a governed pool">
  </div>
</section>

<section class="pitch">
  <div class="pitch-item">
    <span class="pitch-num">01</span>
    <h3>The problem</h3>
    <p>Enterprises store data well and connect it poorly. The signal that predicted fraud, failure, or churn often already exists — distributed across systems that never meet in time.</p>
  </div>
  <div class="pitch-item">
    <span class="pitch-num">02</span>
    <h3>The proposal</h3>
    <p>A data lake stores. A Data Swimming Pool connects: relationships between events become durable, scored, and policy-governed assets of the platform itself.</p>
  </div>
  <div class="pitch-item">
    <span class="pitch-num">03</span>
    <h3>The posture</h3>
    <p>This is an original conceptual architecture for research and critique — not a product, and not an industry standard. Limitations are treated as first-class content.</p>
  </div>
</section>

<section class="section">
  <h2 class="sec-title">Document structure</h2>
  <p class="sec-sub">Navigate by part. Each chapter is self-contained and linked to the next.</p>
  <div class="pgrid">${cards}</div>
</section>

<section class="section">
  <h2 class="sec-title">Recommended entry points</h2>
  <div class="tgrid">
    <a class="tcard" href="${BASE}/front-matter/start-here/"><b>Non-technical overview</b><span>An eight-minute plain-language introduction to the thesis.</span></a>
    <a class="tcard" href="${BASE}/part-1/01-executive-summary/"><b>Executive briefing</b><span>Problem, proposal, comparison, and risk profile in about 25 minutes.</span></a>
    <a class="tcard" href="${BASE}/part-4/29-banking/"><b>Industry scenarios</b><span>Banking, healthcare, manufacturing, retail, cybersecurity, and more.</span></a>
    <a class="tcard" href="${BASE}/part-2/14-correlation-engine/"><b>Architecture core</b><span>The Correlation Engine — the central design contribution.</span></a>
    <a class="tcard" href="${BASE}/part-5/39-challenges-and-limitations/"><b>Limitations</b><span>Fundamental constraints, failure modes, and when not to adopt.</span></a>
    <a class="tcard" href="${BASE}/${PDF_NAME}" download><b>Print edition (PDF)</b><span>Typeset A4 edition — 333 pages, full-bleed cover.</span></a>
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
  const audioIndex = [];

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
        <a class="rail-pdf" href="${BASE}/${PDF_NAME}" download>Download PDF</a>
        </div></aside>`
      : '';

    const pager = `<nav class="pager">
      ${prev ? `<a class="pg prev" href="${urlFor(prev.file)}"><span>Previous</span><b>${esc(prev.title)}</b></a>` : '<span></span>'}
      ${next ? `<a class="pg next" href="${urlFor(next.file)}"><span>Next</span><b>${esc(next.title)}</b></a>` : '<span></span>'}
    </nav>`;

    const content = `
<article class="doc">
  <header class="chead">
    <p class="crumb"><a href="${BASE}/">Home</a> <em>/</em> <span>${esc(item.group)}</span></p>
    <h1>${esc(item.title)}</h1>
    <p class="cmeta"><span class="chip">${esc(item.group)}</span><span class="dot">·</span>${readingTime(text)} min read</p>
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
    audioIndex.push({
      t: item.title,
      g: item.group,
      u: urlFor(item.file),
      x: narrationText(raw),
    });
  });

  fs.writeFileSync(path.join(OUT, 'search-index.json'), JSON.stringify(index), 'utf8');
  fs.writeFileSync(path.join(OUT, 'audio-index.json'), JSON.stringify(audioIndex), 'utf8');

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
