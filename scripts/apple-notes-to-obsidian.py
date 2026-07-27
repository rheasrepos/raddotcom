#!/usr/bin/env python3
"""
Apple Notes → Obsidian, non-destructively.

For every note in a chosen Apple Notes folder this script:
  1. writes a Markdown file into the vault's `inbox/` (published: false),
  2. appends a line to the ORIGINAL Apple note:  "copied to obsidian on <date>",
  3. moves the original into an Apple Notes folder called "Copied".

Nothing is ever deleted. If a note is already stamped, it is skipped, so the
script is safe to re-run.

USAGE
  python3 scripts/apple-notes-to-obsidian.py --list           # show folders
  python3 scripts/apple-notes-to-obsidian.py --folder Notes   # dry run
  python3 scripts/apple-notes-to-obsidian.py --folder Notes --apply

FIRST RUN: macOS will ask permission for Terminal to control Notes — say yes.
"""
import argparse, os, re, subprocess, sys, datetime, html

STAMP_PREFIX = "copied to obsidian on"
COPIED_FOLDER = "Copied"


def osa(script: str) -> str:
    r = subprocess.run(["osascript", "-e", script], capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit("AppleScript error:\n" + r.stderr.strip())
    return r.stdout.strip()


def list_folders():
    return osa('tell application "Notes" to get name of every folder').split(", ")


def notes_in(folder):
    """Returns [(id, name)] for a folder."""
    ids = osa(f'tell application "Notes" to get id of every note of folder "{folder}"')
    names = osa(f'tell application "Notes" to get name of every note of folder "{folder}"')
    if not ids.strip():
        return []
    return list(zip([i.strip() for i in ids.split(", ")],
                    [n.strip() for n in names.split(", ")]))


def note_body(note_id):
    return osa(f'tell application "Notes" to get body of note id "{note_id}"')


def note_created(note_id):
    return osa(f'tell application "Notes" to get creation date of note id "{note_id}"')


def html_to_md(body: str) -> str:
    t = body
    t = re.sub(r"<div><br></div>", "\n\n", t)
    t = re.sub(r"</div>|<br\s*/?>", "\n", t)
    t = re.sub(r"<li>", "- ", t)
    t = re.sub(r"<h1>(.*?)</h1>", r"# \1", t, flags=re.S)
    t = re.sub(r"<h2>(.*?)</h2>", r"## \1", t, flags=re.S)
    t = re.sub(r"<b>(.*?)</b>", r"**\1**", t, flags=re.S)
    t = re.sub(r"<i>(.*?)</i>", r"*\1*", t, flags=re.S)
    t = re.sub(r"<[^>]+>", "", t)
    t = html.unescape(t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()


def slug(s):
    return re.sub(r"[^\w\s.-]", "", s).strip()[:80] or "untitled"


def find_vault(root):
    for d in sorted(os.listdir(root)):
        if os.path.isdir(os.path.join(root, d)) and "vault-drafts" in d:
            return os.path.join(root, d)
    sys.exit("Could not find the draft vault folder.")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--folder", help="Apple Notes folder to import")
    ap.add_argument("--list", action="store_true", help="list Apple Notes folders")
    ap.add_argument("--apply", action="store_true", help="actually write/stamp/move")
    a = ap.parse_args()

    if a.list or not a.folder:
        print("Apple Notes folders:")
        for f in list_folders():
            print("  -", f)
        return

    repo = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    inbox = os.path.join(find_vault(repo), "inbox")
    today = datetime.date.today().isoformat()

    if a.apply:
        os.makedirs(inbox, exist_ok=True)
        existing = osa('tell application "Notes" to get name of every folder')
        if COPIED_FOLDER not in existing:
            osa(f'tell application "Notes" to make new folder with properties {{name:"{COPIED_FOLDER}"}}')

    made = skipped = 0
    for nid, name in notes_in(a.folder):
        body = note_body(nid)
        if STAMP_PREFIX in body:
            skipped += 1
            continue
        md = html_to_md(body)
        created = note_created(nid)
        m = re.search(r"(\d{4})", created)
        date = today
        try:
            date = datetime.datetime.strptime(created.split(" at ")[0], "%A, %B %d, %Y").date().isoformat()
        except Exception:
            pass
        fname = f"{date} {slug(name)}.md"
        fm = (f'---\ntitle: "{name}"\ndate: {date}\ntype: writing\npublished: false\n'
              f'source: "Apple Notes / {a.folder}"\ntags: [inbox, from-apple-notes]\n---\n\n')
        print(("WRITE " if a.apply else "would write ") + fname)
        if a.apply:
            with open(os.path.join(inbox, fname), "w", encoding="utf-8") as fh:
                fh.write(fm + md + "\n")
            stamp = f"<div><br></div><div>{STAMP_PREFIX} {today}</div>"
            osa(f'tell application "Notes" to set body of note id "{nid}" to (body of note id "{nid}") & "{stamp}"')
            osa(f'tell application "Notes" to move note id "{nid}" to folder "{COPIED_FOLDER}"')
        made += 1

    print(f"\n{'Imported' if a.apply else 'Would import'} {made} note(s); {skipped} already stamped.")
    if not a.apply:
        print("Re-run with --apply to write files, stamp originals, and move them to “Copied”.")


if __name__ == "__main__":
    main()
