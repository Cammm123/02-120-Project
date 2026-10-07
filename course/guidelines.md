# Project guidelines (summary)

Summary of `Project Description F26.pdf` (02-120, Fall 2026). When in doubt, the
PDF is the source of truth.

## What is graded

The goal is learning, not the product: "whether your brain got bigger along the
way, whether you can defend what you built, whether you checked it to make sure
it's right, and whether you used AI to learn rather than to avoid learning."

| Component | Share |
|---|---|
| Proposal (one page, three questions) | 5% |
| Build journal (Claude Code logs + git history, four checkpoints) | 35% |
| TA check-in (15 min, Nov 4–13) | 5% |
| Final app and code (live on the web, with repo + README) | 10% |
| Video demo (5 min max, own voice) | 10% |
| Project assessment (closed, on paper, in class) | 35% |

## Hard rules

- A computational model of a real scientific phenomenon that answers the three
  questions. Suggested: reproduce a published result, then take it further.
- **Not accepted:** "A project with no scientific question, such as a video game
  or a dashboard." Also not accepted: reinventing a standard package, a chain of
  library calls, a project whose only check is that it runs.
- Proposal (one page max) answers:
  1. What is your scientific question?
  2. What will you build to answer it? (A working model someone can explore,
     not a single figure.)
  3. How will you check your model? (At least one concrete check: a published
     value, a case solvable by hand, or a behavior the science requires.)

  It also names the inspiring paper or phenomenon, any data, and where you want
  to take the paper.
- Any data must be downloaded and in the repo **at proposal time**.
- Final app deployed to the web, usable without installing anything. README
  explains what it does and how to run it. Video linked from README and site.

## Build journal (how to work)

- All project work happens in Claude Code inside the repo, including learning the
  science. Keep the paper and sources in the repo.
- Commit early and often, **with commit messages in your own words**.
- Graders look for: steady sessions across weeks; learning with AI (being taught,
  quizzed, explaining back, asking Claude to explain its code, debugging
  together); checking work (tests, comparing output to the proposal's check).
- Not graded: number or polish of prompts, how much code Claude wrote. Dead ends
  are fine.
- A course-provided command copies session logs into `journal/`. Only the repo is
  collected; personal content can be redacted first.

## Pitfalls named

- Data never arrives. Obscure papers (prefer an older, famous result). Scope too
  big: get the smallest version working and checked first.

## Dates (11:59 pm Eastern)

| Date | What |
|---|---|
| Wed Oct 7 | **Proposal due** |
| Fri Oct 9 | Staff feedback |
| Wed Oct 21 | Journal checkpoint 1; revised proposal if asked |
| Fri Oct 30 | Journal checkpoint 2; project office hours |
| Nov 4–13 | TA check-ins |
| Fri Nov 20 | Journal checkpoint 3; first version live on the web |
| Tue Dec 1 | Demo day; final app, code, video due |
| Thu Dec 3 | Project assessment, in class |
