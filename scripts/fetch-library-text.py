#!/usr/bin/env python3
"""
Fetch the actual TEXT behind every Library link, so the Library map can group
items by what they say, not just by their titles.  Run it on your Mac (it
needs the internet), then rebuild:

    python3 scripts/fetch-library-text.py        # first run takes a while; later runs only fetch new links
    python3 scripts/build-library.py

* Web pages: the visible text of the page (scripts, menus and styles stripped).
* PDFs (incl. arXiv): the text of the first pages, via pdftotext (poppler).
* arXiv / DOI links: the abstract page.
* Instagram / TikTok / login-only pages give little or nothing; they keep
  using their title only.

Nothing here calls an AI service. The text is cached in
scripts/.library-text-cache.json (gitignored, never published); only the
resulting map positions reach the site.
"""
import json, os, re, subprocess, sys, tempfile, time, html
from html.parser import HTMLParser
from urllib.request import Request, urlopen

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "src", "data", "library.json")
CACHE = os.path.join(ROOT, "scripts", ".library-text-cache.json")
UA = "Mozilla/5.0 (Macintosh; raddotcom library text fetcher)"
SKIP = re.compile(r"instagram\.com|tiktok\.com|facebook\.com|x\.com|twitter\.com|linkedin\.com|pinterest\.com", re.I)
MAX_WORDS = 3000

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.out = []; self.skip = 0
    def handle_starttag(self, tag, a):
        if tag in ("script", "style", "nav", "header", "footer", "noscript", "svg", "form"): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ("script", "style", "nav", "header", "footer", "noscript", "svg", "form") and self.skip: self.skip -= 1
    def handle_data(self, d):
        if not self.skip and d.strip(): self.out.append(d.strip())

def fetch(url):
    url = re.sub(r"arxiv\.org/(pdf|html)/", "arxiv.org/abs/", url)
    req = Request(url, headers={"User-Agent": UA})
    with urlopen(req, timeout=20) as r:
        kind = r.headers.get("Content-Type", ""); data = r.read(8_000_000)
    if "pdf" in kind or url.lower().endswith(".pdf"):
        with tempfile.NamedTemporaryFile(suffix=".pdf") as f:
            f.write(data); f.flush()
            return subprocess.run(["pdftotext", "-l", "6", f.name, "-"], capture_output=True, text=True).stdout
    p = Text(); p.feed(data.decode("utf-8", "ignore")); return html.unescape(" ".join(p.out))

def main():
    items = json.load(open(LIB))["items"]
    cache = json.load(open(CACHE)) if os.path.exists(CACHE) else {}
    todo = [it["url"] for it in items if it.get("url") and it["url"] not in cache and not SKIP.search(it["url"])]
    print(f"{len(todo)} links to fetch ({len(cache)} already cached)")
    for n, u in enumerate(todo, 1):
        try:
            words = re.sub(r"\s+", " ", fetch(u)).split()[:MAX_WORDS]
            cache[u] = " ".join(words)
        except Exception as e:
            cache[u] = ""  # remembered as unreachable; delete it from the cache file to retry
        if n % 25 == 0:
            json.dump(cache, open(CACHE, "w")); print(f"  {n}/{len(todo)}")
        time.sleep(0.3)
    json.dump(cache, open(CACHE, "w"))
    got = sum(1 for v in cache.values() if v)
    print(f"done: text for {got} of {len(cache)} links → now run python3 scripts/build-library.py")

if __name__ == "__main__":
    main()
