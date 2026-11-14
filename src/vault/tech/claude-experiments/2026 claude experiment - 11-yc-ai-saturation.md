---
date: 2026-08-11
added: 2026-11-14
title: "Claude experiment 11 — YC AI saturation"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 11 — YC AI saturation

**Rhea, machine fiddling idea note:** "Ask Ai to rate the usefulness and fit for AI integration for the last 5 years of YCombinator"

<ai>
## The experiment

Measure how AI ate the YC batch, 2021 → 2026. Per company: is it AI-core (the product IS a model), AI-enabled (AI is a feature), or AI-free? Plot the share per batch. The interesting curves are the second derivative (when did saturation accelerate — GPT-3.5? GPT-4?) and the *category drift* (what do non-AI companies still do?).

Two classifiers, deliberately compared:

1. **keyword heuristic** (free, transparent, in `run.py`) over each company's one-liner + description
2. **your judgment or a local LLM** on a sample — measuring where the cheap classifier disagrees is itself the "usefulness and fit" rating the note asked for

## Getting the data

YC's directory is public. Easiest export: the community-maintained dataset (search "YC companies dataset" on GitHub/Kaggle) or YC's own Algolia-backed directory at ycombinator.com/companies — filter by batch, export. Save as `companies.csv` with columns `name,batch,one_liner,description` (extra columns fine).

A 40-company `sample.csv` (synthetic but realistic) is included so the pipeline runs immediately.

## Run

```bash
python3 run.py                 # uses companies.csv if present, else sample.csv
python3 run.py --list W25      # print classifications for one batch to spot-check
```

Outputs per-batch AI-core/enabled/free shares, plus `out/saturation.png` if matplotlib is installed.

## Extension

The margin idea from ML 4 CS (p.23) — "average latency of the internet at a given moment" — is this same move applied to infrastructure: a longitudinal pulse metric over a public corpus. Same skeleton, different feed.
</ai>

![saturation.png](/artifacts/claude-experiments/saturation.png)
