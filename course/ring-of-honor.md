# Ring of Honor: what the top past projects have in common

Source: the Ring of Honor section of
https://compeau.cbd.cmu.edu/programming-for-scientists/ (six final essays read
2026-10-06). These were team projects, built before AI, mostly in Go.

| Project | Classic starting point | How they checked it | How they extended it |
|---|---|---|---|
| Ab Initio Secondary Structure Prediction | Chou-Fasman, GOR | 8-residue example worked by hand; 50 benchmark proteins; reported missing the published accuracy (35% vs ~50%) and explained why | Added a hidden Markov model; comparison app (R Shiny) |
| Predicting Protein Secondary Structure | Chou-Fasman, GOR | Accuracy on 10 benchmark proteins compared with published ranges | Head-to-head comparison; 3D coloring on AlphaFold structures |
| GoMol | Needleman-Wunsch, Kabsch, Qres | Same protein solved twice gives RMSD ≈ 0 | One interactive tool: alignment + ray-traced 3D |
| De Novo Genome Assembly | de Bruijn graph assembly | Simulated reads from a real genome; noise should raise the best k | Advice on choosing the k-mer length; speedup from merging chains |
| Swimbots | Ventrella's swimbots | Compared each run with a default run | Choosable mate preferences; parameter sweeps |
| Chladni Patterns from Audio | Plate vibration physics | Patterns look right; speed benchmarks | Faster solver; music-driven input; interactive app |

## Patterns to copy

1. Start from a classic, citable model and implement it exactly.
2. Check it against a known answer: a case worked by hand, a published value, or
   a behavior the science requires. Report misses honestly and explain them.
3. Extend it: compare variants, add modes, sweep parameters.
4. Give the user an interactive way to explore the model.
5. Discuss limitations and assumptions explicitly.

## Where to do better than them

- Most never state a crisp scientific question. Ours should state one up front.
- None reproduces a specific published number exactly. Reproducing one named
  result would make this project stronger than any of them.
- None is a game. Each interface exists to explore a model.
