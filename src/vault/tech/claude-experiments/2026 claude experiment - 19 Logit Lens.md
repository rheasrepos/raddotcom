---
date: 2026-11-17
added: 2026-11-17
title: "Claude experiment 19: Logit Lens"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-19-logit-lens.html
published: true
---
[machine fiddling]

<ai>
What would the model say if it had to answer early? A language model only reads out its next-token guess at the very end; the "logit lens" applies that same readout partway through, after each stage. Here it is for the same tiny transformer: a table with one row per stage (embedding, after attention, after the MLP) and one column per word of the prompt, so each row is the prompt "rewritten" at that point, with green where the guess matches the real next word. To the right, the full top guesses for one word at each stage, and how uncertain they are. The last row is exactly the model's real prediction.

This toy has only one layer, so there are three readouts; the same view on a real model with many layers is the natural next step.

Built by Claude from the "rewrite the prompt at every layer" idea in Rhea's machine fiddling notes.
</ai>
