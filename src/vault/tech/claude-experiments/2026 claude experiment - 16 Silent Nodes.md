---
date: 2026-11-15
added: 2026-11-15
title: "Claude experiment 16: Silent Nodes"
ai_title: true
tags: [ai/machine-learning/experiments, ai/machine-learning/interpretability, visualization]
affiliation: independent
type: programming
link: /viz/2026-claude-experiment-16-silent-nodes.html
published: true
---
[machine fiddling]

**NOW note, daily list (CAB Lab research):** "EMAIL KAREN LIVESCU ABOUT TEMPORALITY AND VISUALIZATION =- SLIDES THINK ABOUT THE NON-ACTIVATED NODES"

<ai>
The same tiny transformer as Vectors Left To Right, looking only at the four relu units in its MLP, over two kinds of time. **Over the sentence** (left to right): every token × every unit; units that fired are filled, units that stayed silent are drawn hollow and dashed where they would be, with a tick showing how far below zero they were. **Over training** (top to bottom): the followed token's units at every epoch, so you can watch a unit go silent and stay silent (a dead relu gets no gradient, so training can't wake it). **What the silence costs**: the MLP output built from the units that fired, with each silent unit's contribution drawn faint at the size it would have had: the part of the computation the non-activated nodes throw away.

Built by Claude from the note above. Press "train 10 epochs" to add time.
</ai>
