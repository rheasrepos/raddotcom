---
date: 2026-11-17
added: 2026-11-17
title: "Claude experiment 17: Probe Mode"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-17-probe-mode.html
published: true
---
[machine fiddling]

<ai>
The same tiny transformer as Vectors Left To Right, but instead of following the tokens it pushes a grid and a unit circle through each stage, the way 3Blue1Brown pushes a grid through a matrix. A weight matrix W turns the circle into an ellipse whose long axis is the direction it stretches most; its transpose stretches by exactly the same amounts along different directions; WᵀW only stretches, with no rotation. The MLP is the first place the grid bends: the relu units fold the plane into flat pieces with creases. RMSNorm collapses the whole plane onto a single circle. A small probe circle around the token you pick shows how each nonlinear stage distorts space right where that token is.

Built by Claude from the ML visualization chat. Pick the matrix in the bar; press "train 10 epochs" to watch the shapes change as the weights learn.
</ai>
