# Projects

Each project sheet and direct detail route shares `ProjectSummaryComponent`, a semantic definition list for problem, solution and technologies. The catalogue summaries and technology lists are grounded in `docs/career/AUDITORIA_CV.md` and the owner’s CV: academic team projects are described without invented client metrics or sole-authorship claims. Both ES and EN are supported. `tests/project-summary.spec.js` checks all seven sheets, translations, actual stack output, small-screen scrolling, focus return and the direct Harmonix route.

The Projects section adapts the supplied Sea Ring reference to the existing portfolio: a white stage and curved CSS 3D gallery aligned to the shared editorial container inside the violet shell. Urbanist, contextual white guides, the real seven projects and the surrounding cinematic sections remain unchanged.

- Seven catalogue entries occupy fourteen physical slots (two complete repetitions), making a continuous cylinder without inventing projects. The physical ring is hidden from assistive technology; the seven named buttons below it provide the equivalent keyboard and screen-reader interface.
- `ProjectRing` owns perspective placement, a brief local formation, time-based rotation, drag and horizontal wheel input. Vertical wheel and touch scrolling remain available to leave the section. Previous/next and pause controls provide alternatives to gestures. A transparent editorial strip below the gallery aligns its small exploration label left and its controls right. Three independent 38 px circular faces retain 44 px hit areas and visible focus. SVG icons share one stroke style; previous/pause stay transparent and next uses brand lime with a dark arrow. There is no grouped white capsule.
- The animation runs outside Angular change detection. Intersection and document visibility pause the scene offscreen; a paused, settled ring stops requesting frames. All listeners, observers and animation frames are cleaned up on destruction.
- The gallery uses the neutral `--surface` token: white in light mode and deep black (#09090B) in dark mode, with the shared theme transition. Its control-surface marker is neutral for contextual contrast. The former ocean poster, video, mist and their unused loading/playback code have been removed. Project images and reflections remain unchanged.
- Reduced motion uses a static screenshot catalogue, suppressing automatic movement. Live preference changes work without rebuilding the component.
- Clicking a project opens the existing native dialog with its real landing and repository links. Escape restores focus to the corresponding accessible project button. Hash detail routes remain available.
- There is no separate freelance section; the existing micro-CTA stays in the Hero.

Validation: `tests/project-showcase.spec.js` covers responsive bounds, ES/EN, real links, focus, drag, horizontal/vertical wheel behavior, offscreen pausing, reduced motion and gallery background changes in both themes without replacing project cards. `tests/project-lines.spec.js` checks contextual white guides on violet.


Layout: header, title/count, gallery, controls and numbered index share one `.container` and the existing `--editorial-rail-inset` / 1200 px maximum. The white frame clips the 3D scene to a 22 px corner radius, with no decorative border or shadow; the project depth and ring engine are unchanged. The count remains visible on mobile. Only the gallery clips its cycling 3D content; controls remain outside that aperture.
