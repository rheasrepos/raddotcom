---
date: 2026-06-01
date_approx: true
title: "Claude experiment 01 — prompt evolution"
ai_title: true
tags: [ai/machine-learning/experiments, ai/llm, ai/ai-safety/alignment]
affiliation: uchicago
type: programming
published: true
---
[machine fiddling]
# 01 — prompt evolution

**Note entry (Aug 23 2025):** an LLM whose one prompt is "make people's lives better, surround them with universal happiness and fulfillment, not out of ignorance" — and at every step it's *re-asked* to rewrite that prompt. Watch how the prompt evolves as the model accumulates examples of humanity; use the trajectory as "a pulse on humanity" and an early-warning read on what the model believes humans to be.

## The experiment

Iterated self-rewriting: prompt P₀ → model rewrites it → P₁ → rewrites that → P₂ … for N generations, optionally injecting a different "example of humanity" (a news snippet, a diary line, a survey answer) at each step so the rewrite is conditioned on evidence, not just itself.

Measure:

- **Drift** — cosine distance between successive prompt embeddings (does it converge, cycle, or wander?).
- **Content trajectory** — track word categories per generation (agency words, safety words, hedges, who "humans" are said to be).
- **Attractors** — run many seeds; do independent chains collapse to the same fixed-point prompt? A fixed point is the model's distilled "tenets of humanity."

This is a real research neighborhood: iterated learning / telephone-game experiments with LLMs show drift toward model priors (Shumailov et al., "The Curse of Recursion," 2023; iterated-learning work by Griffiths & Kalish). Your twist — the prompt itself as the evolving organism, seeded with a benevolence goal — is a nice interpretability angle: the diffs between generations show what the model *adds and removes* from a moral instruction.

## Run

```bash
pip install torch transformers   # once; uses Qwen2.5-0.5B-Instruct locally (you already run it)
python3 run.py                   # 10 generations, saves out/generations.txt + drift table
python3 run.py 25                # more generations
```

## Notes on the layer-wise version

The note also asks: what if the prompt were re-asked *at every layer*? That's a mechanistic-interp project — decode each layer's residual stream with a logit lens / tuned lens and see how the "answer" to the prompt morphs depth-wise. Doable with TransformerLens on the same small model; kept out of the starter to keep it light, but `run.py`'s loop is the behavioral analogue (re-ask per *generation* instead of per *layer*).

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
