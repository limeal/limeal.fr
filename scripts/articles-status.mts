// Lists, for every article, which translations are missing or outdated.
//
//   pnpm articles:status
//
// Each article folder holds one file written by hand (no `translatedFrom` in its
// frontmatter). A translation records the hash of the original it came from
// (`sourceHash`), so editing the original makes it outdated. Translations are
// written by Claude (see the write-article skill), with the hash printed here.
// Fixing a translation by hand? Remove its `translatedFrom` line: it then counts
// as written by hand and is never reported.

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const ROOT = path.join(process.cwd(), "content/articles");
const LANGS = ["en", "fr", "es", "kr"] as const;

const hash = (text: string) => createHash("sha256").update(text).digest("hex").slice(0, 12);

const read = async (file: string) => {
  const raw = await fs.readFile(file, "utf8").catch(() => null);
  return raw == null ? null : { raw, data: matter(raw).data };
};

const slugs = (await fs.readdir(ROOT, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
let todo = 0;

for (const slug of slugs) {
  const files = await Promise.all(LANGS.map(async (lang) => ({ lang, file: await read(path.join(ROOT, slug, `${lang}.mdx`)) })));
  const originals = files.filter((f) => f.file && !f.file.data.translatedFrom);

  if (originals.length !== 1) {
    console.log(`✗ ${slug}: expected exactly one original (a file without translatedFrom), found ${originals.length}`);
    todo++;
    continue;
  }

  const { lang: from, file: source } = originals[0];
  const sourceHash = hash(source!.raw);
  console.log(`${slug} (original: ${from}, sourceHash: ${sourceHash})`);

  for (const { lang, file } of files) {
    if (lang === from) continue;
    const state = !file ? "missing" : !file.data.translatedFrom ? "written by hand" : file.data.sourceHash === sourceHash ? "up to date" : "outdated";
    if (state === "missing" || state === "outdated") todo++;
    console.log(`  ${lang}: ${state}`);
  }
}

if (todo > 0) process.exitCode = 1;
