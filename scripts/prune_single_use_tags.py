#!/usr/bin/env python3
"""Sweep single-use concept tags from vault-drafts (keeps nested domain tags + any flat tag used by >=2 notes).
Run whenever the graph feels cluttered:  python3 prune_single_use_tags.py
Tag freely as you write; this keeps the graph clean so you never hand-manage the '>=2 notes' rule."""
import os, re, collections
VAULT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "vault-drafts")
files = [f for f in os.listdir(VAULT) if f.endswith(".md")]
c = collections.Counter()
for f in files:
    m = re.search(r"^tags:\s*\[(.*?)\]", open(os.path.join(VAULT,f),encoding="utf-8").read(), re.M)
    if m:
        for t in m.group(1).split(","):
            t=t.strip()
            if t: c[t]+=1
keep = {t for t in c if ("/" in t) or c[t] >= 2}
dropped = sorted(t for t in c if t not in keep)
n=0
for f in files:
    p=os.path.join(VAULT,f); t=open(p,encoding="utf-8").read()
    m=re.search(r"^tags:\s*\[(.*?)\]\s*$",t,re.M)
    if not m: continue
    old=[x.strip() for x in m.group(1).split(",") if x.strip()]
    new=[x for x in old if x in keep]
    if new!=old:
        t = t[:m.start()]+("tags: ["+", ".join(new)+"]" if new else "")+t[m.end():] if new else t[:m.start()]+t[m.end()+1:]
        open(p,"w",encoding="utf-8").write(t); n+=1
print(f"pruned {len(dropped)} single-use tags across {n} notes")
