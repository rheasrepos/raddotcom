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


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Can truly concurrent processes happen to computers?
Same CPU-bound work three ways (sequential / threads / processes), with
per-worker progress timestamps, then a clock-resolution test for whether
"simultaneous" is even observable. Stdlib only.
"""
import time, os, threading, multiprocessing as mp

N_WORKERS = 4
WORK = 2_000_00  # per worker


def burn(_):
    """CPU-bound work; returns (pid, start, end) timestamps."""
    start = time.perf_counter()
    x = 0
    for i in range(WORK):
        x += i * i % 7
    return os.getpid(), start, time.perf_counter()


def run_sequential():
    t0 = time.perf_counter()
    spans = [burn(i) for i in range(N_WORKERS)]
    return time.perf_counter() - t0, spans


def run_threads():
    spans = [None] * N_WORKERS

    def task(i):
        spans[i] = burn(i)

    t0 = time.perf_counter()
    ts = [threading.Thread(target=task, args=(i,)) for i in range(N_WORKERS)]
    [t.start() for t in ts]; [t.join() for t in ts]
    return time.perf_counter() - t0, spans


def run_processes():
    t0 = time.perf_counter()
    with mp.Pool(N_WORKERS) as pool:
        spans = pool.map(burn, range(N_WORKERS))
    return time.perf_counter() - t0, spans


def overlap_report(spans):
    """Do any two workers' [start, end] spans overlap in wall time?"""
    n_overlap = 0
    for i in range(len(spans)):
        for j in range(i + 1, len(spans)):
            _, s1, e1 = spans[i]
            _, s2, e2 = spans[j]
            if max(s1, s2) < min(e1, e2):
                n_overlap += 1
    return n_overlap


def clock_floor():
    """Smallest measurable gap between successive perf_counter reads."""
    gaps = []
    for _ in range(10000):
        a = time.perf_counter(); b = time.perf_counter()
        if b > a:
            gaps.append(b - a)
    return min(gaps)


def main():
    print(f"{N_WORKERS} workers, CPU-bound loop each\n")
    results = {}
    for name, fn in [("sequential", run_sequential),
                     ("threads   ", run_threads),
                     ("processes ", run_processes)]:
        wall, spans = fn()
        results[name] = wall
        pids = {p for p, _, _ in spans}
        print(f"{name}: {wall:.3f}s  wall-time overlapping pairs: "
              f"{overlap_report(spans)}/{N_WORKERS*(N_WORKERS-1)//2}  distinct PIDs: {len(pids)}")

    seq, thr, proc = results["sequential"], results["threads   "], results["processes "]
    print(f"\nspeedups: threads {seq/thr:.2f}x (GIL: interleaved, not simultaneous), "
          f"processes {seq/proc:.2f}x (real parallelism)")

    floor = clock_floor()
    print(f"\nclock resolution floor: {floor*1e9:.0f} ns — events closer than this")
    print("cannot be ordered by this machine's clock at all. Below that line,")
    print("'simultaneous' isn't true or false; it's unmeasurable (Lamport's point).")


if __name__ == "__main__":
    main()
```
