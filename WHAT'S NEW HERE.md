# What on rhea.com is off-the-shelf, and what's actually new

_Written by Claude (2026-11-13) for Rhea — an honest audit, not site text._

**Short answer:** almost every building block could be assembled from tutorials and libraries online. What hasn't been done before (as far as I know) is a handful of specific ideas, and the particular combination: a personal archive that labels its own AI-written words.

## Off-the-shelf (you could have built these from resources online)
| Piece | What it's built on |
|---|---|
| The site itself, routing, hosting | SvelteKit + Vercel |
| Posts from markdown | gray-matter + a small markdown renderer (common "blog from Obsidian" pattern) |
| Retro desktop look, draggable icons, windows | many "OS-style portfolio" sites and tutorials exist |
| WPM typing test + shared wall | typing tests are a classic tutorial; the wall is a Supabase table |
| Guestbook | Formspree form |
| Video gallery | YouTube's public channel feed |
| Obsidian graph mode | force-directed graph (same idea as Obsidian's own) |
| 3-D map of notes | text vectors → PCA, drawn with three.js |
| Library map | TF-IDF → SVD → t-SNE → k-means (textbook methods; your TTIC readings cover each) |
| Fonts | Archivo / Hind via Fontsource |

## Genuinely custom (not a known template)
1. **AI provenance as a design element.** Every AI-written word is marked (`<AIText>`, `<ai>`), "types itself" in when it appears, can be hidden site-wide by visitors, and exact quotes inside AI text are exempted (`<src>`). Sites disclose AI use; very few mark it word by word.
2. **Redaction font that decays with age** — older posts look more pixelated/degraded, driven by each note's date.
3. **Library as public "search history"** — everything you saved, clustered by what the pages say, with *you* placed in the same space by your own writing, and second-degree rings for things posted about you.
4. **Clustering left open to visitors** on the Obsidian page (pick k, re-run, see how much the folders agree) — a teaching point that clustering has no ground truth.
5. **The publishing pipeline**: a private vault where files sit beside their notes, one script that publishes only `published: true`, keeps private AI material out by rule, binds PDFs to posts by name, and rebuilds the maps.
6. **Questions page** built from exact quotes pulled out of years of notes and papers.

## Where it could be simpler
- The desktop page is still the most complex file (`src/routes/+page.svelte` + `src/lib/desktop/*`).
- Three different maps (Obsidian 3-D, Obsidian graph, Library) each have their own drawing code; they could share one.
- Several one-off scripts in `scripts/` (date stamping, PDF sync, embeddings, library) could become one `build` step run by promote.
