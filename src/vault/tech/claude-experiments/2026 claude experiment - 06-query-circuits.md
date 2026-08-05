---
date: 2026-06-01
date_approx: true
title: "Claude experiment 06 — query circuits"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 06 — query circuits

**Note entry (Mar 9 2026, 10:34pm):** rotate a SQL parse tree and it looks like a neural net (a graph). What if neurons were *specialized* — each node a query-execution operator, weights passed through specialized functions? Is that what ML was before it was "AI"? A wrapper supervising specific circuits and blocks; maybe intelligence emerges from AI training another model — training as "giving the AI a body, a set of instructions and bounds with which to move."

## Where this idea actually lives

You independently arrived at several real research programs:

- **Typed/specialized nodes instead of uniform neurons** → Neural Module Networks (Andreas et al. 2016), mixture-of-experts, and differentiable-programming approaches; also the pre-deep-learning era the note guesses at (hand-built feature pipelines = specialized circuits, exactly "what ML was before it was AI").
- **Query trees as learnable graphs** → learned query optimizers (Neo, Marcus et al. 2019; SageDB) literally put neural nets inside query-execution nodes.
- **Supervising circuits and blocks** → circuit-level interpretability + modular training.
- **AI training another model as embodiment** → teacher–student distillation, RLHF reward models, and your own GRPO run (an AI-scored objective training the AV model).

## The starter

A tiny **typed-operator network**: nodes are FILTER / JOIN-ish (gated combine) / AGGREGATE operators, each with a couple of learnable parameters, wired like a rotated query tree. It's trained two ways on the same task ("SELECT avg(x) WHERE x > θ" on synthetic rows — the net must *discover* θ):

1. **direct search** on the parameters (you supervising the circuit), and
2. **teacher-trains-student**: a second copy is trained only on the first model's outputs — the note's "AI training AI" — and you measure what survives the handoff.

Because every node has a *meaning*, you can read the learned parameters directly — interpretability for free, the note's core trade: expressivity vs. legibility.

## Run

```bash
python3 run.py    # pure numpy
```

## The concurrency aside

The note's "can truly concurrent processes happen to computers?" got its own project — see `08-concurrency-time`.

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
