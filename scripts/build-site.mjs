#!/usr/bin/env node
// ModelScope docs static site — official EN + ZH (UI fixes)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EN_PAGES = path.join(ROOT, "docs", "pages");
const ZH_PAGES = path.join(ROOT, "docs", "zh", "pages");
const DIST = path.join(ROOT, "dist");
const BASE = (process.env.PAGES_BASE || "").replace(/\/$/, "");
const UI = JSON.parse(fs.readFileSync(path.join(__dirname, "i18n", "ui.json"), "utf8"));

const CHEV_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function asset(p, locale = "en") {
  const rel = String(p).replace(/^\//, "");
  const isShared = rel.startsWith("assets/") || rel.startsWith("meta/");
  const locPrefix = !isShared && locale === "zh" ? "zh/" : "";
  return BASE ? `${BASE}/${locPrefix}${rel}` : `/${locPrefix}${rel}`;
}

function htmlEscape(s) {
  return String(s)
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;");
}

function isHtmlDoc(text) {
  const t = String(text).trimStart().slice(0, 200).toLowerCase();
  return t.startsWith("<!doctype") || t.startsWith("<html") || t.startsWith("<head");
}

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (ent.isFile() && ent.name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

function titleFromMd(md, fallback) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/[`*]/g, "").trim() : fallback;
}

function humanize(slug) {
  return slug.replace(/\.md$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function relToHtml(rel) {
  return rel.replace(/\.md$/, ".html");
}

function pathToRel(p) {
  return String(p).replace(/\\/g, "/").replace(/_(EN|CN)\.md$/i, ".md");
}

function loadMetaTree(locale) {
  const p = path.join(ROOT, "docs", "meta", `index.${locale}.json`);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function loadCdnPrefixes() {
  const listPath = path.join(ROOT, "docs", "list.json");
  const out = { en: "", zh: "" };
  if (!fs.existsSync(listPath)) return out;
  try {
    const list = JSON.parse(fs.readFileSync(listPath, "utf8"));
    for (const loc of list.locales || []) {
      if (loc.locale === "en") out.en = (loc.prefix || "").replace(/\/$/, "");
      if (loc.locale === "zh") out.zh = (loc.prefix || "").replace(/\/$/, "");
    }
  } catch {
    /* ignore */
  }
  return out;
}

function loadPages(rootDir) {
  const files = walk(rootDir);
  const pages = [];
  for (const abs of files) {
    const rel = path.relative(rootDir, abs).replace(/\\/g, "/");
    let md = fs.readFileSync(abs, "utf8");
    if (isHtmlDoc(md)) continue;
    md = md.replace(/^<!-- modelscope-docs:[\s\S]*?-->\n*/m, "");
    const title = titleFromMd(md, humanize(path.basename(rel, ".md")));
    pages.push({ abs, rel, md, title });
  }
  return pages;
}

function leafItem(node, locale, pageByRel) {
  const rel = pathToRel(node.path);
  const page = pageByRel.get(rel);
  return {
    title: node.title || page?.title || humanize(rel),
    href: asset(relToHtml(rel), locale),
    rel,
  };
}

function collectLeaves(node, locale, pageByRel, items = []) {
  if (!node) return items;
  if (!node.dir && node.path) {
    items.push(leafItem(node, locale, pageByRel));
    return items;
  }
  for (const c of node.children || []) collectLeaves(c, locale, pageByRel, items);
  return items;
}

/**
 * Build smooth nav:
 * - top sections = tracks
 * - direct leaf children folded into one "Articles" group
 * - nested dirs become real groups
 * - never create a group per single leaf with the same title
 */
function buildNavFromTree(tree, locale, pageByRel) {
  const homeName = locale === "zh" ? "首页" : "Home";
  const articlesName = locale === "zh" ? "文档" : "Articles";
  const tracks = [
    {
      id: "home",
      name: homeName,
      badge: "·",
      groups: [
        {
          name: homeName,
          items: [{ title: homeName, href: asset("index.html", locale), rel: "index.md" }],
        },
      ],
      count: 1,
    },
  ];

  if (!tree) {
    const items = [];
    for (const [rel, page] of pageByRel) {
      if (rel === "index.md") continue;
      items.push({ title: page.title, href: asset(relToHtml(rel), locale), rel });
    }
    tracks.push({
      id: "all",
      name: locale === "zh" ? "全部文档" : "All docs",
      badge: "▸",
      groups: [{ name: articlesName, items }],
      count: items.length,
    });
    return tracks;
  }

  for (const top of tree.children || []) {
    const id =
      (top.filename || top.url || top.title || "sec")
        .toString()
        .toLowerCase()
        .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 40) || "sec";

    // single leaf track (e.g. Overview)
    if (!top.dir && top.path) {
      const item = leafItem(top, locale, pageByRel);
      tracks.push({
        id,
        name: top.title || id,
        badge: "▸",
        groups: [{ name: articlesName, items: [item] }],
        count: 1,
      });
      continue;
    }

    const kids = top.children || [];
    if (!kids.length) continue;

    const directLeaves = [];
    const nestedGroups = [];

    for (const k of kids) {
      if (!k.dir && k.path) {
        directLeaves.push(leafItem(k, locale, pageByRel));
      } else if (k.dir) {
        const items = collectLeaves(k, locale, pageByRel, []);
        if (items.length === 1 && (items[0].title === k.title || !k.title)) {
          // single-page section → treat as direct leaf
          directLeaves.push(items[0]);
        } else if (items.length) {
          nestedGroups.push({ name: k.title || k.filename || articlesName, items });
        }
      } else {
        const items = collectLeaves(k, locale, pageByRel, []);
        directLeaves.push(...items);
      }
    }

    const groups = [];
    if (directLeaves.length) {
      groups.push({ name: articlesName, items: directLeaves });
    }
    for (const g of nestedGroups) groups.push(g);

    // collapse: if only one group, keep it; if many singleton groups slipped through, flatten
    const flat = [];
    const multi = [];
    for (const g of groups) {
      if (g.items.length === 1 && g.name === g.items[0].title) flat.push(g.items[0]);
      else multi.push(g);
    }
    let finalGroups = multi;
    if (flat.length) {
      const existing = finalGroups.find((g) => g.name === articlesName);
      if (existing) existing.items.push(...flat);
      else finalGroups.unshift({ name: articlesName, items: flat });
    }
    if (!finalGroups.length && directLeaves.length) {
      finalGroups = [{ name: articlesName, items: directLeaves }];
    }

    const count = finalGroups.reduce((n, g) => n + g.items.length, 0);
    if (!count) continue;
    tracks.push({ id, name: top.title || id, badge: "▸", groups: finalGroups, count });
  }
  return tracks;
}

function renderNavHtml(tracks, activeRel) {
  const parts = [];
  let activeTop = "home";
  for (const t of tracks) {
    if (t.groups.some((g) => g.items.some((it) => it.rel === activeRel))) {
      activeTop = t.id;
      break;
    }
  }
  for (const track of tracks) {
    const trackActive = track.id === activeTop;
    const open = trackActive || track.id === "home" ? "1" : "0";
    parts.push(
      `<div class="track" data-track="${htmlEscape(track.id)}" data-open="${open}" data-active="${trackActive ? "1" : "0"}" data-hydrated="0">`,
    );
    parts.push(
      `<button type="button" class="track-btn" data-track-toggle="${htmlEscape(track.id)}" aria-expanded="${open === "1"}" data-needs-items="1"><span class="chev">${CHEV_SVG}</span><span class="track-label">${htmlEscape(track.name)}</span><span class="track-count">${track.count}</span></button>`,
    );
    parts.push(
      `<div class="track-panel"><div class="track-panel-inner"><div class="track-body"><div class="muted nav-loading">…</div></div></div></div></div>`,
    );
  }
  return parts.join("\n");
}

function renderChipsHtml(tracks, activeRel) {
  let activeTop = "home";
  for (const t of tracks) {
    if (t.groups.some((g) => g.items.some((it) => it.rel === activeRel))) {
      activeTop = t.id;
      break;
    }
  }
  // skip home chip; keep top ~10 useful tracks
  const chips = tracks.filter((t) => t.id !== "home").slice(0, 12);
  return chips
    .map((t) => {
      const act = t.id === activeTop ? " active" : "";
      return `<button type="button" class="chip${act}" data-jump-track="${htmlEscape(t.id)}">${htmlEscape(t.name)}</button>`;
    })
    .join("");
}

function enhanceCode(html) {
  return html
    .replace(
      /<pre><code class="language-([^"]*)">([\s\S]*?)<\/code><\/pre>/g,
      (_, lang, code) =>
        `<div class="code-block"><div class="code-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lang">${htmlEscape(lang || "text")}</span><button type="button" class="copy-btn" data-copy>Copy</button></div><pre><code class="language-${htmlEscape(lang)}">${code}</code></pre></div>`,
    )
    .replace(
      /<pre><code>([\s\S]*?)<\/code><\/pre>/g,
      (_, code) =>
        `<div class="code-block"><div class="code-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="lang">text</span><button type="button" class="copy-btn" data-copy>Copy</button></div><pre><code>${code}</code></pre></div>`,
    );
}

function tocFromHtml(html) {
  const items = [];
  const re = /<h([23])\s+id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  let m;
  while ((m = re.exec(html))) {
    const text = m[3].replace(/<[^>]+>/g, "").trim();
    if (text) items.push({ level: Number(m[1]), id: m[2], text });
  }
  if (items.length < 2) return "";
  return `<nav class="toc"><div class="toc-title">On this page</div><ul>${items
    .map((it) => `<li class="l${it.level}"><a href="#${htmlEscape(it.id)}">${htmlEscape(it.text)}</a></li>`)
    .join("")}</ul></nav>`;
}

function resolveMediaUrl(src, fromRel, cdnPrefix) {
  if (!src) return src;
  if (/^https?:\/\//i.test(src) || src.startsWith("data:") || src.startsWith("#")) return src;
  // strip title / size fragments like "...png#width"
  let s = src.split(/\s+/)[0].split("#")[0];
  s = s.replace(/^\.\//, "");
  const dir = path.posix.dirname(fromRel.replace(/\\/g, "/"));
  const pageDir = dir === "." ? "" : dir;
  if (cdnPrefix) {
    // resources/foo.png or _resources/foo.png next to the page
    const joined = path.posix.normalize(path.posix.join(pageDir, s)).replace(/^\/+/, "");
    return `${cdnPrefix}/dist/${joined}`;
  }
  // fallback local absolute under BASE (may 404)
  return asset(path.posix.normalize(path.posix.join(pageDir, s)).replace(/^\/+/, ""));
}

function postProcessHtml(html, fromRel, locale, cdnPrefix) {
  // links
  html = html.replace(/href="([^"]+)"/g, (full, href) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) return full;
    if (/^https?:\/\//i.test(href)) {
      const m = href.match(/^https?:\/\/(?:www\.)?modelscope\.cn\/docs\/(.+)$/i);
      if (m) {
        let p = decodeURIComponent(m[1]).replace(/\/$/, "");
        if (!p || p === "home") return `href="${asset("index.html", locale)}"`;
        if (!p.endsWith(".html")) p = p + ".html";
        return `href="${asset(p, locale)}"`;
      }
      return full;
    }
    if (href.endsWith(".md") || href.includes(".md#")) {
      let target = href;
      let hash = "";
      const hi = target.indexOf("#");
      if (hi >= 0) {
        hash = target.slice(hi);
        target = target.slice(0, hi);
      }
      target = pathToRel(target);
      const dir = path.posix.dirname(fromRel.replace(/\\/g, "/"));
      let rel = target.replace(/^\.\//, "");
      if (!rel.startsWith("/")) {
        rel = path.posix.normalize(path.posix.join(dir === "." ? "" : dir, rel));
      }
      rel = rel.replace(/^\/+/, "");
      if (rel.endsWith(".md")) rel = rel.slice(0, -3) + ".html";
      return `href="${asset(rel, locale)}${hash}"`;
    }
    return full;
  });

  // images
  html = html.replace(/src="([^"]+)"/g, (full, src) => {
    if (!src || src.startsWith("data:") || /^https?:\/\//i.test(src)) {
      // drop broken alipay intranet proxies
      if (/intranetproxy\.alipay\.com/i.test(src)) {
        return `src="" data-broken="1" alt="(image unavailable)"`;
      }
      return full;
    }
    const resolved = resolveMediaUrl(src, fromRel, cdnPrefix);
    return `src="${htmlEscape(resolved)}" loading="lazy" referrerpolicy="no-referrer"`;
  });

  return html;
}

function makeHomeMd(locale, navTracks) {
  const isZh = locale === "zh";
  const sections = navTracks
    .filter((t) => t.id !== "home")
    .map((t) => {
      const first = t.groups?.[0]?.items?.[0];
      const href = first ? first.href : asset("index.html", locale);
      // use relative path for md → will be processed; better write plain list with titles only
      return `- **${t.name}** (${t.count})`;
    })
    .join("\n");

  if (isZh) {
    return `# 魔搭 ModelScope 文档镜像

非官方镜像，内容来自 [ModelScope 官方文档](https://www.modelscope.cn/docs) CDN（中英双语）。

## 如何使用

- 左侧按主题展开目录，支持多栏同时打开
- 顶部可切换 **EN / 中文**
- 搜索框可快速过滤文章标题

## 文档分区

${sections}

## 说明

- 英文部分官方 CDN 偶有空页，镜像会自动回退中文内容并标注
- 图片资源指向官方文档 CDN
- 每日自动同步更新

> 本站为社区镜像，请以 [官方文档](https://www.modelscope.cn/docs) 为准。
`;
  }
  return `# ModelScope Docs Mirror

Unofficial mirror of [ModelScope documentation](https://www.modelscope.cn/docs) (official EN + 中文 from CDN).

## How to use

- Expand sections in the left nav (multi-open, like a learning path)
- Switch **EN / 中文** in the top bar
- Use search to filter article titles

## Sections

${sections}

## Notes

- Some English CDN pages are empty upstream — this mirror falls back to Chinese with a note
- Images are loaded from the official ModelScope docs CDN
- Refreshed daily via GitHub Actions

> Community mirror — prefer the [official docs](https://www.modelscope.cn/docs) as the source of truth.
`;
}

function layout({ locale, title, bodyHtml, navHtml, chipsHtml, tocHtml, rel, ui }) {
  const enHref = asset(relToHtml(rel), "en");
  const zhHref = asset(relToHtml(rel), "zh");
  const activeEn = locale === "en" ? " active" : "";
  const activeZh = locale === "zh" ? " active" : "";
  const langAttr = locale === "zh" ? "zh-CN" : "en";

  return `<!DOCTYPE html>
<html lang="${langAttr}" data-locale="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="theme-color" content="#08090c" />
  <title>${htmlEscape(title)} · ${htmlEscape(ui.brand)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://resouces.modelscope.cn" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css" />
  <link rel="stylesheet" href="${asset("assets/site.css")}" />
  <link rel="alternate" hreflang="en" href="${enHref}" />
  <link rel="alternate" hreflang="zh-CN" href="${zhHref}" />
</head>
<body>
  <div class="progress" aria-hidden="true"></div>
  <header class="topbar">
    <div class="topbar-inner">
      <button type="button" class="menu-btn" id="menuBtn" aria-label="${htmlEscape(ui.menu)}">${htmlEscape(ui.menu)}</button>
      <a class="brand" href="${asset("index.html", locale)}">
        <span class="brand-mark">魔</span>
        <span class="brand-text">${htmlEscape(ui.brand)}</span>
        <span class="brand-v">${htmlEscape(ui.brandSub)}</span>
      </a>
      <nav class="chips" id="trackChips" aria-label="Tracks">${chipsHtml}</nav>
      <div class="lang-switch" role="navigation" aria-label="Language">
        <a class="lang-btn${activeEn}" href="${enHref}" data-lang-set="en" hreflang="en">${htmlEscape(ui.langEn)}</a>
        <a class="lang-btn${activeZh}" href="${zhHref}" data-lang-set="zh" hreflang="zh-CN">${htmlEscape(ui.langZh)}</a>
      </div>
      <a class="top-link" href="https://www.modelscope.cn/docs" rel="noopener" target="_blank">${htmlEscape(ui.official)}</a>
    </div>
  </header>
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="side-head">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3-3"/></svg>
          <input class="search" id="search" type="search" placeholder="${htmlEscape(ui.searchPlaceholder)}" autocomplete="off" />
          <span class="search-kbd" aria-hidden="true">/</span>
        </div>
        <div class="side-label">${htmlEscape(ui.learningPath)}</div>
      </div>
      <nav class="nav" id="nav" data-active-rel="${htmlEscape(rel)}">${navHtml}</nav>
      <div class="side-foot">${htmlEscape(ui.footer)}</div>
    </aside>
    <button type="button" class="backdrop" id="backdrop" aria-label="Close menu"></button>
    <main class="main">
      <div class="content-wrap">
        <article class="content prose">
          ${bodyHtml}
          <p class="page-foot">${htmlEscape(ui.footer)}</p>
        </article>
        ${tocHtml}
      </div>
    </main>
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/highlight.min.js"></script>
  <script src="${asset("assets/site.js")}"></script>
  <script>document.querySelectorAll("pre code").forEach((el)=>window.hljs&&hljs.highlightElement(el));</script>
</body>
</html>`;
}

function copyAssets() {
  const out = path.join(DIST, "assets");
  ensureDir(out);
  for (const f of ["site.css", "site.js"]) {
    fs.copyFileSync(path.join(__dirname, "site-assets", f), path.join(out, f));
  }
  fs.copyFileSync(path.join(__dirname, "i18n", "ui.json"), path.join(out, "ui.json"));
  ensureDir(path.join(DIST, "meta"));
  for (const f of ["llms.txt", "list.json"]) {
    const src = path.join(ROOT, "docs", f);
    if (fs.existsSync(src)) fs.copyFileSync(src, path.join(DIST, "meta", f));
  }
  const metaDir = path.join(ROOT, "docs", "meta");
  if (fs.existsSync(metaDir)) {
    for (const f of fs.readdirSync(metaDir)) {
      fs.copyFileSync(path.join(metaDir, f), path.join(DIST, "meta", f));
    }
  }
}

function buildLocale(locale, pages, navTracks, cdnPrefix) {
  const ui = UI[locale] || UI.en;
  const outRoot = locale === "zh" ? path.join(DIST, "zh") : DIST;
  ensureDir(outRoot);
  let n = 0;
  for (const page of pages) {
    const md = page.rel === "index.md" ? makeHomeMd(locale, navTracks) : page.md;
    const title = page.rel === "index.md" ? (locale === "zh" ? "首页" : "Home") : page.title;
    const nav = renderNavHtml(navTracks, page.rel);
    const chips = renderChipsHtml(navTracks, page.rel);
    marked.setOptions({ gfm: true, breaks: false });
    let body = marked.parse(md);
    body = enhanceCode(body);
    body = postProcessHtml(body, page.rel, locale, cdnPrefix);
    const toc = page.rel === "index.md" ? "" : tocFromHtml(body);
    const html = layout({
      locale,
      title,
      bodyHtml: body,
      navHtml: nav,
      chipsHtml: chips,
      tocHtml: toc,
      rel: page.rel,
      ui,
    });
    const outFile = path.join(outRoot, relToHtml(page.rel));
    ensureDir(path.dirname(outFile));
    fs.writeFileSync(outFile, html);
    n++;
  }
  return n;
}

function main() {
  fs.rmSync(DIST, { recursive: true, force: true });
  ensureDir(DIST);
  copyAssets();

  const prefixes = loadCdnPrefixes();
  const enRaw = loadPages(EN_PAGES);
  const zhRaw = loadPages(ZH_PAGES);
  if (!enRaw.length && !zhRaw.length) {
    console.error("No pages");
    process.exit(1);
  }
  const allRels = new Set([...enRaw.map((p) => p.rel), ...zhRaw.map((p) => p.rel)]);
  const enMapRaw = new Map(enRaw.map((p) => [p.rel, p]));
  const zhMapRaw = new Map(zhRaw.map((p) => [p.rel, p]));

  const enPages = [];
  for (const rel of allRels) {
    const en = enMapRaw.get(rel);
    const zh = zhMapRaw.get(rel);
    if (en && en.md.trim().length > 20) enPages.push(en);
    else if (zh) {
      enPages.push({
        ...zh,
        rel,
        md:
          `> **Note:** Official English page is not available yet; showing Chinese content.\n\n` +
          zh.md,
        title: zh.title,
      });
    }
  }
  const zhPages = [];
  for (const rel of allRels) {
    const en = enMapRaw.get(rel);
    const zh = zhMapRaw.get(rel);
    if (zh && zh.md.trim().length > 20) zhPages.push(zh);
    else if (en) zhPages.push(en);
  }

  // ensure index exists
  if (!enPages.some((p) => p.rel === "index.md")) {
    enPages.unshift({ rel: "index.md", md: "# Home\n", title: "Home", abs: "" });
  }
  if (!zhPages.some((p) => p.rel === "index.md")) {
    zhPages.unshift({ rel: "index.md", md: "# 首页\n", title: "首页", abs: "" });
  }

  const enMap = new Map(enPages.map((p) => [p.rel, p]));
  const zhMap = new Map(zhPages.map((p) => [p.rel, p]));
  const enNav = buildNavFromTree(loadMetaTree("en"), "en", enMap);
  const zhNav = buildNavFromTree(loadMetaTree("zh"), "zh", zhMap);

  fs.writeFileSync(path.join(DIST, "assets", "nav.json"), JSON.stringify(enNav, null, 2));
  fs.writeFileSync(path.join(DIST, "assets", "nav.zh.json"), JSON.stringify(zhNav, null, 2));

  const nEn = buildLocale("en", enPages, enNav, prefixes.en);
  const nZh = buildLocale("zh", zhPages, zhNav, prefixes.zh || prefixes.en);
  console.log(`[en] ${nEn} pages — tracks ${enNav.length}`);
  console.log(`[zh] ${nZh} pages — tracks ${zhNav.length}`);
  // print sample nav structure for models
  const models = enNav.find((t) => t.id === "models");
  if (models) {
    console.log(
      "models groups:",
      models.groups.map((g) => `${g.name}:${g.items.length}`).join(", "),
    );
  }
  console.log(`CDN en=${prefixes.en ? "yes" : "no"} zh=${prefixes.zh ? "yes" : "no"}`);
  console.log(`Built locales en+zh -> ${DIST} (BASE=${BASE || "/"})`);
}

main();
