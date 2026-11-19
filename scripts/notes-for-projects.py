#!/usr/bin/env python3
"""
Sort Apple Notes into the two grokking course projects, word for word.

    python3 scripts/notes-check.py --all        # fresh dump of every note -> notes-all.json (read-only on Notes)
    python3 scripts/notes-for-projects.py       # writes notes/apple-notes-relevant.md in each project folder

A note goes to a project when its text uses that project's terms (lists below); a note that
matches both projects (or only the shared grokking terms) goes into BOTH files. Each entry keeps
the note's title, created/modified dates, folder, the matching terms, and the note's own text
(whole note if short, otherwise just the paragraphs that match). Keyword matching only; no AI.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HOME = os.path.expanduser("~")
DESK = next((p for p in (os.path.join(HOME, "Desktop"), "/sessions/keen-hopeful-volta/mnt/Desktop") if os.path.isdir(p)), None)
SDL_DIR = os.environ.get("SDL_DIR") or os.path.join(os.path.dirname(DESK) if DESK and DESK.endswith("mnt/Desktop") else DESK or "", "Science Of Deep Learning sharma", "project-grokking-scaling")
HML_DIR = os.environ.get("HML_DIR") or os.path.join(os.path.dirname(DESK) if DESK and DESK.endswith("mnt/Desktop") else DESK or "", "honors machine learning gautam", "project-grokking-defect")

# strong terms (one is required); weak terms only add support
SHARED = r"grok|modular (addition|arithmetic)|mod p\b|memori[sz]ation|weight decay|clean ?up phase|nanda|fourier (feature|basis|mode|frequenc)|key frequenc|double descent|progress measure"
SDL = r"\blaser\b|low[- ]?rank|rank (cut|reduction|truncat)|effective rank|scaling law|chinchilla|isoflop|compute[- ]optimal|sharma|loss barrier|linear mode connectivity|edge of stability"
HML = r"equivarian|group (rule|theory|representation|structure)|\bdefect\b|kamath|homomorphism|cyclic group|mech(anistic)? ?interp"
WEAK = r"generali[sz]ation|singular value|\bsvd\b|spectr|rotation|symmetr|neuron|circuit|representation|transformer|interpolat|loss landscape"

# Hand-checked on 2026-11-19 (read each match): titles that only matched by coincidence, and
# notes that belong in both files even though only one side's words appear.
EXCLUDE = ("reading response for BPRO avian", "Honors ml nov 10 granola", "One area of safety",
           "ryota:", "Anthropic ben levinstein")
FORCE_BOTH = ("HONROS ML MIDTERM RECOERY PCA", "thesis thoughts", "Write an email to Neel", "How to count digital minds")

def norm(s): return s.replace(" ", " ")

def main():
    path = os.path.join(ROOT, "notes-all.json")
    if not os.path.exists(path): sys.exit("no notes-all.json; run: python3 scripts/notes-check.py --all")
    notes = json.load(open(path))
    rs, rd, rh, rw = (re.compile(x, re.I) for x in (SHARED, SDL, HML, WEAK))
    out = {"sdl": [], "hml": []}
    for n in notes:
        t = norm(n.get("text") or "")
        if len(t) < 20: continue
        hs, hd, hh = (sorted(set(m.group(0).lower() for m in r.finditer(t))) for r in (rs, rd, rh))
        hw = sorted(set(m.group(0).lower() for m in rw.finditer(t)))
        # one strong project term plus at least one more term (strong or weak), so a stray word doesn't count
        if not (hs or hd or hh) or len(set(hs + hd + hh + hw)) < 2: continue
        to = []
        if hd or (hs and not hh): to.append("sdl")
        if hh or (hs and not hd): to.append("hml")
        if hs and hd and hh: to = ["sdl", "hml"]
        if (n.get("created") or "") < "2025-09" and not re.search(r"grok|laser|equivarian|nanda", t, re.I): continue   # older notes only if clearly about these topics
        nm = (n.get("name") or "").strip()
        if nm.startswith(EXCLUDE): continue
        if nm.startswith(FORCE_BOTH): to = ["sdl", "hml"]
        both = len(to) == 2
        paras = [p.strip() for p in re.split(r"\n\s*\n", t) if p.strip()]
        body = t.strip() if len(t) <= 1500 else "\n\n".join(p for p in paras if rs.search(p) or rd.search(p) or rh.search(p))
        entry = dict(name=n.get("name", "").strip(), created=n.get("created", "")[:10], modified=n.get("modified", "")[:10],
                     folder=n.get("folder", ""), terms=hs + hd + hh + hw, both=both, body=body, full=len(t) <= 1500)
        for k in to: out[k].append(entry)
    for key, d, label in (("sdl", SDL_DIR, "Science of Deep Learning (rank cut / grokking cleanup)"),
                          ("hml", HML_DIR, "Honors ML (group-rule defect)")):
        es = sorted(out[key], key=lambda e: e["created"], reverse=True)
        lines = [f"# Apple Notes relevant to the {label} project", "",
                 f"Made by scripts/notes-for-projects.py from notes-all.json (keyword matching, no AI). {len(es)} notes; "
                 f"{sum(e['both'] for e in es)} also appear in the other project's file (marked BOTH). Text is copied word for word.", ""]
        for e in es:
            lines += [f"## {e['name'][:90] or '(untitled)'}" + ("  [BOTH]" if e["both"] else ""),
                      f"created {e['created']} · edited {e['modified']} · folder: {e['folder'] or '?'} · matched: {', '.join(e['terms'])}",
                      "" if e["full"] else "(long note: only the matching paragraphs)", "", e["body"], "", "---", ""]
        if not os.path.isdir(d): print("skip, no folder:", d); continue
        os.makedirs(os.path.join(d, "notes"), exist_ok=True)
        open(os.path.join(d, "notes", "apple-notes-relevant.md"), "w", encoding="utf-8").write("\n".join(lines))
        print(f"{label}: {len(es)} notes ({sum(e['both'] for e in es)} BOTH) -> {os.path.join(d, 'notes', 'apple-notes-relevant.md')}")

if __name__ == "__main__":
    main()
