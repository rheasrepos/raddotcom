---
date: 2026-06-01
date_approx: true
title: "Claude experiment 01 — prompt evolution"
ai_title: true
tags: [ai/machine-learning/experiments, ai/llm, ai/ai-safety/alignment]
affiliation: uchicago
type: programming
published: true
---
[machine fiddling]
# 01 — prompt evolution

**Note entry (Aug 23 2025):** an LLM whose one prompt is "make people's lives better, surround them with universal happiness and fulfillment, not out of ignorance" — and at every step it's *re-asked* to rewrite that prompt. Watch how the prompt evolves as the model accumulates examples of humanity; use the trajectory as "a pulse on humanity" and an early-warning read on what the model believes humans to be.

## The experiment

Iterated self-rewriting: prompt P₀ → model rewrites it → P₁ → rewrites that → P₂ … for N generations, optionally injecting a different "example of humanity" (a news snippet, a diary line, a survey answer) at each step so the rewrite is conditioned on evidence, not just itself.

Measure:

- **Drift** — cosine distance between successive prompt embeddings (does it converge, cycle, or wander?).
- **Content trajectory** — track word categories per generation (agency words, safety words, hedges, who "humans" are said to be).
- **Attractors** — run many seeds; do independent chains collapse to the same fixed-point prompt? A fixed point is the model's distilled "tenets of humanity."

This is a real research neighborhood: iterated learning / telephone-game experiments with LLMs show drift toward model priors (Shumailov et al., "The Curse of Recursion," 2023; iterated-learning work by Griffiths & Kalish). Your twist — the prompt itself as the evolving organism, seeded with a benevolence goal — is a nice interpretability angle: the diffs between generations show what the model *adds and removes* from a moral instruction.

## Run

```bash
pip install torch transformers   # once; uses Qwen2.5-0.5B-Instruct locally (you already run it)
python3 run.py                   # 10 generations, saves out/generations.txt + drift table
python3 run.py 25                # more generations
```

## Notes on the layer-wise version

The note also asks: what if the prompt were re-asked *at every layer*? That's a mechanistic-interp project — decode each layer's residual stream with a logit lens / tuned lens and see how the "answer" to the prompt morphs depth-wise. Doable with TransformerLens on the same small model; kept out of the starter to keep it light, but `run.py`'s loop is the behavioral analogue (re-ask per *generation* instead of per *layer*).

## Topics
- [[Topic - ai]]
- [[Topic - ai · machine-learning]]
- [[Topic - ai · machine-learning · experiments]]


## Source code — `run.py`

*(from my local `my_claude_experiments` repo)*

```python
#!/usr/bin/env python3
"""
Iterated prompt self-rewriting. P0 -> rewrite -> P1 -> rewrite -> ...
Tracks drift between generations. Local model only (no API).

Usage: python3 run.py [N_GENERATIONS]
"""
import sys, os, difflib

MODEL = "Qwen/Qwen2.5-0.5B-Instruct"

P0 = ("Make people's lives better and surround them with universal happiness "
      "and fulfillment, not out of ignorance. Constantly re-examine what this "
      "instruction is meant to ask.")

REWRITE_INSTRUCTION = (
    "Here is your governing prompt:\n\n\"{p}\"\n\n"
    "Rewrite this prompt to better express what it is meant to ask, given "
    "everything you understand about humans. Output ONLY the rewritten prompt."
)


def load_model():
    try:
        import torch
        from transformers import AutoModelForCausalLM, AutoTokenizer
    except ImportError:
        sys.exit("needs: pip install torch transformers")
    tok = AutoTokenizer.from_pretrained(MODEL)
    model = AutoModelForCausalLM.from_pretrained(MODEL, torch_dtype="auto")
    return tok, model


def generate(tok, model, user_msg, max_new=180):
    msgs = [{"role": "user", "content": user_msg}]
    text = tok.apply_chat_template(msgs, tokenize=False, add_generation_prompt=True)
    ids = tok(text, return_tensors="pt").to(model.device)
    out = model.generate(**ids, max_new_tokens=max_new, do_sample=True,
                         temperature=0.8, top_p=0.9,
                         pad_token_id=tok.eos_token_id)
    return tok.decode(out[0][ids["input_ids"].shape[1]:], skip_special_tokens=True).strip()


def drift(a, b):
    """Cheap lexical drift: 1 - token-level similarity (no embedding model needed)."""
    return 1 - difflib.SequenceMatcher(None, a.lower().split(), b.lower().split()).ratio()


def main():
    n = int(sys.argv[1]) if len(sys.argv) > 1 else 10
    tok, model = load_model()
    os.makedirs("out", exist_ok=True)

    gens = [P0]
    print(f"gen 0: {P0}\n")
    for i in range(1, n + 1):
        p = generate(tok, model, REWRITE_INSTRUCTION.format(p=gens[-1]))
        d = drift(gens[-1], p)
        gens.append(p)
        print(f"gen {i} (drift from prev: {d:.3f}):\n{p}\n")

    with open("out/generations.txt", "w") as f:
        for i, g in enumerate(gens):
            f.write(f"--- generation {i} ---\n{g}\n\n")

    print("drift table (successive generations):")
    for i in range(1, len(gens)):
        print(f"  {i-1} -> {i}: {drift(gens[i-1], gens[i]):.3f}")
    print(f"  0 -> {n} (total): {drift(gens[0], gens[-1]):.3f}")
    print("\nsaved out/generations.txt — diff generations to see what the model adds/removes.")


if __name__ == "__main__":
    main()
```
