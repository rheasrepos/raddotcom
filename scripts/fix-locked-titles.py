#!/usr/bin/env python3
"""Run me after closing Obsidian: python3 scripts/fix-locked-titles.py
Sets proper display titles on 8 notes that were file-locked during the
2026-07-20 titles pass."""
import re, glob, os
os.chdir(os.path.join(os.path.dirname(__file__), "..", "vault-drafts"))
FIX = {
 "2022-23 Media Aesthetics Text paper 2.md": "HUMA: Media Aesthetics — Text Paper 2",
 "2026-01-08 UCD Reading Response 1 - period-tracking privacy post-Roe (Cao et al).md": "UCD: Reading Response — Period-Tracking Privacy Post-Roe (Cao et al)",
 "2026-01-13 UCD Reading Response 2 - HelpCall older adults (Tanprasert et al).md": "UCD: Reading Response — HelpCall for Older Adults (Tanprasert et al)",
 "2026-01-15 UCD Reading Response 3 - rideshare transparency (Nagaraj et al).md": "UCD: Reading Response — Rideshare Transparency (Nagaraj et al)",
 "2026-02-17 UCD Reading Response - Storywell family fitness (Saksono et al).md": "UCD: Reading Response — Storywell Family Fitness (Saksono et al)",
 "2026-02-18 UCD Reading Response - BlackPeopleTwitter governance (Smith et al).md": "UCD: Reading Response — BlackPeopleTwitter Governance (Smith et al)",
 "2023-10-20 Cog Psych Discussion - Week 4 (mental imagery).md": "COG PSYCH: Discussion Week 4 — Mental Imagery",
 "2023-10-28 Cog Psych Discussion - Week 5 (selective attention).md": "COG PSYCH: Discussion Week 5 — Selective Attention",
}
for fname, title in FIX.items():
    hits = glob.glob(f"*/*/{fname}") + glob.glob(f"*/{fname}")
    if not hits:
        print("missing:", fname); continue
    p = hits[0]
    t = open(p, encoding="utf-8", errors="ignore").read()
    esc = title.replace('"', "'")
    if re.search(r"^title:", t, re.M):
        t = re.sub(r"^title:\s*.*$", f'title: "{esc}"', t, count=1, flags=re.M)
    else:
        t = re.sub(r"^---\n", f'---\ntitle: "{esc}"\n', t, count=1)
    open(p, "w", encoding="utf-8").write(t)
    print("fixed:", fname)
print("Done. Re-run promote-to-site.command, then commit & push.")
