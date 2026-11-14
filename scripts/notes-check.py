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
for d, _, fs in os.walk(VAULT):
    for f in fs:
        if f.endswith(".md"):
            t = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read(3000)
            if "source: Apple Notes, exact copy" in t:
                m = re.search(r'^title:\s*"?(.*?)"?\s*$', t, re.M)
                if m: want.append(m.group(1))
print(f"{len(want)} vault copies to check")

def osa(js, *args):
    r = subprocess.run(["osascript", "-l", "JavaScript", "-e", js, *args], capture_output=True, text=True)
    if r.returncode: raise SystemExit("osascript failed: " + r.stderr)
    return json.loads(r.stdout)

# 1) every note's id + name (one bulk call — fast even for thousands of notes)
allnotes = osa('''function run(){ const N=Application("Notes").notes; return JSON.stringify({id:N.id(), name:N.name()}); }''')
names = [norm(n) for n in allnotes["name"]]
print(f"{len(names)} notes in Notes")

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
