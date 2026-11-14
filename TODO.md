# TODO — rhea.com (outstanding, for Rhea)

_Kept current by Claude at the end of each session. Tick things off or delete lines as you go; this file is for you, not the site._

## Decisions / content only you can do
- [ ] **ShieldFont proof** — pick one essay to try it on (see chat 2026-10-22 for the trade-offs: breaks find/copy/search/SEO for that text).
- [ ] **Art years** — open `scripts/art-date-sheet.html` (run `python3 scripts/stamp-art-dates.py --sheet` first, with `npm run dev` running), type the year each piece was made, "copy CSV" → `artifacts/_dates.csv` in the draft vault → `python3 scripts/stamp-art-dates.py` → promote. Until then the art shows no year and doesn't degrade (all 99 pieces carry the 2026-07-23 scan date).
- [ ] **About page**: replace "INSERT LINK LOL" (the Redaction font link) and decide on "bio incoming.... this is a work in progress".
- [ ] **HIPS/MBL "Visualising the Invisible"**: body still says "CONTENT TO PASTE" — download the PDF from iCloud and paste the essay (or give it a PDF).
- [ ] **Resume/CV**: `static/resume.pdf` still says "Graduating June 2026" with your UChicago email — update when you have a new one.
- [ ] **Library sources**: Chrome bookmarks reviewed and kept as-is (438, 2026-11-13). Apple Notes links are exported (243, 2026-11-13) to `recommendations/_from-apple-notes.md` — skim, delete anything private, set `include: true`, then rebuild. Add your Wild card picks to `recommendations/_wildcard.md`.
- [ ] **Online-presence cleanup** (found 2026-11-13): delete the Nextdoor "Sherman Oaks" page; close the 2 old LinkedIn profiles (Bored of Boredom / University of Chicago); ask theorg.com to remove its scraped profile; unpublish espanolrhea.blogspot.com + the therhealdeal Blogger if unwanted; check Tumblr / Trello "rhea" / CS50 visibility; check people-search sites (Spokeo, Whitepages…) yourself. Send me your exact TikTok handle (Profile → share) — @voicesinyourshowerhead didn't resolve.
- [ ] **SPOY description** — the note still has the placeholder comment; write the real one.
- [ ] **"RPM (rhea's personal machine)"** from the handwritten note — never placed; decide where (or drop).
- [ ] **WhatsApp digital-garden message** — Claude can only draft it; send it yourself.
- [ ] **Retitle AI-drafted titles** (24 notes with `ai_title: true`). When you rewrite one, delete the `ai_title: true` line. List at the bottom of this file.

## Setup on your Mac / accounts
- [ ] **Library by content:** `python3 scripts/fetch-library-text.py` then `python3 scripts/build-library.py` (optionally `pip3 install sentence-transformers` and prefix `LIB_EMBED=1`), then promote + push.
- [ ] **Unpublished Y3/Y4 drafts to review** (`published: false`): UCD GP1 proposal + GP1–GP4 reflections, System Design Crit, BPRO proposal, ML4CS proposal.
- [x] ~~Move the repo out of iCloud~~ — done (now `~/Code/raddotcom`).
- [x] ~~Supabase keys for the shared WPM wall~~ — done 2026-10-23 (project `rhea-com`, table `notes`; moderate in Supabase → Table Editor → notes). Delete the "setup test" row whenever.
- [x] ~~Formspree for the guestbook~~ — done 2026-10-23 (form `rhea.com guestbook`). **Click the confirmation link in the first Formspree email** or later notes won't arrive.
- [x] ~~`brew install poppler`~~ — already installed (26.11.0), checked 2026-11-13.
- [ ] **Push `my_claude_experiments` to GitHub** so the experiment posts can link live code.
- [x] ~~`_videos.md`~~ — 12 videos naming you added 2026-11-13. Still to add: the Jake Schroeder songs you sing backing on (send the song names).
- [ ] **Complexity survey table** — paste the SQL from HOW TO §5g into Supabase → SQL Editor → Run (until then /complexity only saves in each visitor's browser). Then decide where to link /complexity from.

## After each Claude session
- [ ] Push in GitHub Desktop, then hit ⇱ once on the desktop if icons look off.

## AI-drafted titles still to rewrite (`ai_title: true`, published)
_Essays and coursework were renamed to your pattern from each paper's own heading on 2026-11-13; these are what's left._
- [ ] `creative/poetry/2017 Madhogarhia Rhea 7 Flowers Project.md` — currently “The Flowers — analytical project (7th grade)”
- [ ] `creative/poetry/2017-01 Madhogarhia Rhea 7 Poems.md` — currently “Seven Poems (7th grade)”
- [ ] `creative/scripts-and-theatre/2022-23 Hindi FINAL SKIT Team Sabziyaan (Jason-edited).md` — currently “HINDI: Team Sabziyaan — final skit”
- [ ] `creative/scripts-and-theatre/2022-23 Spring Quarter Theatre 24 - 'You. Me. Her. Fish. Uncle'.md` — currently “THEATRE 24: Camille & Rhea — spring quarter script”
- [ ] `creative/scripts-and-theatre/2026-04 Story Structure - The Golden Record.md` — currently “BPRO: Story Structure — The Golden Record”
- [ ] `essays/truth/2025-12 Truth BSI Writeup (collaborative).md` — currently “TRUTH: Bullshit Detection Instrument — Collaborative Writeup”
- [ ] `research/cab-lab/Preprint - Neural dynamics of updating social impressions during movie watching.md` — currently “Ke, J. et al. - Social Aha Moments & IS-RSA”
- [ ] `research/cab-lab/Publication - Cortical reinstatement of causally related events sparks narrative insights by updating neural representation patterns.md` — currently “Song, H., Ke, J., Madhogarhia, R., et al. (2025) - Cortical Reinstatement Preprint”
- [ ] `research/fellowships/2024 Madhogarhia Rhea Goldwater Research Essay.md` — currently “Goldwater Research Essay”
- [ ] `tech/claude-experiments/2026 claude experiment - 01-prompt-evolution.md` — currently “Claude experiment 01 — prompt evolution”
- [ ] `tech/claude-experiments/2026 claude experiment - 02-weight-symmetries.md` — currently “Claude experiment 02 — weight symmetries”
- [ ] `tech/claude-experiments/2026 claude experiment - 03-sample-then-correct.md` — currently “Claude experiment 03 — sample then correct”
- [ ] `tech/claude-experiments/2026 claude experiment - 04-universal-overfit.md` — currently “Claude experiment 04 — universal overfit”
- [ ] `tech/claude-experiments/2026 claude experiment - 05-class-direction.md` — currently “Claude experiment 05 — class direction”
- [ ] `tech/claude-experiments/2026 claude experiment - 06-query-circuits.md` — currently “Claude experiment 06 — query circuits”
- [ ] `tech/claude-experiments/2026 claude experiment - 07-threebody-evo.md` — currently “Claude experiment 07 — three-body evolution”
- [ ] `tech/claude-experiments/2026 claude experiment - 08-concurrency-time.md` — currently “Claude experiment 08 — concurrency & time”
- [ ] `tech/claude-experiments/2026 claude extracted machine fiddling.md` — currently “Extracted machine fiddling”
- [ ] `tech/projects/AI Progress Open Dataset.md` — currently “AI Progress Open Dataset”
- [ ] `tech/projects/AI-Fixable Problems Database.md` — currently “AI-Fixable Problems Database”
- [ ] `think-pieces/2025-01-21 TEAL Teaching Philosophy Statement.md` — currently “TEAL Teaching Philosophy Statement”
- [ ] `think-pieces/2026-07-01 Notes on Raqib Shaw's Paradise Lost at the Art Institute.md` — currently “Notes on Raqib Shaw's Paradise Lost at the Art Institute”
- [ ] `think-pieces/On Apple TV's 'Pluribus'.md` — currently “On Apple TV's 'Pluribus'”
- [ ] `think-pieces/reading-ideas/Is training only on synthetic data a moral choice.md` — currently “Is training only on synthetic data a moral choice?”
