# Section 03: scroll-controlled video

`src/modules/data-story/presentation/data-scene.js` renders the bilingual editorial layout. `src/modules/data-story/presentation/data-video.js`
uses GSAP ScrollTrigger for normalized scroll progress and native CSS sticky for
the scene. No pin spacer, wheel interception, snapping, playback timer, tween,
`play()` call or autoplay is used. The title and navigation remain stationary.

Desktop has 420svh of total section height; mobile has 360svh. The scene sticks
below the existing header. Progress runs from `top header-height` to
`bottom bottom`, so the last frame is reached exactly when the sticky scene
releases. Section transitions on both adjacent boundaries use normal flow.

The editorial composition places the enlarged two-line headline on the left,
the scrubbed scene to the center/right, and the supplied transparent
`03_gato_asombrado.png` in a reserved upper-right area, at 140–180 px on desktop.
The original cat asset is reused without image edits. The external orbit and
scattered sparkles have been removed. A small lime underline/star and a Caveat
handwritten annotation remain. CSS grid/flex reserve separate space for copy,
video and sticker, without overlapping the media. The six-stage indicator has
uniform SVG icons, a fine neutral connector and only a violet current step with
a small lime dot. Mobile stacks the title, scene and sticker row above a
three-column stage grid. Stage selection still follows the actual media time.
The existing feathered media mask is retained to blend into the off-white
background; no decorative element runs an independent animation timer.

## Media and timing

- Original supplied by Camilla: `resources/data-story/03_video-original.mp4`, preserved.
- Runtime: `public/assets/data-story/video/03_video.mp4`, 1280 x 720, 24 fps, 10 seconds,
  H.264/yuv420p, 2,334,728 bytes (approximately 2.3 MB).
- No audio track; MP4 metadata moved to the beginning (`+faststart`).
- Maximum keyframe interval: 6 frames / 250 ms; no B frames, CRF 20.
- Six 640 x 360 WebP stills extracted from that same clip, about 41 KB combined.
  They are not generated substitutes or assets from the other sections.

Stage boundaries follow the supplied clip, rather than six arbitrary equal
intervals. They are centralized in `dataStages` in `src/modules/data-story/domain/stages.js`:

| Stage | Start (normalized) | Current clip |
| --- | --- | --- |
| Data | 0 | 0 s |
| Validation | .16 | 1.6 s |
| Transformation | .30 | 3.0 s |
| Governance | .47 | 4.7 s |
| Reporting | .64 | 6.4 s |
| Insight | .80 | 8.0 s |

The time target is always `progress * video.duration`, including 0 and 1.
Metadata must be finite before seeking. Scroll events are coalesced with one
requestAnimationFrame, and in-flight seeks retain only the latest target.
`seeked` flushes that target and updates the stage text/progress from media time.
Targets less than 1/240 second apart are skipped; there is no smoothing loop
advancing the video after scrolling stops. ScrollTrigger refreshes preserve the
current scroll target, including entering midway before metadata arrives.

## Loading and accessibility

The video has no `src` until the section is within 800 px of the viewport.
It stays paused throughout. Loading has a 12-second deadline; a seek has an
8-second deadline. Network/decode/unsupported-media errors switch to the six
real static frames and remove the long scroll section. A usable storyboard is
also present while loading and when JavaScript is unavailable.

With `prefers-reduced-motion: reduce`, the six stills are displayed together,
without a long sticky section or any MP4 request. Live preference changes are
supported. Stage labels, descriptions, `aria-current`, the progressbar and a
keyboard-focusable skip link provide accessible navigation. Video pixels are
decorative to assistive technology; equivalent stage names remain real text.

## Regenerating assets

Install FFmpeg or set the `FFMPEG` environment variable to its executable. Then:

```powershell
node scripts/prepare-data-video.mjs
# Optional alternate source, kept separate from the generated output:
node scripts/prepare-data-video.mjs 'C:/path/to/new-source.mp4'
```

This preserves the original, prepares the scrub encoding, and regenerates six
stills. If replacing the clip with different figure timing, update `dataStages`
and the representative frame positions in the preparation script as well.

## Validation

With the dev server running on 5173:

```powershell
npx playwright test tests/data-video.spec.js tests/navigation.spec.js tests/reading-flow.spec.js --workers=1
npm run build
```

Verified with local Chrome 155 on Windows: actual six frame captures, forward
and reverse seeking, exact stationary time after scroll stops, late metadata,
rapid direction changes, missing-file fallback, live reduced-motion preference,
EN/ES, header/title stability and natural release. Responsive sizes include
1440x900, 390x844, 320x740, 1240x600 and 844x390. This replaces the former particle
tests. Some older portfolio tests target previously removed hero/drawing UI.

A local 20-target forward/reverse benchmark measured an average of 28.4 ms and
a maximum of 159.7 ms from scroll change to completed seek. The accuracy checks
pass within .003 normalized progress; corresponding forward/reverse screenshots
match. These measurements are local, not a guarantee on other devices/networks.
Safari/iOS and Firefox have not been directly tested here. The bounded MP4 is
currently sufficient; no extra full-frame Canvas image sequence is downloaded.
