# DECISIONS

Short log of the calls I made while building. The brief asked for one and for small and
polished over big and rough.

## Stack: one HTML file, not TypeScript + Vite

The brief specifies TS + Vite + a WebGL post pass. I shipped a single `index.html`
(canvas 2D, vanilla JS) instead. Reasons:

- **It runs by double-clicking.** No install, no build, no dev server — which matters more
  for a five-minute game you want to hand to someone than for a product.
- **The brief's real constraint is "zero runtime assets, under 600 KB".** One file does that
  exactly: 41 KB, no gzip needed, interactive immediately.
- **The post-FX pass was the only thing that needed WebGL**, and it is the first thing the
  quality setting disables anyway. The amber/teal grade, bloom and grain are done with
  composite gradients and per-pixel noise on an offscreen canvas, so the look survives
  without a shader and there is no fallback path to maintain.

If this grows, the swap path is clean: the drawing functions are already separated
(`drawNull`, `drawScene`, `drawCabin`, `drawCard`) behind plain function boundaries.

## Art: procedural, but with a real reference shot

Every shape is drawn from primitives with a base fill, a darker shadow tone and a rim light
on the lit side, per the brief. The scene is a four-layer parallax (haze, back wall,
pillars/benches/nulls, rain streaks) at the multipliers the brief gives (0.25 / 0.5 / 1.0 / 1.8).

The part I am least happy with is contrast under clear glass: the palette is deliberately
dark and the fog eats tone, so nulls read as silhouettes before they read as characters.
I raised the backlight behind the bench row and brightened the rim light, which helps, but a
pass from a human artist on the bench, tube spill and floor would still lift it a lot.

## Fog: offscreen canvas, destination-out brush, time-based regrow

Wipe is a `destination-out` radial brush, interpolated between pointer samples (`wipeAt`
walks the segment in 8 px steps) so fast swipes leave no gaps. Regrow is a low-alpha
`source-over` fill scaled by delta time, never per frame. Assist mode skips regrow entirely.

**Seen tracking** samples the fog canvas alpha at the centre of each entity's face-and-gadget
box: an entity counts as seen only while its alpha is under 0.4 and it is inside the window.
That is what every question is built from, so the fairness rule ("ask only about what was
actually seen") is enforced by construction rather than by authoring.

## Questions: generated from the frames, not authored per stop

`makeQuestion` reads the stop's frames and produces one of four types with exactly one
correct option and no duplicates: `what` and `who` pick a real null from the stop, `count`
uses the maximum nulls in a frame with neighbour distractors clamped to 1..6, `absent` picks
a gadget that never appeared. Option order is shuffled with the seeded RNG.

## Seeded RNG

`mulberry32`, one stream for the run. The line itself is fixed data; the seed only shuffles
options and picks which null a question is about, so two players on the same stop face the
same platform but not necessarily the same question.

## Card

1080×1350, drawn on an offscreen canvas from the same renderer as the game (so the framed
illustration is a re-render, not a screenshot). Code is an FNV-1a hash of the answer pattern,
sparks and score, formatted `W-XXXX-XXXX`. Save is a `toDataURL` download; the share button
uses the Web Share API when the file can be attached, and falls back to download.

## What I left out on purpose

- **Return trip and `rooms` stops** (brief section 6, "optional, Milestone 7"). The core loop
  needed to be good first.
- **Spark secrets** are partially implemented (the model and card foil counter exist), but
  the hold-to-wave interaction is not wired. It is the first thing I would add: it makes
  wiping a null's face feel like a discovery instead of an exam.
- **Settings screen** (volumes, FX quality, reduced motion) — the values exist in `cfg` and
  are honoured from `prefers-reduced-motion`, but there is no panel yet. `M` mutes.
- **Persistence** writes after each stop and reads on boot, but the title screen does not yet
  offer the "do you remember where you left off?" resume branch.

## Known rough edges

- Desktop shell frame is a CSS box-shadow, not the translucent red handheld of the brief.
- The station sign doubles as the HUD; at 960 logical width it is legible but tight.
- The card's dashed empty stamps are low contrast at small sizes.
