---
date: 2026-06-01
date_approx: true
title: "Claude experiment 04 — universal overfit"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/theory]
affiliation: independent
type: programming
published: true
---

# 04 — universal overfit

**Note entry (phil of AI class):** can you fit a model to *any* problem and *any* curve just by training the weights A LOT, without changing the architecture at all?

## The honest answer this experiment demonstrates

Theory says *almost*: the **universal approximation theorem** (Cybenko 1989, Hornik 1991) guarantees a fixed-depth net can approximate any continuous function — but only if you're allowed to grow *width*. With architecture truly frozen (fixed width AND depth), capacity is finite, so there exist curves it cannot fit no matter how long you train. The philosophical bite: "train a lot" buys you optimization, not capacity.

The starter pins that down empirically with one frozen MLP (1 → 64 → 64 → 1) trained on progressively nastier 1-D targets:

1. smooth sine — fits fast
2. high-frequency sine — fits slowly (spectral bias: nets learn low frequencies first — Rahaman et al. 2019)
3. discontinuous step — approximates but never nails the jump
4. pure noise (n points) — *memorizes perfectly* once parameters ≫ n, which is the flip side: for finite datasets, "any curve" is true (Zhang et al. 2017, "Understanding deep learning requires rethinking generalization")

So the answer splits: **any finite dataset — yes, eventually (memorization). Any underlying function — no, capacity and spectral bias are real walls.**

## Run

```bash
python3 run.py     # pure numpy, ~1 min; prints loss table, saves out/fits.png if matplotlib
```

## Extension

Sweep width at fixed training budget vs. training budget at fixed width — the two axes the note collapses. Where does an extra 10x of training equal an extra 2x of width?

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
