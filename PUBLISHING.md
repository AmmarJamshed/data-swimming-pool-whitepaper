# Publishing Guide

How to publish this whitepaper to GitBook, GitHub, and as a downloadable PDF.

---

## 1. Local PDF

```bash
npm install
npm run verify      # links, figure numbers, Mermaid syntax
npm run build:pdf   # -> dist/data-swimming-pool-whitepaper.pdf
```

The PDF is an A4 typeset edition with:

- Full-bleed cover illustration and brand typography
- Generated table of contents
- Running headers and footers
- All Mermaid diagrams rendered as vector graphics
- Callout boxes, tables, and part dividers styled for print

Approximate size: **~7 MB · 330+ pages · ~91,000 words**.

---

## 2. GitBook

1. Create a space at [gitbook.com](https://www.gitbook.com).
2. Connect this repository (Git sync) or import the Markdown tree.
3. Confirm `.gitbook.yaml` points at `README.md` and `SUMMARY.md` (already configured).
4. Enable **Export → PDF** in the space settings for a GitBook-native download; the repository PDF above is the higher-fidelity print edition.
5. Publish the space and share the public URL.

GitBook renders Mermaid diagrams and `{% hint %}` callouts natively.

---

## 3. GitHub

```bash
git add .
git commit -m "docs: publish Data Swimming Pool whitepaper v1.0"
git remote add origin <your-repo-url>
git push -u origin main
```

Recommended repository layout notes for readers:

- `README.md` — cover / landing page
- `SUMMARY.md` — table of contents (GitBook + GitHub TOC)
- `dist/data-swimming-pool-whitepaper.pdf` — downloadable typeset edition
- `part-1/` … `part-5/` · `appendix/` · `front-matter/` — chapter sources

Add a GitHub Release attaching the PDF for ResearchGate / LinkedIn distribution.

---

## 4. LinkedIn / Medium / ResearchGate

| Platform | Recommended approach |
| --- | --- |
| **LinkedIn** | Publish a short article summarizing the thesis; link to the GitBook URL and the PDF Release. |
| **Medium** | Import or re-publish the Executive Summary + Abstract; link out to the full document. |
| **ResearchGate** | Upload `dist/data-swimming-pool-whitepaper.pdf` as a Preprint / Working Paper; use the BibTeX citation in [Chapter 42](part-5/42-references.md). |

---

## 5. Regenerating the Figure Index

After adding or renumbering figures:

```bash
node build/gen-index.mjs
```

This rewrites `front-matter/figures-and-tables.md` from the manuscript captions.

---

## 6. Verification Checklist Before Publication

- [ ] `npm run verify` exits 0
- [ ] PDF cover is full-bleed and brand-first
- [ ] Disclaimer appears in front matter and Appendix E
- [ ] Author's Note matches the approved text
- [ ] Contact placeholders (GitHub, Website, Email, ORCID) replaced or left explicit
- [ ] Case studies still labelled illustrative
- [ ] Version and date in README, cover, and Appendix E agree
