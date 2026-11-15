---
date: 2026-10-14
added: 2026-11-14
title: "Claude experiment 13: All The Math"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-13-all-the-math.html
published: true
---
[machine fiddling]

**Note entry (Oct 5 2026):** "Why not make a visualization of all raw data points and every transformation or application to that datapoint graphically over time? I need that visualization."

<ai>
Every number in a tiny transformer (one layer, one head, 82 parameters, every vector 2-D so it can be drawn), in three tabs. Ask: type a prompt, watch it get split into tokens and the model write 8 more. Forward pass: about 20 stages, each one operation, shown as the actual matrices. Training step: the backward pass drawn the same way, then the weights updated and the loss before and after. Press train to step through learning.

Built by Claude from this note; the live visualization is above (open it full-screen with "Open live").
</ai>
