#!/usr/bin/env python3
"""
Consolidate posts and their PDFs under ONE source of truth: the post's slug.

Every post's PDF is named <post-slug>.pdf. The site auto-attaches it (see
src/routes/api/posts/+server.js reading src/lib/pdf-manifest.json), so the
hand-typed `pdf:` frontmatter line is no longer needed and gets removed.

    python3 scripts/sync-pdfs.py            # DRY RUN — prints the plan
    python3 scripts/sync-pdfs.py --apply    # rename PDFs + rewrite manifest + strip pdf: lines

Run this whenever you rename a post: it re-slugs, renames the matching PDF to
match, and keeps the two in lock-step. Idempotent.
"""
import os, re, sys, glob, json, subprocess, shutil

APPLY = "--apply" in sys.argv
DOCS = "static/docs"
COVERS = os.path.join(DOCS, "covers")
MANIFEST = "src/lib/pdf-manifest.json"

def slugify(s):
    s = s.lower().replace("'", "").replace("’", "").replace('"', "")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

# tokens that carry no discriminating meaning when matching a post to a PDF
STOP = set("rhea madhogarhia final paper essay the of a an and to for in on with "
           "work doc copy share to-share reflections reflection".split())
ALIAS = {"mbm": {"mind", "brain", "meaning"}, "ucd": {"user", "centered", "design"}}

# Human-verified matches the fuzzy pass can't safely make (MBM short papers all
# share the same topic words; SOSC reflections confirmed by PDF text content).
# Keyed: post-slug -> the actual orphan PDF filename.
OVERRIDE = {
    "2023-24-short-paper-1-mind-brain-and-meaning": "2023-24-mbm-short-paper-1-rhea-madhogarhia.pdf",
    "2023-24-short-paper-2-mind-brain-and-meaning": "2023-24-mbm-short-paper-2-rhea-madhogarhia.pdf",
    "2023-24-short-paper-3-mind-brain-and-meaning": "2023-24-short-paper-3-rhea-madhogarhia-mbm.pdf",
    "2023-24-final-paper-mind-brain-and-meaning":   "2023-24-final-paper-rhea-madhogarhia-mind-brain-and-meani.pdf",
    "2022-23-sosc-1-fall-reflection-smith":         "2022-23-ressay.pdf",             # "Adam Smith" x14
    "2022-23-sosc-reflection-2-marx":               "2022-23-essay-2-rhea-madhogarhia-sosc-self-cutlure-and.pdf",  # "Marx" x11
    "2023-03-media-aesthetics-ii-final-paper":      "2023-03-madhogarhia-rhea-final-paper.pdf",  # "Media Aesthetics II | Section 9"
}

def toks(name):
    out = set()
    for t in re.split(r"[-_\s]+", slugify(name)):
        if not t or t.isdigit() or t in STOP:
            continue
        out |= ALIAS.get(t, {t})
    return out

def pdftext(path):
    try:
        r = subprocess.run(["pdftotext", "-l", "2", path, "-"],
                           capture_output=True, timeout=20)
        return r.stdout.decode("utf-8", "ignore").lower()
    except Exception:
        return ""

# --- gather posts and current pdf refs ---
posts = []  # (mdpath, slug, current_pdf_or_None)
for p in glob.glob("src/vault/**/*.md", recursive=True):
    if os.path.basename(p) == "README.md":
        continue
    t = open(p, encoding="utf-8", errors="ignore").read()
    if not re.search(r"^published:\s*true", t, re.M):
        continue
    m = re.search(r"^pdf:\s*/docs/(\S+)", t, re.M)
    posts.append((p, slugify(os.path.basename(p)[:-3]), m.group(1) if m else None))

all_pdfs = {os.path.basename(x) for x in glob.glob(os.path.join(DOCS, "*.pdf"))}
referenced = {cur for _, _, cur in posts if cur}
orphans = sorted(all_pdfs - referenced)

renames = {}   # oldname -> newname (<slug>.pdf)
strip = []     # md paths to remove pdf: line from
unmatched = [] # posts with no findable PDF (stay text-only)

# 1) Deterministic: post's pdf: already points at a real file -> rename to slug.
#    Plus human-verified OVERRIDE matches.
need = []  # posts still needing a pdf found among orphans
for mdpath, slug, cur in posts:
    target = f"{slug}.pdf"
    if slug in OVERRIDE and OVERRIDE[slug] in all_pdfs:
        if OVERRIDE[slug] != target:
            renames[OVERRIDE[slug]] = target
        strip.append(mdpath)
    elif cur and cur in all_pdfs:
        if cur != target:
            renames[cur] = target
        strip.append(mdpath)
    elif cur:
        need.append((mdpath, slug, cur))  # had a pdf: line but file missing

# 2) Rare-token matching for the broken refs. A token shared by exactly one
#    post AND one orphan (e.g. "turkopticon", "sidewalk") is a near-certain
#    match; common tokens ("paper") barely count. Assign GLOBALLY best-first
#    so UCD papers can't get scrambled by processing order.
avail = [o for o in orphans if o not in renames]
df = {}  # token -> how many orphans contain it (rarity)
for o in avail:
    for t in toks(o[:-4]):
        df[t] = df.get(t, 0) + 1
pairs = []
for mdpath, slug, cur in need:
    wt = toks(slug)
    for o in avail:
        ot = toks(o[:-4])
        shared = wt & ot
        if not shared:
            continue
        score = sum(1.0 / df[t] for t in shared)          # rare tokens dominate
        rare = min((df[t] for t in shared), default=9)     # best (rarest) shared token
        pairs.append((score, -rare, mdpath, slug, o))
pairs.sort(reverse=True)
claimed_o, claimed_m = set(), set()
for score, negrare, mdpath, slug, o in pairs:
    if mdpath in claimed_m or o in claimed_o:
        continue
    rare = -negrare
    if rare <= 2:                                          # a (near-)unique shared token
        renames[o] = f"{slug}.pdf"; strip.append(mdpath)
        claimed_m.add(mdpath); claimed_o.add(o)
for mdpath, slug, cur in need:
    if mdpath not in claimed_m:
        unmatched.append((mdpath, slug, cur))

print(f"posts scanned: {len(posts)}   pdfs on disk: {len(all_pdfs)}")
print(f"\nRENAMES ({len(renames)}):")
for a, b in sorted(renames.items()):
    print(f"   {a}\n     -> {b}")
print(f"\nUNMATCHED — stay text-only ({len(unmatched)}):")
for mdpath, slug, cur in unmatched:
    print(f"   {os.path.basename(mdpath)}  (wanted: {cur})")

if APPLY:
    # collisions first: if target already exists and isn't the source, back off
    for a, b in list(renames.items()):
        src, dst = os.path.join(DOCS, a), os.path.join(DOCS, b)
        if a == b:
            continue
        if os.path.exists(dst):
            print(f"   SKIP (target exists): {b}"); continue
        os.rename(src, dst)
        # move/regenerate cover
        oc, nc = os.path.join(COVERS, a[:-4] + ".png"), os.path.join(COVERS, b[:-4] + ".png")
        if os.path.exists(oc):
            os.rename(oc, nc)
    # strip pdf: lines (auto-attach handles it now)
    for mdpath in set(strip):
        t = open(mdpath, encoding="utf-8", errors="ignore").read()
        t2 = re.sub(r"^pdf:\s*/docs/\S+\s*\n", "", t, count=1, flags=re.M)
        if t2 != t:
            open(mdpath, "w", encoding="utf-8").write(t2)
    # regenerate any missing covers
    if shutil.which("pdftoppm"):
        os.makedirs(COVERS, exist_ok=True)
        for f in os.listdir(DOCS):
            if f.endswith(".pdf") and not os.path.exists(os.path.join(COVERS, f[:-4] + ".png")):
                subprocess.run(["pdftoppm", "-png", "-f", "1", "-singlefile",
                                "-scale-to", "400", os.path.join(DOCS, f),
                                os.path.join(COVERS, f[:-4])], capture_output=True)
    # write manifest of available <slug>.pdf
    manifest = sorted(os.path.basename(x) for x in glob.glob(os.path.join(DOCS, "*.pdf")))
    os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
    json.dump(manifest, open(MANIFEST, "w"), indent=0)
    print(f"\nAPPLIED. manifest: {len(manifest)} pdfs -> {MANIFEST}")
else:
    print("\nDry run. Re-run with --apply to rename + strip pdf: lines + write manifest.")
