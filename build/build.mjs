#!/usr/bin/env node
/**
 * Data Swimming Pool — whitepaper build
 *
 * Reads SUMMARY.md, concatenates every chapter in declared order, converts
 * GitBook-flavoured Markdown to HTML, renders Mermaid diagrams in a headless
 * browser, and prints a paginated PDF with running headers and footers.
 *
 *   node build/build.mjs              -> dist/data-swimming-pool.html + .pdf
 *   node build/build.mjs --html-only  -> dist/data-swimming-pool.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const HTML_ONLY = process.argv.includes('--html-only');

const TITLE = 'Data Swimming Pool';
const SUBTITLE = 'An Intelligent Enterprise Data Ecosystem for Connected, Living Data';
const AUTHOR = 'Ammar Jamshed';
const VERSION = '1.0';

/* ------------------------------------------------------------------ */
/* 1. Read chapter order from SUMMARY.md                               */
/* ------------------------------------------------------------------ */

function readOrder() {
  const summary = fs.readFileSync(path.join(ROOT, 'SUMMARY.md'), 'utf8');
  const items = [];
  for (const line of summary.split(/\r?\n/)) {
    const part = line.match(/^##\s+(.+?)\s*$/);
    if (part) { items.push({ kind: 'part', title: part[1] }); continue; }
    const link = line.match(/^\s*\*\s*\[([^\]]+)\]\(([^)]+\.md)\)/);
    if (link) items.push({ kind: 'chapter', title: link[1], file: link[2] });
  }
  return items;
}

/* ------------------------------------------------------------------ */
/* 2. GitBook -> HTML preprocessing                                    */
/* ------------------------------------------------------------------ */

const HINT_LABEL = {
  info: 'Note',
  success: 'Key Takeaways',
  warning: 'Important',
  danger: 'Caution',
};

function preprocess(md, fileDir) {
  let out = md;

  // Strip YAML front matter (GitBook page configuration).
  out = out.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

  // {% hint style="x" %} ... {% endhint %}  ->  fenced div
  out = out.replace(
    /\{%\s*hint\s+style="(\w+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_m, style, body) => {
      const cls = HINT_LABEL[style] ? style : 'info';
      const inner = body.trim();
      // Suppress the auto-label when the body already opens with a heading.
      const hasHeading = /^#{1,6}\s/.test(inner);
      const label = hasHeading ? '' : `<p class="hint-label">${HINT_LABEL[cls]}</p>\n\n`;
      return `\n<div class="hint hint-${cls}">\n\n${label}${inner}\n\n</div>\n`;
    }
  );

  // Strip any remaining GitBook block tags.
  out = out.replace(/\{%[\s\S]*?%\}/g, '');

  // Mermaid init directives are stripped: print theme is applied globally.
  out = out.replace(/%%\{init:[\s\S]*?\}%%\s*/g, '');

  // Rewrite relative image paths to absolute file URLs for the single-file build.
  const toFileUrl = (src) => 'file:///' + path.resolve(fileDir, src).replace(/\\/g, '/');
  out = out.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (m, alt, src) =>
    /^(https?:|data:|file:)/.test(src) ? m : `![${alt}](${toFileUrl(src)})`
  );
  out = out.replace(/(<img\b[^>]*\bsrc=")([^"]+)(")/g, (m, a, src, b) =>
    /^(https?:|data:|file:)/.test(src) ? m : a + toFileUrl(src) + b
  );

  // Cross-document links become in-document anchors; external links survive.
  out = out.replace(/\[([^\]]+)\]\(([^)]+\.md)(#[^)]*)?\)/g, (_m, text, target, frag) => {
    const abs = path.resolve(fileDir, target);
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    return `[${text}](#doc-${slugFile(rel)})`;
  });

  return out;
}

const slugFile = (rel) => rel.replace(/[^a-z0-9]+/gi, '-').toLowerCase();

/* ------------------------------------------------------------------ */
/* 3. Markdown renderer                                                */
/* ------------------------------------------------------------------ */

const mdit = new MarkdownIt({ html: true, linkify: false, typographer: true })
  .use(anchor, { level: [1, 2, 3], permalink: false });

// Route ```mermaid fences to <div class="mermaid"> for client-side rendering.
const defaultFence = mdit.renderer.rules.fence.bind(mdit.renderer.rules);
mdit.renderer.rules.fence = (tokens, idx, opts, env, self) => {
  const token = tokens[idx];
  if ((token.info || '').trim().toLowerCase() === 'mermaid') {
    return `<div class="mermaid-wrap"><pre class="mermaid">${mdit.utils.escapeHtml(token.content)}</pre></div>\n`;
  }
  return defaultFence(tokens, idx, opts, env, self);
};

/* ------------------------------------------------------------------ */
/* 4. Assemble                                                         */
/* ------------------------------------------------------------------ */

/** Full-bleed branded cover page, printed in a separate pass with zero margins. */
function printCover() {
  const img = 'file:///' + path.join(ROOT, 'assets', 'cover-illustration.png').replace(/\\/g, '/');
  return `<section class="print-cover" style="--cover-image:url('${img}')">
  <div class="pc-scrim"></div>
  <header class="pc-top">
    <p class="pc-eyebrow">Independent Research Whitepaper · Version ${VERSION}</p>
    <h1 class="pc-brand">Data<br>Swimming<br>Pool</h1>
    <p class="pc-subtitle">${SUBTITLE}</p>
  </header>
  <footer class="pc-bottom">
    <div class="pc-rule"></div>
    <p class="pc-author">${AUTHOR}</p>
    <p class="pc-role">Independent Data Scientist · AI Researcher · Enterprise Data &amp; Analytics Professional</p>
    <p class="pc-foot">An original conceptual framework. Not an industry standard.</p>
  </footer>
</section>`;
}

/** README doubles as the GitBook landing page; the print edition supplies its own hero. */
function trimCoverDuplication(md) {
  return md
    .replace(/^#\s+Data Swimming Pool\s*$/m, '## About This Publication')
    .replace(/^##\s+An Intelligent Enterprise Data Ecosystem[^\n]*$/m, '')
    .replace(/^\*\*An Independent Research Whitepaper\*\*\s*$/m, '')
    .replace(/<figure><img[\s\S]*?<\/figure>/, '');
}

function assemble() {
  const order = readOrder();
  const body = [];
  const toc = [];
  let chapterCount = 0;

  for (const item of order) {
    if (item.kind === 'part') {
      body.push(`<section class="part-divider"><div><p class="part-eyebrow">Part</p><h1>${item.title}</h1></div></section>`);
      toc.push({ level: 0, title: item.title, href: null });
      continue;
    }
    const abs = path.join(ROOT, item.file);
    if (!fs.existsSync(abs)) {
      console.warn(`  ! missing: ${item.file}`);
      continue;
    }
    let raw = fs.readFileSync(abs, 'utf8');
    const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
    const isCover = rel === 'README.md';
    if (isCover) raw = trimCoverDuplication(raw);
    const id = `doc-${slugFile(rel)}`;
    const html = mdit.render(preprocess(raw, path.dirname(abs)));
    const section = `<section class="chapter${isCover ? ' colophon' : ''}" id="${id}">\n${html}\n</section>`;
    if (isCover) {
      // Colophon sits immediately after the cover; the TOC follows it.
      body.push(section, '<!--TOC-->');
      toc.push({ level: 1, title: 'About This Publication', href: `#${id}`, first: true });
    } else {
      body.push(section);
      toc.push({ level: 1, title: item.title, href: `#${id}` });
    }
    chapterCount += 1;
  }

  return { body: body.join('\n'), toc, chapterCount };
}

function renderToc(toc) {
  const rows = toc
    .map((t) =>
      t.href
        ? `<li class="toc-chapter"><a href="${t.href}">${t.title}</a></li>`
        : `<li class="toc-part">${t.title}</li>`
    )
    .join('\n');
  return `<section class="chapter toc-page"><h1>Table of Contents</h1><ul class="toc">${rows}</ul></section>`;
}

/* ------------------------------------------------------------------ */
/* 5. Page shell                                                       */
/* ------------------------------------------------------------------ */

function shell({ body, toc }, { coverOnly = false } = {}) {
  const css = fs.readFileSync(path.join(__dirname, 'print.css'), 'utf8');
  if (coverOnly) body = printCover();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${TITLE} — ${SUBTITLE}</title>
<meta name="author" content="${AUTHOR}">
<meta name="description" content="${SUBTITLE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Public+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
${coverOnly ? body : body.includes('<!--TOC-->') ? body.replace('<!--TOC-->', renderToc(toc)) : renderToc(toc) + body}
<script type="module">
import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  securityLevel: 'loose',
  fontFamily: 'Public Sans, system-ui, sans-serif',
  themeVariables: {
    background: '#ffffff',
    primaryColor: '#e8f4fa',
    primaryTextColor: '#0c2733',
    primaryBorderColor: '#1c6c8c',
    lineColor: '#3d6b80',
    secondaryColor: '#f2f7f4',
    tertiaryColor: '#faf6ec',
    fontSize: '13px'
  },
  flowchart: { htmlLabels: true, curve: 'basis', useMaxWidth: true },
  sequence: { useMaxWidth: true },
  gantt: { useMaxWidth: true }
});
try {
  await mermaid.run({ querySelector: 'pre.mermaid' });
} catch (e) {
  console.error('mermaid render error', e);
}
window.__renderComplete = true;
</script>
</body>
</html>`;
}

/* ------------------------------------------------------------------ */
/* 6. Run                                                              */
/* ------------------------------------------------------------------ */

async function main() {
  fs.mkdirSync(DIST, { recursive: true });

  console.log('› assembling chapters');
  const assembled = assemble();
  console.log(`  ${assembled.chapterCount} documents`);

  // Screen/web edition includes the cover inline.
  const htmlPath = path.join(DIST, 'data-swimming-pool.html');
  const html = shell({ ...assembled, body: printCover() + assembled.body }, {});
  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`› wrote ${path.relative(ROOT, htmlPath)} (${(html.length / 1024).toFixed(0)} KB)`);

  if (HTML_ONLY) return;

  // Print edition renders the cover and the body separately so that the cover
  // can bleed to the sheet edges without running headers.
  const coverHtmlPath = path.join(DIST, '.cover.html');
  const bodyHtmlPath = path.join(DIST, '.body.html');
  fs.writeFileSync(coverHtmlPath, shell(assembled, { coverOnly: true }), 'utf8');
  fs.writeFileSync(bodyHtmlPath, shell(assembled, {}), 'utf8');

  console.log('› launching headless browser');
  const { default: puppeteer } = await import('puppeteer');
  const browser = await puppeteer.launch({
    args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
  });

  const load = async (p) => {
    const page = await browser.newPage();
    await page.goto('file:///' + p.replace(/\\/g, '/'), { waitUntil: 'networkidle0', timeout: 180000 });
    await page.waitForFunction('window.__renderComplete === true', { timeout: 300000 });
    return page;
  };

  console.log('› rendering cover');
  const coverPage = await load(coverHtmlPath);
  await new Promise((r) => setTimeout(r, 800));
  const coverPdf = await coverPage.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
    pageRanges: '1',
  });

  console.log('› rendering body and diagrams');
  const bodyPage = await load(bodyHtmlPath);
  await new Promise((r) => setTimeout(r, 2500));
  const diagrams = await bodyPage.evaluate(() => document.querySelectorAll('pre.mermaid svg').length);
  console.log(`  ${diagrams} diagrams rendered`);

  const bodyPdf = await bodyPage.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    margin: { top: '20mm', bottom: '18mm', left: '18mm', right: '18mm' },
    headerTemplate: `<div style="width:100%;font:8pt 'Public Sans',sans-serif;color:#93a9b4;padding:0 18mm;display:flex;justify-content:space-between;">
      <span>${TITLE} · v${VERSION}</span><span>${AUTHOR}</span></div>`,
    footerTemplate: `<div style="width:100%;font:8pt 'Public Sans',sans-serif;color:#93a9b4;padding:0 18mm;display:flex;justify-content:space-between;">
      <span>Independent research whitepaper — not an industry standard</span>
      <span class="pageNumber"></span></div>`,
  });

  await browser.close();

  console.log('› merging');
  const { PDFDocument } = await import('pdf-lib');
  const out = await PDFDocument.create();
  out.setTitle(`${TITLE}: ${SUBTITLE}`);
  out.setAuthor(AUTHOR);
  out.setSubject('Enterprise data architecture — independent conceptual framework');
  out.setKeywords([
    'data architecture', 'event correlation', 'knowledge graph',
    'stream processing', 'data governance', 'enterprise AI',
  ]);
  out.setProducer('data-swimming-pool build pipeline');
  out.setCreationDate(new Date());

  for (const buf of [coverPdf, bodyPdf]) {
    const src = await PDFDocument.load(buf);
    const pages = await out.copyPages(src, src.getPageIndices());
    for (const p of pages) out.addPage(p);
  }

  const pdfPath = path.join(DIST, 'data-swimming-pool-whitepaper.pdf');
  fs.writeFileSync(pdfPath, await out.save());
  fs.rmSync(coverHtmlPath, { force: true });
  fs.rmSync(bodyHtmlPath, { force: true });

  const mb = fs.statSync(pdfPath).size / 1024 / 1024;
  console.log(`› wrote ${path.relative(ROOT, pdfPath)} (${out.getPageCount()} pages, ${mb.toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
