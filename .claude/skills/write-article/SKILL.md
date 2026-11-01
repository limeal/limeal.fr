---
name: write-article
description: Writes or improves a public article for /articles (content/articles/<slug>/<lang>.mdx), picking subjects and patterns from what already performs (Search Console / Vercel Analytics exports in content/performance). Use when Paul wants to write an article, find the next subject, or improve an article that underperforms.
---

# Write an article

Goal: articles that bring qualified visitors from search engines to Paul's site, a
software & product engineer who builds with Go, React and Claude Code. Each article must
be useful enough to rank, and true: it is his name on it.

Read `content/articles/README.md` first: file layout, frontmatter, languages, and the
`Limeal` ban.

## 1. Learn what works

1. List the existing articles: frontmatter of every `content/articles/*/*.mdx` (originals are
   the files without `translatedFrom`).
2. Read the latest exports in `content/performance/` (see its README). With Search Console:
   - **Winners**: pages by clicks. Note what they share: subject, title shape, length,
     format (guide, retour d'expérience, comparatif…), language.
   - **Opportunities**: queries at position 5–20 with impressions → an article to
     strengthen, or a new one aimed squarely at that query.
   - **Weak CTR**: pages with impressions but CTR well under the site average → rewrite
     the `title`/`description` only.
   - **Unplanned queries**: queries bringing visitors to an article that does not target
     them → subject for a dedicated article.
3. Read `content/performance/learnings.md` (create it if missing) and update it with what
   this data confirms or contradicts. Short dated bullets, each tied to numbers.

No data yet (new site, empty folder)? Say so plainly and rely on the fundamentals below
and on Paul's positioning. Never make up figures.

## 2. Choose the subject with Paul

Propose 3 subjects, each with: the search query targeted, why (data from step 1 or search
intent), the angle that only Paul can bring, and the format. Let him choose.

Then ask for his material: what he did, the real numbers, the code, the mistakes. The
article is built on that. **Never invent** an anecdote, a client, a metric or a result;
when something is missing, ask or leave it out. No employer, city, surname or client names
(see `docs/specs/refonte-vitrine.md`).

**Fact-check, and contradict him when needed.** Paul's experience and opinions are his to
give; everything else gets checked before it goes in, with a web search on primary
sources (official pages, docs, changelogs) rather than blogs:
- any claim about an external service, product, company, price, date, availability or
  figure, even when he states it confidently;
- anything he says he is unsure about ("je crois", "il me semble", "non ?").

When a source says otherwise, tell him plainly, with the link, before writing: "Ce n'est
pas ce que dit X : …". Don't soften it and don't silently fix it in the text: he decides
how to rephrase. Opinions stay his, but point out when one rests on a wrong fact. Keep the
sources: the claims that matter are linked in the article.

## 3. Write

Outline first (H2s as questions or promises), validated by Paul, then the full text in the
language he picks.

- **Title** ≤ 60 characters, main query at the start, concrete promise. **Description**
  140–160 characters, answers "why click". **Slug**: the query, lowercase, hyphens.
- The first paragraph answers the query directly; context comes after.
- `##` sections that can be skimmed; short paragraphs; lists and tables when they help.
- Real code in fenced blocks with the language (```ts, ```go…), runnable as shown.
- Link to other articles on the site when relevant (`/articles/<lang>/<slug>`) and to
  primary sources.
- Fresh topics (products, launches) date fast: state facts with their date ("en bêta
  depuis le 11 août 2026"), and re-check them right before publishing.
- End with what to do next, not a summary.
- Reuse the structure of the winners from step 1 when it fits.
- Paul's voice: direct, first person, opinions backed by experience. No filler
  ("Dans cet article, nous allons voir…", "En conclusion"), no AI clichés.

Save to `content/articles/<slug>/<lang>.mdx` with `draft: true`, and have him read it with
`pnpm dev` at `/articles/<lang>/<slug>`.

## 4. Publish

Once Paul approves: remove `draft`, then translate it yourself into every other site
language (`en`, `fr`, `es`, `kr`), one file each next to the original:

- same frontmatter, with `title` and `description` translated (same length limits),
  plus `translatedFrom: <original lang>` and the `sourceHash` printed by
  `pnpm articles:status`;
- keep his voice and register (his `vous` becomes the polite form of each language),
  every link, figure and product name, and quotes in their original language;
- translate image alt texts; images themselves stay language-neutral.

Run `pnpm articles:status` again: every translation must be "up to date". Then suggest a
commit.

Give each article a `cover` (1200 × 630, under `public/images/articles/<slug>/`): it is
the image on the article card, so make it say something about the subject without words
to translate.

## Improving an existing article

For a page from "Opportunities" or "Weak CTR": change only what the data points to (title
and description for CTR; missing sections, depth, freshness for position), set `updated`
to today, then update the translations that `pnpm articles:status` reports as outdated. Keep the slug:
changing it loses the ranking.
