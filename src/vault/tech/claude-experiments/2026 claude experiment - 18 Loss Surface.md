---
date: 2026-11-17
added: 2026-11-17
title: "Claude experiment 18: Loss Surface"
ai_title: true
tags: [ai/machine-learning/experiments, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-18-loss-surface.html
published: true
---
[machine fiddling]

<ai>
What gradient descent's steps look like on the loss landscape of the same tiny transformer. Pick a learning rate (or a cosine schedule) and a number of steps; the page trains from the same starting weights and draws, left to right: the loss at each step as bars; a 2-D slice of the 82-dimensional landscape through where training ended, along the two directions the path moved most, as contour lines with the steps on top; the same slice zoomed in on the end ("visualize the curves first, approximate a min, then look close there"); and the slice flipped upside down, where descending the loss becomes ascending the gain and the end becomes a maximum.

A slice can mislead: a valley can curve out of the page, so the lowest point on the slice isn't necessarily a minimum of the real loss. Each panel says how much of the path the slice actually captures.

Built by Claude from the loss-surface ideas in Rhea's machine fiddling notes.
</ai>
