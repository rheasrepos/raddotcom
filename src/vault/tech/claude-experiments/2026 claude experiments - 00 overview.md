---
date: 2026-06-01
date_approx: true
title: "Claude experiments — 00: overview"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
kind: [meta/index]
type: programming
published: true
---

# claude experiments

Individual projects spun out of the iCloud note **"machine fiddling"** (Aug 2025 – Mar 2026).
Each folder is self-contained: a README turning the note entry into a concrete experiment, plus a runnable starter script. Everything runs locally (numpy / stdlib / small local models — no API calls), and each project is scoped to be open-sourceable on rad.com on its own.

| Folder | Note entry | Date | Runs with |
|---|---|---|---|
| `01-prompt-evolution` | LLM whose benevolent prompt is re-asked & rewritten each iteration; watch its model of humanity evolve | Aug 23 2025 | transformers + small local model |
| `02-weight-symmetries` | multiply weights/inputs by transpose, transpose's transpose — "every direction of the data" | Nov 19 2025 | numpy |
| `03-sample-then-correct` | generate randomly first, then correct by probability (reverse of the usual order) | prob-ML homework | numpy |
| `04-universal-overfit` | can a fixed architecture fit ANY curve just by training a lot? | phil of AI class | numpy |
| `05-class-direction` | to what degree is *class* encoded in language? plebeian↔aristocrat as a direction, like man↔woman | Dec 2025 (3Blue1Brown) | gensim word vectors |
| `06-query-circuits` | SQL query trees rotated = neural nets with specialized nodes; supervising circuits; AI training AI as "giving it a body" | Mar 9 2026 | numpy |
| `07-threebody-evo` | the three-body-problem evolutionary algorithm | Mar 14 2026 | numpy |
| `08-concurrency-time` | can truly concurrent processes happen to computers? | Mar 9 2026 | stdlib |

## Conventions

- `python3 run.py` inside any folder runs the starter experiment.
- Scripts degrade gracefully: if an optional dependency (matplotlib, gensim, transformers) is missing they say so and continue where possible.
- Results land in each folder's `out/` (gitignored by convention if you init a repo).

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
