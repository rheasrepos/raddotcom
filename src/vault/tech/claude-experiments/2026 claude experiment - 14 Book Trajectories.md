---
date: 2026-10-14
added: 2026-11-14
title: "Claude experiment 14: Book Trajectories"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-14-book-trajectories.html
published: true
---
[machine fiddling]

**From the Points In Space / All The Math pages (Oct 14 2026):** a token is a point in the model's space and every computation moves it. Do that for a whole book with a real model, and compare the path to an fMRI time series.

<ai>
A whole book drawn as a path through a language model's space (GPT-2's residual stream, projected to 3-D with one PCA so every layer shares the same axes). Scrub by position, switch layers, follow one token through depth, search for a word or character to thread every mention, and mark fMRI-style TR windows. The data loaded by default is a synthetic placeholder (random walks, not a model); load a JSON made by book_trajectory.py to see a real book.

Built by Claude from this note; the live visualization is above (open it full-screen with "Open live").
</ai>
