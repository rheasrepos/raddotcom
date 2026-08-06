#!/usr/bin/env python3
"""
Clear the ai_title flag on any post whose title actually appears INSIDE its own
document — because that means Rhea titled the paper herself (even if the title
isn't the document's filename).

    python3 scripts/clear-self-titled.py          # dry run
    python3 scripts/clear-self-titled.py --apply   # remove ai_title: true lines

Looks at each published post flagged ai_title: true, reads the note body plus
the text of its attached PDF (by slug), and if the title (or the title minus a
course prefix like "SOSC:" / "MBM:") shows up in that text, drops the flag.
"""
import os, re, sys, glob, json, subprocess

APPLY = "--apply" in sys.argv
DOCS = "static/docs"

def slugify(s):
    s = s.lower().replace("'", "").replace("’", "").replace('"', "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

def norm(s):
    return re.sub(r"[^a-z0-9 ]+", " ", s.lower())
    # collapse handled by caller

def collapse(s):
    return re.sub(r"\s+", " ", s).strip()

def pdftext(path):
    try:
        r = subprocess.run(["pdftotext", "-l", "3", path, "-"], capture_output=True, timeout=25)
        return r.stdout.decode("utf-8", "ignore")
    except Exception:
        return ""

cleared, kept = [], []
for p in sorted(glob.glob("raddotcom Vault (vault-drafts)/**/*.md", recursive=True)):
    if p.split("/")[-1].startswith("_"):
        continue
    t = open(p, encoding="utf-8", errors="ignore").read()
    if not re.search(r"^published:\s*true", t, re.M):
        continue
    if not re.search(r"^ai_title:\s*true", t, re.M):
        continue
    m = re.search(r'^title:\s*"?(.*?)"?\s*$', t, re.M)
    if not m:
        continue
    title = m.group(1).strip()
    # core = title minus a leading COURSE PREFIX ("SOSC: ", "MBM — ", "PHIL OF AI: ")
    core = re.sub(r"^[A-Z][A-Z0-9 &/]{1,20}[:—-]\s*", "", title).strip()
    body = re.sub(r"^---.*?---", "", t, count=1, flags=re.S)
    slug = slugify(os.path.basename(p)[:-3])
    doc = body
    pdfp = os.path.join(DOCS, slug + ".pdf")
    if os.path.exists(pdfp):
        doc += "\n" + pdftext(pdfp)
    hay = collapse(norm(doc))
    hit = None
    for cand in {title, core}:
        c = collapse(norm(cand))
        if len(c) >= 12 and c in hay:
            hit = cand
            break
    if hit:
        cleared.append((os.path.basename(p), title, hit))
        if APPLY:
            t2 = re.sub(r"^ai_title:\s*true\s*\n", "", t, count=1, flags=re.M)
            open(p, "w", encoding="utf-8").write(t2)
    else:
        kept.append((os.path.basename(p), title))

print(f"CLEARED ai_title ({len(cleared)}) — title found in the document:")
for fn, ti, hit in cleared:
    print(f"   ✓ {ti}")
print(f"\nKEPT flagged ({len(kept)}) — title NOT found in the document:")
for fn, ti in kept:
    print(f"   · {ti}")
if not APPLY:
    print("\nDry run. Re-run with --apply to remove the ai_title lines.")
