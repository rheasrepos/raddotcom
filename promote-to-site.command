#!/bin/bash
# Double-click to promote: copies every vault-drafts note marked `published: true` into src/vault/ (which the site reads).
cd "$(dirname "$0")"
python3 - << 'PY'
import os,re,shutil
src="vault-drafts"; dst="src/vault"
os.makedirs(dst,exist_ok=True)
promoted=[]
# Walk subfolders too (essays/, research/, creative/, ...) — the vault is
# organized into topic folders; the site reads a flat src/vault.
for root,dirs,files in os.walk(src):
    # skip hidden dirs (.obsidian, .smart-env) and _meta housekeeping
    dirs[:]=[d for d in dirs if not d.startswith((".","_"))]
    for f in sorted(files):
        if not f.endswith(".md") or f.startswith("_"): continue
        t=open(os.path.join(root,f),encoding="utf-8",errors="ignore").read()
        m=re.search(r"^published:\s*(true|false)\s*$",t,re.M)
        if m and m.group(1)=="true":
            shutil.copy2(os.path.join(root,f),os.path.join(dst,f)); promoted.append(f)
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
