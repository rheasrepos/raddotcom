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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Sample-then-correct vs compute-then-sample. Pure numpy.
Three samplers targeting the same categorical distribution; compare
convergence (TV distance) and cost (target evaluations per accepted draw).
"""
import numpy as np

rng = np.random.default_rng(1)
K = 50            # vocabulary size
N = 20000         # samples per method


def make_target(k=K, temp=1.0):
    logits = rng.normal(size=k) * 2
    p = np.exp(logits / temp)
    return p / p.sum()


def tv(p, q):
    return 0.5 * np.abs(p - q).sum()


def empirical(samples, k=K):
    c = np.bincount(samples, minlength=k).astype(float)
    return c / c.sum()


def compute_then_sample(p, n):
    """Standard: full distribution known, draw directly. Cost: K evals once."""
    return rng.choice(len(p), size=n, p=p), len(p)


def propose_then_correct(p, n):
    """Uniform proposal, accept with prob p[i]/max(p). Cost: 1 eval per proposal."""
    m = p.max()
    out, evals = [], 0
    while len(out) < n:
        i = rng.integers(len(p))
        evals += 1
        if rng.random() < p[i] / m:
            out.append(i)
    return np.array(out), evals


def propose_cheap_then_correct(p, n):
    """Speculative-style: propose from a crude approximation q, correct to p."""
    q = 0.5 * p + 0.5 / len(p)          # cheap proposal: smoothed target
    w = p / q
    m = w.max()
    out, evals = [], 0
    while len(out) < n:
        i = rng.choice(len(p), p=q)
        evals += 1
        if rng.random() < w[i] / m:
            out.append(i)
    return np.array(out), evals


def main():
    p = make_target()
    print(f"target: K={K}, entropy={-np.sum(p*np.log(p)):.2f} nats, max prob={p.max():.3f}\n")

    results = {}
    for name, fn in [("compute-then-sample", compute_then_sample),
                     ("propose-then-correct (uniform)", propose_then_correct),
                     ("propose-then-correct (cheap proposal)", propose_cheap_then_correct)]:
        s, evals = fn(p, N)
        results[name] = s
        print(f"{name}")
        print(f"  TV distance to target: {tv(empirical(s), p):.4f}")
        print(f"  target evaluations: {evals}  ({evals / N:.2f} per accepted sample)\n")

    print("punchline: all three converge to the SAME distribution — randomness first,")
    print("probability as the corrector, is exact. The difference is pure cost, and the")
    print("cheap-proposal variant (speculative decoding's trick) closes most of the gap.")

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt, os
        os.makedirs("out", exist_ok=True)
        ns = np.unique(np.geomspace(100, N, 20).astype(int))
        plt.figure(figsize=(7, 4))
        for name, s in results.items():
            plt.plot(ns, [tv(empirical(s[:n]), p) for n in ns], label=name)
        plt.xscale("log"); plt.yscale("log")
        plt.xlabel("samples"); plt.ylabel("TV distance to target"); plt.legend()
        plt.title("sample-then-correct converges like compute-then-sample")
        plt.tight_layout(); plt.savefig("out/convergence.png", dpi=120)
        print("saved out/convergence.png")
    except ImportError:
        print("(matplotlib not installed — skipped plot)")


if __name__ == "__main__":
    main()
```
