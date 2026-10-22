# TODO — rhea.com (outstanding, for Rhea)

_Kept current by Claude at the end of each session. Tick things off or delete lines as you go; this file is for you, not the site._

## Decisions / content only you can do
- [ ] **ShieldFont proof** — pick one essay to try it on (see chat 2026-10-22 for the trade-offs: breaks find/copy/search/SEO for that text).
- [ ] **Art years** — open `scripts/art-date-sheet.html` (run `python3 scripts/stamp-art-dates.py --sheet` first, with `npm run dev` running), type the year each piece was made, "copy CSV" → `artifacts/_dates.csv` in the draft vault → `python3 scripts/stamp-art-dates.py` → promote. Until then the art shows no year and doesn't degrade (all 99 pieces carry the 2026-07-23 scan date).
- [ ] **SPOY description** — the note still has the placeholder comment; write the real one.
- [ ] **"RPM (rhea's personal machine)"** from the handwritten note — never placed; decide where (or drop).
- [ ] **WhatsApp digital-garden message** — Claude can only draft it; send it yourself.
- [ ] **Retitle AI-drafted titles** (45 notes with `ai_title: true`). When you rewrite one, delete the `ai_title: true` line. List at the bottom of this file.

## Setup on your Mac / accounts
- [ ] **Move the repo out of iCloud** (`~/Desktop` → e.g. `~/Code/raddotcom`, then "Add existing repository" in GitHub Desktop). `.git` has been corrupted by iCloud 3× — each recovery was luck.
- [ ] **Supabase keys** for the shared WPM wall → HOW TO §5d (5 steps).
- [ ] **Formspree ID** for the guestbook (`src/components/Guestbook.svelte`, `FORMSPREE_ID`) — falls back to mailto until then.
- [ ] **`brew install poppler`** — promote then builds PDF covers and the Obsidian space reads PDF text.
- [ ] **Push `my_claude_experiments` to GitHub** so the experiment posts can link live code.
- [ ] **`_videos.md`** in the draft vault — paste YouTube links of videos you're in that aren't on your channel (About → video gallery).

## After each Claude session
- [ ] Push in GitHub Desktop, then hit ⇱ once on the desktop if icons look off.

## AI-drafted titles still to rewrite (`ai_title: true`)
- [ ] `coursework/biotechnology/2024-10-17 Biotech in the News - Recursion clinical trial.md` — currently “Biotech in the News — Recursion's clinical trial”
- [ ] `coursework/cognitive-psychology/2023-10-20 Cog Psych Discussion - Week 4 (mental imagery).md` — currently “COG PSYCH: Discussion Week 4 — Mental Imagery”
- [ ] `coursework/cognitive-psychology/2023-10-28 Cog Psych Discussion - Week 5 (selective attention).md` — currently “COG PSYCH: Discussion Week 5 — Selective Attention”
- [ ] `coursework/cognitive-psychology/2023-11-03 Cog Psych Discussion - Week 6 (working memory & expertise).md` — currently “COG PSYCH: Discussion Week 6 — Working Memory & Expertise”
- [ ] `coursework/cognitive-psychology/2023-11-14 Cog Psych Discussion - Week 7 (long-term & false memory).md` — currently “COG PSYCH: Discussion Week 7 — Long-Term & False Memory”
- [ ] `coursework/cognitive-psychology/2023-11-17 Cog Psych Discussion - Week 8 (categorization).md` — currently “COG PSYCH: Discussion Week 8 — Categorization”
- [ ] `coursework/cognitive-psychology/2023-11-30 Cog Psych Discussion - Week 9 (insight & problem solving).md` — currently “COG PSYCH: Discussion Week 9 — Insight & Problem Solving”
- [ ] `coursework/cognitive-psychology/2023-12-01 Cog Psych Discussion - Week 1 rewrite (computer metaphor, Pinker).md` — currently “COG PSYCH: Discussion Week 1 — Computer Metaphor (rewrite)”
- [ ] `coursework/cognitive-psychology/2023-12-02 Cog Psych Discussion - Week 2 rewrite (cognitive revolution).md` — currently “COG PSYCH: Discussion Week 2 — Cognitive Revolution (rewrite)”
- [ ] `coursework/cognitive-psychology/Cognitive Psychology Discussion Post (context & object recognition).md` — currently “Cognitive Psychology Discussion Post (context & object recognition)”
- [ ] `coursework/hindi/2022-23 HINDI 103 Video Summary.md` — currently “HINDI: Video Summary — Airplane Emergency”
- [ ] `coursework/sensation-and-perception/2025-04-06 Sensation & Perception - Journal Critique 2 (spatial hearing in blindness).md` — currently “S&P: Journal Critique 2 — Spatial Hearing in Blindness”
- [ ] `creative/poetry/2017 Madhogarhia Rhea 7 Flowers Project.md` — currently “The Flowers — analytical project (7th grade)”
- [ ] `creative/poetry/2017-01 Madhogarhia Rhea 7 Poems.md` — currently “Seven Poems (7th grade)”
- [ ] `creative/scripts-and-theatre/2022-23 Hindi FINAL SKIT Team Sabziyaan (Jason-edited).md` — currently “HINDI: Team Sabziyaan — final skit”
- [ ] `creative/scripts-and-theatre/2022-23 Spring Quarter Theatre 24 - 'You. Me. Her. Fish. Uncle'.md` — currently “THEATRE 24: Camille & Rhea — spring quarter script”
- [ ] `creative/scripts-and-theatre/2026-04 Story Structure - The Golden Record.md` — currently “BPRO: Story Structure — The Golden Record”
- [ ] `essays/biotechnology/2024-12 FINAL BIOTECH PAPER.md` — currently “BIOTECH: Final Paper”
- [ ] `essays/cognitive-psychology/2023-12-07 Cognitive Psychology Final.md` — currently “COG PSYCH: Take-Home Final Essay Exam”
- [ ] `essays/hips/2025-26 hips civ final.md` — currently “HIPS: Civ — Final Essay”
- [ ] `essays/media-aesthetics/2022-10 HUMA Kiarostami essay.md` — currently “HUMA: Kiarostami essay”
- [ ] `essays/mind-brain-meaning/2023-24 Final Paper - Mind, Brain, and Meaning.md` — currently “MBM: Final Paper”
- [ ] `essays/mind-brain-meaning/2023-24 Short Paper 3 - Mind, Brain, and Meaning.md` — currently “MBM: Short Paper 3”
- [ ] `essays/negotiation/2024-25 Psychology of Negotiation TERM PAPER.md` — currently “Psychology of NEGOTIATION: Term Paper”
- [ ] `essays/sosc-self-culture-society/2022-23 SOSC 1 FALL REFLECTION - Smith.md` — currently “SOSC: Self, Culture & Society — Fall Essay”
- [ ] `essays/sosc-self-culture-society/2022-23 SOSC Reflection 2 - Marx.md` — currently “SOSC: Self, Culture & Society — Essay 2”
- [ ] `essays/sosc-self-culture-society/2023-03 SELF III SOSC Final Essay.md` — currently “SOSC: Self, Culture & Society III — Final Essay”
- [ ] `essays/sosc-self-culture-society/2023-03 WINTER QUARTER FINAL SOSC ESSAY.md` — currently “SOSC: Self, Culture & Society — Winter Final Essay”
- [ ] `essays/truth/2025-12 Truth BSI Writeup (collaborative).md` — currently “TRUTH: Bullshit Detection Instrument — Collaborative Writeup”
- [ ] `research/cab-lab/Preprint - Neural dynamics of updating social impressions during movie watching.md` — currently “Ke, J. et al. - Social Aha Moments & IS-RSA”
- [ ] `research/cab-lab/Publication - Cortical reinstatement of causally related events sparks narrative insights by updating neural representation patterns.md` — currently “Song, H., Ke, J., Madhogarhia, R., et al. (2025) - Cortical Reinstatement Preprint”
- [ ] `research/coursework-research/2024-05 Cog Models final report.md` — currently “COG MODELS: Final Report”
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
- [ ] `think-pieces/2025-01-21 TEAL Teaching Philosophy Statement.md` — currently “TEAL Teaching Philosophy Statement”
- [ ] `think-pieces/2026-07-01 Notes on Raqib Shaw's Paradise Lost at the Art Institute.md` — currently “Notes on Raqib Shaw's Paradise Lost at the Art Institute”
- [ ] `think-pieces/On Apple TV's 'Pluribus'.md` — currently “On Apple TV's 'Pluribus'”
