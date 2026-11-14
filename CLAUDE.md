# CLAUDE.md — rules for any AI agent working on raddotcom

Rhea's personal site (www.rhea.com). Full how-to for humans: `HOW TO UPDATE THIS SITE.md`. Outstanding items: `TODO.md`. What's custom vs off-the-shelf: `WHAT'S NEW HERE.md`.

## Rule 1 — label every word you write (non-negotiable)
Any text an AI writes that a visitor can see **must be marked as AI-drafted, in the same change that adds it.** No exceptions, no "I'll label it later."
- **In a Svelte page/component:** wrap it in `<AIText>…</AIText>` (`src/components/AIText.svelte`). This covers sentences, notices, empty states, error messages, captions, tags like "not on my channel", tooltips you write as prose.
- **In a vault note's body:** wrap it in `<ai>` … `</ai>` (on their own lines around whole paragraphs, or inline around a phrase).
- **Titles / descriptions in frontmatter:** `ai_title: true` / `ai_description: true`.
- **Live-updating text** (contains a `{variable}` that changes while shown): still wrap it, and add `data-no-reveal` to its container so the reveal animation doesn't freeze it.
- **Exempt:** short control labels on buttons/menus ("send", "re-run", "do a new one →"). Anything that reads as a sentence is not exempt.
- **Verbatim copies are not AI text:** a title copied exactly from its source (a web page's or paper's title, a caption, a quote) gets no AI mark — inside AI text, wrap an exact quote in `<src>…</src>`. Only text Claude wrote, paraphrased or trimmed into new wording is labelled.
- **Never** wrap or "improve" Rhea's own words, and never retitle/rewrite her writing without asking.
- Before finishing any change, re-scan the components you touched for unwrapped prose.

## Other standing rules
- Don't make design choices on your own — ask, or mirror an existing pattern and say so.
- No emoji / pictographic glyphs on buttons or labels (⌨ ✎ ♪ etc.).
- Don't publish anything Rhea hasn't marked `published: true`; never republish `Artifact myart02b (PRIVATE - license collage)`.
- `research/ai-wiki/` (AI-compiled from Rhea's private chats) and `_sources/ai-chats/` (the raw transcripts) are private: never set `published: true` on them or copy them into `src/vault/`. See the vault's `_meta/2026-11 AI WIKI merged in (how it works).md`.
- Finish and commit work fully; the repo is pushed by Rhea from GitHub Desktop.
- The repo lives in iCloud Desktop: if git reports a missing branch or `*.lock` files, restore `refs/heads/main` from `main.lock` (check it points at a real commit) rather than re-initialising anything.
- Svelte treats undeclared names as globals, so `vite build` will NOT catch a deleted variable. After removing code, check every removed `let`/`function` name is no longer referenced.
