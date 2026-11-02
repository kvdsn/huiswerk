# Avatar contract

Every avatar is one ES module `js/ui/avatars/<id>.js`, listed in `index.js`.
`js/ui/mascot.js` draws the shared rewards around it and runs the shared
reactions. `eenhoorn.js` is the reference: copy its structure and style.

```js
export default {
  id: 'kat',            // = file name, lowercase ascii
  noun: 'kat',          // Dutch noun as shown to the child (may have accents: 'pinguïn')
  article: 'de',        // 'de' | 'het'
  markup,               // SVG string (see below)
  defs,                 // SVG <defs> content string ('' if none)
  crown: { x, y, scale }, // where the schelpenkroon reward sits
  css,                  // optional extra CSS string ('' if none)
};
```

Leave out `placeholder: true` (only the temporary grey stand-ins have it).

## Coordinates

- Draw in a 200 × 200 box (`viewBox="0 0 200 200"`); the `<svg>` itself is supplied.
- The character sits, facing forward, centred on x = 100. Feet/paws touch
  the ground at y ≈ 185–192. The head's centre is around (100, 92), about
  100 wide and 90 tall; ears/horns may reach up to y ≈ 8.
- Stay inside x 30–170 so the shared rewards fit: the rainbow arcs behind
  (centre (100, 178), radius 86–116), the planet and stars orbiting on a
  circle of radius 96 around (100, 96), and the bunny friend in front at
  the bottom right (x ≈ 160–200, y ≈ 120–200). A tail may go behind the
  bunny.

## Required groups

`markup` is drawn after the rainbow and before the planet and bunny. It must
contain these groups (extra classes and groups are fine):

| class | contains | animation (shared CSS) |
|---|---|---|
| `mascot-body` | torso, front legs, tail | none of its own; lies under the head |
| `mascot-hoof-left`, `mascot-hoof-right` (inside `mascot-body`) | one front leg/paw each, nothing else | "happy": both rotate around their **top centre** (origin 50% 10% of the group's box), left to −42°, right to +42°, twice, so they clap towards the middle. Draw each leg as a closed shape hanging straight down from the torso, with nothing above its top that should stay put. |
| `mascot-tail` (optional, inside `mascot-body`) | the tail | idle sway: rotates 0–6° around its **left-middle** edge (origin 0% 50%). Put the tail at the right side so it attaches on the left. |
| `mascot-head` | everything that nods: ears, head, hair, face, horns | "encourage": nod (rotate −4°…3°, move down 4px) around 50% 92% of its box (the chin). Must come **after** `mascot-body` in the markup. |
| `mascot-eyes` (inside `mascot-head`) | both eyes with their highlights (and lashes) only | blink: scaleY to 0.1 around its own centre every 3–6 s. Nothing else inside, or it squashes too. |

The whole SVG also bobs (idle) and jumps (happy); that needs nothing from you.

Rules: every group listed above appears exactly once. No `<script>`,
`<style>`, `<text>`, `<image>`, filters or masks. Use `fill`/`stroke`
attributes, not inline `style`.

## Crown (schelpenkroon reward)

The crown is placed inside `mascot-head`, so it nods along. By default it is
added as the last thing in `mascot-head` (over the face). To paint it under
something (e.g. in front of hair but behind a horn or forelock), put the
literal text `{crown}` in the head group where it should be drawn.

`crown: { x, y, scale }` = the point where the **centre-bottom** of the
crown sits on top of the head, and its size (1 = the unicorn's crown, about
76 wide and 36 tall: it spans x − 38·scale … x + 38·scale and reaches about
36·scale upwards; the pearl band itself is the bottom ~12·scale). Usually x = 100 and y is just under the top outline
of the head, so the crown overlaps the head a little. Eenhoorn:
`{ x: 100, y: 62, scale: 1 }`. Check it in `tools/artwork.html`.

## Ids in defs

Every id is written `{uid}-name` and referenced as `url(#{uid}-name)`, in
both `defs` and `markup`. `mountMascot` replaces `{uid}` per instance so
several mascots on a page never share gradients. No bare ids anywhere.

## Extra CSS

`css` is injected once per page, after the shared CSS. Scope every selector
to `.mascot.avatar-<id>`. Put animations (`animation:`) only inside
`@media (prefers-reduced-motion: no-preference) { … }`; name keyframes
`<id>-…`. You can react to `.mascot.avatar-<id>.is-happy` (600 ms) and
`.is-encourage` (500 ms). For anything you transform, set
`transform-box: fill-box` and a `transform-origin`. Example: eenhoorn's horn
glows on happy.

## Style guide (match eenhoorn.js)

- Chibi: big round head (~100 × 90) on a small round seated body
  (~80 × 56), two short stubby front legs (20 wide, 34 long, fully rounded).
- Eyes: big dark ovals (rx 10, ry 12.5, `#4a3266`) at about y 94, 44 apart,
  each with a large white highlight up-right (r 4) and a small one down-left
  (r 2, opacity .85). Optional little lashes.
- Rosy cheeks: soft pink ovals (`#ffb3d1`, opacity .7) under the outer
  eye corners, about y 110.
- Small happy smile (stroke 2.5, round caps), small nose/muzzle.
- Soft pastel flat colours, at most a gentle top-to-bottom gradient.
  White/very light body base where the animal allows it (white-to-blush
  gradient like the unicorn's skin); otherwise a light pastel of the
  animal's colour (a light orange fox, light grey-blue penguin back, etc.).
- One outline colour per animal, a soft mid-tone of its palette (unicorn:
  `#c79bd8`), width 3 for the main shapes (head, body, legs, ears), 2–2.5
  for details. `stroke-linejoin="round"`, `stroke-linecap="round"`. Never
  black outlines.
- Friendly and cute for a 4–8 year old: no teeth, claws or angry brows.
