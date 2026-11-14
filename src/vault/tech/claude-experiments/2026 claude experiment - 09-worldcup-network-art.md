---
date: 2026-10-30
added: 2026-11-14
title: "Claude experiment 09 — world cup network art"
ai_title: true
tags: [ai/machine-learning/experiments]
affiliation: independent
type: programming
published: true
---
[machine fiddling]
# 09 — world cup network art

**Rhea (Gemini chat, Jul 19 2026):** "I want to create a program that looks at the world cup and traces the pattern of everyone on the spain team as a node and then adds connections to everyone and sees how the shape within the field changes over time? its as if you were overlaying all footage from teh 2026 world cup final? i think this would make an interesteing art piece!!"

<ai>
## The experiment

A team is a dynamic spatial graph G(t) = (V, E): 10 outfield players as nodes, edges from spatial structure (Delaunay neighbors, or proximity < θ meters). Instead of clearing each frame, edges accumulate at low opacity — 90 minutes of collective movement compress into one glowing geometric footprint. Attack stretches the convex hull; defense contracts it; the overlay is the time-integral of team shape.

The full pipeline (broadcast footage → YOLO/ByteTRACK → jersey-color team mask → homography to pitch coordinates) needs video + GPU models, so this starter splits cleanly in two:

1. **`run.py` (here, pure numpy):** takes tracking data as CSV (`frame,player,x,y` in meters) and renders the accumulated network overlay. If no CSV is given it **simulates** a plausible match — a 4-3-3 formation whose centroid drifts end-to-end while compactness breathes with attack/defense phases — so the aesthetic can be iterated on today, before any computer vision.
2. **Extraction (later):** ultralytics YOLO + ByteTRACK + OpenCV homography produce exactly that CSV from real footage. The renderer never has to change.

Edge rule is pluggable: `--edges delaunay` (scipy if available, else greedy proximity fallback), `--edges proximity` (default θ = 15 m), `--edges mesh` (K₁₀, opacity ∝ 1/distance).

## Run

```bash
python3 run.py                          # simulate 90 "minutes", render out/overlay.png
python3 run.py --edges mesh             # full K10 mesh, distance-weighted
python3 run.py --csv tracking.csv       # use real tracking data instead
```

Saves the trail image to `out/overlay.png` (matplotlib; without it, saves a raw accumulation grid to `out/overlay.pgm`) and per-frame hull area / team width to `out/shape.csv` — the "breathing" signal, plottable on its own.

### Live, over anything playing on screen

```bash
pip install mss opencv-python ultralytics   # once
python3 live.py                             # drag a box over the video, ENTER
```

No recording needed: `live.py` captures a screen region in real time (any YouTube video, the FOX replay, any team sport), detects the people in it, and accumulates the graph in its own window while you watch. Keys: `q` quit, `r` reset canvas = manual era break (saves `out/live_era_NN.png`), `s` snapshot, `a` toggle experimental auto-era, `m` toggle onion skin — all accumulated movement vs. only the current formation (edges + node dots, brighter; accumulation continues underneath, so toggling back loses nothing).

**Broadcast noise → three defenses:**

- `c` — team calibration: click one player of your team; every detection is jersey-color-matched (mean torso HSV, circular hue distance) and non-matches (other team, refs) are dropped, capped at `--players` (default 10) nodes.
- Camera cuts: a frame-difference detector pauses accumulation ~0.7 s on cuts/zooms, and frames with fewer than `--min-players` (default 4) team detections (close-ups, replays) are skipped.
- `h` — pitch homography: click the 4 corners of the `--side` penalty area and detections are mapped to a **fixed 105×68 m pitch canvas** in real coordinates — pans stop smearing, proximity becomes true meters (θ = 15 m), and the art becomes the actual shape on the actual field. Manual calibration only holds while the camera angle holds (re-press `h` after changes) — best on wide/tactical angles; per-frame automatic homography via a pitch-keypoint model is the proper extension. `--display trail` shows the art alone on black. macOS will ask for Screen Recording permission for the terminal on first run; keep the art window outside the captured region (feedback loop otherwise); DRM players in Safari may capture black — use Chrome.

### Drawing language (live.py)

Player movement paths draw at full `--line-width` (default 4); player-to-player connection lines at half that; **passes** — ball possession jumping from one of your players to another, YOLO ball tracking + 2-frame possession confirmation — as permanent straight hot-pink lines at full width (status bar counts them; `--no-ball` disables). Era resets clear pass lines along with the trail.

### Pro mode: tested open-source components (roboflow/sports)

```bash
pip install "git+https://github.com/roboflow/sports.git"      # team classifier
pip install inference supervision                              # auto homography
export ROBOFLOW_API_KEY=...                                    # free, roboflow.com

python3 live.py --team-mode embed --device mps --auto-pitch
```

`pro_adapters.py` lifts two components from [roboflow/sports](https://github.com/roboflow/sports) into the live workflow: their SigLIP-embedding **team classifier** (learns both kits by appearance during `--warmup` seconds, then labels each tracked ID by 3-frame majority vote — replaces HSV matching entirely, immune to shadows and red hue-wrap) and their **pitch keypoint model**, which refreshes the homography every ~2 s in a background thread (`pitch auto` in the status bar) — no clicking, survives every pan. `t` flips which team is targeted; `n` selection still works on top and re-seeds itself from the classifier after cuts/seeks. Related projects if this outgrows the live hack: SoccerNet/TrackLab (benchmark-grade tracking + calibration), TVCalib (camera calibration), Norfair (lightweight tracking).

### Compositing over real footage

```bash
python3 compose.py --video final.mp4                  # tier 1: simulated layer over footage
python3 compose.py --video final.mp4 --mode detect    # tier 2: graph on YOLO-detected players

# the full-final recording, Spain only (tested Oct 30 on a 3-min chunk of it):
V="Screen Recording 2026-07-20 at 1.32.51 PM.mov"     # typing it is fine — see note
python3 compose.py --video "$V" --mode detect --team-hsv 0,180,150 \
    --start 39:50 --max-frames 7200 --stride 15       # 2-min test chunk first
python3 compose.py --video "$V" --mode detect --team-hsv 0,180,150 \
    --stride 15 --breaks 1:13:00,1:21:30              # whole match, one image per lineup (example times — use the real sub moments)
```

`--start` (seconds, mm:ss or h:mm:ss) skips pre-match or picks a test chunk; `--team-hsv` keeps one team by shirt color (same jersey logic as `live.py`); a frame-difference cut detector pauses drawing ~0.7 s after replays/close-ups, and the run ends with a `frames: N drawn, N paused for cuts, …` summary. Ink is scaled by `--stride`, so a strided run is as bright as a full one. **Filename note:** macOS puts an invisible narrow no-break space (U+202F) before "PM" in screen-recording names, so a typed name never matched; `compose.py` now resolves it automatically.

**Eras (substitutions → a new image):** `--breaks 46:00,1:13:00` (video timestamps — the recording's clock, not the match clock; h:mm:ss works) closes the current accumulation and starts a fresh canvas at each break — one image per lineup, saved as `out/era_01.png`, `era_02.png`, …. Sub minutes come from the match report; add your recording's kickoff offset. `--auto-eras` (detect mode) tries to find subs itself via ByteTRACK IDs — an era break fires only when a new ID has persisted ≥4 s *and* an established ID (≥12 s of life) has been gone ≥8 s, with a 45 s cooldown — but broadcast cuts churn IDs, so treat it as an experiment; `--breaks` is the reliable path.

Needs `opencv-python`; `--mode detect` also needs `ultralytics` (yolov8n weights auto-download). Edges accumulate additively and are colored by match clock (kickoff = cold blue → final whistle = hot orange). Writes `out/composite.mp4` plus the accumulated trail alone as `out/composite_trail.png`. Tier 2 works in raw pixel space — no homography — so proximity is perspective-distorted; without `--team-hsv` it connects *all* detected people (both teams, refs). Pixel→pitch→pixel reprojection is the next step (see Extensions). Footage note: the FOX/FIFA replay is DRM-streamed — screen-record locally for personal experimentation; a piece made from that footage can't be published without rights clearance.

## Extensions

- Feed it the actual final: run YOLOv8 + ByteTRACK on broadcast footage, homography via pitch keypoints, filter Spain by HSV jersey clustering → CSV.
- Color edges by match clock (kickoff = cold, final whistle = hot) so the overlay encodes *when*, not just *where*.
- Both teams at once, two palettes — the interference pattern between two breathing hulls.
- Pairs with #07: the hull-area time series is a fitness-like scalar extracted from chaotic multi-agent motion.
</ai>

![composite_trail.png](/artifacts/claude-experiments/composite_trail.png)

![overlay.png](/artifacts/claude-experiments/overlay.png)

![era_01.png](/artifacts/claude-experiments/era_01.png)

![era_02.png](/artifacts/claude-experiments/era_02.png)

![era_03.png](/artifacts/claude-experiments/era_03.png)
