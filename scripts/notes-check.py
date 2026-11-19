#!/usr/bin/env python3
"""
Read-only check: find the Apple Notes behind the vault's "exact copy" notes and
dump them (title, creation date, last-edited date, folder, plain text,
attachment count) so Claude can compare them with the vault before anything is
deleted. Changes nothing in Notes.

    python3 scripts/notes-check.py      (macOS may ask once to let Terminal control Notes)

Writes notes-check.json in the repo root (gitignored).
"""
import json, os, re, subprocess, difflib, unicodedata

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT = next(os.path.join(ROOT, d) for d in os.listdir(ROOT) if "vault-drafts" in d)

def norm(x):
    x = unicodedata.normalize("NFKC", x).replace(" ", " ").replace("’", "'")
    return re.sub(r"\s+", " ", x).strip().lower()

# the vault notes that say "source: Apple Notes, exact copy"
want = []
bodies = {}
for d, _, fs in os.walk(VAULT):
    for f in fs:
        if f.endswith(".md"):
            t = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read(3000)
            if "source: Apple Notes, exact copy" in t:
                m = re.search(r'^title:\s*"?(.*?)"?\s*$', t, re.M)
                if m:
                    want.append(m.group(1))
                    full = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read()
                    bodies[m.group(1)] = re.sub(r"^---\n.*?\n---\n", "", full, flags=re.S)
import sys
if "--all" in sys.argv:
    # dump EVERY note (name, dates, folder, text, attachments) for a duplicate check
    # Done folder by folder, a few bulk calls each, because one giant call (or a per-note
    # container() lookup) runs past the 2-minute Apple Event limit once there are thousands of notes.
    def osa_js(js, *args):
        r = subprocess.run(["osascript", "-l", "JavaScript", "-e", js, *args], capture_output=True, text=True)
        if r.returncode: raise SystemExit("osascript failed: " + r.stderr)
        return json.loads(r.stdout)
    folders = osa_js('''function run(){ const F=Application("Notes").folders;
      return JSON.stringify({id:F.id(), name:F.name()}); }''')
    out, seen = [], set()
    for i, (fid, fname) in enumerate(zip(folders["id"], folders["name"])):
        meta = osa_js('''function run(argv){ const N=Application("Notes").folders.byId(argv[0]).notes;
          return JSON.stringify({id:N.id(), name:N.name(), cr:N.creationDate().map(d=>d.toISOString()), md:N.modificationDate().map(d=>d.toISOString())}); }''', fid)
        n = len(meta["id"])
        texts = []
        for a in range(0, n, 150):   # text in chunks of 150 notes
            texts += osa_js('''function run(argv){ const N=Application("Notes").folders.byId(argv[0]).notes; const a=+argv[1], b=+argv[2];
              const out=[]; for (let k=a;k<b;k++){ try{ out.push(N[k].plaintext()); }catch(e){ out.push(""); } } return JSON.stringify(out); }''', fid, str(a), str(min(n, a + 150)))
        for k in range(n):
            if meta["id"][k] in seen: continue
            seen.add(meta["id"][k])
            out.append({"id": meta["id"][k], "name": meta["name"][k], "created": meta["cr"][k], "modified": meta["md"][k], "folder": fname, "text": texts[k] if k < len(texts) else ""})
        print(f"  {i + 1}/{len(folders['id'])} {fname}: {n} notes", flush=True)
    path = os.path.join(ROOT, "notes-all.json"); json.dump(out, open(path, "w"))
    print(f"wrote {len(out)} notes to {path} — tell Claude it's there"); raise SystemExit
print(f"{len(want)} vault copies to check")

def osa(js, *args):
    r = subprocess.run(["osascript", "-l", "JavaScript", "-e", js, *args], capture_output=True, text=True)
    if r.returncode: raise SystemExit("osascript failed: " + r.stderr)
    return json.loads(r.stdout)

# 1) every note's id + name (one bulk call — fast even for thousands of notes)
allnotes = osa('''function run(){ const N=Application("Notes").notes; return JSON.stringify({id:N.id(), name:N.name()}); }''')
names = [norm(n) for n in allnotes["name"]]
print(f"{len(names)} notes in Notes")

# 1b) every note's text too, so a copy can be found INSIDE a longer note
alltext = osa('''function run(){ return JSON.stringify(Application("Notes").notes.plaintext()); }''')
texts = [norm(t) for t in alltext]

# 2) match each vault title to the closest note name (fuzzy, so trailing spaces,
#    curly quotes or a longer first line don't hide it)
pick = {}
for t in want:
    nt = norm(t)
    best, score = None, 0
    for i, nm in enumerate(names):
        if nm == nt or nm.startswith(nt[:30]) or nt.startswith(nm[:30]):
            s = difflib.SequenceMatcher(None, nm[:120], nt[:120]).ratio() + 1
        else:
            continue
        if s > score: best, score = i, s
    # short names ("so", "m") match too loosely — require real overlap
    if best is not None and len(names[best]) < 8 and names[best] != nt: best = None
    if best is None:
        # look for the note's opening words inside any note's text
        key = norm(bodies.get(t, t))[:60]
        hits = [i for i, tx in enumerate(texts) if key and key in tx]
        if hits: best = hits[0]
    pick[t] = allnotes["id"][best] if best is not None else None

# 3) details for the matched notes
ids = [v for v in pick.values() if v]
details = osa('''function run(argv){ const N=Application("Notes"); const out={};
  for (const id of JSON.parse(argv[0])) { const n=N.notes.byId(id);
    out[id]={name:n.name(), created:n.creationDate().toISOString(), modified:n.modificationDate().toISOString(),
      folder:n.container().name(), text:n.plaintext(), attachments:n.attachments().length}; }
  return JSON.stringify(out); }''', json.dumps(ids)) if ids else {}

out = [dict(title=t, **(details[i] if i else {"missing": True})) for t, i in pick.items()]
path = os.path.join(ROOT, "notes-check.json")
json.dump(out, open(path, "w"), indent=1)
print(f"matched {len(ids)} of {len(want)} — wrote {path}; tell Claude it's there")
