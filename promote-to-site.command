#!/bin/bash
# Double-click to promote: copies every vault-drafts note marked `published: true` into src/vault/ (which the site reads).
cd "$(dirname "$0")"
python3 - << 'PY'
import os,re,shutil
# Draft vault folder — auto-detects the name so renaming it in Obsidian
# (e.g. "raddotcom Vault (vault-drafts)") doesn't silently break publishing.
CANDIDATES=["vault-drafts","raddotcom Vault (vault-drafts)"]
src=next((c for c in CANDIDATES if os.path.isdir(c)),None)
if src is None:
    src=next((d for d in sorted(os.listdir(".")) if os.path.isdir(d) and "vault-drafts" in d),None)
if src is None:
    raise SystemExit("Could not find the draft vault folder (looked for one containing 'vault-drafts').")
print(f"Draft vault: {src}/")
dst="src/vault"
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
    # Skip the PRIVATE top-level scraps/ dump only. personal/scraps is the
    # public-facing Scraps section of Personal Writing (notes stay hidden
    # until individually flipped to published: true).
    dirs[:]=[d for d in dirs if not d.startswith((".","_")) and not (d == "scraps" and root == src)]
    # research/ai-wiki is compiled from PRIVATE AI chats: never publish it, even if a note says published: true (CLAUDE.md)
    dirs[:]=[d for d in dirs if not (d == "ai-wiki" and os.path.basename(root) == "research")]
    for f in sorted(files):
        if not f.endswith(".md") or f.startswith("_"): continue
        # skip iCloud/Obsidian sync-conflict copies like "Foo 2.md", "Foo 3.md"
        # skip iCloud/Obsidian sync-conflict copies ("Foo 2.md" next to "Foo.md") —
        # but keep real titles that end in a number ("Short Paper 1.md")
        cm=re.match(r"(.*) \d+\.md$", f)
        if cm and os.path.exists(os.path.join(root, cm.group(1)+".md")): continue
        t=open(os.path.join(root,f),encoding="utf-8",errors="ignore").read()
        m=re.search(r"^published:\s*(true|false)\s*$",t,re.M)
        if m and m.group(1)=="true":
            rel=os.path.relpath(root,src)
            outdir=os.path.join(dst,rel) if rel != "." else dst
            os.makedirs(outdir,exist_ok=True)
            shutil.copy2(os.path.join(root,f),os.path.join(outdir,f)); promoted.append(os.path.join(rel,f))
# The video list (vault/_videos.md → src/data/videos.md) feeds the About page gallery.
if os.path.exists(os.path.join(src,"_videos.md")):
    os.makedirs("src/data",exist_ok=True); shutil.copy2(os.path.join(src,"_videos.md"),"src/data/videos.md"); print("Copied _videos.md → src/data/videos.md")
# The questions list (vault/_questions.md → src/data/questions.md) feeds the Questions tab.
if os.path.exists(os.path.join(src,"_questions.md")):
    os.makedirs("src/data",exist_ok=True); shutil.copy2(os.path.join(src,"_questions.md"),"src/data/questions.md"); print("Copied _questions.md → src/data/questions.md")
print(f"Promoted {len(promoted)} note(s) to src/vault/:")
for f in promoted: print("  +",f)

# Files live NEXT TO their notes in the vault (one content folder). The website
# can only serve files from static/, so copy them there on every promote:
#   essays/Foo.md + essays/Foo.pdf          -> static/docs/<slug of Foo>.pdf
#   artifacts/Artifact x.md + its images    -> static/artifacts/<image name>
# Copies only (the vault file wins whenever it differs); nothing in static/ is ever deleted here.
def _slug(s):
    s=s.lower().replace("'","").replace("’","").replace('"',"")
    s=re.sub(r"[^a-z0-9]+","-",s); return re.sub(r"-+","-",s).strip("-")
import filecmp
def _newer(a,b): return not os.path.exists(b) or not filecmp.cmp(a,b,shallow=False)  # vault copy differs → it wins
pdfs=imgs=0
for rel in promoted:
    note=os.path.join(src,rel); folder=os.path.dirname(note); stem=os.path.basename(rel)[:-3]
    pdf=os.path.join(folder,stem+".pdf")
    if os.path.exists(pdf):
        out=os.path.join("static/docs",_slug(stem)+".pdf"); os.makedirs("static/docs",exist_ok=True)
        if _newer(pdf,out): shutil.copy2(pdf,out); pdfs+=1
    t=open(note,encoding="utf-8",errors="ignore").read()
    for ref in set(re.findall(r"/artifacts/([^\s,\]'\"]+\.(?:jpg|jpeg|png|gif|webp|pdf))",t,re.I)):
        f=os.path.join(folder,os.path.basename(ref))
        if os.path.exists(f):
            out=os.path.join("static/artifacts",ref); os.makedirs(os.path.dirname(out),exist_ok=True)
            if _newer(f,out): shutil.copy2(f,out); imgs+=1
if pdfs or imgs: print(f"Copied {pdfs} PDF(s) → static/docs/ and {imgs} image(s) → static/artifacts/ from beside their notes")

# Generate blog cover thumbnails (first PDF page) for any new documents.
# Needs poppler: brew install poppler
import subprocess
docs="static/docs"; cov=os.path.join(docs,"covers")
if os.path.isdir(docs) and shutil.which("pdftoppm"):
    os.makedirs(cov,exist_ok=True); made=0
    for f in os.listdir(docs):
        if not f.endswith(".pdf"): continue
        out=os.path.join(cov,f[:-4])
        if os.path.exists(out+".png"): continue
        r=subprocess.run(["pdftoppm","-png","-f","1","-singlefile","-scale-to","400",os.path.join(docs,f),out],capture_output=True)
        if r.returncode==0: made+=1
    if made: print(f"Generated {made} new cover thumbnail(s) in static/docs/covers/")
elif os.path.isdir(docs):
    print("(skipping cover thumbnails — install poppler with: brew install poppler)")
if promoted:
    print("\nNext: commit & push (git add src/vault && git commit -m 'publish' && git push),")
    print("or run `npm run dev` to preview locally.")
else:
    print("\nNo notes marked published:true yet. In Obsidian, set published: true on the ones you want live, then re-run this.")
PY

# Rebuild the Library (rhea.com/library) from recommendations/ (src/data/library.json).
python3 scripts/build-library.py || echo "(build-library.py failed — the Library will show the previous list)"

# Rebuild the Obsidian page's 3-D map from the published notes (static/vault-space.json).
python3 scripts/embed-vault.py || echo "(embed-vault.py failed — the Obsidian page will show the previous map)"
echo ""
read -p "Press Enter to close."
