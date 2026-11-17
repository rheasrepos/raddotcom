---
date: 2026-11-17
added: 2026-11-17
title: "Claude experiment 20: Model Size"
ai_title: true
tags: [ai/machine-learning/experiments, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-20-model-size.html
published: true
---
[machine fiddling]

<ai>
The same tiny transformer as the other pages, but you choose its size: how many numbers each vector has (2, 3 or 4), how many attention heads (1 or 2) and how many layers (1 or 2). It follows one word through the model left to right, showing every vector as a bracketed column of numbers with a bar for each entry, the attention each head pays to the earlier words, and the next-word guess at the end. Press train to watch it learn; the parameter count updates as you change the size (82 for the smallest, 424 for the largest).

Built by Claude as a follow-up to All The Math and Vectors Left To Right.
</ai>
