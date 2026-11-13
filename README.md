# window seat

An unofficial fan game for the nulls universe (@nullsxyz). You are the train, not the platform:
a five-minute, one-thumb memory game seen through fogged glass.

## Run it

Open `index.html` in any modern browser. No build, no install, no network.

```
xdg-open index.html          # linux
open index.html              # macOS
```

Debug: `index.html?debug=1`.

## How it plays

1. **title** — press start to remember.
2. **board** — the platform you left: a null on a bench, amber train arriving.
3. **stop ×7** — for each stop:
   - *approach* — the train slows, the glass fogs over completely.
   - *watch* (16 s) — the platform slides past. Drag to wipe a round brush through the fog;
     fog regrows, so decide what is worth looking at. Only what you clear counts as *seen*.
   - *conductor* — a faceless conductor asks what you saw (1 question at stop 1, then 2).
   - *reveal* — correct: a punch in your ticket and the lamps flare warm. wrong: the right
     entity is highlighted and one lamp dims.
   - *depart* — the train pulls out toward the next sign.
4. **finale** — your own seat, one handheld still glowing.
5. **memory card** — a 1080×1350 ticket you can save: code, the best frame you saw,
   seven stamp slots, one punch per correct answer, tier, date.

Three lamps are your light. Two correct answers in a row relight one. At zero the run ends
early with a *crumpled stub* card.

## Content

`LINE` in `index.html` holds the seven stops (speed, fog regrow rate, frames, question types)
and every null is assembled from trait pools (ears, eyes, eyewear, top, bottom, shoes, gadget,
pose), so no two nulls in a stop share more than a few slots. Questions ask about what you
could actually see:

- `what` — which gadget did the null in the X top hold?
- `who` — which null held the Y?
- `count` — how many nulls were waiting?
- `absent` — which item was NOT there?

Distractors are real trait values that did not appear in that stop, so the answer is
decidable from what was on screen.

## Audio

Everything is synthesised with Web Audio: brown-noise train bed, 900 Hz rail clacks,
filtered wipe squeak that follows pointer speed, menu blips, a warm two-note chime for
correct, a low thud for wrong, and a ticket punch on the reveal. `M` mutes.

## Files

- `index.html` — the whole game (canvas 2D, no assets, no dependencies)
- `DECISIONS.md` — what I chose and why, including what is deliberately not built yet

## License

MIT. Fan project; the nulls universe belongs to its creators.
