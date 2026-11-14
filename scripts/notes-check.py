#!/usr/bin/env python3
"""
Read-only check: dump the 29 "exact copy" Apple Notes (title, creation date,
last-edited date, plain text) so Claude can compare them with the vault copies
before anything is deleted. Changes nothing in Notes.

    python3 scripts/notes-check.py      (macOS will ask once to let Terminal control Notes)

Writes notes-check.json next to this repo's TODO.md.
"""
import json, os, re, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VAULT = next(os.path.join(ROOT, d) for d in os.listdir(ROOT) if "vault-drafts" in d)

# the vault notes that say "source: Apple Notes, exact copy"
titles = []
for d, _, fs in os.walk(VAULT):
    for f in fs:
        if f.endswith(".md"):
            t = open(os.path.join(d, f), encoding="utf-8", errors="ignore").read(3000)
            if "source: Apple Notes, exact copy" in t:
                m = re.search(r'^title:\s*"?(.*?)"?\s*$', t, re.M)
                if m: titles.append(m.group(1))
import sys
if len(sys.argv) > 1:   # or: check specific notes by (part of) their name
    titles = sys.argv[1:]
print(f"{len(titles)} vault copies to check")

JXA = r'''
function run(argv) {
  const Notes = Application("Notes"); const want = JSON.parse(argv[0]); const out = [];
  for (const t of want) {
    // match on the first 24 characters: Notes often keeps trailing spaces or a
    // slightly different ending in the name than the vault title
    let hits = Notes.notes.whose({ name: t })();
    if (!hits.length) hits = Notes.notes.whose({ name: { _beginsWith: t.slice(0, 24).trim() } })();
    if (!hits.length) hits = Notes.notes.whose({ name: { _contains: t.slice(0, 24).trim() } })();
    for (const n of hits) out.push({ title: t, name: n.name(), created: n.creationDate().toISOString(),
      modified: n.modificationDate().toISOString(), folder: n.container().name(), text: n.plaintext(),
      attachments: n.attachments().length });
    if (!hits.length) out.push({ title: t, missing: true });
  }
  return JSON.stringify(out);
}
'''
r = subprocess.run(["osascript", "-l", "JavaScript", "-e", JXA, json.dumps(titles)], capture_output=True, text=True)
if r.returncode:
    raise SystemExit("osascript failed: " + r.stderr)
out = os.path.join(ROOT, "notes-check.json")
open(out, "w").write(r.stdout)
print("wrote", out, "— tell Claude it's there")
