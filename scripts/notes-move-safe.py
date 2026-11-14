#!/usr/bin/env python3
"""
Move the Apple Notes that are already fully saved in the vault into a Notes
folder called "SAFE TO DELETE (on rhea.com)". Moves only — deletes nothing;
drag any note back out if you change your mind. The list (note ids + names) is
scripts/notes-safe-to-delete.json, made from the notes-check comparison.

    python3 scripts/notes-move-safe.py
"""
import json, os, subprocess
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
notes = json.load(open(os.path.join(ROOT, "scripts", "notes-safe-to-delete.json")))
JS = r'''
function run(argv) {
  const Notes = Application("Notes"); const want = JSON.parse(argv[0]);
  const NAME = "SAFE TO DELETE (on rhea.com)";
  const acct = Notes.accounts.byName("iCloud");
  let folder = acct.folders.whose({ name: NAME })();
  folder = folder.length ? folder[0] : (function(){ const f = Notes.Folder({ name: NAME }); acct.folders.push(f); return acct.folders.byName(NAME); })();
  const moved = [], missing = [];
  for (const n of want) {
    try { const note = Notes.notes.byId(n.id); note.name(); Notes.move(note, { to: folder }); moved.push(n.name); }
    catch (e) { missing.push(n.name); }
  }
  return JSON.stringify({ moved, missing });
}
'''
r = subprocess.run(["osascript", "-l", "JavaScript", "-e", JS, json.dumps(notes)], capture_output=True, text=True)
if r.returncode: raise SystemExit("osascript failed: " + r.stderr)
out = json.loads(r.stdout)
print(f"moved {len(out['moved'])} notes into 'SAFE TO DELETE (on rhea.com)'")
if out["missing"]: print("couldn't find:", out["missing"])
