#!/usr/bin/env python3
"""
Turn the published vault (src/vault/**.md) into points in space for the Obsidian page.

    python3 scripts/embed-vault.py                 # TF-IDF + SVD, pure numpy, no downloads
    python3 scripts/embed-vault.py --model all-MiniLM-L6-v2   # sentence-transformers, if installed

Writes static/vault-space.json:
  { "model": ..., "variance": [v1,v2,v3], "notes": [ {id, title, date, type, tags, sub, xyz:[x,y,z], links:[ids / "topic:…"]} ... ] }
Notes are sorted by `date` (undated last), so the order IS the path through time.
`id` matches the site's post id (`vault-<filename>`), so a point can link to /posts/<id>.

Only src/vault (the PUBLISHED copy) is read. The private draft vault is never touched.
promote-to-site.command runs this automatically after promoting notes.
"""
import os, re, json, sys, math, subprocess, shutil, hashlib
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT = os.path.join(ROOT, "src", "vault")
OUT = os.path.join(ROOT, "static", "vault-space.json")
DOCS = os.path.join(ROOT, "static", "docs")
CACHE = os.path.join(ROOT, "scripts", ".pdf-text-cache.json")   # gitignored; pdftotext is slow

# Same slug rule as src/routes/api/posts/+server.js — a note's PDF is static/docs/<slug>.pdf
def slugify(s):
    s = re.sub(r"['’\"]", "", s.lower())
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return re.sub(r"-+", "-", s).strip("-")

# Most notes are a one-line stub over a PDF ("original document below"), so
# the words that say what a note is ABOUT live in the PDF. Pull them in.
_cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
def pdf_text(path):
    if not path or not os.path.exists(path) or not shutil.which("pdftotext"): return ""
    key = f"{path}:{os.path.getmtime(path)}"
    if key not in _cache:
        try:
            out = subprocess.run(["pdftotext", "-l", "12", "-q", path, "-"], capture_output=True, text=True, timeout=60).stdout
        except Exception:
            out = ""
        _cache[key] = re.sub(r"\s+", " ", out)[:20000]
    return _cache[key]
model_name = sys.argv[sys.argv.index("--model") + 1] if "--model" in sys.argv else None

# ---------------------------------------------------------------- read notes
def frontmatter(t):
    m = re.match(r"^---\n(.*?)\n---\n?(.*)$", t, re.S)
    if not m: return {}, t
    fm = {}
    for line in m.group(1).split("\n"):
        k, _, v = line.partition(":")
        if _: fm[k.strip()] = v.strip().strip('"\'')
    return fm, m.group(2)

def tags_of(v):
    if not v: return []
    return [x.strip().strip('"\'') for x in v.strip("[]").split(",") if x.strip()]

notes = []
for root, dirs, files in os.walk(VAULT):
    dirs[:] = [d for d in dirs if not d.startswith(".")]
    for f in sorted(files):
        if not f.endswith(".md") or f == "README.md": continue
        raw = open(os.path.join(root, f), encoding="utf-8", errors="ignore").read()
        fm, body = frontmatter(raw)
        if fm.get("published", "").lower() != "true": continue
        body = re.sub(r"\[\[Topic - [^\]]*\]\]", " ", body)
        body = re.sub(r"</?ai>", " ", body)                                 # AI-drafted markers are not words          # topic backlinks are bookkeeping, not content
        body = re.sub(r"[#>*_`\[\]\(\)\-]|https?://\S+", " ", body)
        rel = os.path.relpath(root, VAULT).split(os.sep)
        pdf = fm.get("pdf") or ""
        pdf_path = os.path.join(ROOT, "static", pdf.lstrip("/")) if pdf else os.path.join(DOCS, slugify(f[:-3]) + ".pdf")
        doc = pdf_text(pdf_path)
        # [[wikilinks]] — what the Obsidian-style graph view draws. Kept raw
        # (target text only, no alias/heading); resolved against note names
        # below. "Topic - x" targets are the vault's topic hub notes.
        links = [m.strip() for m in re.findall(r"\[\[([^\]|#]+)", raw)]
        notes.append({
            "id": "vault-" + f[:-3],
            "title": fm.get("title") or f[:-3],
            "date": fm.get("date", ""),
            "type": fm.get("type", rel[0] if rel[0] != "." else ""),
            "tags": tags_of(fm.get("tags")),
            "sub": rel[1] if len(rel) >= 2 else None,
            "_text": (fm.get("title", "") + " ") * 3 + " ".join(fm.get("tags", "").split("/")) + " " + body + " " + doc,
            "_words": len(re.findall(r"[a-zA-Z]{3,}", body + " " + doc)),
            "_links": links,
            "_name": f[:-3],
        })
json.dump(_cache, open(CACHE, "w"))
# Scans and artwork have no words (they're pictures), so "what is this note
# about" has no answer for them — they'd all pile onto one point and squash the
# real notes into a corner (which is exactly what the old map looked like).
# They stay in the graph view; the space is for notes with text.
skipped = [n for n in notes if n["_words"] < 25]
notes = [n for n in notes if n["_words"] >= 25]
if len(notes) < 4:
    sys.exit(f"only {len(notes)} published notes with text in {VAULT}; need a few more to make a space")
print(f"{len(notes)} notes with text in the space ({len(skipped)} image-only notes left out)")

# ---------------------------------------------------------------- embed
if model_name:
    from sentence_transformers import SentenceTransformer
    M = SentenceTransformer(model_name).encode([n["_text"][:4000] for n in notes], normalize_embeddings=True)
    label = f"sentence-transformers/{model_name}"
    for n in notes: n["terms"] = []
else:
    # TF-IDF, pure numpy. Each note = a bag of words weighted by how rare they are across the vault.
    STOP = set("the a an and or of to in on for with is are was were be been it its this that these those i you we they he she my your our as at by from not but have has had do does did so if than then there here which who what when where why how can could would should will just like also into over about more most some any all very".split())
    docs = [[w for w in re.findall(r"[a-z][a-z']+", n["_text"].lower()) if w not in STOP and len(w) > 2] for n in notes]
    df = {}
    for d in docs:
        for w in set(d): df[w] = df.get(w, 0) + 1
    vocab = sorted(w for w, c in df.items() if c >= 2)                 # a word must appear in 2+ notes to connect anything
    idx = {w: i for i, w in enumerate(vocab)}
    M = np.zeros((len(notes), len(vocab)))
    for r, d in enumerate(docs):
        for w in d:
            if w in idx: M[r, idx[w]] += 1
    M = np.log1p(M) * np.log(len(notes) / np.array([df[w] for w in vocab]))
    M /= np.linalg.norm(M, axis=1, keepdims=True) + 1e-9
    label = f"tf-idf over {len(vocab)} words"
    # each note's 6 most distinctive words — lets the site name a cluster by
    # what its notes actually talk about
    for r, n in enumerate(notes):
        top = np.argsort(-M[r])[:6]
        n["terms"] = [vocab[i] for i in top if M[r, i] > 0]
print(f"embedding: {label}  ->  {M.shape}")

# ---------------------------------------------------------------- 3-D via SVD (PCA on the centered matrix)
mu = M.mean(0)
U, S, Vt = np.linalg.svd(M - mu, full_matrices=False)
xyz = (M - mu) @ Vt[:3].T
# Robust scaling per axis: a few outliers must not shrink everyone else into a
# dot. Each axis is scaled by its 96th-percentile spread and clipped to ±1.
scale = np.percentile(np.abs(xyz), 96, axis=0) + 1e-9
xyz = np.clip(xyz / scale, -1, 1)
var = (S[:3] ** 2 / (S ** 2).sum()).tolist()
print(f"3 components keep {sum(var):.1%} of the variance")

# ---------------------------------------------------------------- attach coordinates, order by date, write
by_name = {n["_name"].lower(): n["id"] for n in notes}
for n, p in zip(notes, xyz):                       # xyz rows are in read order, same as `notes`
    n["xyz"] = [round(float(c), 4) for c in p]
    # links: to another published note → its id; to a "Topic - …" hub → "topic:<name>";
    # anything else (unpublished / missing note) is dropped, like Obsidian with
    # "existing files only" on.
    out = []
    for t in n["_links"]:
        if t.lower() in by_name and by_name[t.lower()] != n["id"]: out.append(by_name[t.lower()])
        elif t.startswith("Topic - "): out.append("topic:" + t[len("Topic - "):].strip())
    n["links"] = sorted(set(out))
    del n["_text"], n["_links"], n["_name"], n["_words"]
notes.sort(key=lambda n: (n["date"] == "", n["date"]))   # dated notes chronologically, undated last
json.dump({"model": label, "variance": var, "count": len(notes), "left_out": len(skipped), "notes": notes}, open(OUT, "w"))
print(f"wrote {os.path.relpath(OUT, ROOT)}")
