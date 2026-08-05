---
date: 2026-06-01
date_approx: true
title: "Claude experiment 07 — three-body evolution"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 07 — three-body evo

**Note entry (Mar 14 2026):** "the three body problem evolutionary algorithm."

## The experiment

The three-body problem has no general closed-form solution, but *stable periodic orbits exist* (the figure-eight of Chenciner & Montgomery 2000; hundreds more found numerically by Šuvakov & Dmitrašinović 2013 — and notably, later searches used ML/optimization to find thousands). So: **evolve** initial conditions instead of deriving them.

Genome = initial positions + velocities of three equal masses (zero total momentum enforced). Fitness = how long the system survives without a close encounter or an escape, plus a bonus for returning near its initial state (periodicity). Standard GA: tournament selection, gaussian mutation, elitism.

This is the cleanest possible playground for the evolutionary-algorithm intuition: a fitness landscape that's wildly non-convex and chaotic (tiny mutations → totally different trajectories), where gradient methods are useless but evolution still finds islands of stability.

## Run

```bash
python3 run.py            # ~1-2 min: evolves 40 generations, prints best fitness curve
python3 run.py 100        # more generations, better orbits
```

Saves the champion's initial conditions to `out/best.json` and, if matplotlib is installed, its trajectory to `out/orbit.png`.

## Extensions

- Seed the population near the known figure-eight (x1=-x2=(0.970, -0.243), v3=-2v1, v1=(0.466, 0.432)) and measure the basin of stability by mutation radius.
- Multi-objective: stability AND aesthetic symmetry of the orbit — plot the Pareto front.
- The note pairs nicely with #06: this *is* "supervised search over a bounded body" — the GA is the wrapper, the physics is the specialized circuit.

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
