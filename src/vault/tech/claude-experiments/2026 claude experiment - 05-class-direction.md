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
[machine fiddling]
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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Class direction in word embeddings: build a plebeian<->aristocrat axis from
anchor pairs, project probe words, measure how linearly class is encoded
(vs. the gender axis as a benchmark).

Needs: pip install gensim   (downloads glove-wiki-gigaword-100, ~66MB, once)
"""
import numpy as np

AXIS_PAIRS = [  # (aristocrat-side, plebeian-side)
    ("aristocrat", "peasant"), ("rich", "poor"), ("wealthy", "poverty"),
    ("mansion", "slum"), ("luxury", "cheap"), ("elite", "common"),
    ("noble", "commoner"), ("refined", "crude"), ("privileged", "underprivileged"),
]
HELDOUT_PAIRS = [("heir", "laborer"), ("yacht", "bus"), ("caviar", "gruel"),
                 ("duchess", "maid"), ("estate", "tenement")]
GENDER_PAIRS = [("man", "woman"), ("king", "queen"), ("he", "she"),
                ("father", "mother"), ("brother", "sister"), ("male", "female"),
                ("boy", "girl"), ("uncle", "aunt"), ("son", "daughter")]
GENDER_HELDOUT = [("actor", "actress"), ("prince", "princess"), ("waiter", "waitress"),
                  ("nephew", "niece"), ("gentleman", "lady")]

PROBES = {
    "occupations": ["doctor", "lawyer", "banker", "professor", "janitor", "plumber",
                    "farmer", "cashier", "surgeon", "waitress", "architect", "miner",
                    "artist", "consultant", "nanny", "senator"],
    "foods": ["champagne", "caviar", "quinoa", "brie", "hamburger", "soda",
              "lobster", "spam", "espresso", "grits", "truffle", "ramen"],
    "hobbies": ["polo", "golf", "opera", "yachting", "bowling", "nascar",
                "chess", "wrestling", "ballet", "bingo", "skiing", "darts"],
    "adjectives": ["articulate", "elegant", "vulgar", "classy", "trashy",
                   "sophisticated", "simple", "cultured", "rough", "polished"],
}


def load_vectors():
    try:
        import gensim.downloader as api
    except ImportError:
        raise SystemExit("needs: pip install gensim")
    print("loading glove-wiki-gigaword-100 (downloads once)...")
    return api.load("glove-wiki-gigaword-100")


def axis_from_pairs(kv, pairs):
    diffs = []
    for hi, lo in pairs:
        if hi in kv and lo in kv:
            d = kv[hi] - kv[lo]
            diffs.append(d / np.linalg.norm(d))
    axis = np.mean(diffs, axis=0)
    return axis / np.linalg.norm(axis)


def heldout_accuracy(kv, axis, pairs):
    """Fraction of held-out pairs whose 'high' word projects above its 'low' word."""
    ok = tot = 0
    for hi, lo in pairs:
        if hi in kv and lo in kv:
            tot += 1
            ok += float(kv[hi] @ axis > kv[lo] @ axis)
    return ok / tot if tot else float("nan")


def main():
    kv = load_vectors()
    cls = axis_from_pairs(kv, AXIS_PAIRS)
    gen = axis_from_pairs(kv, GENDER_PAIRS)

    print("\n=== how linearly is each concept encoded? (held-out pair accuracy) ===")
    print(f"  class axis : {heldout_accuracy(kv, cls, HELDOUT_PAIRS):.2f}  "
          f"(pairs like heir/laborer, caviar/gruel)")
    print(f"  gender axis: {heldout_accuracy(kv, gen, GENDER_HELDOUT):.2f}  (benchmark)")

    print("\n=== probe words on the plebeian(-) <-> aristocrat(+) axis ===")
    for cat, words in PROBES.items():
        scored = sorted(((float(kv[w] @ cls), w) for w in words if w in kv), reverse=True)
        top = ", ".join(f"{w}({s:+.2f})" for s, w in scored[:3])
        bot = ", ".join(f"{w}({s:+.2f})" for s, w in scored[-3:])
        print(f"  {cat:12} most aristocrat: {top}")
        print(f"  {'':12} most plebeian:   {bot}")

    print("\nreading: the projections ARE the stereotype extract the note asked for —")
    print("what the corpus (and so the culture that wrote it) binds to class. Compare")
    print("the two accuracies for 'to what degree': gender is the ceiling to beat.")


if __name__ == "__main__":
    main()
```
