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
    if any(x in u for x in ("arxiv", "doi.org", "biorxiv", "nature.com", "pubmed", "journalclub.io/episodes")) or u.endswith(".pdf") or re.search(r"\bpaper\b", t): return "paper"
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
        # an Instagram title starts with the account name, which would group posts by who
        # posted rather than what they're about — left out of what items are compared on
        ctx_title = re.sub(r"^[\w.]+: ", "", title) if url and "instagram.com" in url else title
        context = " ".join([ctx_title, heading, IDS.sub("", MDLINK.sub(lambda x: re.sub(r"^[\w.]+: ", "", x.group(1)) if "instagram.com" in (url or "") else x.group(1), raw))])  # (source file name left out: it grouped items by where they were saved, not what they are)
        via = re.search(r"@via\s+(.+?)\s*$", raw)
        items.append({"title": title[:160], "url": url, "kind": "person" if fname == "_influential-minds.md" else kind_of(title, url), "_ctx": context, "_key": key,
                      "_me": fname == "_me-online.md",   # fixed topic "Me online" (not clustered)
                      "_minds": fname == "_influential-minds.md",   # fixed topic "Influential minds"
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

# ------------------------------------------------------------------ page text (optional)
# scripts/fetch-library-text.py caches the actual text behind each link. When
# present, it's added to what each item is compared on, so items group by what
# they SAY, not just by their titles. (Cache is private; never published.)
TEXTF = os.path.join(ROOT, "scripts", ".library-text-cache.json")
PAGE = json.load(open(TEXTF)) if os.path.exists(TEXTF) else {}
# Web pages carry site furniture (menus, cookie banners, "arXivLabs", footers).
# Per site, drop any word that shows up on most of that site's pages, plus a
# list of web-chrome words, so pages group by their content, not their template.
WEBJUNK = set("""cookie cookies privacy policy terms subscribe newsletter sign login log account menu
navigation skip content footer header advertise advertisement advertising ads llc inc copyright rights reserved
share facebook twitter instagram linkedin pinterest email print toggle search home contact help faq
loading javascript enable browser update reload page click accept arxivlabs arxiv bibliographic
explorer citations export bibtex code data media related papers connected litmaps scite smart
recommender mendeley download pdf html submission history comments subjects cite view abstract
nfl reddit posts comment upvote downvote member members community award join""".split())
from collections import defaultdict
def _dom(u): return re.sub(r"^www\.", "", (u or "").split("/")[2]) if u and "//" in u else ""
by_dom = defaultdict(list)
for it in items:
    t = PAGE.get(it["url"] or "", "")
    if t: by_dom[_dom(it["url"])].append(set(re.findall(r"[a-z][a-z'+#]{2,}", t.lower())))
dom_common = {}
for d, sets in by_dom.items():
    if len(sets) >= 3:
        cnt = defaultdict(int)
        for st in sets:
            for w in st: cnt[w] += 1
        dom_common[d] = {w for w, c in cnt.items() if c >= 0.6 * len(sets)}
with_text = 0
for it in items:
    t = PAGE.get(it["url"] or "", "")
    if t:
        drop = WEBJUNK | dom_common.get(_dom(it["url"]), set())
        words = [w for w in re.findall(r"[A-Za-z][A-Za-z'+#]{2,}", t) if w.lower() not in drop]
        # the page's own words replace the folder/heading context, which otherwise dominates
        it["_ctx"] = it["title"] + " " + it["title"] + " " + " ".join(words[:1500]); with_text += 1
if PAGE: print(f"page text used for {with_text} of {len(items)} items")

# ------------------------------------------------------------------ embed (TF-IDF, numpy only)
STOP = set("""the a an and or of to in on for with is are was were be been it its this that these those you your
your i we they he she my our as at by from not but have has had do does did so if than then there here which who what
when where why how can could would should will just like also into over about more most some any all very via etc
com www http https instagram reel reels post youtube video watch html amp one two new get use using vs
now their them they time his her him she people out up down just like than then also only even much many
more most other some such own same very can will would could should may might must now our ours your yours
was were been being have has had having does did doing because while until again further once here there
when where why how all any both each few nor not off over under above below between into through during
before after again first last year years day days way ways make made thing things know see said says say
well back still something really want need going get got let us around per via rhea bookmark bookmarks
chrome bar folder from recommendations instasaved misc inbox from comment comments follow followed link bio
send love best free actually worth nice amazing fun don dont friend friends literally obsessed tag save
saved part ever every thank thanks guys girl girls today tonight wait omg lol""".split())
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

# Optional: a local sentence-embedding model instead of TF-IDF (runs on your
# Mac at build time only — the site never calls a model). Turn on with
#   pip3 install sentence-transformers && LIB_EMBED=1 python3 scripts/build-library.py
if os.environ.get("LIB_EMBED"):
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer("all-MiniLM-L6-v2")
        Z = model.encode([" ".join(it["_ctx"].split()[:400]) for it in items], normalize_embeddings=True, show_progress_bar=True)
        Z = np.asarray(Z, dtype=float)
        print("similarity: sentence-transformers all-MiniLM-L6-v2")
    except Exception as e:
        print("(LIB_EMBED: sentence-transformers not available, using TF-IDF)", e)

def kmeans(Z, k, seed):
    rng = np.random.default_rng(seed)
    C = [Z[rng.integers(len(Z))]]
    for _ in range(1, k):                                   # k-means++
        Cm = np.array(C); d2 = np.maximum(np.min((Z ** 2).sum(1)[:, None] + (Cm ** 2).sum(1)[None] - 2 * Z @ Cm.T, axis=1), 0)
        C.append(Z[rng.choice(len(Z), p=d2 / d2.sum())])
    C = np.array(C)
    for _ in range(100):
        lab = np.argmin((C ** 2).sum(1)[None] - 2 * Z @ C.T, axis=1)
        newC = np.array([Z[lab == j].mean(0) if (lab == j).any() else C[j] for j in range(k)])
        if np.allclose(newC, C): break
        C = newC
    inertia = ((Z - C[lab]) ** 2).sum()
    return lab, inertia

_D = None
def pdist(Z):
    sq = (Z ** 2).sum(1)
    return np.sqrt(np.maximum(sq[:, None] + sq[None] - 2 * Z @ Z.T, 0))
def silhouette(Z, lab):
    # vectorised: mean distance from every point to every cluster at once
    global _D
    if _D is None or _D.shape[0] != len(Z): _D = pdist(Z)
    ks = np.unique(lab); onehot = (lab[:, None] == ks[None]).astype(float); cnt = onehot.sum(0)
    M = _D @ onehot                                   # summed distance to each cluster
    own = (lab[:, None] == ks[None])
    a = (M * own).sum(1) / np.maximum((cnt[None] * own).sum(1) - 1, 1)
    other = np.where(own, np.inf, M / cnt[None]); b = other.min(1)
    s = np.where((cnt[None] * own).sum(1) > 1, (b - a) / np.maximum(a, b), 0)
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

# ------------------------------------------------------------------ 2-D map (t-SNE, numpy only)
# Like plotting word embeddings: each item's vector (above) is squeezed to 2-D so
# that items with similar text land near each other. Deterministic (fixed seed).
def tsne(Z, perplexity=30, iters=750, seed=0):
    n = len(Z)
    sq = (Z ** 2).sum(1); D = np.maximum(sq[:, None] + sq[None] - 2 * Z @ Z.T, 0)  # squared distances, memory-light
    P = np.zeros((n, n)); target = np.log(perplexity)
    for i in range(n):
        lo, hi, beta = 0.0, np.inf, 1.0
        d = np.delete(D[i], i)
        for _ in range(60):
            p = np.exp(-d * beta); s = p.sum() + 1e-12; p /= s
            H = -(p * np.log(p + 1e-12)).sum()
            if abs(H - target) < 1e-4: break
            if H > target: lo = beta; beta = beta * 2 if hi == np.inf else (beta + hi) / 2
            else: hi = beta; beta = (beta + lo) / 2
        P[i, np.arange(n) != i] = p
    P = (P + P.T) / (2 * n); P = np.maximum(P, 1e-12)
    rng = np.random.default_rng(seed)
    Y = rng.normal(0, 1e-4, (n, 2)); V = np.zeros_like(Y); G = np.ones_like(Y)
    for t in range(iters):
        ex = 12.0 if t < 250 else 1.0
        sq = (Y ** 2).sum(1); num = 1 / (1 + sq[:, None] + sq[None] - 2 * Y @ Y.T)
        np.fill_diagonal(num, 0); Q = np.maximum(num / num.sum(), 1e-12)
        PQ = (ex * P - Q) * num
        grad = 4 * ((np.diag(PQ.sum(1)) - PQ) @ Y)
        G = np.where(np.sign(grad) != np.sign(V), G + 0.2, G * 0.8).clip(0.01)
        V = (0.5 if t < 250 else 0.8) * V - 200 * G * grad
        Y += V; Y -= Y.mean(0)
    return Y
# Rhea herself as a point: her own published writing (essays, research,
# coursework, think-pieces — AI-marked text removed) is turned into a vector the
# same way as every item, so she lands among the things most like what she writes.
def rhea_vector():
    vault = os.path.join(ROOT, "src", "vault"); words = []
    for top in ("essays", "research", "coursework", "think-pieces", "creative", "comedy"):
        for d, _, fs in os.walk(os.path.join(vault, top)):
            for f in fs:
                if f.endswith(".md"):
                    t = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()
                    t = re.sub(r"^---\n.*?\n---\n", "", t, flags=re.S); t = re.sub(r"<ai>.*?</ai>", " ", t, flags=re.S)
                    words.append(t)
    doc = toks(" ".join(words))
    x = np.zeros(len(vocab))
    for w in doc:
        if w in idx: x[idx[w]] += 1
    x = np.log1p(x) * idf; x /= np.linalg.norm(x) + 1e-9
    if os.environ.get("LIB_EMBED"):
        try:
            from sentence_transformers import SentenceTransformer
            z = SentenceTransformer("all-MiniLM-L6-v2").encode([" ".join(" ".join(words).split()[:400])], normalize_embeddings=True)[0]
            return np.asarray(z, dtype=float)
        except Exception: pass
    z = (x - X.mean(0)) @ Vt[:dims].T
    return z / (np.linalg.norm(z) + 1e-9)
rz = rhea_vector()
rnear = [int(j) for j in np.argsort(-(Z @ rz))[:6] if not items[int(j)].get("_via")]

# Instagram saves are hidden by default on the site, so the map and its topics are
# built WITHOUT them (otherwise hidden dots shape the layout and name the topics).
# Each Instagram save is then placed beside its most similar non-Instagram item.
is_ig = lambda it: bool(it["url"]) and "instagram.com" in it["url"] and not it.get("_me")
ig_idx = [i for i, it in enumerate(items) if is_ig(it) and not it.get("_via")]
own_idx = [i for i, it in enumerate(items) if not it.get("_via") and not is_ig(it)]
XY = np.zeros((len(items), 2)); RXY = [0.0, 0.0]; KEEP = None
if len(own_idx) > 5:
    Y = tsne(np.vstack([Z[own_idx], rz[None, :]]))
    RXY = [round(float(v), 4) for v in Y[-1]]; Y = Y[:-1]
    r = np.sqrt((Y ** 2).sum(1)); sc = np.percentile(r, 98); Y /= sc; RXY = [round(v / float(sc), 4) for v in RXY]   # most points inside the unit circle
    XY[own_idx] = Y
    # how faithful is the flat map? share of each item's 10 nearest neighbours (by
    # content) that are still among its 10 nearest on the map
    Zo = Z[own_idx]; S = Zo @ Zo.T; np.fill_diagonal(S, -9)
    D2 = ((Y[:, None, :] - Y[None]) ** 2).sum(-1); np.fill_diagonal(D2, 9e9)
    hi = np.argsort(-S, 1)[:, :10]; lo = np.argsort(D2, 1)[:, :10]
    KEEP = float(np.mean([len(set(hi[i]) & set(lo[i])) / 10 for i in range(len(own_idx))]))
    print(f"map faithfulness: {KEEP:.0%} of each item's 10 nearest neighbours stay nearest on the map")
    rng = np.random.default_rng(7)
    for i in ig_idx:
        j = own_idx[int(np.argmax(Z[own_idx] @ Z[i]))]
        XY[i] = XY[j] + rng.normal(0, 0.012, 2)

# ------------------------------------------------------------------ topics that match the map
# "Natural" clusters: DBSCAN on the map positions. No number of topics is forced —
# a topic is any region where dots sit densely together (each dot has at least
# MINPTS neighbours within EPS). Dots in sparse areas belong to no topic ("unsorted").
own = np.array(own_idx)
P = XY[own]
D = np.sqrt(((P[:, None, :] - P[None]) ** 2).sum(-1))
MINPTS = 6
kth = np.sort(D, 1)[:, MINPTS]
def dbscan(EPS):
    core = (D <= EPS).sum(1) > MINPTS
    lab = -np.ones(len(P), int); c = 0
    for s0 in np.where(core)[0]:
        if lab[s0] != -1: continue
        stack = [s0]; lab[s0] = c
        while stack:
            u = stack.pop()
            if not core[u]: continue
            for v in np.where(D[u] <= EPS)[0]:
                if lab[v] == -1: lab[v] = c; stack.append(v)
        c += 1
    sizes = np.bincount(lab[lab >= 0]) if c else np.zeros(0, int)
    return lab, int((sizes >= 8).sum())
# Sweep the closeness setting from tight to loose and stop where the answer stops
# changing: the longest run of settings that all give the same number of topics
# (a "plateau" — the most stable clustering). No limit on how many topics.
qs = np.linspace(20, 95, 76)
runs = [(q, *dbscan(np.percentile(kth, q))) for q in qs]
counts = [r[2] for r in runs]
# the number of topics wobbles a little from setting to setting, so "settled" =
# the count that comes up most often across the sweep; of the settings giving
# that count, use the loosest (it sorts the most dots into a topic)
from collections import Counter as _C
settled = _C(counts).most_common(1)[0][0]
mid = max((r for r in runs if r[2] == settled), key=lambda r: r[0])
bl = counts.count(settled)
lo, hi = min(c for c in counts if c >= settled - 3), max(counts)
best = (None, mid[1], np.percentile(kth, mid[0]), mid[2])
print(f"settled: {settled} topics (the most common answer, {bl} of {len(qs)} closeness settings)")
lab2 = best[1]
sizes = np.bincount(lab2[lab2 >= 0])
lab2 = np.where((lab2 >= 0) & (sizes[np.maximum(lab2, 0)] >= 8), lab2, -1)   # tiny groups → unsorted
UNSORTED = 10_000
lab2 = np.where(lab2 < 0, UNSORTED, lab2)
chosen = int(len(set(lab2) - {UNSORTED}))
print(f"natural clusters: {chosen} topics, {np.mean(lab2 == UNSORTED):.0%} of dots unsorted")
best = (None, lab2)
labels = np.array(labels).copy()
labels[own] = best[1]
for i in ig_idx:
    labels[i] = labels[own_idx[int(np.argmax(Z[own_idx] @ Z[i]))]]
names = {}
for j in sorted(set(labels[own])):
    if j == UNSORTED: names[j] = "unsorted"; continue
    m = np.zeros(len(items), bool); m[own[labels[own] == j]] = True
    score = X[m].mean(0) - X[~m].mean(0)
    top = [vocab[i] for i in np.argsort(-score)[:3] if score[i] > 0]
    names[j] = " · ".join(top) if top else "assorted"

# ------------------------------------------------------------------ write
out = []
for i, (it, lab) in enumerate(zip(items, labels)):
    wild = it["_key"] in wild_keys or it["title"].lower() in wild_keys
    topic = "Me online" if it.get("_me") else "Influential minds" if it.get("_minds") else ("Wild card" if wild else names[int(lab)])
    out.append({"title": it["title"], "url": it["url"], "kind": it["kind"],
                "topic": topic, "wild": wild or bool(it.get("_me")) or bool(it.get("_minds")), "near": nbrs[i],
                "xy": [round(float(XY[i, 0]), 4), round(float(XY[i, 1]), 4)],
                **({"via": it["_via"]} if it.get("_via") else {}),
                **({"added": it["_added"]} if it.get("_added") else {}),
                **({"ai_title": True} if it.get("_ai") else {}),
                **({"published": it["_published"]} if it.get("_published") else {})})
json.dump({"count": len(out), "k": chosen, "faithfulness": round(KEEP, 3) if len(own_idx) > 5 else None, "rhea": {"xy": RXY, "near": rnear}, "items": out}, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

counts = {}
for o in out: counts[o["topic"]] = counts.get(o["topic"], 0) + 1
print(f"{len(out)} items in {chosen} clusters (+ wild card) → {os.path.relpath(OUT, ROOT)}")
for t, n in sorted(counts.items(), key=lambda x: -x[1]): print(f"  {n:4d}  {t}")
if skipped: print("not included yet (set include: true to use):", ", ".join(skipped))
