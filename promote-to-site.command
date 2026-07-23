#!/bin/bash
# Double-click to promote: copies every vault-drafts note marked `published: true` into src/vault/ (which the site reads).
cd "$(dirname "$0")"
python3 - << 'PY'
import os,re,shutil
src="vault-drafts"; dst="src/vault"
os.makedirs(dst,exist_ok=True)
# Rebuild src/vault from scratch each run so renames/unpublishes don't leave
# stale copies behind. README.md is preserved.
for root,dirs,files in os.walk(dst, topdown=False):
    for f in files:
        if f.endswith(".md") and f != "README.md": os.remove(os.path.join(root,f))
    for d in dirs:
        p=os.path.join(root,d)
        if not os.listdir(p): os.rmdir(p)
promoted=[]
# Walk subfolders (essays/media-aesthetics/, ...) and PRESERVE the folder
# structure — the site shows subfolders inside each category folder.
for root,dirs,files in os.walk(src):
    # skip hidden dirs (.obsidian, .smart-env), _meta housekeeping, and scraps
    # (scraps are notes/dumps that should never publish, even if flagged)
    dirs[:]=[d for d in dirs if not d.startswith((".","_")) and d != "scraps"]
    for f in sorted(files):
        if not f.endswith(".md") or f.startswith("_"): continue
        t=open(os.path.join(root,f),encoding="utf-8",errors="ignore").read()
        m=re.search(r"^published:\s*(true|false)\s*$",t,re.M)
        if m and m.group(1)=="true":
            rel=os.path.relpath(root,src)
            outdir=os.path.join(dst,rel) if rel != "." else dst
            os.makedirs(outdir,exist_ok=True)
            shutil.copy2(os.path.join(root,f),os.path.join(outdir,f)); promoted.append(os.path.join(rel,f))
print(f"Promoted {len(promoted)} note(s) to src/vault/:")
for f in promoted: print("  +",f)
if promoted:
    print("\nNext: commit & push (git add src/vault && git commit -m 'publish' && git push),")
    print("or run `npm run dev` to preview locally.")
else:
    print("\nNo notes marked published:true yet. In Obsidian, set published: true on the ones you want live, then re-run this.")
PY
echo ""
read -p "Press Enter to close."
