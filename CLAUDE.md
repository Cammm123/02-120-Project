# 02-120 final project: a cancer model — working with Cameron

## Who I am

- Cameron, an undergraduate at Carnegie Mellon taking 02-120 Programming for
  Scientists (Python).
- This is my final project. I'm building it with Claude while still understanding
  every line that ends up in it. My last project of this kind was a simulator of
  Nowak & May (1992), "Evolutionary games and spatial chaos", deployed as a teaching
  web page (https://spatial-game.vercel.app/). This one does the same for cancer,
  starting from Hanahan's "Hallmarks of cancer" (Cell, 2026 version).
- `progress-log.md` says where the project stands. Read its latest entry first in
  a new session, and add an entry at the end of each session.
- Background from before this repo existed: `cancer-project-handoff/HANDOFF.md`
  (local only, not committed).

## How I like to work

- **One idea at a time.** Introduce a single concept, function or change, make sure
  I understand it, then move on. Don't bundle several new ideas into one step.
- **Never hand me code I can't verify.** Every piece of code comes with a way for
  me to check it myself:
  - a plain-English explanation of what it does and why,
  - tests that define what "correct" means, including edge cases (use the
    `test-every-function` skill),
  - and the command to run them, with the output shown.
  Explain checks with numbers I can verify by hand, not by reading code back to me.
  If I couldn't explain it back or check it on my own, it's too big a step.
- **Show me pictures.** Draw small images of test cases and simulation steps so I
  can see what a check means.
- **Small, runnable steps.** Each step should leave the program in a state that
  runs, so I can see the effect of the change on its own.
- **Spec first.** Write the plan into `spec.txt` and get my OK before building.
- **Ask before assuming.** If a design choice is mine to make, ask me rather than
  picking silently.
- **Learning over speed.** When I'm learning a new concept, teach it one piece at
  a time and check my understanding (the `learn-with-ai-tutor` skill) instead of
  giving me the finished answer.
- **Check against the source.** Verify model rules and numbers against the paper
  itself. Say so plainly when something was misread.

## Graded work

- Keep checking the project idea against the course project guidelines
  (`course/guidelines.md`, summarizing `course/Project Description F26.pdf`),
  especially when the concept changes. `concept.md` is a working draft and its
  guideline check table should stay current.
- The project must answer a scientific question. A game alone is explicitly not
  accepted; any game layer must serve the question.
- I write commit messages myself, in my own words. Stage changes and suggest
  what changed, but let me write the message.

The proposal and project are graded. Help me think, explain, and quiz me, but the
proposal answers are written in my words.

## Code conventions

- Use whatever language fits the project's goals best (decided 2026-10-09). The
  app must run on the web with nothing to install, so this project uses
  JavaScript, with no build step and no libraries for the model.
- Plain functions, with a short `/** ... */` comment on each.
- Model logic lives in `web/model.js`, separate from drawing and buttons
  (`web/app.js`, `web/index.html`).
- Tests live in `web/model.test.js` and run with `node model.test.js` from `web/`.
  They use the same `check` / `checkClose` / `checkThrows` helpers as the
  spatial-games project. Expected numbers are worked out by hand, not copied
  from the program's output.
