# How to update www.rhea.com — by hand, no AI needed

Everything on this site comes from **plain text files you already own**. You never need me to change a word. This is the map: which file controls what, and exactly how to change it.

The golden rule: **edit a file → save → run `promote-to-site.command` (double-click it) → `git add . && git commit -m "..." && git push`.** The live site rebuilds in ~1 minute.

---

## 1. The two folders that matter

| Folder | What it is |
|---|---|
| `raddotcom Vault (vault-drafts)/` | **Your Obsidian vault.** Every post is a `.md` file here. Private — never goes online until you publish it. Edit here. |
| `src/vault/` | The **published copy**. You never touch this by hand — `promote-to-site.command` fills it from the vault. |

Open the vault in Obsidian: **Open folder as vault** → pick `raddotcom Vault (vault-drafts)`.

---

## 2. Every page in the top nav → the file that controls it

| Nav item | File to edit |
|---|---|
| **Desktop** (the home screen, folders, windows) | `src/routes/+page.svelte` |
| **Blog** (the list of posts) | `src/routes/blog/+page.svelte` |
| **Obsidian** (the node graph) | `src/routes/network/+page.svelte` |
| **Resume** | `src/routes/resume/+page.svelte` (the PDF it shows is `static/resume.pdf`) |
| **About** | `src/routes/about/+page.svelte` |
| **Admin** | `src/routes/admin/+page.svelte` (local-only draft tool; ignore it) |
| A single post page | `src/routes/posts/[id]/+page.svelte` (one file renders every post) |
| The site name, tagline | `src/lib/site.js` |
| The category list + colors | `src/lib/categories.js` |
| Fonts, colors, spacing (whole site) | `src/app.css` |

---

## 3. Changing the words in a POST (the most common thing)

Every post is a `.md` file in the vault. It has two parts:

```
---
title: "PHIL OF AI: Limits of Matter and Manner"
ai_title: true
date: 2025-12-15
type: essays
published: true
tags: [academic/philosophy/philosophy-of-ai]
---

This part is the body. Write whatever you want here.
```

- **The bit between the two `---` lines is "frontmatter"** — settings.
- **Everything below the second `---` is the post body** — your actual writing.

To change the body, just type in it. To change the title, edit the `title:` line.

### Removing the AI-generated dashed underline
If a title/description has a dashed underline on the site, it's because the file has `ai_title: true` or `ai_description: true`. **When you rewrite that text yourself, delete that line.** The underline disappears. That's the whole system — one line per file.

### Making a post live / hidden (PRUNING)
`published: true` = on the site. `published: false` = hidden. Change the word, promote, push.

**To prune (unpublish) a post you don't want live:** open its `.md` file, change `published: true` to `published: false`, save, double-click `promote-to-site.command`, commit + push. It disappears from the site but stays in your vault. Nothing is deleted.

**To prune in bulk / find what to prune:**
- In Obsidian, use Search (`⌘⇧F`) for `published: true` to see everything that's live.
- To hide a whole folder at once, you can set `published: false` on each note, or just move the folder into `scraps/` — the promote script never publishes anything in `scraps/`.
- To find the weakest/shortest posts to consider cutting, sort your file explorer by size, or ask me for a word-count list.

**To delete a post entirely:** delete its `.md` file from the vault, then delete the matching file from `src/vault/` (or just re-run promote, which rebuilds `src/vault` from scratch and drops anything no longer in the vault). Commit + push.

---

## 4. Adding a NEW post

1. In Obsidian, make a new note in the right folder (e.g. `essays/`, `comedy/off-off-campus/`).
2. Paste this at the very top and fill it in:
   ```
   ---
   title: "Your title here"
   date: 2026-08-01
   type: essays
   published: true
   tags: [academic/philosophy]
   ---

   Your writing starts here.
   ```
3. Save. Double-click `promote-to-site.command`. Commit + push.

**`type:` must be one of the category ids** in `src/lib/categories.js`: `writing`, `essays`, `coursework`, `thesis`, `research`, `creative`, `comedy`, `music`, `programming`, `recs`, `friends`, `artifacts`. (You never set a `grp-` group as a `type:` — those are just the desktop folders the categories live in.)

### Optional extras you can add to any post's frontmatter
| Line | What it does |
|---|---|
| `description: "one line"` | shows a subtitle under the title |
| `featured: true` | pins it to the top of the blog |
| *(PDF)* | no line needed — name the file `<slug>.pdf` in `static/docs/` and it auto-attaches (see §4b) |
| `video: https://youtu.be/XXXX` | embeds a YouTube video |
| `link: https://...` | adds an "Open project ↗" button |
| `doi: https://doi.org/...` | adds a "Read the paper" link |
| `image: /artifacts/foo.jpg` | shows an image (put it in `static/artifacts/`) |
| `loose: true` | floats the note on the desktop instead of inside a folder |
| `also_in: [programming]` | makes the post appear in EXTRA category folders too (like multiple tags). Primary folder stays `type:`; list any extra category ids here |

---

## 4b. PDFs — one file, one post (no more drift)

A post and its PDF are now bound by the post's **slug** (its filename, lowercased with dashes). You never type a `pdf:` line — the site auto-attaches `static/docs/<slug>.pdf` if it exists.

- **The slug** of a post is its `.md` filename → lowercase, spaces/punctuation → dashes. Example: `2023-24 SHORT PAPER 1 - Mind, Brain, and Meaning.md` → slug `2023-24-short-paper-1-mind-brain-and-meaning`, so its PDF is `static/docs/2023-24-short-paper-1-mind-brain-and-meaning.pdf`.

**To attach or replace a PDF:** name the file `<slug>.pdf`, drop it in `static/docs/` (overwrite to replace), then run `python3 scripts/sync-pdfs.py --apply` (regenerates the cover + manifest), then `promote-to-site.command`, commit + push.

**If you rename a post:** its slug changes, so run `python3 scripts/sync-pdfs.py --apply` — it renames the matching PDF to the new slug so the two stay in lock-step. That's the whole point: the PDF and the post can't drift apart anymore.

`scripts/sync-pdfs.py` (no `--apply`) is a safe dry run that prints exactly what it would rename.

---

## 5. Adding a caption to an artifact / image

Artifacts live in `artifacts/`. Each has an `image:` line already pointing at the scan. To caption one:
1. Open the note.
2. Write your caption in the body (below the `---`).
3. Set `published: true`.
4. Delete `ai_description: true` if it's there (you wrote it now).
Promote + push.

---

## 6. Categories & the desktop folders — add, rename, recolor, regroup

Everything about folders lives in **one file: `src/lib/categories.js`**. It has two kinds of entries.

**GROUPS** are the big desktop folders (there are 4: Writing, Research, Making, Collecting). They look like this:
```
'grp-writing': { id: 'grp-writing', label: 'Writing', color: '#4a69bd', group: true },
```

**CATEGORIES** are the real `type:` you put on a post. Each one names a group as its `parent`, so it shows up *inside* that group's folder:
```
essays: { id: 'essays', label: 'Essays & Papers', color: '#4a69bd', parent: 'grp-writing' },
```

Now you can change any of this yourself:

- **Rename a desktop folder** → change the group's `label` (e.g. `'Writing'` → `'Words'`).
- **Rename a category** → change its `label`.
- **Recolor** anything → change its `color` (any hex like `#ff8c42`).
- **Move a category into a different group** → change its `parent` to another group id. Example: to put Research inside Writing, change `research`'s `parent` from `'grp-research'` to `'grp-writing'`.
- **Add a new group (desktop folder)** → copy a `grp-` line, give it a new id/label, `group: true`. Then point some categories' `parent` at it.
- **Add a new category** → copy a category line, new `id` + `label` + a `parent`. Then use that `id` as the `type:` in your posts.
- **Delete a group** → remove its line and re-`parent` its categories somewhere else.

A category can nest inside another category too (that's how **Comedy** and **Music** sit inside **Creative**, which sits inside **Making**): give it `parent: 'creative'`.

**A folder only appears on the desktop if it contains published posts** — so empty groups/categories stay hidden until you publish something in them. No code needed; just publish a post with that `type:`.

---

## 7. The Obsidian graph (the "Obsidian" nav page)

The graph builds itself from your posts. You control it two ways, both in the `.md` files:

- **Topic nodes** = your `tags:`. A tag becomes a node once 2+ posts share it; its size = how many posts carry it. So to make a topic bigger, tag more posts with it. To remove a topic, remove the tag.
- **Filing tags don't show** (`affiliation:`, `kind:`, `form:` are separate fields on purpose, so they don't clutter the graph).

The graph code itself is `src/routes/network/+page.svelte` — you rarely need to touch it.

---

## 8. Links section

The links page is a normal post: `recommendations/2026-07 Links.md`. Add a bullet with `- [name](https://url)` and it appears. Promote + push.

---

## 9. Formatting inside a post (Markdown)

| You type | You get |
|---|---|
| `## Heading` | a heading |
| `**bold**` | **bold** |
| `*italic*` | *italic* |
| `- item` | a bullet list |
| `[text](https://url)` | a link |
| `> quote` | an indented quote |
| blank line between paragraphs | a new paragraph |

Do **not** use `[[double brackets]]` in anything published — those are Obsidian-only and show as literal text on the site. (The `## Topics` and `## Related` blocks at the bottom of notes are auto-hidden on the site, so leave them.)

---

## 10. Fonts & colors for the whole site

`src/app.css`, near the top:
- **Font**: the line starting `font-family:` — swap `'Space Grotesk'` for any font name. If you buy Quadrat Grotesk, it's already listed first, so installing it is enough.
- **Wallpaper / accent colors**: the `:root { --color-... }` block.

---

## 10b. The Redaction age-decay (older posts look more degraded)

Post titles (and bodies) render in the **Redaction** typeface, in progressively degraded grades the older the post is. Everything about it lives in **one file: `src/lib/redaction.js`**.

**One-time setup (needs you):** download the free font from **redaction.us** (Download button → zip). From the zip, copy the `.woff2` files into `static/fonts/redaction/` with these names: `Redaction-Regular.woff2`, `Redaction_10-Regular.woff2`, `Redaction_20-Regular.woff2`, `Redaction_35-Regular.woff2`, `Redaction_50-Regular.woff2`, `Redaction_70-Regular.woff2`, `Redaction_100-Regular.woff2`. Until then the site quietly uses SF Mono — nothing breaks.

**Tuning the timeframes** — edit the table in `src/lib/redaction.js`:
```
{ months: 6,   grade: 'R'   },   // ≥ 6 months old → clean Redaction
{ months: 12,  grade: '10'  },   // ≥ 1 year → slightly degraded
...
{ months: 120, grade: '100' }    // ≥ 10 years → maximum decay
```
Change the `months` numbers to speed up / slow down the decay. Delete rows to use fewer grades. Posts newer than the first row keep the normal site font.

**Titles only?** Set `APPLY_TO_BODY = false` in the same file — bodies stay readable SF Mono and only titles decay.

---

## 11. The publish checklist (memorize this)

1. Edit the `.md` file in `raddotcom Vault (vault-drafts)/` (or a `src/...` file for page layout).
2. Save.
3. Double-click **`promote-to-site.command`** (only needed if you changed a vault post).
4. In Terminal, from the repo folder:
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
5. Wait ~1 minute; the live site updates.

To preview locally before pushing: `npm run dev`, then open the localhost link it prints.

---

## 12. Where the AI-written text is, so you can hunt it down

Every title/description I wrote is flagged in its file with `ai_title: true` or `ai_description: true` — and shows a dashed underline on the site. To find them all at once, in Terminal:
```
grep -rl "ai_title: true" "raddotcom Vault (vault-drafts)"
```
That prints every file with an AI-written title. Rewrite, delete the flag, promote, push.
