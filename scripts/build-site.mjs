#!/usr/bin/env node
// ModelScope docs — modal-docs page form (official EN + ZH)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";
import { createParadigm } from "./paradigm-page.mjs";
import { writeLlmsArtifacts } from "./generate-llms.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const EN_PAGES = path.join(ROOT, "docs", "pages");
const ZH_PAGES = path.join(ROOT, "docs", "zh", "pages");
const DIST = path.join(ROOT, "dist");
const BASE = (process.env.PAGES_BASE || "").replace(/\/$/, "");
const UI = JSON.parse(fs.readFileSync(path.join(__dirname, "i18n", "ui.json"), "utf8"));

const CHEV_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>';

const OFFICIAL = "https://www.modelscope.cn/docs";
const PREFERRED = ["models", "overview"];

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function asset(p, locale = "en") {
  const rel = String(p).replace(/^\//, "");
  const isShared = rel.startsWith("assets/") || rel.startsWith("meta/");
  const locPrefix = !isShared && locale === "zh" ? "zh/" : "";
  return BASE ? `${BASE}/${locPrefix}${rel}` : `/${locPrefix}${rel}`;
}
function htmlEscape(s) {
  return String(s).replace(/&/g, "&"+"amp;").replace(/</g, "&"+"lt;").replace(/>/g, "&"+"gt;").replace(/"/g, "&"+"quot;");
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

const P = createParadigm({ htmlEscape, asset, CHEV_SVG, relToHtml: (rel) => rel.replace(/\.md$/, ".html") });

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
  if (items.length < 1) return "";
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

function pathToRel(p) {
  return String(p).replace(/\\/g, "/").replace(/_(EN|CN)\.md$/i, ".md");
}

function relToHtml(rel) {
  return rel.replace(/\.md$/, ".html");
}

function humanize(slug) {
  return slug.replace(/\.md$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}


function renderNavHtml(tracks, activeRel) {
  return P.renderNavHtmlFull(tracks, activeRel, PREFERRED);
}
function renderChipsHtml(tracks, activeRel) {
  return P.renderChipsHtmlFull(tracks, activeRel, 12);
}

function layout({ locale, title, bodyHtml, navHtml, chipsHtml, tocHtml, rel, ui, mtBanner, crumbHtml, pagerHtml }) {
  const enHref = asset(relToHtml(rel || "index.md"), "en");
  const zhHref = asset(relToHtml(rel || "index.md"), "zh");
  const activeEn = locale === "en" ? " active" : "";
  const activeZh = locale === "zh" ? " active" : "";
  const langAttr = locale === "zh" ? "zh-CN" : "en";
  const desc = htmlEscape(ui.homeLead || title || "");
  return `<!DOCTYPE html>
<html lang="${langAttr}" data-locale="${locale}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${desc}" />
  <meta name="color-scheme" content="dark" />
  <meta name="theme-color" content="#08090c" />
  <title>${htmlEscape(title)} · ${htmlEscape(ui.brand || "Docs")}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="preconnect" href="https://resouces.modelscope.cn" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+SC:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/styles/github-dark.min.css" />
  <link rel="stylesheet" href="${asset("assets/site.css")}" />
  <link rel="alternate" hreflang="en" href="${enHref}" />
  <link rel="alternate" hreflang="zh-CN" href="${zhHref}" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="progress" aria-hidden="true"></div>
  <header class="topbar">
    <div class="topbar-inner">
      <button type="button" class="menu-btn" id="menuBtn" aria-label="${htmlEscape(ui.menu || "Menu")}">${htmlEscape(ui.menu || "Menu")}</button>
      <a class="brand" href="${asset("index.html", locale)}">
        <span class="brand-mark">魔</span>
        <span class="brand-text">${htmlEscape(ui.brand || "Docs")}</span>
        <span class="brand-v">${htmlEscape(ui.brandSub || "mirror")}</span>
      </a>
      <nav class="chips" id="trackChips" aria-label="Tracks">${chipsHtml || ""}</nav>
      <div class="lang-switch" role="group" aria-label="Language">
        <a class="lang-btn${activeEn}" href="${enHref}" data-lang-set="en" hreflang="en">${htmlEscape(ui.langEn || "EN")}</a>
        <a class="lang-btn${activeZh}" href="${zhHref}" data-lang-set="zh" hreflang="zh-CN">${htmlEscape(ui.langZh || "中文")}</a>
      </div>
      <a class="top-link" href="${OFFICIAL}" rel="noopener" target="_blank">${htmlEscape(ui.official || "Official ↗")}</a>
    </div>
  </header>
  <div class="shell">
    <aside class="sidebar" id="sidebar">
      <div class="side-head">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input class="search" id="search" type="search" placeholder="${htmlEscape(ui.searchPlaceholder || "Search…")}" autocomplete="off" />
          <span class="search-kbd" aria-hidden="true">/</span>
        </div>
        <p class="side-label">${htmlEscape(ui.learningPath || "Browse docs")}</p>
      </div>
      <nav class="nav" id="nav" data-active-rel="${htmlEscape(rel || "")}" aria-label="Docs">${navHtml}</nav>
      <div class="side-foot">${htmlEscape(ui.footer || "")}</div>
    </aside>
    <button type="button" class="backdrop" id="backdrop" aria-label="Close menu"></button>
    <div class="main" id="main">
      ${mtBanner || ""}
      <div class="crumb">${crumbHtml || ""}</div>
      <div class="content-wrap">
        <article class="content prose">${bodyHtml}</article>
        ${tocHtml || ""}
      </div>
      ${pagerHtml || ""}
      <footer class="page-foot">${htmlEscape(ui.footer || "")}</footer>
    </div>
  </div>
  ${P.kbdHelpHtml()}
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.11.1/build/highlight.min.js"></script>
  <script src="${asset("assets/site.js")}"></script>
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
  const sync = locale === "zh" ? "每日与 modelscope.cn 同步" : "synced daily from modelscope.cn";
  const ui = P.enrichUi(UI[locale] || UI.en, locale, sync);
  const outRoot = locale === "zh" ? path.join(DIST, "zh") : DIST;
  ensureDir(outRoot);
  const flat = P.flattenNav(navTracks);
  const homeHref = asset("index.html", locale);
  let n = 0;
  for (const page of pages) {
    const isHome = page.rel === "index.md";
    const title = isHome ? (locale === "zh" ? "首页" : "Home") : page.title;
    const navHtml = renderNavHtml(navTracks, page.rel);
    const chipsHtml = renderChipsHtml(navTracks, page.rel);
    let body, toc = "";
    if (isHome) {
      body = P.renderHomeBody(navTracks, ui, {
        pageCount: pages.length,
        localeCount: 2,
        officialUrl: OFFICIAL,
        syncNote: sync,
        llmsHref: asset("llms.txt"),
        llmsFullHref: asset("llms-full.txt"),
      });
    } else {
      marked.setOptions({ gfm: true, breaks: false });
      body = marked.parse(page.md);
      body = P.addHeadingIds(body);
      body = enhanceCode(body);
      body = postProcessHtml(body, page.rel, locale, cdnPrefix);
      toc = tocFromHtml(body);
    }
    const meta = P.findActiveMeta(navTracks, page.rel);
    meta.title = title;
    const crumbHtml = P.renderCrumb(ui, meta, isHome, homeHref);
    const pagerHtml = isHome ? "" : P.renderPager(flat, page.rel, ui);
    const html = layout({ locale, title, bodyHtml: body, navHtml, chipsHtml, tocHtml: toc, rel: page.rel, ui, crumbHtml, pagerHtml });
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
  if (!enRaw.length && !zhRaw.length) { console.error("No pages"); process.exit(1); }
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
        ...zh, rel,
        md: `> **Note:** Official English page is not available yet; showing Chinese content.\n\n` + zh.md,
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
  
  // --- llmstxt.org artifacts (llms.txt + llms-full.txt) ---
  try {
    const llmsPages = (typeof enPages !== "undefined" ? enPages : typeof pages !== "undefined" ? pages : [])
      .filter((p) => p && p.rel && p.md)
      .map((p) => ({ rel: p.rel, title: p.title, md: p.md }));
    const llmsNav = (typeof enNav !== "undefined" ? enNav : typeof nav !== "undefined" ? nav : typeof navTracks !== "undefined" ? navTracks : null);
    const llmsResult = writeLlmsArtifacts({
      dist: DIST,
      pages: llmsPages,
      base: BASE,
      origin: process.env.SITE_ORIGIN || "https://xiaoqianran.github.io",
      brand: 'ModelScope Docs',
      description: 'Unofficial bilingual mirror of ModelScope documentation (EN + 中文).',
      officialUrl: 'https://www.modelscope.cn/docs',
      repo: 'modelscope-docs',
      nav: llmsNav,
    });
    console.log(
      `[llms] llms.txt + llms-full.txt — ${llmsResult.pageCount} pages, full=${Math.round(llmsResult.fullBytes / 1024)}KB` +
        (llmsResult.fullTruncated ? " (truncated)" : ""),
    );
  } catch (err) {
    console.warn("[llms] failed:", err?.message || err);
  }

  console.log(`Built locales en+zh -> ${DIST} (BASE=${BASE || "/"})`);
}
main();
