#!/usr/bin/env node
/**
 * Fetch ModelScope docs from official CDN:
 *   GET /api/v1/document/main_doc_{EN|CN}_prod → TargetPrefix
 *   {prefix}/dist/index.json (gzip) → page tree
 *   {prefix}/dist/{path} → Markdown
 *
 * Writes docs/en|zh pages + indexes. Official bilingual — no MT needed.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const CONCURRENCY = Math.max(1, Number(process.env.FETCH_CONCURRENCY || 8));
const TIMEOUT_MS = Math.max(5000, Number(process.env.FETCH_TIMEOUT_MS || 45000));
const UA = process.env.FETCH_UA || "modelscope-docs-mirror/1.0 (+https://github.com/xiaoqianran/modelscope-docs)";

const LOCALES = [
  { id: "en", apiKey: "main_doc_EN_prod", pagesDir: path.join(DOCS, "pages") },
  { id: "zh", apiKey: "main_doc_CN_prod", pagesDir: path.join(DOCS, "zh", "pages") },
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function sanitize(text) {
  let t = String(text);
  t = t.replace(/\bghp_[A-Za-z0-9]{20,}\b/g, "ghp_REDACTED");
  t = t.replace(/\bsk-[A-Za-z0-9]{20,}\b/g, "sk-REDACTED");
  t = t.replace(/\bhf_[A-Za-z0-9]{20,}\b/g, "hf_REDACTED");
  t = t.replace(/\bAKIA[0-9A-Z]{16}\b/g, "AKIA_REDACTED");
  return t;
}

async function fetchBuf(url, attempt = 0) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        "User-Agent": UA,
        Accept: "*/*",
        "Accept-Encoding": "gzip, deflate, br",
      },
      redirect: "follow",
    });
    if (res.status === 429 || res.status === 503) {
      const backoff = Math.min(60000, 2000 * Math.pow(2, attempt));
      if (attempt < 6) {
        console.warn(`rate ${res.status} ${url} sleep ${backoff}`);
        await sleep(backoff);
        return fetchBuf(url, attempt + 1);
      }
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  } finally {
    clearTimeout(timer);
  }
}

function maybeGunzip(buf) {
  if (buf.length >= 2 && buf[0] === 0x1f && buf[1] === 0x8b) {
    return zlib.gunzipSync(buf);
  }
  return buf;
}

async function fetchText(url) {
  const buf = maybeGunzip(await fetchBuf(url));
  return buf.toString("utf8");
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

function walkPages(node, acc = []) {
  if (!node) return acc;
  if (!node.dir && node.path) acc.push(node);
  for (const c of node.children || []) walkPages(c, acc);
  return acc;
}

/** Stable rel path without locale suffix: overview/overview.md */
function pathToRel(p) {
  let s = String(p).replace(/\\/g, "/");
  s = s.replace(/_(EN|CN)\.md$/i, ".md");
  if (!s.endsWith(".md")) s = s + ".md";
  return s.replace(/^\/+/, "");
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length || 1) }, () => worker()));
  return results;
}

async function fetchLocale(locale) {
  console.log(`\n=== locale ${locale.id} (${locale.apiKey}) ===`);
  const meta = await fetchJson(`https://www.modelscope.cn/api/v1/document/${locale.apiKey}`);
  if (!meta?.Success || !meta?.Data?.TargetPrefix) {
    throw new Error(`version API failed for ${locale.apiKey}: ${JSON.stringify(meta)}`);
  }
  const prefix = meta.Data.TargetPrefix.replace(/\/$/, "");
  const version = meta.Data.Version;
  console.log(`prefix ${prefix} version ${version}`);

  const index = await fetchJson(`${prefix}/dist/index.json`);
  ensureDir(path.join(DOCS, "meta"));
  fs.writeFileSync(path.join(DOCS, "meta", `index.${locale.id}.json`), JSON.stringify(index, null, 2));

  let titleMap = {};
  try {
    titleMap = await fetchJson(`${prefix}/dist/title-mapping.json`);
    fs.writeFileSync(path.join(DOCS, "meta", `title-mapping.${locale.id}.json`), JSON.stringify(titleMap, null, 2));
  } catch (e) {
    console.warn("title-mapping skip", e.message);
  }

  const pages = walkPages(index);
  console.log(`tree pages: ${pages.length}`);

  // clean pages dir
  fs.rmSync(locale.pagesDir, { recursive: true, force: true });
  ensureDir(locale.pagesDir);

  let done = 0;
  let ok = 0;
  const results = await mapPool(pages, CONCURRENCY, async (node) => {
    const mdPath = node.path;
    const url = `${prefix}/dist/${mdPath}`;
    try {
      const text = await fetchText(url);
      if (text.trim().length < 10) throw new Error("empty");
      const rel = pathToRel(mdPath);
      const out = path.join(locale.pagesDir, rel);
      ensureDir(path.dirname(out));
      const header = `<!-- modelscope-docs: ${node.title || ""} | ${mdPath} -->\n\n`;
      // ensure H1 if missing
      let body = text;
      if (!/^#\s/m.test(body) && node.title) {
        body = `# ${node.title}\n\n` + body;
      }
      fs.writeFileSync(out, sanitize(header + body));
      ok++;
      done++;
      if (done % 40 === 0 || done === pages.length) process.stdout.write(`\r  ${locale.id} ${done}/${pages.length} ok=${ok}`);
      return { ok: true, rel, title: node.title, path: mdPath, url: node.url, key: node.key, bytes: Buffer.byteLength(body) };
    } catch (e) {
      done++;
      return { ok: false, path: mdPath, error: e.message, title: node.title };
    }
  });
  console.log("");

  // write index for locale
  const okPages = results.filter((r) => r && r.ok);
  const failPages = results.filter((r) => r && !r.ok);
  const indexMd = [
    `# ModelScope documentation mirror (${locale.id})`,
    ``,
    `Unofficial mirror of [ModelScope Docs](https://www.modelscope.cn/docs).`,
    ``,
    `- Source version: \`${version}\``,
    `- CDN: \`${prefix}\``,
    `- Pages: ${okPages.length}`,
    ``,
    `## Top sections`,
    ``,
    ...(index.children || []).map((c) => `- ${c.title || c.filename || c.url}`),
    ``,
  ].join("\n");
  fs.writeFileSync(path.join(locale.pagesDir, "index.md"), indexMd);

  return {
    locale: locale.id,
    prefix,
    version,
    ok: okPages.length,
    failed: failPages.length,
    pages: okPages,
    failures: failPages,
    tree: index,
  };
}

async function main() {
  ensureDir(DOCS);
  const stats = [];
  for (const loc of LOCALES) {
    stats.push(await fetchLocale(loc));
  }

  const list = {
    fetchedAt: new Date().toISOString(),
    method: "modelscope-cdn-dist",
    locales: stats.map((s) => ({
      locale: s.locale,
      prefix: s.prefix,
      version: s.version,
      ok: s.ok,
      failed: s.failed,
    })),
    en: stats.find((s) => s.locale === "en"),
    zh: stats.find((s) => s.locale === "zh"),
  };
  // shrink list for json (no full tree)
  const slim = {
    fetchedAt: list.fetchedAt,
    method: list.method,
    locales: list.locales,
    pages: {
      en: list.en?.pages || [],
      zh: list.zh?.pages || [],
    },
    failures: {
      en: list.en?.failures || [],
      zh: list.zh?.failures || [],
    },
  };
  fs.writeFileSync(path.join(DOCS, "list.json"), JSON.stringify(slim, null, 2));
  fs.writeFileSync(
    path.join(DOCS, "llms.txt"),
    [
      "# ModelScope Docs",
      "",
      "Official bilingual documentation mirror.",
      "",
      `- EN: ${list.en?.ok || 0} pages (version ${list.en?.version || "?"})`,
      `- ZH: ${list.zh?.ok || 0} pages (version ${list.zh?.version || "?"})`,
      "",
      "Source: https://www.modelscope.cn/docs",
      "",
    ].join("\n"),
  );

  console.log("\nDone", JSON.stringify(list.locales, null, 2));
  if ((list.en?.ok || 0) < 50 || (list.zh?.ok || 0) < 50) {
    console.error("Too few pages");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
