---
date: 2026-06-01
date_approx: true
title: "Claude experiment 08 — concurrency & time"
ai_title: true
tags: [academic/computer-science, ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 08 — concurrency & time

**Note entry (Mar 9 2026):** "concurrency is cool because it deals with time — can truly concurrent processes happen to computers?"

## The question, sharpened

"Truly concurrent" can mean three different things, and the answer differs for each:

1. **Simultaneous execution** — yes, physically: separate cores execute instructions in the same clock cycle. (Single core + threads is interleaving, not simultaneity — Python's GIL makes this vivid.)
2. **Simultaneous *observation*** — murkier: there is no single global "now" inside a machine. Cores have their own caches and store buffers; two cores can disagree about the order of two writes (memory-model reordering). Lamport's "Time, Clocks, and the Ordering of Events" (1978) is the classic: in distributed systems, time is *partial order*, and "at the same time" is often undefined rather than true or false.
3. **Metaphysically shared time** — the phil-of-AI version: relativity says spatially separated events have no absolute simultaneity anyway, so "truly concurrent" may not be a property the universe offers anything, computers included.

## The starter demonstrates 1 and glances at 2

`run.py` (stdlib only) runs the same CPU-bound work three ways — sequential, threads, processes — and timestamps fine-grained progress ticks from each worker:

- Threads: no speedup (GIL) but *interleaved* ticks → concurrency without parallelism.
- Processes: real speedup and ticks with overlapping timestamps from different PIDs → the closest a computer gets to "truly concurrent."
- Then it measures the resolution floor: how close two timestamps from different processes can be before the clock itself can't order them — your "is simultaneity even observable" question, in microseconds.

## Run

```bash
python3 run.py
```

## Reading list

Lamport 1978 (logical clocks); "happens-before" in the Java/C++ memory models; vector clocks; Hewitt's actor model. The bridge back to the note's ML thread: asynchronous SGD (Hogwild!, Recht et al. 2011) trains models with *racing* concurrent writes on purpose — noise from broken simultaneity acting as regularizer.

## Topics
- [[Topic - academic]]
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
- [[Topic - academic · computer-science]]
