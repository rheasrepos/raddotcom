---
date: 2026-06-01
date_approx: true
title: "Extracted machine fiddling"
ai_title: true
tags: [ai/machine-learning/experiments]
form: [brainstorm]
affiliation: uchicago
type: programming
published: true
---

# margin ideas — machine fiddling addendum

Ideas recovered from PDF margin annotations and class notes scattered outside the iCloud "machine fiddling" note. Extracted from 535 annotations across PHIL OF AI, MACHINE LEARNING, ML 4 CS, MFML, NLP, databases, bpro, and Year 2 cog-sci/phil-of-mind folders (all under `University of Chicago/` on this Desktop). Paths are relative to that folder; page numbers refer to the PDF. Notes appearing in both the compiled Arkoudas packet and individual reading PDFs are listed once, under the original reading.

## Directly machine-fiddling (new experiment candidates)

**"so maybe my problem is that i dont think humans are modelable — there is no model human bc in that case if we were to do biology on ourselves each of us is a branch, a new species"**
— Putnam, *The Nature of Mental States*, p.5 (`Year 4/.../philofai mind and matter 10.14/Putnam--the nature of mental states.pdf`)
→ Experiment candidate: measure *un-modelability* — train a "generic human" predictor on many people's data, measure the per-person residual that never shrinks. Your CABLAB finding (between-participant disagreement ~2x character signal) is literally evidence for this note. Pairs with `05-class-direction` (what models DO capture is the stereotype, not the person).

**"how do we train llms to be rational? the theory is one that rationality is being human, using language"** + **"for non perfectly rational systems we must go to a reliable design stance rather than intentionality — so this is an arg for AI to be reliable and predictable which… it is not"** + **"AI can tell us characteristics of our rationality and what humans think and produce"**
— Dennett, *Intentional Systems*, pp.2–15 (`philofai mind and matter 10.9/Dennett, intentional systems.pdf`)
→ These three are the philosophical core of `01-prompt-evolution` — the note's "pulse on humanity" idea already existed in your Dennett margins a year before the machine fiddling entry. The design-stance note also suggests a measurable: predictability-under-perturbation as a reliability metric.

**"neural network tries to solve storage problem"** + **"well this is just weights and nodes neural network"** (on Turing 1950!)
— Turing, *Computing Machinery and Intelligence*, pp.18, 26 (`philofai mind and matter 10.9/`)
→ Experiment candidate: nets as storage — how many bits can a fixed architecture memorize? Directly extends `04-universal-overfit` (capacity measured in bits/param; cf. Zhang et al. 2017).

**"I wonder if an LLM could help decode network / DNS logs!"**
— databases hw2 reflections (`Year 4/year4winterquarter/intro to database systems/cmsc23500-win-2026/homework-rheasrepos/hw2/reflections.md`)
→ Practical project, fits the reduce-AI-usage theme inverted: a *small local* model (or even regex+heuristics baseline vs. LLM) for log triage. Also connects to `06-query-circuits` (specialized operators over structured data).

**"wait interesting ig this is what machine learning does"** (on eliminative materialism)
— Churchland, *Eliminative Materialism*, p.16 (`materialism/Churchland, Eliminative Materialism.pdf`)
→ The observation: ML replaces folk-psychological categories with learned features, the way Churchland wants neuroscience to replace beliefs/desires. Essay seed more than experiment — but probing whether a model's learned features align with folk categories is exactly what `05-class-direction` does.

**"maybe general AI tries to avoid this — not just solving one problem but any, and that's why it's dangerous: there is no design that it's solving, it's unrestricted?"**
— Dretske, p.7 (`materialism/Dretske.pdf`)
→ Pairs with the machine-fiddling note's "body/bounds" idea (`06-query-circuits`): specialization as safety. An experiment on generality-vs-auditability is a genuine open research direction.

## Mind-as-machine margins (essay/blog material)

- **"maybe computer is not brain, but computer is computer and computer is part of brain"** + **"ascription is possible of the brain to a computer but equivalence is not guaranteed"** + **"it's all observer-relative — what is a computer and what is not is a societal issue!"** — Searle, *Syntax & Physics*, pp.1–3 (`philofai mind and matter 10.20/`). Your MBM final paper already flips this ("to what extent is a computer a brain?" — `Year 4/Recovered Writing/Priority Classes/Final Paper Rhea Madhogarhia Mind Brain and Meani.md`).
- **"helen keller = ai"** — Turing, p.25. (Compressed but real: learning from impoverished channels — sample-efficiency of grounding. Cf. Piantadosi on LLMs and language deprivation.)
- **"i guess intention is prediction dependent — you predict it will be received a certain way, so ai has intention"** — Dennett, p.2; developed in your PHIL OF AI final (`Recovered Writing/Priority Classes/2025-12-15 PHIL OF AI MIND AND MATTER FINAL PAPER.md`).
- **"what if we are mistaken — what if what we call consciousness is knee-jerk reactions and survival techniques, consciousness as part of our biology"** + **"AI? LLMs — is this what the turing test rests on?"** — Chalmers, pp.121, 124 (`Consciousness week2friday/Chalmers.pdf`).
- **"we are not breakable into our parts… maybe it's like a rube goldberg machine — our singularity comes from the sum of the parts"** — Nagel, *Brain Bisection*, p.2 (`thoughtsLanguageSelfweek3monday/`).
- **"What if mental states are just another type of theory? If emotions/thoughts/beliefs are theories, what if those descriptions don't align with neurological observations"** — Mind Brain Meaning notes (`Recovered Writing/Priority Classes/Mind Brain  Meaning Notes.md`, lines 104–105).
- **"the machine cannot refer because it does not KNOW?"** + **"but chatgpt CAN do this"** — Putnam packet, pp.3–6 (`week2wednesdayAIandIntentionality/Putnam.pdf`).

## Methods margins (MFML — study notes, not ideas, but good open-source explainer seeds)

Your gradient-descent, ridge-regression, and kernel-trick margins (`Year 3/Mathematical Foundations of Machine Learning/mfml canvas notes/`, Lectures 3–12) — e.g. "this is hard to compute / this is easy to compute: ⟨xi,xj⟩" (the kernel trick in six words) — would make good short explainer posts for rad.com alongside the experiment repos.

## Bias margins (NLP + Evans)

- **"i wonder if what is considered an error is also biased to think that llm generated text is error free"** — minalee paper, p.7 (`Year 3/NLP/minaleepaper.pdf`) → measurable: human error-detection rates on labeled-vs-unlabeled LLM text.
- **"doesn't this also include bias? experts in a field ≠ the common person who would benefit"** — Sourati & Evans 2023, p.1 (`james evans/`).

---
*Method: pypdf annotation extraction over 1000+ PDFs in class folders (FreeText/Highlight notes with content), keyword filter (model/neural/llm/weights/computer/…), plus grep over .md/.txt notes. Non-matching annotations (474) are mostly reading comprehension notes — rerun `chatgrep`-style on `/tmp/annots.jsonl` anytime for other themes.*

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]
