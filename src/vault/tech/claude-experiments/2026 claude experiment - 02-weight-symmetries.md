---
date: 2026-06-01
date_approx: true
title: "Claude experiment 02 — weight symmetries"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 02 — weight symmetries

**Note entry (Nov 19 2025):** take the inputs to a model — or the weights — and multiply by its transpose, its transpose's transpose... "every possible, or at least four-way, direction of the data."

## What this already is (and where it goes further)

Multiplying by the transpose is not idle fiddling — it's the front door to most of linear-algebra-based interpretability:

- **X·Xᵀ / Xᵀ·X** of inputs are Gram/covariance matrices → their eigenvectors are PCA.
- **W·Wᵀ and Wᵀ·W** of a weight matrix share nonzero eigenvalues, and those are the squared **singular values** of W → SVD. The singular vectors are the directions a layer amplifies or kills.
- Products in "every direction" (WᵀW, WWᵀ, WᵀWWᵀW, ...) are how you compute **effective rank**, **anisotropy**, and layer-to-layer signal propagation. (Wᵀᵀ = W, so the interesting objects are the two Grams and their powers.)

So the experiment: train a small net, then look at all four products per layer and ask *what changed relative to random initialization* — training should carve low-rank structure into the Grams.

## Run

```bash
python3 run.py    # trains a tiny MLP on synthetic data (pure numpy),
                  # then prints per-layer spectra of W, W·Wt, Wt·W at init vs after training
```

Measured per layer: top singular values, effective rank (participation ratio), and the alignment between input covariance eigenvectors and the layer's right singular vectors — i.e. does the layer learn to "point at" the data's principal directions?

## Extensions

- Do it on real checkpoints (your NLA LoRA matrices — A·B products are already low-rank by construction; measure how their singular directions rotate over training).
- Fourth-order version: the note's "four-way direction" reads naturally as (XᵀX)² / higher moments — compare eigenvectors of the Gram vs Gram² (same eigenvectors, powered eigenvalues — verifying that numerically is a good exercise in why "transpose of transpose" saturates fast).

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
- [[Topic - ai · machine-learning · interpretability]]


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Weight symmetries: W, W·Wt, Wt·W at initialization vs after training.
Pure numpy — trains a tiny 2-layer MLP on synthetic low-rank data,
then compares layer spectra before/after.
"""
import numpy as np

rng = np.random.default_rng(0)


def make_data(n=2000, d=16, true_rank=3):
    """Inputs with hidden low-rank structure; targets depend on that structure."""
    U = rng.normal(size=(d, true_rank))
    z = rng.normal(size=(n, true_rank))
    X = z @ U.T + 0.1 * rng.normal(size=(n, d))
    y = np.tanh(z @ rng.normal(size=true_rank))[:, None]
    return X, y


def init_net(d, h=32):
    return {"W1": rng.normal(size=(d, h)) / np.sqrt(d),
            "b1": np.zeros(h),
            "W2": rng.normal(size=(h, 1)) / np.sqrt(h),
            "b2": np.zeros(1)}


def forward(p, X):
    a = np.tanh(X @ p["W1"] + p["b1"])
    return a, a @ p["W2"] + p["b2"]


def train(p, X, y, lr=0.05, epochs=400):
    n = len(X)
    for _ in range(epochs):
        a, out = forward(p, X)
        g_out = 2 * (out - y) / n
        p["W2"] -= lr * a.T @ g_out
        p["b2"] -= lr * g_out.sum(0)
        g_a = g_out @ p["W2"].T * (1 - a ** 2)
        p["W1"] -= lr * X.T @ g_a
        p["b1"] -= lr * g_a.sum(0)
    return p


def eff_rank(s):
    """Participation ratio of singular values."""
    s2 = s ** 2
    return (s2.sum() ** 2) / (s2 ** 2).sum()


def spectrum_report(name, W):
    s = np.linalg.svd(W, compute_uv=False)
    gram_eigs = np.linalg.eigvalsh(W @ W.T)[::-1]
    print(f"  {name}: shape={W.shape}  top-5 singular values: {np.round(s[:5], 3)}")
    print(f"    eff. rank {eff_rank(s):.2f} / {min(W.shape)}   "
          f"(check: sqrt of W·Wt eigs == singular values: "
          f"{np.allclose(np.sqrt(np.clip(gram_eigs[:len(s)], 0, None)), s)})")
    return s


def alignment(X, W):
    """How aligned are data principal directions with the layer's input singular vectors?"""
    _, _, Vt_data = np.linalg.svd(X - X.mean(0), full_matrices=False)
    U_w, _, _ = np.linalg.svd(W, full_matrices=False)
    overlap = np.abs(Vt_data[:3] @ U_w[:, :3])
    return overlap.max(axis=1)


def main():
    X, y = make_data()
    p = init_net(X.shape[1])
    W1_init = p["W1"].copy()

    print("=== data Gram (Xt·X): the 'multiply by transpose' of the INPUTS ===")
    eig = np.linalg.eigvalsh((X - X.mean(0)).T @ (X - X.mean(0)) / len(X))[::-1]
    print(f"  top-6 eigenvalues: {np.round(eig[:6], 2)}  <- low-rank structure visible (planted rank 3)")

    print("\n=== layer 1 at INIT ===")
    s_init = spectrum_report("W1", W1_init)
    print(f"  alignment of data PCs with W1 singular vectors: {np.round(alignment(X, W1_init), 2)}")

    _, out0 = forward(p, X)
    p = train(p, X, y)
    _, out1 = forward(p, X)
    print(f"\ntraining: mse {np.mean((out0 - y) ** 2):.4f} -> {np.mean((out1 - y) ** 2):.4f}")

    print("\n=== layer 1 AFTER TRAINING ===")
    s_trained = spectrum_report("W1", p["W1"])
    print(f"  alignment of data PCs with W1 singular vectors: {np.round(alignment(X, p['W1']), 2)}")

    print("\n=== the punchline ===")
    dW = p["W1"] - W1_init
    s_delta = np.linalg.svd(dW, compute_uv=False)
    print(f"  eff. rank: W_init {eff_rank(s_init):.2f}, W_trained {eff_rank(s_trained):.2f}, "
          f"but the UPDATE dW = W_trained - W_init: {eff_rank(s_delta):.2f}")
    print("  <- training's contribution is low-rank (the planted rank-3 structure lives in dW,")
    print("     not in W itself — same reason LoRA works).")
    print("  Gram^2 check: eigenvectors of (Wt·W) are eigenvectors of (Wt·W)^2, eigs squared —")
    G = p["W1"].T @ p["W1"]
    e1, v1 = np.linalg.eigh(G)
    print(f"  G^2 v == e^2 v for all eigvecs: {np.allclose(G @ G @ v1, v1 * e1 ** 2)}")
    print("  ('transpose of transpose' saturates: two Grams + their powers is the whole family)")


if __name__ == "__main__":
    main()
```
