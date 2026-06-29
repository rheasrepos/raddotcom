# raddotcom — Build & Workflow Plan

_Last updated: 2026-06-27_

This is the plan we agreed to before building. It covers four things:

1. The Obsidian → site workflow (and how to run it expertly on your Mac)
2. Substack (you don't have an account yet, and there's an important constraint)
3. Mac-style folder icons
4. The 4-year archive project — mining old writing into posts

Plus short notes on what already works and the "switch models" question.

---

## 0. What already works (so we don't rebuild it)

Your site already does several things you asked for:

- **Selective Obsidian publishing.** `src/vault/` is an Obsidian vault. A note only appears on the site if its frontmatter contains `published: true`. Everything else stays private. The logic lives in `src/routes/api/posts/+server.js`. So "choose which notes populate the site" is one line per note.
- **Full-text search.** The search box already matches your query against the title, description, and the entire body text of every note (HTML stripped). Direct-word-match-anywhere works today.
- **Loose files + clickable folders.** The desktop view already supports notes sitting loose on the desktop *and* folders you open, even though there are no loose files right now.
- **Per-note custom icon.** Frontmatter already supports `iconImage`, so any note/folder icon can be swapped to a custom image later.

**What's genuinely new work:** Substack, and changing the icons from category symbols (pen, music note) to Mac-style **folder icons with the folder name underneath**.

---

## 1. The Obsidian workflow (the heart of everything)

An Obsidian "vault" is nothing more than a folder of Markdown (`.md`) files. That's the whole trick — anything that can write Markdown into that folder feeds your site.

### How publishing works
Every note that should go live needs frontmatter at the top:

```yaml
---
title: "Your post title"
description: "One line shown in the preview"
date: 2026-06-01
type: writing        # writing | thesis | research | programming | music | comedy
published: true      # ← omit or set false to keep it private
iconImage: null      # optional: custom icon image path later
---

Your note body here...
```

Drop the file in the vault, set `published: true`, sync, and it's on the site. Remove that line and it disappears. That's your "choose which things populate the site" control.

### Running it expertly on your Mac
1. **Open the vault.** In Obsidian: _Open folder as vault_ → point it at `…/raddotcom/src/vault`. Now Obsidian edits the exact files the site reads.
2. **Install two plugins** (Settings → Community plugins):
   - **Obsidian Git** — auto-commits and pushes the vault on a schedule, so the site updates without you touching a terminal. Point it at this repo.
   - **Templater** (optional) — gives you a one-keystroke "new post" template so the frontmatter is pre-filled.
3. **Use Properties for frontmatter.** Obsidian's Properties panel turns that YAML block into nice form fields (title, date, a `published` checkbox). You never hand-edit YAML.
4. **Folders = folders on the site.** Subfolders in the vault can map to the clickable folders on your desktop UI (we'll wire this in the build step).
5. **Drag-and-drop to import.** Drag any `.md`, image, or PDF straight into the Obsidian window and it lands in the vault. Word docs need a quick conversion first (covered in §4).
6. **Mobile.** Obsidian's iOS app syncs the same vault, so you can publish from your phone.

The daily loop becomes: write note → tick `published` → Obsidian Git pushes → live in ~1 min.

---

## 2. Substack

You don't have an account yet, and there's one hard constraint worth knowing before we build anything:

> **Substack has no public publishing API.** Nothing can reliably "push" a finished post from your site into Substack automatically. Tools that claim to do this drive Substack's web editor with browser automation, which is fragile and breaks often.

So "push site posts to Substack" can't be a clean one-click pipeline. Here's the honest, durable setup instead:

### Recommended model: one source, two destinations
Write once in Obsidian. From that single Markdown note:
- The **site** publishes automatically (already wired).
- **Substack** is your newsletter/email layer. The realistic ways to get the note into it, best to worst:
  1. **Paste the Markdown into Substack's editor** (~2 min). Substack accepts Markdown paste and keeps formatting. I can add a **"Copy for Substack"** button to each post page that puts clean, ready-to-paste text on your clipboard.
  2. **Browser-assisted drafting.** I can use the Chrome tools to open Substack's editor and drop a note in as a *draft* for you to review and hit publish. Works, but treat it as a convenience, not a guarantee.
- The **site can also show your Substack posts**: Substack publishes an RSS feed at `https://YOURNAME.substack.com/feed`. We embed that so your latest newsletters appear on the desktop automatically. This direction (Substack → site) *is* reliable.

### Decision for you
- If the newsletter/email audience matters → make the Substack account, and we wire the RSS-embed + "Copy for Substack" button. Best of both: site is the canonical archive, Substack is distribution.
- If you mainly want a personal site → skip Substack for now; the architecture already supports adding it later with zero rework.

I'll wait for your call on whether to create the account before building this piece.

---

## 3. Mac-style folder icons

Goal: icons look like the classic Mac folder, with the **folder/note name as a label underneath**, swappable to a custom image later.

Plan:
- Replace the category SVGs (pen, music note, etc.) with a single **folder icon** SVG, rendered with the folder name beneath it — exactly like a Mac desktop.
- Keep the existing `iconImage` frontmatter override so any folder or note can later point at a custom image (`iconImage: /icons/my-thing.png`) and that image renders instead of the default folder.
- Loose notes (files not in a folder) get a **document icon** + name, so the desktop visually distinguishes folders from files — Mac-style.
- No data migration needed; this is a presentation change in `src/routes/+page.svelte`.

---

## 4. The 4-year archive project (the big one)

You want to go through ~4 years of writing, pull out the think-pieces / essays / articles worth keeping, and turn them into posts. You said the writing is spread across several places ("mixed / not sure"). Yes — this is exactly what Obsidian is good for, because the end state is just Markdown files in the vault. Here's the staged plan.

### Phase 1 — Discovery (find everything)
We locate every candidate file before deciding anything.
- **Google Drive is already connected to this project**, so I can search your Drive for Docs and files by keyword, date range, and type right now.
- For writing **on your Mac**, you'd grant me access to the relevant folders (Documents, Desktop, old project folders) and I'd scan for `.docx`, `.txt`, `.md`, `.pages`, and Google Docs exports.
- I produce a single **inventory spreadsheet**: every file, where it lives, date, word count, and a first-pass guess at type (essay / think-piece / fragment / notes / junk).

### Phase 2 — Triage & scoring
- I read through the candidates and tag each one: **keep / maybe / skip**, plus a short reason and a quality/interest note.
- You get a ranked shortlist instead of 4 years of raw files. You can take "just the good ones" or "all of them" — your call, per file.

### Phase 3 — Convert to Markdown
- Word/Pages/Google Docs → clean Markdown (I handle the conversion; `pandoc` for docs).
- Each kept piece gets frontmatter filled in: title, description, a sensible date (from the file or the content), `type`, and `published` left **false** by default so nothing goes live until you say so.
- Everything lands in the vault, organized into folders (e.g. `essays/`, `think-pieces/`, `thesis/`).

### Phase 4 — Review & publish
- You open the vault in Obsidian, skim the shortlist, and flip `published: true` on the ones you want — individually, at your pace.
- Optionally push selected ones to Substack per §2.

**Can this be done through Obsidian?** Yes — Obsidian is the destination and the review surface. The finding, converting, and frontmatter-filling is work I do for you; Obsidian is where you make the final keep/publish calls.

---

## 5. Switching this project to a different model

That's a Cowork app setting, not anything in the code. Change which Claude model powers this project in the **model picker in the Cowork interface** (in the chat UI), not by editing the repo. I can't flip it from here, but that's where it lives.

---

## Proposed build order

1. **Folder icons** — self-contained, visible win, no dependencies. _(I can start here immediately.)_
2. **Folder structure mapping** — vault subfolders → clickable desktop folders.
3. **Substack** — only after you decide on the account; then RSS embed + "Copy for Substack" button.
4. **Archive project** — Phase 1 discovery as soon as you point me at Drive and/or a Mac folder. This runs in parallel with everything else.

Tell me which to start and I'll build it.
