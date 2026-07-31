#!/usr/bin/env python3
"""
Publish all finished work, EXCEPT a small held list.

Run this when iCloud/Obsidian isn't actively syncing (so files aren't locked):
    python3 scripts/publish-finished.py            # dry run — shows what it would do
    python3 scripts/publish-finished.py --apply    # actually flip published: true

Then double-click promote-to-site.command and push.

It flips `published: false` -> `published: true` on every note outside the
held/hidden folders. It never touches: scraps/, artifacts/, topics/, _meta/,
_not-mine/, _resume-lines, recommendation LISTS, or the explicitly HELD files.
It skips iCloud conflict copies ("Foo 2.md") and anything flagged not_mine.
Idempotent and safe to re-run.
"""
import os, re, sys, glob

APPLY = "--apply" in sys.argv

# Explicitly held — leave unpublished (your call to change later):
HELD = {
    "thesis/2025-10 Rhea Madhogarhia THESIS PROPOSAL.md",          # thesis paused
    "scraps/thesis/2025-10 THESIS DUMP.md",
    "scraps/thesis/2025-26 phil of ai final paper ideas.md",
    "think-pieces/2025-08 Learning the Machine  New Critic interview.md",  # republication rights
    "research/coursework-research/2024-05 Cog Models final report.md",     # co-authored
    "essays/cognitive-science/2026-02 philofaifinalcallardcomments.md",    # duplicate of Phil of AI final
    "friends/_TEMPLATE (copy me per friend).md",                            # template, not content
    "friends/2026-07 Paris - quotes (placeholder).md",                      # empty placeholder
    "creative/scripts-and-theatre/2026-07-01 Golden Record musical  Scott's notes.md",  # Scott's words, not Rhea's
}
SKIP_DIRS = {"topics", "_meta", "_not-mine", "_resume-lines (not posts)", "artifacts", "scraps"}

# locate the vault
here = os.path.dirname(os.path.abspath(__file__))
repo = os.path.dirname(here)
vault = next((os.path.join(repo, d) for d in os.listdir(repo)
             if "vault-drafts" in d and os.path.isdir(os.path.join(repo, d))), None)
if not vault:
    sys.exit("Couldn't find the vault folder.")

changed = []
for root, dirs, files in os.walk(vault):
    dirs[:] = [d for d in dirs if not d.startswith(".") and d not in SKIP_DIRS]
    for f in sorted(files):
        if not f.endswith(".md") or re.search(r" \d+\.md$", f):
            continue
        rel = os.path.relpath(os.path.join(root, f), vault)
        if rel in HELD:
            continue
        # leave recommendation LISTS unpublished (keep the Links note only)
        if rel.startswith("recommendations") and "Links" not in f:
            continue
        p = os.path.join(root, f)
        t = open(p, encoding="utf-8", errors="ignore").read()
        m = re.match(r"^---\n(.*?)\n---", t, re.S)
        if not m:
            continue
        fm = m.group(1)
        if re.search(r"^published:\s*true", fm, re.M):
            continue
        if re.search(r"^not_mine:\s*true", fm, re.M):
            continue
        if APPLY:
            t2 = re.sub(r"^published:\s*false\s*$", "published: true", t, count=1, flags=re.M)
            if t2 == t:
                t2 = re.sub(r"^(type:.*)$", r"\1\npublished: true", t, count=1, flags=re.M)
            open(p, "w", encoding="utf-8").write(t2)
        changed.append(rel)

print(("PUBLISHED " if APPLY else "WOULD PUBLISH ") + f"{len(changed)} notes:")
for c in changed:
    print("  +", c)
if not APPLY:
    print("\nRe-run with --apply to write, then run promote-to-site.command and push.")
