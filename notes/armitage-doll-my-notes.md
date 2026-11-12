# Armitage & Doll (1954): my notes

Written by Cameron after the tutor session on 2026-10-07. Page numbers refer to
`papers/brjcancer 00386.pdf`.

1. **Why one hit fails:** with one hit, a 32-year-old and a 62-year-old tie this
   year, so one hit predicts a flat rate. But the data shows 18× (colon, men,
   England 2013–17: 47 vs 846 per million per year). (p. 1–2)
2. **The rule:** rate ∝ age^(k−1), where k = number of hits (the paper calls it
   r). Slope on a log-log plot = k − 1. Paper: slopes 4.97–6.48, so about 6–7
   hits. (pp. 2, 4, Table I)
3. **An assumption that breaks:** constant p. Lung cancer breaks it because
   people in older generations smoked less. (pp. 5, 7–8)
4. **When the line bends:** the people who can still get cancer run out, when
   hits aren't rare (p × age not small). The line flattens. (p. 10, "as t → 0")
5. **Timing:** a carcinogen that causes an early hit matters most at young ages;
   one that causes a late hit matters most at older ages. (pp. 6–7, 11)

## Study list (from the quiz)
- **Fixed order:** hit #k can only happen in a cell that already has hit #k−1.
  Making hits faster never changes which comes first, like a combination lock.
- **Line 1:** forgot it once. The point is the rate *this year*, not the total
  chance by some age.

## Why r mutations gives slope r − 1 (Cameron's words, 2026-11-10)

After the counting-cells session (pictures in `output/learn/README.md`):

> Cancer rates rise with age because more cells are one step away now, and as
> age increases, more cells have the opportunity to get cancer.
>
> r mutations give slope r − 1 because it needs r − 1 mutations to happen to
> get to this point. The final r-th mutation happens then, so it doesn't
> affect the slope at that point.
>
> The height of the line doesn't matter because you can figure out the number
> of mutations from the slope (mutations = slope + 1).

To remember: the height comes from N and p, and the slope comes from r. Each
mutation a ready cell already has adds one ×2 when age doubles.

## Why our slope is 2.84, not 3 (Cameron's words, 2026-11-12)

After the "ways and misses" session (`output/learn/README.md`, section 4 and
"What a way means"):

> When someone is really old, the odds of them now getting cancer in the
> simulation has a lot of ways because you have so many possible years to add
> the first mutation. On the other hand, the number of empty years drags the
> average down when calculating the slope, and it is weighed down a little by
> the empty hits.

To remember:
- The ways count where **all** the earlier hits fell (r − 1 of them; 3 when
  r = 4), not just the first, and they're counted per cell.
- It's not really an average. Each way's chance is multiplied by 0.995 for
  every empty year. Older cells have more empty years, so their count is cut
  more (×0.878 at 30, ×0.755 at 60), and the line rises more slowly.
- Ways push the slope up to about 3; misses pull it down to 2.84.
