#!/usr/bin/env python3
"""
Library items marked @ai have titles Claude wrote. Where the link has a real
title of its own (a paper, a video, a web page), use that EXACT title instead
and drop the @ai mark. Run on your Mac (needs the internet):

    python3 scripts/fix-ai-titles.py            # shows what would change
    python3 scripts/fix-ai-titles.py --apply    # writes it, then: python3 scripts/build-library.py

Sources: arXiv API (arXiv links), Crossref (doi.org links), YouTube oEmbed,
else the page's own <title>. Instagram / TikTok / login pages are skipped,
since their "titles" are just the account name. No AI service is called.
"""
import json, os, re, sys, html, time
from urllib.request import Request, urlopen
from urllib.parse import quote

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REC = next(os.path.join(ROOT, d, "recommendations") for d in os.listdir(ROOT) if "vault-drafts" in d)
UA = {"User-Agent": "Mozilla/5.0 (Macintosh; raddotcom title checker)"}
SKIP = re.compile(r"instagram\.com|tiktok\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|reddit\.com", re.I)
LINE = re.compile(r"^(\s*-\s*)\[([^\]]+)\]\((https?://[^)\s]+)\)(.*@ai\b.*)$")
JUNK = re.compile(r"(?i)^(just a moment|access denied|attention required|log ?in|sign ?in|403|404|page not found|error)")

def get(url, n=400_000):
    with urlopen(Request(url, headers=UA), timeout=20) as r: return r.read(n).decode("utf-8", "ignore")

def title_of(url):
    m = re.search(r"arxiv\.org/(?:abs|pdf|html)/(\d{4}\.\d{4,5})", url) or re.search(r"arXiv\.(\d{4}\.\d{4,5})", url)
    if m:
        t = re.search(r"<entry>.*?<title>(.*?)</title>", get(f"https://export.arxiv.org/api/query?id_list={m.group(1)}"), re.S)
        return t and re.sub(r"\s+", " ", t.group(1)).strip()
    m = re.search(r"doi\.org/(10\.[^\s)]+)", url)
    if m:
        d = json.loads(get(f"https://api.crossref.org/works/{quote(m.group(1))}"))["message"]
        return (d.get("title") or [None])[0]
    if re.search(r"youtube\.com|youtu\.be", url):
        return json.loads(get(f"https://www.youtube.com/oembed?url={quote(url, safe='')}&format=json")).get("title")
    t = re.search(r"<title[^>]*>(.*?)</title>", get(url), re.S | re.I)
    t = t and re.sub(r"\s+", " ", html.unescape(t.group(1))).strip()
    return None if not t or JUNK.search(t) else t

apply = "--apply" in sys.argv
changed = 0
for f in sorted(os.listdir(REC)):
    if not f.endswith(".md"): continue
    p = os.path.join(REC, f); lines = open(p, encoding="utf-8").read().split("\n"); dirty = False
    for i, l in enumerate(lines):
        m = LINE.match(l)
        if not m or SKIP.search(m.group(3)): continue
        try: t = title_of(m.group(3))
        except Exception as e: t = None
        time.sleep(0.3)
        if not t or t.strip().lower() == m.group(2).strip().lower(): continue
        t = t.replace("[", "(").replace("]", ")")
        rest = re.sub(r"\s*@ai\b", "", m.group(4))
        print(f"{f}: {m.group(2)!r}\n    -> {t!r}")
        lines[i] = f"{m.group(1)}[{t}]({m.group(3)}){rest}"; dirty = True; changed += 1
    if dirty and apply: open(p, "w", encoding="utf-8").write("\n".join(lines))
print(f"\n{changed} titles {'replaced' if apply else 'would change (run with --apply)'}")
