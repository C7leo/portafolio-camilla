# Section 04: editorial Journey

The original professional copy in `src/modules/career/domain/journey.js` and the three local
institutional photographs are preserved. Photograph sources/credits remain in
`src/modules/career/presentation/journey.js` and `public/assets/career/photographs/README.md`; each image retains its
visible source link. No employment dates, responsibilities or academic results
have been added.

`src/modules/career/presentation/journey.js` and `src/modules/career/presentation/journey.css` provide a 35/65 desktop layout with a
bounded native sticky sidebar, three naturally scrolling chapters and a fine
vertical timeline. BCP places copy before its photograph, BanBif inverts those
columns, and UPC closes with its original academic description and graduation
qualification. On tablet the chapters stack internally; mobile removes the
sidebar sticky and presents all content in document flow.

The original PNGs supplied by Camilla are used without raster edits:

- `04_Gatito neón guiñando el ojo.png`: small BCP sticker.
- `04_gato_mirando.png`: left sidebar, accompanied by a native SVG heart bubble
  and illustrative translucent steps (not another generated mascot).
- `04_gato durmiendo.png`: UPC; the supplied asset already includes its ZZZ.

Sticker space is reserved above each photograph. White photographic borders,
violet backplates, sparse lime accents and native handwritten labels supply the
collage treatment. The violet is the Hero's `#9747ff`. Notes and new labels are
translated through the existing EN/ES system.

`src/modules/career/presentation/journey-motion.js` uses the existing GSAP/ScrollTrigger installation for
individual copy/media entrances and a scroll progress line. Each chapter has
its own trigger, so experiences are discovered separately. No extra section pin,
scroll interception or horizontal carousel is introduced. The current chapter
and line progress reverse with native scroll; the sticky sidebar releases at
the end of the section. Reduced motion removes entrances and shows all markers.
MatchMedia resources are cleaned up with the existing page lifecycle.

Validation uses local Chrome with desktop 1440/1920, tablet 768 and phones
320/390 in both languages. The Journey tests cover sticky hold/release, natural
page flow, chapter progression/reversal, alternating BanBif geometry, local
images, original sticker paths, clearance above photos and reduced motion.

```powershell
npx playwright test tests/journey.spec.js tests/navigation.spec.js tests/reading-flow.spec.js --workers=1
npm run build
```
