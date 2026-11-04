# Camilla — Software, data & meaningful systems

A personal portfolio designed as an editorial publication: interrupted headlines, cropped interface imagery, fragmented masks, unequal résumé columns and a typographic closing poster. Built on the existing Vite, JavaScript and GSAP architecture, with a React island for CardSwap.

## Run locally

```powershell
npm install
npm run dev
```

`npm run build` creates `dist/`. `npm run preview` serves the production build.

## Source structure

- `src/modules/capabilities/presentation/tools.js` and `src/modules/capabilities/presentation/tools.css`: section 05's editorial category selector, six original PNGs, coordinated transitions and content-driven Quick View. See [Tools notes](docs/tools.md).
- `src/modules/profile/domain/profile.js`: verified name, academic and professional information, technology categories and contact configuration.
- `src/app/scenes.js`: reusable scene renderers for introduction, about, project showcase, conceptual data system, experience, technologies, learning interests and contact.
- `src/modules/projects/presentation/work-gallery.js` preserves the editorial shell, cat, index and project dialog. `src/modules/projects/presentation/work-swap.jsx` uses the original, unmodified `CardSwap.jsx` and `CardSwap.css` with `<Card>` children. The component imports `@hugeicons/react` and `@hugeicons/core-free-icons`; both are installed. `vite.config.js` enables automatic JSX so the original needs no default React import. Selection, index navigation, reduced-motion props and callback filtering live outside the original component and use only its standard `next()` and `prev()` ref methods. The six existing verified views remain the project content.
- `src/modules/career/presentation/journey.js`, `src/modules/career/presentation/journey.css` and `src/modules/career/presentation/journey-motion.js`: section 04's editorial 35/65 spread, native sticky title, three alternating chapters, original cat stickers and scroll-driven timeline. See [Journey notes](docs/journey.md); photo sources remain in `public/assets/career/photographs/README.md`.
- `src/modules/profile/presentation/hero/hero.js` and `src/modules/profile/presentation/hero/hero-editorial.css`: the central-cat editorial Hero, layered typography, geometric artwork, specialty cards and functional actions. `src/modules/profile/presentation/hero/hero.css` preserves the established header styles.
- `src/modules/profile/presentation/hero/hero-motion.js`: cat entrance, bounded pointer response and offscreen animation cleanup; CSS handles the 4.8-second float and subtle graphic motion.
- `src/shared/presentation/illustrations/graphics.js`: native vector engineering artwork and a small, explicitly labeled mascot asset slot.
- `src/app/main.js`: navigation, technology selection and native case-study dialog.
- `src/shared/presentation/navigation/navigation.css`: persistent header, accessible EN / ES controls and section offsets.
- `src/shared/i18n/language.js` and `src/shared/i18n/translations.js`: English/Spanish copy, accessible labels and saved language preference; interactive updates retain the chosen language.
- `src/app/motion.js`: GSAP entrances and section transitions.
- `src/modules/data-story/presentation/data-scene.js`, `src/modules/data-story/presentation/data-video.js` and `src/modules/data-story/presentation/data-visual.css`: section 03, scroll-driven MP4 seeking, six synchronized stages, native sticky layout and actual-frame static fallback. See [video implementation notes](docs/data-video.md). The former particle modules are no longer imported at runtime.
- `src/modules/projects/presentation/prototype/drawing.js`: archived tracing implementation; no longer imported or rendered.
- `src/shared/presentation/styles/global.css`: design tokens, responsive editorial grids, accessible states and reduced-motion styles.

## Content and asset audit

The original workspace was empty. Professional content comes from the user's initial master prompt, and the user subsequently confirmed the name Camilla. Employment dates, numerical achievements, certifications and project implementations have not been invented.

The latest message supplies four distinct visual references: Libertans, Carbon, Hudak and Qorry. The Hudak image appears twice. Their composition, typography, image masks and spatial rhythm were visually inspected before implementation. See ART-DIRECTION.md for the reference-to-section decisions. The existing paper, black, lime, violet and blue colors are retained because those relationships are present in the references.

Contact now uses Camilla's original transparent `/assets/profile/contact/07_gato.png` in a black editorial panel with native white, lime and violet typography, a handwritten introduction, and four contact tiles. The design supports EN/ES, responsive layouts and reduced motion; unconfigured contact values remain clearly pending. See `docs/contact.md` for implementation and validation details.

The About section uses four 3D PNG illustrations supplied by Camilla in a responsive editorial layout (src/modules/profile/presentation/about/about.js and src/modules/profile/presentation/about/about.css), with live bilingual copy and a conceptual SVG growth curve. The spatial gallery uses direct browser captures of the existing portfolio tracing interaction. Captions identify them as portfolio prototypes, not screenshots of a completed academic application. See public/assets/README.md for provenance; scripts/capture-study.mjs records the earlier prototype capture workflow. Section 03 uses the supplied 3D video, scrubbed exclusively by scroll, with six real extracted frames as its static alternative.

The latest Hero follows Camilla's central-cat reference: CODE on the left, DATA on the right and CURIOSITY across a two-stroke lime highlight below. The supplied `public/assets/profile/hero/Gato negro de ojos neón.png` overlaps the headline and native lime/violet panels. It is not copied, renamed, generated or downloaded. The PNG is 1536 × 1024 RGBA with real alpha (range 0–254; all four corners transparent), displayed with `object-fit: contain` and no color filters. All typography, specialty cards, arrows and buttons remain real HTML/SVG; the poster is not flattened into an image.

The previous two-column structure, sidebar and introduction strip are replaced by one viewport-sized editorial composition. Secondary information surrounds the character; the three specialty cards and work/contact actions occupy the lower area. Mobile keeps the central collage and moves the cards and actions into natural document flow. The cat floats 8 px over 4.8 seconds with pointer translation limited to 5 px per axis; small pixel graphics and orbit lines move independently. Offscreen motion is paused and reduced motion disables all decorative animation. Hero-local colors are #FAFAF7, #111111, #C7FF35 and #9747FF. About, Projects, Experience, Contact, navigation and EN/ES behavior remain intact.

The mascot tests verify the original image URL and alpha pixels, full desktop bounds at 1440 × 900 and 1536 × 864 in EN/ES, pointer limits, animation and reduced motion, plus readable layouts at 320, 390, 640, 700, 768 and 1024 px. Existing tests cover both CTA destinations and the remaining portfolio interactions.

Nutrisend and independent data/AI projects are omitted because no implementation or documentation was provided. The motor dysgraphia platform remains an academic proposal, with individual contributions, stack and completed features pending verification. The working tracing exercise is an illustrative portfolio prototype, not evidence of the academic application's implementation or clinical effectiveness.

Email, LinkedIn and GitHub are configured in `src/modules/profile/domain/profile.js` using Camilla's supplied details. CV remains null; its tile is displayed as pending text. A verified CV can be stored in `public/` and configured with its root-relative path. Confidential banking assets, data and internal implementation details are excluded.

## Accessibility and performance

Semantic sections, visible keyboard focus, a skip link, an accessible mobile menu, native modal focus behavior and keyboard-accessible technology buttons are retained. Animation is optional; reduced motion shows the completed data composition without an extended sticky scroll section.

The section 03 MP4 loads only near the scene and remains paused. Scroll controls currentTime directly, in both directions; stage text follows decoded media time. Reduced motion avoids downloading the video and shows all six stills without an extended scroll section. Media failure also presents the static sequence. See docs/data-video.md for encoding, timing, measured seek performance and browser validation limits.

## Validation

With the dev server running:

```powershell
npx playwright test tests/data-video.spec.js tests/navigation.spec.js tests/reading-flow.spec.js --workers=1
```

The current section 03, navigation and reading-flow tests use locally installed Chrome. They cover the actual MP4, all six stages, reverse and stationary seeking, delayed metadata, media failure, reduced motion, EN/ES, sticky layout and responsive sizes. Screenshots are written to test-results/. Older tests may reference UI removed in earlier redesigns.

To test a different port:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5175'
npx playwright test
```

## Hosting

This is a local implementation. Native Sites hosting tools were unavailable; no deployment is claimed. The production `dist/` folder can be served by a static host.

## Presentation-style section transitions

`src/shared/presentation/motion/section-transitions.js` retains presentation effects on selected boundaries. Projects and Next Questions enter in normal document flow, without lateral masks. Next Questions also exits in normal flow so Contact cannot cover its lower content. Section 04 enters and exits in normal flow to preserve its native sticky sidebar; it receives no GSAP section pin or mask. Other selected static sections hold their final viewport while the next section enters; the data scene retains its own sticky behavior. Animated transitions reverse naturally with the scroll position.

Native scrolling remains in control, with no wheel interception, forced snapping or added presentation-only scroll length. Anchor navigation resolves the original position of held sections. Keyboard focus reveals an unfinished incoming section. Small screens use vertical covers, and reduced motion removes all section pins, masks and transition overlays. MatchMedia and animation resources are reverted during cleanup.

The additional transition test verifies overlapping geometry, reverse scrolling, keyboard access, breakpoint changes and removal of pins under reduced motion.

## Source architecture

`src` is organized by domain modules (`profile`, `career`, `projects`, `capabilities`, `data-story`), with pure domain content and presentation code separated. `app` composes the site; `shared` owns common UI and i18n. See [docs/architecture.md](docs/architecture.md) for module boundaries and editing locations. Run `npm run check:architecture` to validate dependency rules.

## Media organization

Runtime media lives under `public/assets/{profile,projects,career,capabilities,data-story,shared}`. The original source video is preserved in `resources/data-story/` and excluded from the published public tree. Five byte-identical duplicate images and one unused sticker variant were removed. See [docs/assets.md](docs/assets.md) for the cleanup audit. Run `npx playwright test tests/assets.spec.js --workers=1` to check that every published image/video has a current consumer and a valid media response.
