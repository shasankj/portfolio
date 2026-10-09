# Changing the hero animation

The home-page hero shows a few faint square "packets" drifting along horizontal rails, like messages moving through a pipeline. It is intentionally calm. Everything you are likely to adjust is in one object at the top of [`src/lib/hero-stream.ts`](../src/lib/hero-stream.ts):

```ts
export const CONFIG = {
  particles: 14,              // how many packets are visible
  crossSeconds: [12, 25],     // seconds for one packet to cross the screen (min, max)
  rails: 7,                   // number of horizontal rails
  opacity: { rest: 0.4, near: 0.9 },
  size: 4,                    // packet size in px
  cursor: { radius: 110, push: 10 },
  fade: 0.12,                 // fade-in/out fraction at each end of the path
  maxFps: 30,
};
```

Save the file and the dev server (`npm run dev`) reloads automatically.

## Common tweaks

| I want it... | Change |
|---|---|
| Calmer | Lower `particles` (try 8), raise `crossSeconds` (try `[20, 40]`), lower `opacity.rest` (try `0.25`) |
| Busier | Raise `particles` (try 24), lower `crossSeconds` (try `[8, 16]`) |
| Off entirely | Set `particles: 0` (the static rails remain), or delete `<HeroStream />` from `src/pages/index.astro` |
| Not reacting to the cursor | Set `cursor.push` to `0` |
| Bigger or smaller packets | Change `size` |
| Lighter on the battery | Lower `maxFps` (try `24`) |

## Rails

`rails` must match the CSS that draws the static lines. In `src/styles/global.css`, `.hero-rails` repeats a line every `12.5%` (that is `100 / (rails + 1)`). If you change `rails`, change that percentage to `100 / (rails + 1)` and update both numbers in the `repeating-linear-gradient`.

## Colors

The packets use the site tokens: `--ink` for resting packets and `--accent` when the cursor is near, so they follow light and dark mode automatically. To change them, edit the tokens in `global.css`, not the animation.

## Built-in safeguards (leave these on)

- Pauses when the hero scrolls off-screen or the browser tab is hidden.
- Respects the system "reduce motion" setting: one still frame is drawn and nothing moves.
- Skipped on low-power devices (2 or fewer CPU cores, 2 GB or less memory, or data-saver on). The static rails are shown instead.
- Loads after the page is idle, so it never delays first paint.
- Without JavaScript, only the static rails show.

## Changing the movement itself

Path logic lives in `pos()` in the same file. Today packets run along a rail and hop to a neighbouring rail at right angles at four stations (`p.t * 4`). To change the number of stations, change the `4`. For a different feel (curves, diagonals), replace what `pos()` returns; it only has to return an `{ x, y }` for a packet's progress `p.t` (0 to 1).
