#!/usr/bin/env python3
"""
Build the Library (rhea.com/library) from saved-link notes in the draft vault.

    python3 scripts/build-library.py            (promote-to-site.command runs it too)
    python3 scripts/build-library.py --k 14     (force the number of topics)

SOURCES — every .md in <draft vault>/recommendations/:
  * the "Instasaved" topic lists, the "Recommendations" notes, "TO DO links"
  * _from-*.md review lists (Chrome bookmarks, Apple Notes, …) — used ONLY when
    their frontmatter says `include: true`, so nothing new goes public unreviewed
  * _wildcard.md — Rhea's hand-picked "Wild card" topic (see below)

WHAT SHIPS (per Rhea, 2026-11-13): for each item only its name, link and topic.
The notes written beside items when the lists were compiled are used as hidden
context for clustering and never reach the site.

TOPICS ARE CLUSTERS: items are embedded (TF-IDF over name + hidden context +
the heading/folder they sat under), reduced with SVD, and grouped with k-means
(k chosen by silhouette unless --k is given). Each topic is named by the words
most distinctive to it — a machine-made label, shown on the site as such.

WILD CARD: list anything in _wildcard.md — one per line, either a URL or the
item's exact name (a new item may also be given as "- [name](url)"). Those land
in "Wild card" regardless of clustering. That topic is Rhea's choice only.
"""
import os, re, json, sys, math
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFT = next((d for d in sorted(os.listdir(ROOT)) if os.path.isdir(os.path.join(ROOT, d)) and "vault-drafts" in d), None)
if not DRAFT:
    sys.exit("draft vault not found")
SRC = os.path.join(ROOT, DRAFT, "recommendations")
OUT = os.path.join(ROOT, "src", "data", "library.json")
FORCE_K = int(sys.argv[sys.argv.index("--k") + 1]) if "--k" in sys.argv else None

URL = re.compile(r"https?://[^\s)>\]]+")
MDLINK = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
IDS = re.compile(r"\((?:IMG_\d+[^)]*|[0-9a-f]{8}[^)]*|v\d+[^)]*)\)|`src:[^`]*`|\(via [^)]*\)|\(unverified[^)]*\)")

def frontmatter(text):
    m = re.match(r"^---\n(.*?)\n---\n?", text, re.S)
    return (m.group(1) if m else ""), (text[m.end():] if m else text)

def kind_of(title, url):
    u = (url or "").lower(); t = title.lower()
    if any(x in u for x in ("youtu", "vimeo", "/reel", "tiktok")) or re.search(r"\b(talk|video|lecture)\b", t): return "video"
    if any(x in u for x in ("arxiv", "doi.org", "biorxiv", "nature.com", "pubmed")) or u.endswith(".pdf") or re.search(r"\bpaper\b", t): return "paper"
    if "podcast" in t or "spotify.com/episode" in u or "podcasts.apple" in u: return "podcast"
    if re.search(r"\b(book|novel)\b", t) or "goodreads" in u: return "book"
    if "instagram.com" in u: return "post"
    if url: return "website"
    return "thing"

def clean_title(raw):
    s = IDS.sub("", raw).strip()
    s = MDLINK.sub(lambda m: m.group(1), s)
    b = re.search(r"\*\*(.+?)\*\*", s)
    s = b.group(1) if b else re.split(r"\s+[—–]\s+|\s+-\s+|:\s", s, maxsplit=1)[0]
    s = URL.sub("", s)
    return re.sub(r"[*_`]|\[\[|\]\]", "", s).strip(" .;,:—–-")

def norm_url(u):
    # one key per page: ignore http/https, www./m., HTML-escaped &, tracking bits, reel/reels
    u = u.replace("&amp;", "&").lower()
    u = re.sub(r"^https?://(www\.|m\.)?", "", u)
    u = re.sub(r"[?&](utm_[^&]*|igsh[^&]*|img_index[^&]*|si=[^&]*|hl=[^&]*|feature=[^&]*)", "", u)
    u = re.sub(r"#.*", "", u).replace("youtu.be/", "youtube.com/watch?v=")
    u = re.sub(r"instagram\.com/reels?/", "instagram.com/reel/", u)
    return u.rstrip("/?&")

def host_title(url):
    host = re.sub(r"^www\.", "", url.split("/")[2])
    return {"instagram.com": "Instagram post", "youtu.be": "YouTube video", "youtube.com": "YouTube video"}.get(host, host)

# ------------------------------------------------------------------ read
items, seen, skipped = [], set(), []
wild_keys = set()
for fname in sorted(os.listdir(SRC)):
    if not fname.endswith(".md") or re.search(r" \d+\.md$", fname) or "INDEX" in fname or fname.endswith("Recommendations - Home.md"):
        continue
    text = open(os.path.join(SRC, fname), encoding="utf-8").read()
    fm, body = frontmatter(text)
    if fname == "_wildcard.md":
        for line in body.split("\n"):
            m = re.match(r"^\s*[-*]?\s*(.+?)\s*$", line)
            if not m or not m.group(1) or line.lstrip().startswith("#"):
                continue
            val = m.group(1)
            mdl = MDLINK.search(val)
            v = mdl.group(2) if mdl else val
            wild_keys.add(norm_url(v) if re.match(r"https?://", v) else v.rstrip("/").lower())
        # wildcard entries written as links are also items in their own right
    elif fname.startswith("_") and not re.search(r"^include:\s*true\b", fm, re.M):
        skipped.append(fname)
        continue
    heading = ""
    for line in body.split("\n"):
        h = re.match(r"^#{2,3}\s+(.+)", line)
        if h:
            heading = h.group(1).strip(); continue
        m = re.match(r"^\s*[-*]\s+(.+)", line)
        if not m or line.lstrip().startswith(">"):
            continue
        raw = m.group(1)
        # dates: "@added YYYY-MM-DD" (when Rhea saved it) / "@published YYYY[-MM[-DD]]" (when it came out)
        DATE = r"(\d{4}(?:-\d{2}){0,2})"
        added = re.search(r"@added\s+" + DATE, raw); published = re.search(r"@published\s+" + DATE, raw)
        ai_title = bool(re.search(r"\s@ai\b", raw))   # title written by Claude, not copied from the source
        raw = re.sub(r"\s*@(added|published)\s+\S+", "", raw)
        raw = re.sub(r"\s*@ai\b", "", raw).strip()
        # navigation / template lines, not saved things: bullets that are only a
        # [[wikilink]] (+ its gloss), and the how-to-use instructions
        if re.match(r"^\[\[[^\]]+\]\]", raw) or fname.endswith("Recommendations - Home.md"):
            continue
        mdl = MDLINK.search(raw)
        um = URL.search(raw)
        url = mdl.group(2) if mdl else (um.group(0) if um else None)
        if fname == "_wildcard.md" and not url:
            continue  # bare names in _wildcard.md just point at existing items
        whole = re.fullmatch(r"\[([^\]]+)\]\((https?://[^)\s]+)\)", re.sub(r"\s*@via\s+.*$", "", raw))   # a bare [title](url) line: keep the full title
        title = (whole.group(1).strip() if whole else clean_title(raw)) or (host_title(url) if url else "")
        if len(title) < 2 or title.lower() in ("inbox",):
            continue
        if url and re.search(r"//(www\.)?google\.[a-z.]+/(webhp|search)", url):
            continue  # saved Google searches are not things (and the links are dead)
        key = (norm_url(url) if url else re.sub(r"[^a-z0-9]+", " ", title.lower()).strip())
        if key in seen:
            continue
        seen.add(key)
        src_topic = re.sub(r"^\d{4}-\d{2} (Instasaved|Recommendations) - _?|\.md$|^_from-", "", fname)
        context = " ".join([title, heading, src_topic, IDS.sub("", MDLINK.sub(lambda x: x.group(1), raw))])
        via = re.search(r"@via\s+(.+?)\s*$", raw)
        items.append({"title": title[:160], "url": url, "kind": kind_of(title, url), "_ctx": context, "_key": key,
                      "_me": fname == "_me-online.md",   # fixed topic "Me online" (not clustered)
                      "_via": via.group(1) if via else None,
                      "_added": added.group(1) if added else None, "_ai": ai_title, "_published": published.group(1) if published else None})   # posted ABOUT Rhea by someone else

# link fixes (recommendations/_link-fixes.txt): "fragment => new url" replaces a link;
# a bare host / URL fragment / YouTube id drops the item (dead or login-only links)
FIXF = os.path.join(SRC, "_link-fixes.txt")
FIX, DROP = {}, []
if os.path.exists(FIXF):
    for l in open(FIXF, encoding="utf-8"):
        l = l.strip()
        if not l or l.startswith("#"): continue
        if "=>" in l: k, v = [x.strip() for x in l.split("=>", 1)]; FIX[k] = v
        else: DROP.append(l)
def hits(u, d): return ("//" + d) in u or ("." + d) in u or ("v=" + d) in u or ("youtu.be/" + d) in u or ("/" + d) in u
kept = []
for it in items:
    u = (it["url"] or "").replace("&amp;", "&")
    for k, v in FIX.items():
        if u and k in u: it["url"] = u = v
    if u and any(hits(u, d) for d in DROP): continue
    kept.append(it)
print(f"link fixes: {len(items) - len(kept)} dropped, {sum(1 for it in kept if it['url'] in FIX.values())} replaced")
items = kept

# ------------------------------------------------------------------ embed (TF-IDF, numpy only)
STOP = set("""the a an and or of to in on for with is are was were be been it its this that these those you your
your i we they he she my our as at by from not but have has had do does did so if than then there here which who what
when where why how can could would should will just like also into over about more most some any all very via etc
com www http https instagram reel reels post youtube video watch html amp one two new get use using vs""".split())
def toks(s):
    s = s.lower()
    s = re.sub(r"https?://\S+", lambda m: " ".join(re.findall(r"[a-z]{3,}", m.group(0).split("/", 3)[-1])), s)
    return [w for w in re.findall(r"[a-z][a-z'+#]{2,}", s) if w not in STOP]
docs = [toks(it["_ctx"]) for it in items]
df = {}
for d in docs:
    for w in set(d): df[w] = df.get(w, 0) + 1
vocab = sorted(w for w, c in df.items() if 2 <= c <= 0.4 * len(docs))
idx = {w: i for i, w in enumerate(vocab)}
X = np.zeros((len(items), len(vocab)))
for r, d in enumerate(docs):
    for w in d:
        if w in idx: X[r, idx[w]] += 1
idf = np.log(len(items) / np.array([df[w] for w in vocab]))
X = np.log1p(X) * idf
X /= np.linalg.norm(X, axis=1, keepdims=True) + 1e-9

U, S, Vt = np.linalg.svd(X - X.mean(0), full_matrices=False)
dims = min(40, len(S))
Z = (X - X.mean(0)) @ Vt[:dims].T
Z /= np.linalg.norm(Z, axis=1, keepdims=True) + 1e-9   # cosine geometry

def kmeans(Z, k, seed):
    rng = np.random.default_rng(seed)
    C = [Z[rng.integers(len(Z))]]
    for _ in range(1, k):                                   # k-means++
        d2 = np.min(((Z[:, None, :] - np.array(C)[None]) ** 2).sum(-1), axis=1)
        C.append(Z[rng.choice(len(Z), p=d2 / d2.sum())])
    C = np.array(C)
    for _ in range(100):
        lab = np.argmin(((Z[:, None, :] - C[None]) ** 2).sum(-1), axis=1)
        newC = np.array([Z[lab == j].mean(0) if (lab == j).any() else C[j] for j in range(k)])
        if np.allclose(newC, C): break
        C = newC
    inertia = ((Z - C[lab]) ** 2).sum()
    return lab, inertia

def silhouette(Z, lab):
    D = np.sqrt(((Z[:, None, :] - Z[None]) ** 2).sum(-1))
    s = []
    for i in range(len(Z)):
        same = lab == lab[i]
        if same.sum() <= 1: s.append(0); continue
        a = D[i, same].sum() / (same.sum() - 1)
        b = min(D[i, lab == j].mean() for j in set(lab) if j != lab[i])
        s.append((b - a) / max(a, b))
    return float(np.mean(s))

def best_run(k):
    return min((kmeans(Z, k, seed) for seed in range(8)), key=lambda r: r[1])[0]

if FORCE_K:
    labels, chosen = best_run(FORCE_K), FORCE_K
else:
    scores = {}
    for k in range(8, 19):
        lab = best_run(k)
        scores[k] = (silhouette(Z, lab), lab)
    chosen = max(scores, key=lambda k: scores[k][0])
    labels = scores[chosen][1]

# ------------------------------------------------------------------ name clusters by their most distinctive words
names = {}
for j in sorted(set(labels)):
    inside = X[labels == j].mean(0); outside = X[labels != j].mean(0)
    score = inside - outside
    top = [vocab[i] for i in np.argsort(-score)[:3] if score[i] > 0]
    names[j] = " · ".join(top) if top else "assorted"

# ------------------------------------------------------------------ neighbours (for the map view)
# each item links to its 3 most similar items (cosine in the reduced space),
# like a connected-papers graph; weak links (< 0.35) are dropped
sim = Z @ Z.T
np.fill_diagonal(sim, -1)
nbrs = []
for i in range(len(items)):
    top = [int(j) for j in np.argsort(-sim[i])[:3] if sim[i, j] >= 0.35]
    nbrs.append(top)

# ------------------------------------------------------------------ write
out = []
for i, (it, lab) in enumerate(zip(items, labels)):
    wild = it["_key"] in wild_keys or it["title"].lower() in wild_keys
    topic = "Me online" if it.get("_me") else ("Wild card" if wild else names[int(lab)])
    out.append({"title": it["title"], "url": it["url"], "kind": it["kind"],
                "topic": topic, "wild": wild or bool(it.get("_me")), "near": nbrs[i],
                **({"via": it["_via"]} if it.get("_via") else {}),
                **({"added": it["_added"]} if it.get("_added") else {}),
                **({"ai_title": True} if it.get("_ai") else {}),
                **({"published": it["_published"]} if it.get("_published") else {})})
json.dump({"count": len(out), "k": chosen, "items": out}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

counts = {}
for o in out: counts[o["topic"]] = counts.get(o["topic"], 0) + 1
print(f"{len(out)} items in {chosen} clusters (+ wild card) → {os.path.relpath(OUT, ROOT)}")
for t, n in sorted(counts.items(), key=lambda x: -x[1]): print(f"  {n:4d}  {t}")
if skipped: print("not included yet (set include: true to use):", ", ".join(skipped))
