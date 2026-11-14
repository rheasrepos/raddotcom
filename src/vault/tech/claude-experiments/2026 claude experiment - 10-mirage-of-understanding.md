---
date: 2026-08-11
added: 2026-11-14
title: "Claude experiment 10 — mirage of understanding"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-10-mirage-of-understanding.html
published: true
---
[machine fiddling]
# 10 — mirage of understanding

**Rhea, thesis proposal (Oct 2025):** "our inclination to attach a 'mirage of understanding' to chatbot outputs, a form of trust we often don't afford to other humans." **NLP margin (minalee paper, p.7):** "i wonder if what is considered an error is also biased to think that llm generated text is error free"

<ai>
## The experiment

The thesis claims the mirage exists; this measures it. Within-subjects labeling study:

1. Take N short answer passages (mixed human- and AI-written, or all identical AI answers — the *stronger* design, since then content is constant and only the label varies).
2. Each rater sees each passage under one of three labels — **"written by a person"**, **"written by AI"**, **unlabeled** — randomized per rater (Latin-square so nobody sees the same passage twice).
3. Ratings per passage: trust (1–7), perceived understanding of the topic by the author (1–7), and error spotting ("mark anything that seems wrong").

**Predictions the thesis makes:** (a) same text rated more trustworthy/understanding under the human label, or — the mirage version — AI-labeled text trusted *more* on technical topics; (b) fewer errors caught in AI-labeled text (the minalee margin). Either direction is a finding.

Related work to position against: Jakesch et al. 2023 (PNAS, "Human heuristics for AI-generated language are flawed"); Kreps et al. 2022 (credibility of AI news); automation-bias literature (Parasuraman & Riley 1997). The "same text, different label" design is standard and IRB-light (you have CITI certification already).

## Run

```bash
python3 run.py make          # builds out/survey.html from stimuli.csv (10 sample items included)
python3 run.py analyze       # analyzes out/responses.csv (synthetic pilot data generated if none)
```

`survey.html` is self-contained — open it, rate, and it downloads a `responses.csv` at the end. Send the link to friends for a pilot; swap `stimuli.csv` for your real items.

## Extension

Cross with project 05: does the label effect vary with the *class-codedness* of the prose style? And the thesis tie-in: the mirage is exactly Dennett's intentional stance extended on credit — your margin "for non perfectly rational systems we must go to a reliable design stance… which it is not" is the normative half of this measurement.
</ai>
