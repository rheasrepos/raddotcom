#!/usr/bin/env python3
"""
Pull the LINKS (only) out of Apple Notes into a review list for the Library.

    python3 scripts/notes-links-export.py              # all folders
    python3 scripts/notes-links-export.py --folder Notes

Run it on your Mac (it talks to the Notes app; macOS asks once for permission).
It is READ-ONLY: nothing in Notes is moved, changed or deleted.

What it keeps: each URL, with the link's own text when the note has one, and the
note's title as the heading. What it never writes out: the rest of the note's
text. Folders named like "private", "journal" or "health" are skipped.

Output: <draft vault>/recommendations/_from-apple-notes.md with `include: false`.
Skim it, delete anything you don't want public, set `include: true`, promote.
"""
import os, re, subprocess, sys, html

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFT = next(d for d in sorted(os.listdir(ROOT)) if os.path.isdir(os.path.join(ROOT, d)) and "vault-drafts" in d)
OUT = os.path.join(ROOT, DRAFT, "recommendations", "_from-apple-notes.md")
ONLY = sys.argv[sys.argv.index("--folder") + 1] if "--folder" in sys.argv else None
SKIP = re.compile(r"private|journal|diary|health|therapy|password|bank|recently deleted", re.I)
DROP = re.compile(r"docs\.google|drive\.google|mail\.|accounts\.|login|signin|zoom\.us|calendly|venmo|paypal|bank|\?.*(token|key|sig|auth)=", re.I)

def osa(script):
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if r.returncode: sys.exit(r.stderr.strip())
    return r.stdout.strip()

SEP = "␞"
folders = [f for f in osa('tell application "Notes" to get name of every folder').split(", ") if f]
lines = ["---", 'title: "From Apple Notes (links only)"', "published: false",
         "include: false   # ← flip to true after skimming; the Library only uses this list when true", "---", "",
         "Links pulled from Apple Notes by scripts/notes-links-export.py — note text is not copied.", ""]
total = 0
for folder in folders:
    if (ONLY and folder != ONLY) or SKIP.search(folder):
        continue
    raw = osa(f'''tell application "Notes"
set out to ""
repeat with n in (every note of folder "{folder}")
  set out to out & (name of n) & "{SEP}" & (body of n) & "{SEP}{SEP}"
end repeat
return out
end tell''')
    for chunk in raw.split(SEP + SEP):
        if SEP not in chunk: continue
        title, body = chunk.split(SEP, 1)
        if SKIP.search(title): continue
        links = []
        for m in re.finditer(r'<a [^>]*href="(https?://[^"]+)"[^>]*>(.*?)</a>', body, re.I | re.S):
            links.append((html.unescape(m.group(1)), re.sub(r"<[^>]+>", "", html.unescape(m.group(2))).strip()))
        bare = set(re.findall(r'https?://[^\s<>"\']+', re.sub(r"<a [^>]*>.*?</a>", " ", body, flags=re.S)))
        links += [(html.unescape(u), "") for u in bare]
        links = [(u, t) for u, t in links if not DROP.search(u)]
        if not links: continue
        lines.append(f"## {folder} / {title.strip()[:80]}")
        for u, t in dict((u, t) for u, t in links).items():
            label = (t if t and not t.startswith("http") else "").replace("[", "(").replace("]", ")")
            lines.append(f"- [{label or u}]({u})"); total += 1
        lines.append("")
open(OUT, "w", encoding="utf-8").write("\n".join(lines))
print(f"{total} links → {OUT}\nSkim it, delete what you don't want public, set include: true, then run promote-to-site.command.")
