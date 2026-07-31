---
date: 2026-06-01
date_approx: true
title: "Claude experiment 05 — class direction"
ai_title: true
tags: [ai/machine-learning/experiments, ai/nlp]
affiliation: independent
type: programming
published: true
---

# 05 — class direction

**Note entry (Dec 2025, watching 3Blue1Brown):** to what degree is *class* encoded in language? Find the plebeian↔aristocrat direction in embedding space — like man↔woman in king − man + woman ≈ queen — and project a bunch of words onto it.

## The experiment

Classic embedding-arithmetic probing (Mikolov et al. 2013; Bolukbasi et al. 2016 did exactly this for gender bias — "Man is to Computer Programmer as Woman is to Homemaker"). Your question extends it to socioeconomic class, which is much less studied than gender/race directions — a real gap. Kozlowski, Taddy & Evans, "The Geometry of Culture" (American Sociological Review, 2019) built an "affluence" axis in word2vec and tracked it across a century of books; your version asks what *today's* embeddings carry, and the note's larger frame ("a pulse on humanity / extract our stereotypes") is exactly what this measures.

Method in the starter:

1. Build a class axis from anchor pairs (aristocrat−plebeian, rich−poor, mansion−slum, refined−common, ...) — averaging several pairs denoises the direction (Bolukbasi's method).
2. Project a probe vocabulary onto the axis: occupations, foods, names, hobbies, adjectives.
3. Report the most aristocrat-loaded and plebeian-loaded words per category — the stereotype extract.
4. Sanity checks: axis coherence (held-out pairs project correctly), and comparison against the gender axis to see whether class is as linearly encoded as gender (the "to what degree" in your note — measured as held-out pair separation accuracy).

## Run

```bash
pip install gensim              # once; downloads GloVe (~66MB, glove-wiki-gigaword-100)
python3 run.py
```

## Extension

Do it in a *contextual* model (BERT/LLM embeddings) and per-decade corpora; compare with Kozlowski et al.'s historical drift. Also flip it: which words does the model refuse to place (near-zero projection) — is anything class-neutral?

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
- [[Topic - ai · nlp]]
