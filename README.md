# ModelScope Docs Mirror

Unofficial mirror of **[ModelScope 魔搭](https://www.modelscope.cn/docs)** documentation.

## Features

- **Official bilingual**: English + 简体中文 from ModelScope CDN (not machine translation)
- ~290 pages per locale (Models, Datasets, Studios, Library, Eval, Training…)
- Daily auto-refresh via GitHub Actions → GitHub Pages

## Sources

```
GET https://www.modelscope.cn/api/v1/document/main_doc_EN_prod
GET https://www.modelscope.cn/api/v1/document/main_doc_CN_prod
→ TargetPrefix/dist/index.json + Markdown pages
```

## Local

```bash
npm install --no-save marked@15
npm run fetch
PAGES_BASE=/modelscope-docs npm run build
node scripts/serve-pages.mjs
```

## LLM / agent access ([llmstxt.org](https://llmstxt.org/))

| File | Purpose |
|------|---------|
| [`/llms.txt`](./llms.txt) | Curated page index (mirror URLs) |
| [`/llms-full.txt`](./llms-full.txt) | Full markdown corpus for ingestion |
| `/meta/llms-index.json` | Machine-readable page list |

Generated at build time from scraped pages.
