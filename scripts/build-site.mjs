#!/usr/bin/env node
// ModelScope docs static site — official EN + ZH
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

/** Build nav tracks from official tree meta */
function buildNavFromTree(tree, locale, pageByRel) {
  if (!tree) {
    // fallback flat
    const tracks = [{ id: "all", name: "Docs", badge: "·", groups: [{ name: "All", items: [] }], count: 0 }];
    for (const [rel, page] of pageByRel) {
      if (rel === "index.md") continue;
      tracks[0].groups[0].items.push({
        title: page.title,
        href: asset(relToHtml(rel), locale),
        rel,
      });
    }
    tracks[0].count = tracks[0].groups[0].items.length;
    return tracks;
  }

  const tracks = [
    {
      id: "home",
      name: locale === "zh" ? "首页" : "Home",
      badge: "·",
      groups: [
        {
          name: "Home",
          items: [{ title: locale === "zh" ? "首页" : "Home", href: asset("index.html", locale), rel: "index.md" }],
        },
      ],
      count: 1,
    },
  ];

  function collectLeaves(node, items) {
    if (!node) return;
    if (!node.dir && node.path) {
      const rel = pathToRel(node.path);
      const page = pageByRel.get(rel);
      items.push({
        title: node.title || page?.title || humanize(rel),
        href: asset(relToHtml(rel), locale),
        rel,
      });
      return;
    }
    for (const c of node.children || []) collectLeaves(c, items);
  }

  for (const top of tree.children || []) {
    const id = (top.filename || top.url || top.title || "sec")
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "sec";

    // if top is a leaf
    if (!top.dir && top.path) {
      const rel = pathToRel(top.path);
      tracks.push({
        id,
        name: top.title || id,
        badge: "▸",
        groups: [
          {
            name: top.title || "Page",
            items: [
              {
                title: top.title || humanize(rel),
                href: asset(relToHtml(rel), locale),
                rel,
              },
            ],
          },
        ],
        count: 1,
      });
      continue;
    }

    // children as groups
    const groups = [];
    const kids = top.children || [];
    if (kids.length === 0) continue;

    // if children are mostly leaves → one group
    const hasNestedDirs = kids.some((k) => k.dir && (k.children || []).length);
    if (!hasNestedDirs) {
      const items = [];
      collectLeaves(top, items);
      if (items.length) {
        groups.push({ name: top.title || "Guides", items });
      }
    } else {
      for (const k of kids) {
        const items = [];
        collectLeaves(k, items);
        if (items.length) {
          groups.push({ name: k.title || k.filename || "Section", items });
        }
      }
    }
    const count = groups.reduce((n, g) => n + g.items.length, 0);
    if (!count) continue;
    tracks.push({ id, name: top.title || id, badge: "▸", groups, count });
  }
  return tracks;
}

function renderNavHtml(tracks, activeRel) {
  // Slim shell + hydrate from nav.json (same pattern as HF)
  const parts = [];
  const activeTop = (() => {
    if (!activeRel || activeRel === "index.md") return "home";
    // match track containing active
    for (const t of tracks) {
      if (t.groups.some((g) => g.items.some((it) => it.rel === activeRel))) return t.id;
    }
    return tracks[0]?.id || "home";
  })();

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
      `<div class="track-panel"><div class="track-panel-inner"><div class="track-body"><div class="muted" style="padding:0.45rem 0.5rem;font-size:0.78rem">Loading…</div></div></div></div></div>`,
    );
  }
  return parts.join("\n");
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

function postProcessHtml(html, fromRel, locale) {
  return html.replace(/href="([^"]+)"/g, (full, href) => {
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("data:")) return full;
    if (/^https?:\/\//i.test(href)) {
      // map modelscope docs absolute URLs to local
      const m = href.match(/^https?:\/\/(?:www\.)?modelscope\.cn\/docs\/(.+)$/i);
      if (m) {
        let p = decodeURIComponent(m[1]).replace(/\/$/, "");
        if (!p || p === "home") return `href="${asset("index.html", locale)}"`;
        // title mapping may be needed; best-effort
        if (!p.endsWith(".html")) p = p + ".html";
        return `href="${asset(p, locale)}"`;
      }
      return full;
    }
    // relative .md
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
}

function layout({ locale, title, bodyHtml, navHtml, tocHtml, rel, ui }) {
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
  <title>${htmlEscape(title)} · ${htmlEscape(ui.brand)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&family=Noto+Sans+SC:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css" />
  <link rel="stylesheet" href="${asset("assets/site.css")}" />
  <link rel="alternate" hreflang="en" href="${enHref}" />
  <link rel="alternate" hreflang="zh-CN" href="${zhHref}" />
</head>
<body>
  <header class="topbar">
    <div class="topbar-inner">
      <button type="button" class="menu-btn" id="menuBtn" aria-label="${htmlEscape(ui.menu)}">${htmlEscape(ui.menu)}</button>
      <a class="brand" href="${asset("index.html", locale)}">
        <span class="brand-mark">魔</span>
        <span class="brand-text">${htmlEscape(ui.brand)}</span>
        <span class="brand-v">${htmlEscape(ui.brandSub)}</span>
      </a>
      <nav class="chips" id="trackChips" aria-label="Tracks"></nav>
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

function buildLocale(locale, pages, navTracks) {
  const ui = UI[locale] || UI.en;
  const outRoot = locale === "zh" ? path.join(DIST, "zh") : DIST;
  ensureDir(outRoot);
  const navHtmlBase = null;
  let n = 0;
  for (const page of pages) {
    const nav = renderNavHtml(navTracks, page.rel);
    marked.setOptions({ gfm: true, breaks: false });
    let body = marked.parse(page.md);
    body = enhanceCode(body);
    body = postProcessHtml(body, page.rel, locale);
    const toc = tocFromHtml(body);
    const html = layout({
      locale,
      title: page.title,
      bodyHtml: body,
      navHtml: nav,
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

  const enRaw = loadPages(EN_PAGES);
  const zhRaw = loadPages(ZH_PAGES);
  if (!enRaw.length && !zhRaw.length) {
    console.error("No pages");
    process.exit(1);
  }
  // Union of all rels (prefer ZH tree completeness)
  const allRels = new Set([...enRaw.map((p) => p.rel), ...zhRaw.map((p) => p.rel)]);
  const enMapRaw = new Map(enRaw.map((p) => [p.rel, p]));
  const zhMapRaw = new Map(zhRaw.map((p) => [p.rel, p]));

  // EN: official EN when present; else ZH content + banner (many EN CDN files are empty)
  const enPages = [];
  for (const rel of allRels) {
    const en = enMapRaw.get(rel);
    const zh = zhMapRaw.get(rel);
    if (en && en.md.trim().length > 20) {
      enPages.push(en);
    } else if (zh) {
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
  // ZH: official CN when present; else EN
  const zhPages = [];
  for (const rel of allRels) {
    const en = enMapRaw.get(rel);
    const zh = zhMapRaw.get(rel);
    if (zh && zh.md.trim().length > 20) zhPages.push(zh);
    else if (en) zhPages.push(en);
  }

  const enMap = new Map(enPages.map((p) => [p.rel, p]));
  const zhMap = new Map(zhPages.map((p) => [p.rel, p]));
  const enTree = loadMetaTree("en");
  const zhTree = loadMetaTree("zh");
  const enNav = buildNavFromTree(enTree, "en", enMap);
  const zhNav = buildNavFromTree(zhTree, "zh", zhMap);

  fs.writeFileSync(path.join(DIST, "assets", "nav.json"), JSON.stringify(enNav, null, 2));
  fs.writeFileSync(path.join(DIST, "assets", "nav.zh.json"), JSON.stringify(zhNav, null, 2));

  const nEn = buildLocale("en", enPages, enNav);
  const nZh = buildLocale("zh", zhPages, zhNav);
  console.log(`[en] ${nEn} pages — tracks ${enNav.length}`);
  console.log(`[zh] ${nZh} pages — tracks ${zhNav.length}`);
  console.log(`Built locales en+zh -> ${DIST} (BASE=${BASE || "/"})`);
}

main();
