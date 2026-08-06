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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Typed-operator network: a "rotated query tree" where each node is a
specialized, legible operator with learnable parameters.

Task the circuit must learn: SELECT avg(x) FROM rows WHERE x > theta
(theta unknown to the model). Two trainings:
  1. you supervise the circuit directly (random search on params)
  2. a student circuit is trained ONLY on the teacher's outputs (AI trains AI)

Pure numpy.
"""
import numpy as np

rng = np.random.default_rng(3)
TRUE_THETA = 0.7


# --- specialized operators (each one legible: you can read its params) -----
def op_filter(x, theta, sharpness):
    """Soft WHERE x > theta: sigmoid gate instead of hard predicate."""
    return 1 / (1 + np.exp(-sharpness * (x - theta)))


def op_aggregate(x, gate):
    """Soft AVG over gated rows."""
    return (x * gate).sum() / (gate.sum() + 1e-9)


def circuit(params, x):
    theta, sharpness = params
    return op_aggregate(x, op_filter(x, theta, sharpness))


# --- ground truth query -----------------------------------------------------
def true_query(x):
    sel = x[x > TRUE_THETA]
    return sel.mean() if len(sel) else 0.0


def make_batches(n_batches=200, rows=100):
    xs = [rng.normal(0.5, 0.5, size=rows) for _ in range(n_batches)]
    return xs, np.array([true_query(x) for x in xs])


def fit(xs, ys, iters=3000):
    """Random-search 'supervision of a specific circuit' (2 params -> easy)."""
    best, best_loss = None, np.inf
    for _ in range(iters):
        cand = (rng.uniform(-1, 2), rng.uniform(0.5, 40))
        loss = np.mean([(circuit(cand, x) - y) ** 2 for x, y in zip(xs, ys)])
        if loss < best_loss:
            best, best_loss = cand, loss
    return best, best_loss


def main():
    xs, ys = make_batches()

    # 1. supervised circuit
    teacher, t_loss = fit(xs, ys)
    print("=== 1. you supervise the circuit ===")
    print(f"  learned FILTER params: theta={teacher[0]:.3f} (true {TRUE_THETA}), "
          f"sharpness={teacher[1]:.1f}")
    print(f"  mse vs true query: {t_loss:.5f}")
    print("  <- every parameter is READABLE because the node is typed. That's the trade:")
    print("     specialized ops give interpretability; generic neurons give expressivity.\n")

    # 2. AI trains AI: student sees only teacher outputs, never the true query
    teacher_out = np.array([circuit(teacher, x) for x in xs])
    student, s_loss_vs_teacher = fit(xs, teacher_out)
    s_loss_vs_truth = np.mean([(circuit(student, x) - y) ** 2 for x, y in zip(xs, ys)])
    print("=== 2. teacher trains student (student never sees the true query) ===")
    print(f"  student params: theta={student[0]:.3f}, sharpness={student[1]:.1f}")
    print(f"  student mse vs teacher: {s_loss_vs_teacher:.5f}")
    print(f"  student mse vs TRUTH:   {s_loss_vs_truth:.5f}")
    drift = abs(student[0] - teacher[0])
    print(f"  theta drift through the handoff: {drift:.3f}")
    print("\nreading: the student inherits the teacher's *behavior*, bounded by the")
    print("operators it was given — the note's 'body': a set of instructions and bounds")
    print("with which to move. Errors compound across handoffs; try chaining 5 students.")


if __name__ == "__main__":
    main()
```
