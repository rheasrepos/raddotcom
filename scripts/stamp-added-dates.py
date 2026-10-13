#!/usr/bin/env python3
"""
Stamp every published note with `added:` — the date it was FIRST added to the
site, pulled from git history (earliest commit that introduced a file with that
name anywhere in src/vault). Distinct from `date:` (when the writing was made).

    python3 scripts/stamp-added-dates.py          # dry run
    python3 scripts/stamp-added-dates.py --apply  # write `added:` into notes

Never overwrites an existing `added:` line (so you can hand-correct one and it
sticks). Idempotent. Re-run after publishing new notes.
"""
import os, re, sys, glob, subprocess

APPLY = "--apply" in sys.argv
VAULT = "raddotcom Vault (vault-drafts)"

# ONE pass over all history: build basename -> earliest date it was added.
# (One git call instead of one per note — the per-file version took minutes.)
FIRST = {}
log = subprocess.run(
    ["git", "log", "--reverse", "--diff-filter=A", "--name-only", "--format=@@%aI", "--", "src/vault"],
    capture_output=True, text=True
).stdout
cur = None
for line in log.splitlines():
    if line.startswith("@@"): cur = line[2:12]; continue
    if line.strip() and cur:
        b = os.path.basename(line.strip())
        FIRST.setdefault(b, cur)  # --reverse ⇒ first seen = earliest

def first_added(basename, path=None):
    if basename in FIRST: return FIRST[basename]
    # renamed files: follow the current src/vault path back through renames
    if path:
        sv = path.replace(VAULT, "src/vault", 1)
        try:
            out = subprocess.run(["git", "log", "--follow", "--format=%aI", "--", sv],
                                 capture_output=True, text=True, timeout=40).stdout.split()
            if out: return min(out)[:10]
        except Exception: pass
    return None

stamped, skipped, missing = [], 0, []
for p in sorted(glob.glob(f"{VAULT}/**/*.md", recursive=True)):
    if os.path.basename(p).startswith("_"): continue
    t = open(p, encoding="utf-8", errors="ignore").read()
    if not re.search(r"^published:\s*true", t, re.M): continue
    if re.search(r"^added:", t, re.M): skipped += 1; continue
    d = first_added(os.path.basename(p), p)
    if not d:
        # never committed yet ⇒ it is being added to the site NOW
        import datetime; d = datetime.date.today().isoformat(); missing.append(os.path.basename(p))
    stamped.append((os.path.basename(p), d))
    if APPLY:
        t2 = re.sub(r"^(date:.*)$", rf"\1\nadded: {d}", t, count=1, flags=re.M)
        if t2 == t:  # no date line — put it after type:
            t2 = re.sub(r"^(type:.*)$", rf"\1\nadded: {d}", t, count=1, flags=re.M)
        open(p, "w", encoding="utf-8").write(t2)

print(f"{'STAMPED' if APPLY else 'WOULD STAMP'} {len(stamped)} notes; already had added: {skipped}; no git history: {len(missing)}")
for n, d in stamped[:12]: print(f"   {d}  {n}")
if len(stamped) > 12: print(f"   … and {len(stamped)-12} more")
if missing: print("no history (never committed yet):", *missing[:8], sep="\n   ")
