---
date: 2026-06-01
date_approx: true
title: "Claude experiment 03 — sample then correct"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 03 — sample then correct

**Note entry (prob-ML homework):** instead of calculating probabilities first and then sampling (reducing the chance the highest-probability item is chosen), do the opposite — **generate randomly first, then correct by probability.**

## What this is

This is a real family of methods: **rejection sampling** (propose uniformly, accept with probability ∝ target), **Metropolis–Hastings** (propose randomly, correct via accept/reject), and at the LLM scale, **speculative decoding** (a cheap model proposes, the real model corrects). The homework intuition generalizes shockingly far.

The starter makes the note concrete: three samplers targeting the same distribution —

1. **compute-then-sample** — the standard way (softmax, then draw).
2. **propose-then-correct** — draw uniformly, accept/reject against the target (your idea).
3. **propose-then-correct with a cheap proposal** — like speculative decoding: propose from a crude approximation, correct to the exact target.

Measured: all three converge to the same distribution (TV distance), but at very different *costs* — number of target-probability evaluations per accepted sample. That cost curve is the interesting part: propose-then-correct wins exactly when computing the full distribution is expensive but *checking* one candidate is cheap.

## Run

```bash
python3 run.py
```

Prints TV distance to the target for each method and the acceptance/cost accounting. If matplotlib is installed, saves `out/convergence.png`.

## Extension

Apply it to an actual LM head: instead of softmax over 50k logits, propose from a unigram cache and correct with a single logit lookup — measure quality vs. full softmax sampling. (This is the pattern behind your NLA best-of-K reranking too: generate candidates cheaply, let a scorer correct.)

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
