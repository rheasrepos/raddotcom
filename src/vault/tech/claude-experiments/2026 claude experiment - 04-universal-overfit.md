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
[machine fiddling]
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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
One frozen architecture (1 -> 64 -> 64 -> 1 MLP), four targets of increasing
nastiness, LOTS of training. Pure numpy with manual backprop (Adam).
Question: does 'train a lot' substitute for changing the architecture?
"""
import numpy as np

rng = np.random.default_rng(2)
H = 64


def targets():
    x = np.linspace(-1, 1, 200)[:, None]
    xn = x[::4]  # noise gets fewer points: memorization needs params >> data
    return {
        "smooth sine":     (x, np.sin(3 * x)),
        "high-freq sine":  (x, np.sin(25 * x)),
        "step (discont.)": (x, np.where(x > 0, 1.0, -1.0)),
        "pure noise (50)": (xn, rng.normal(size=xn.shape)),
    }


def init():
    p = {}
    dims = [1, H, H, 1]
    for i in range(3):
        p[f"W{i}"] = rng.normal(size=(dims[i], dims[i + 1])) * np.sqrt(2 / dims[i])
        p[f"b{i}"] = np.zeros(dims[i + 1])
    return p


def forward(p, x):
    h1 = np.tanh(x @ p["W0"] + p["b0"])
    h2 = np.tanh(h1 @ p["W1"] + p["b1"])
    return (x, h1, h2), h2 @ p["W2"] + p["b2"]


def grads(p, cache, out, y):
    x, h1, h2 = cache
    n = len(x)
    g = {}
    d = 2 * (out - y) / n
    g["W2"], g["b2"] = h2.T @ d, d.sum(0)
    d = d @ p["W2"].T * (1 - h2 ** 2)
    g["W1"], g["b1"] = h1.T @ d, d.sum(0)
    d = d @ p["W1"].T * (1 - h1 ** 2)
    g["W0"], g["b0"] = x.T @ d, d.sum(0)
    return g


def train(p, x, y, steps, lr=3e-3):
    m = {k: np.zeros_like(v) for k, v in p.items()}
    v = {k: np.zeros_like(vv) for k, vv in p.items()}
    checkpoints = {}
    marks = {steps // 100: "1%", steps // 10: "10%", steps: "100%"}
    for t in range(1, steps + 1):
        cache, out = forward(p, x)
        g = grads(p, cache, out, y)
        for k in p:  # Adam
            m[k] = 0.9 * m[k] + 0.1 * g[k]
            v[k] = 0.999 * v[k] + 0.001 * g[k] ** 2
            p[k] -= lr * (m[k] / (1 - 0.9 ** t)) / (np.sqrt(v[k] / (1 - 0.999 ** t)) + 1e-8)
        if t in marks:
            checkpoints[marks[t]] = float(np.mean((forward(p, x)[1] - y) ** 2))
    return p, checkpoints


def main():
    ys = targets()
    steps = 30000
    fits = {}
    print(f"frozen architecture: 1->{H}->{H}->1 tanh MLP, {steps} Adam steps per target\n")
    print(f"{'target':18} {'mse @1%':>10} {'mse @10%':>10} {'mse @100%':>10}")
    print("-" * 52)
    for name, (x, y) in ys.items():
        p, ck = train(init(), x, y, steps)
        fits[name] = forward(p, x)[1]
        print(f"{name:18} {ck['1%']:>10.5f} {ck['10%']:>10.5f} {ck['100%']:>10.5f}")

    print("\nreading: smooth fits early; high-freq needs the '10x more training' (spectral")
    print("bias); the step never truly resolves the jump (capacity/continuity wall); noise")
    print("memorizes because params >> data points. 'Any finite dataset: yes. Any")
    print("function: no.'")

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt, os
        os.makedirs("out", exist_ok=True)
        fig, axes = plt.subplots(2, 2, figsize=(10, 6))
        for ax, (name, (x, y)) in zip(axes.ravel(), ys.items()):
            ax.plot(x, y, ".", ms=3, label="target")
            ax.plot(x, fits[name], lw=1.5, label="fit")
            ax.set_title(name); ax.legend(fontsize=7)
        fig.suptitle("one frozen architecture, trained A LOT, four curves")
        fig.tight_layout(); fig.savefig("out/fits.png", dpi=120)
        print("saved out/fits.png")
    except ImportError:
        print("(matplotlib not installed — skipped plot)")


if __name__ == "__main__":
    main()
```
