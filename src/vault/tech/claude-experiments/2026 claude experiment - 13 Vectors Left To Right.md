---
date: 2026-10-30
added: 2026-11-14
title: "Claude experiment 13: Vectors Left To Right"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-13-vectors-left-to-right.html
published: true
---
[machine fiddling]

**Rhea (Oct 2026):** "can the objects be vectors visually represented rather than all of it being heatmaps, i really value the ability to see things from left to right"

<ai>
No heatmaps: every row of every matrix is an arrow, one panel per stage of the forward pass, scrolling left to right. A weight matrix shows where the unit circle lands under it (an ellipse along the direction it stretches most); a matmul is drawn tip to tail; attention scales each value arrow by its weight and adds them; layer norm snaps each arrow onto its line. Gold is the token being followed.

Built by Claude from this note; the live visualization is above (open it full-screen with "Open live").
</ai>
