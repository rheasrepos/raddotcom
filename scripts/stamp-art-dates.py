#!/usr/bin/env python3
"""
Give the art + scans their real years.

1. Open scripts/art-date-sheet.html (made by this script with --sheet): every
   artifact image with its filename and a box for the year. Fill in what you
   know, click "copy CSV", paste into  raddotcom Vault (vault-drafts)/artifacts/_dates.csv
2. Run:  python3 scripts/stamp-art-dates.py
   For each row  file,year  it sets `date: <year>-01-01` + `date_approx: true`
   on that note in the DRAFT vault (src/vault is rebuilt by promote-to-site).
   Rows with an empty year are skipped. Existing date_approx dates are
   overwritten (that's the point); a note whose date isn't the scan date and
   isn't approx is left alone.
"""
import os, re, sys, csv, html
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DRAFT = next((d for d in os.listdir(ROOT) if os.path.isdir(os.path.join(ROOT, d)) and "vault-drafts" in d), None)
if not DRAFT: sys.exit("draft vault not found")
ART = os.path.join(ROOT, DRAFT, "artifacts")
CSV = os.path.join(ART, "_dates.csv")
SCAN_DATE = "2026-07-23"   # the day everything was scanned — not a real date

def notes():
    for r, _, fs in os.walk(ART):
        for f in sorted(fs):
            if f.endswith(".md") and not f.startswith("_"): yield os.path.join(r, f)

if "--sheet" in sys.argv:
    rows = []
    for p in notes():
        t = open(p, encoding="utf-8").read()
        img = re.search(r"^image:\s*(\S+)", t, re.M); title = re.search(r'^title:\s*"?(.*?)"?\s*$', t, re.M)
        d = re.search(r"^date:\s*(\S+)", t, re.M)
        year = "" if not d or d.group(1) == SCAN_DATE else d.group(1)[:4]
        rows.append((os.path.basename(p), img.group(1) if img else "", title.group(1) if title else "", year))
    cells = "".join(
        f'<figure><img src="{html.escape(i)}" loading="lazy"><figcaption>{html.escape(f)}<br><input data-file="{html.escape(f)}" value="{year}" placeholder="year" inputmode="numeric" maxlength="4"></figcaption></figure>'
        for f, i, ttl, year in rows)
    page = f"""<!doctype html><meta charset=utf-8><title>art dates</title>
<style>body{{font:14px -apple-system,sans-serif;margin:16px}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px}}figure{{margin:0}}img{{width:100%;height:150px;object-fit:contain;background:#eee;border:1px solid #ccc}}figcaption{{font-size:11px;word-break:break-all}}input{{width:60px;margin-top:3px}}button{{position:sticky;top:8px;padding:8px 14px;font:inherit}}</style>
<p>Type the year each piece was MADE (not scanned). Leave blank if unknown. Then <button onclick="copy()">copy CSV</button> and paste into <code>{html.escape(DRAFT)}/artifacts/_dates.csv</code>, then run <code>python3 scripts/stamp-art-dates.py</code>. Images load from the live site; open this file while <code>npm run dev</code> runs, or replace the src prefix.</p>
<div class=grid>{cells}</div>
<script>function copy(){{const out=['file,year'];document.querySelectorAll('input[data-file]').forEach(i=>{{if(i.value.trim())out.push(i.dataset.file+','+i.value.trim())}});navigator.clipboard.writeText(out.join('\\n'));alert(out.length-1+' rows copied')}}</script>"""
    out = os.path.join(ROOT, "scripts", "art-date-sheet.html")
    # images are served from /artifacts/… by the dev server; point at it
    open(out, "w").write(page.replace('src="/artifacts/', 'src="http://localhost:5173/artifacts/'))
    print("wrote", os.path.relpath(out, ROOT), f"({len(rows)} pieces)"); sys.exit()

if not os.path.exists(CSV): sys.exit(f"no {os.path.relpath(CSV, ROOT)} yet — run with --sheet first, fill it in, paste the CSV there")
years = {r["file"].strip(): r["year"].strip() for r in csv.DictReader(open(CSV)) if r.get("year", "").strip()}
done = 0
for p in notes():
    f = os.path.basename(p)
    if f not in years or not re.fullmatch(r"\d{4}", years[f]): continue
    t = open(p, encoding="utf-8").read()
    new = f"date: {years[f]}-01-01"
    t2 = re.sub(r"^date:.*$", new, t, count=1, flags=re.M) if re.search(r"^date:", t, re.M) else t.replace("---\n", f"---\n{new}\n", 1)
    if not re.search(r"^date_approx:", t2, re.M): t2 = t2.replace(new, new + "\ndate_approx: true", 1)
    if t2 != t: open(p, "w", encoding="utf-8").write(t2); done += 1
print(f"stamped {done} note(s); now run promote-to-site.command")
