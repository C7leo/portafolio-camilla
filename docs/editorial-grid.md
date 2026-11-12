# Architectural grid

`EditorialGridComponent` adds an absolute, noninteractive decorative layer to each existing scene. It never participates in layout. The same component is used in Home, the pinned About narrative, its editorial composition and marquee, the sticky project reel, Experience (including the photographic opening), Skills, Contact and the footer. Project detail pages also use it.

One root instance with `viewport: true` draws the two fixed rails from the very top to the bottom of the viewport, continuing behind the navbar's reserved space and across pinned scenes. Scene instances draw only horizontal rules and intersections, avoiding doubled vertical strokes. All share `--editorial-rail-inset` with the existing container geometry: a centered 1200 px content area with at least 56 px margins, 40 px on tablet, and 24 px on mobile. Horizontal rules mark existing whitespace around headers, image groups and closing boundaries. They do not frame individual cards. Scene instances live inside each pinned or sticky scene so they follow that scene without a scroll listener.

Inputs:

- `tone`: `auto` (default), `light` or `dark`. Auto blends white ink with `difference`, producing soft gray on white and translucent white on dark imagery, including background transitions. Explicit tones use normal blending.
- `opacity`: line opacity, default 0.13. Mobile reduces this to 0.10.
- `intersectionOpacity`: square opacity, default 0.5.
- `inset`: optional CSS override for the shared rail position.
- `rules`: horizontal positions described by `at` (CSS length), or `anchor` (an existing element selector), `edge` (`top`/`bottom`) and `offset` (px). `line: false` adds only intersection marks to an existing divider. `intersections: false` omits squares; `mobile: false` hides a secondary rule on phones.

Anchor measurements use layout offsets, ignoring text reveal transforms. ResizeObserver, font readiness and GSAP ScrollTrigger refresh handle responsive changes, translations and pin spacers. No work runs on ordinary scroll. IntersectionObserver reveals rules and squares once; subsequent visits preserve their state. Reduced motion displays them immediately. Mobile hides secondary horizontals and the right intersection marks. Observers, listeners and pending frames are cleaned up on destruction.

Validation: `npx playwright test tests/editorial-grid.spec.js tests/about-story.spec.js tests/hero-intro.spec.js --workers=1` and `npm run build`.
- `viewport`: draws the continuous vertical rails in a fixed layer below navigation. Set only on the root instance; its default is false.
