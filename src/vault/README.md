# Obsidian Vault

This folder is your Obsidian vault, synced to the site via Obsidian Git.

## How to publish a note

Add `published: true` to the YAML frontmatter of any note:

```yaml
---
title: "Your post title"
description: "Short description shown in previews"
date: 2026-06-01
type: writing        # writing | thesis | research | programming | music | comedy
published: true      # ← this is what makes it appear on the site
---

Your note content here...
```

Notes without `published: true` (or with `published: false`) will never appear on the site — they stay private.

## Obsidian Git sync

Install the **Obsidian Git** plugin in Obsidian and point it at this repo. Every time you commit, the site picks up newly published notes automatically.
