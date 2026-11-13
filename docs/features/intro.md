# Cinematic introduction

The independent intro is mounted by AppComponent before the existing navbar/main.
This placement is necessary: StoryChapters reparents/pins the Hero host, which
would interrupt a native modal nested inside Hero. The navbar remains independent.
CinematicIntroState coordinates completion with Hero and keeps
the optional session decision in one place, with browser/platform/storage guards.

Assets use their actual existing paths:
- `src/app/shell/intro/assets/cinematic-intro.mp4` (approximately 10 seconds, 1280×720).
- `src/app/shared/assets/night-lily.png` (poster and transition fallback).

The native fullscreen dialog places the movie above all content and makes the
page inert. It supports a translated skip button, Escape and contained wheel/touch
navigation. The movie is muted, inline and non-looping. End/skip fades the entire
layer over the original floral Hero via GSAP, then closes and removes the dialog.
The natural dissolve starts during the last 1.35 seconds of playback: the movie
fades into a still layer matching the actual Hero backdrop bounds, gradient and
crop, then the overlay fades out. This avoids a frozen end-frame cut and accounts
for the Hero's shorter height on mobile. Resize keeps the matching layer aligned.
Autoplay rejection and media failure bypass the intro. Loading/stalling timeouts
and a final watchdog prevent indefinite blocking. Reduced motion skips the media
and construction sequence, including changes while the intro is active.

Hero retains its original layout, type metrics, IDs, copy and anchors. Its GSAP
sequence expands the existing panel, reveals the name and surname in typographic
steps without splitting glyphs (preserving kerning), briefly blinks a cursor,
then reveals metadata, the divider and lower details. Total duration: 2.54 seconds.
The existing Hero scroll effect remains. Contexts/listeners/media sources/timers
are cleaned up on completion/destruction. There are no global style changes.

Session key: `camilla-cinematic-intro-seen`. The intro is attempted once per
session when entering Home; deep section URLs bypass it. Storage failures are
non-fatal. Returning sessions display the full Hero immediately, except explicit
reloads (F5) from any section: those replace the hash with #inicio, reset scroll
and replay the introduction. During the modal, a scoped scroll guard counters
late browser/ScrollTrigger restoration so the dissolve always lands on Home.
Previous native scroll restoration is restored after completion. Hash navigation
within the running page does not replay it. Reduced-motion reloads return to Home
without playing video. The skip control uses a translucent capsule, small skip
symbol, pastel hover and a visible keyboard focus state.

Verified in Chrome: natural end, skip/Escape, repeat visits, blocked autoplay,
failed video, unavailable storage, initial/live reduced motion, direct section
links and mobile without horizontal overflow.

## Mobile frame continuity

The original PNG is 1672×941; the encoded film is 1280×720. They depict the same
flower but are distinct frames. Matching `cover` alone does not align their
effective crop: the mobile film starts centered in the dynamic viewport while
the Hero background is cropped at 72% inside its stable, sometimes shorter frame.

At natural completion on screens up to 820 px, the final floral shot smoothly
adopts the Hero's actual background rectangle and focal position. It then
dissolves to the original PNG, with its exact gradient and crop, holds that still,
and removes the overlay. Hero text begins only afterward. The last visible intro
image is therefore the same image and geometry as the Hero, rather than a claim
that two different source frames are pixel-identical. Resize continues to align
the still and the registered film. Desktop and skip timing retain their paths.

`tests/cinematic-continuity.spec.js` compares both images before text annotations
at 375, 390, 393 and 430 px in Chrome and WebKit, checks their geometry, and verifies
continuous forward/reverse pin release between Home and About. The global floating scroll capsule appears outside the intro overlay and keeps the same floral handoff. Its accessible label is translated, its arrow respects reduced motion, and its placement is independent of the Hero content. See [Floating controls and themes](floating-controls.md).


## Hero editorial marquee

The full-width lime ribbon occupies the upper 36 px (30 px on phones) of the
existing navbar reserve. It does not change Hero height, title sizes, editorial
rules or the floral backdrop rectangle used by the intro registration.

The Hero owns one text value, with visual copies in two equal flex groups. A
30-second linear CSS transform moves the track by exactly one group width;
each group is at least a viewport wide, so the seam stays covered on wide screens.
Only one copy is exposed to assistive technology. Reduced motion removes the
animation. Brand lime and black remain identical in both themes, and theme
changes preserve the animation instance. During the intro text reveal, the ribbon
stays hidden without restarting its loop. No scroll listeners or packages are added.

`tests/hero-marquee.spec.js` checks viewport coverage through a complete loop,
responsive heights, theme continuity, stable Hero geometry, overflow and reduced
motion. The cinematic continuity tests retain the floral handoff comparison.


## Compact freelance invitation

The Hero contains a small WhatsApp invitation, not an additional section. It uses
the normal grid flow of the lower Hero layout, immediately before the detail
row. A 28 px gap separates it from the editorial line anchored to that row. The
invitation shares the left content guide and keeps its compact copy/button row.
There are no absolute offsets or negative margins on the CTA. Standard viewport
heights remain unchanged; very short landscape windows use natural document
height rather than shrinking the name or overlapping content. The name font
sizes, original floral asset, marquee, professional specialties and existing
project/about links are preserved.

`profile/application/freelance-contact.ts` retains the owner-provided number and
existing prefilled message. The Hero builds the secure new-tab WhatsApp URL from
that configuration; the footer keeps its original direct contact link. Text uses
the existing ES/EN dictionary. The existing Hero timeline reveals the CTA with
the details; repeat visits use one subtle CSS entrance. Reduced motion disables
it. The former standalone component, reveal variant and translations are removed.

`tests/hero-micro-cta.spec.js` checks alignment with the left guide, a 24-32 px
gap above the actual editorial rule, stable height at standard viewports, no
overlap with the name/text/links/scroll control, WhatsApp, accessibility and
language support.
