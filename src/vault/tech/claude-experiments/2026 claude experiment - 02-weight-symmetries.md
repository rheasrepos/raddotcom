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
