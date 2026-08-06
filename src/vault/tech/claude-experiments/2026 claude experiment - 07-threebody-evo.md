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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Evolving stable three-body orbits. Genome = initial positions/velocities of
3 equal masses; fitness = survival time without escape/collision + periodicity
bonus. Pure numpy (RK4 integrator + simple GA).

Usage: python3 run.py [GENERATIONS]
"""
import sys, os, json
import numpy as np

rng = np.random.default_rng(4)
G = 1.0
DT = 0.01
T_MAX = 20.0
POP = 60
ELITE = 6


def accelerations(pos):
    a = np.zeros_like(pos)
    for i in range(3):
        for j in range(3):
            if i != j:
                d = pos[j] - pos[i]
                r = np.linalg.norm(d)
                a[i] += G * d / (r ** 3 + 1e-9)
    return a


def rk4_step(pos, vel):
    k1v = accelerations(pos);              k1x = vel
    k2v = accelerations(pos + 0.5 * DT * k1x); k2x = vel + 0.5 * DT * k1v
    k3v = accelerations(pos + 0.5 * DT * k2x); k3x = vel + 0.5 * DT * k2v
    k4v = accelerations(pos + DT * k3x);       k4x = vel + DT * k3v
    return (pos + DT / 6 * (k1x + 2 * k2x + 2 * k3x + k4x),
            vel + DT / 6 * (k1v + 2 * k2v + 2 * k3v + k4v))


def genome_to_state(g):
    pos = g[:6].reshape(3, 2)
    vel = g[6:].reshape(3, 2)
    vel -= vel.mean(axis=0)          # zero total momentum
    pos -= pos.mean(axis=0)          # centered
    return pos, vel


def fitness(g, record=False):
    pos, vel = genome_to_state(g.copy())
    pos0 = pos.copy()
    traj = [pos.copy()] if record else None
    t, periodic_bonus = 0.0, 0.0
    while t < T_MAX:
        pos, vel = rk4_step(pos, vel)
        t += DT
        d01 = np.linalg.norm(pos[0] - pos[1])
        d02 = np.linalg.norm(pos[0] - pos[2])
        d12 = np.linalg.norm(pos[1] - pos[2])
        if min(d01, d02, d12) < 0.08:            # close encounter (chaos ahead)
            break
        if max(np.linalg.norm(pos, axis=1)) > 2.5:  # left the neighborhood
            break
        if t > 2.0:                              # continuous periodicity reward
            periodic_bonus = max(periodic_bonus,
                                 5.0 * np.exp(-4 * np.linalg.norm(pos - pos0)))
        if record:
            traj.append(pos.copy())
    return (t + periodic_bonus, np.array(traj)) if record else t + periodic_bonus


def evolve(generations):
    pop = rng.normal(0, 0.6, size=(POP, 12))
    best_hist = []
    for gen in range(generations):
        fit = np.array([fitness(g) for g in pop])
        order = np.argsort(fit)[::-1]
        pop, fit = pop[order], fit[order]
        best_hist.append(fit[0])
        if gen % 5 == 0 or gen == generations - 1:
            print(f"gen {gen:>3}: best fitness {fit[0]:6.2f}  "
                  f"(survival+bonus; max possible {T_MAX + 5:.0f})  mean {fit.mean():5.2f}")
        # next generation: elites + mutated tournament winners
        nxt = [pop[i].copy() for i in range(ELITE)]
        while len(nxt) < POP:
            i, j = rng.integers(POP // 2, size=2)
            parent = pop[min(i, j)]
            child = parent + rng.normal(0, 0.05, size=12)
            nxt.append(child)
        pop = np.array(nxt)
    return pop[0], best_hist


def main():
    generations = int(sys.argv[1]) if len(sys.argv) > 1 else 40
    best, hist = evolve(generations)
    score, traj = fitness(best, record=True)
    print(f"\nchampion: fitness {score:.2f}, survived {len(traj) * DT:.1f}s of {T_MAX:.0f}s")

    os.makedirs("out", exist_ok=True)
    with open("out/best.json", "w") as f:
        json.dump({"genome": best.tolist(), "fitness": float(score)}, f, indent=2)
    print("saved out/best.json (rerun exact orbit from these initial conditions)")

    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        plt.figure(figsize=(6, 6))
        for i, c in enumerate(["tab:red", "tab:blue", "tab:green"]):
            plt.plot(traj[:, i, 0], traj[:, i, 1], c=c, lw=0.8, label=f"body {i}")
            plt.plot(traj[0, i, 0], traj[0, i, 1], "o", c=c)
        plt.axis("equal"); plt.legend(); plt.title(f"evolved orbit (fitness {score:.1f})")
        plt.tight_layout(); plt.savefig("out/orbit.png", dpi=120)
        print("saved out/orbit.png")
    except ImportError:
        print("(matplotlib not installed — skipped orbit plot)")


if __name__ == "__main__":
    main()
```
