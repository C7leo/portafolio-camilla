# Project ribbon

`ProjectReelComponent` hosts the scroll-driven Three.js ribbon using the seven
existing project images and URLs from `data/projects.ts`. No external videos,
fonts or new dependencies are required.

- The local `.reel-track` provides 700 viewport heights (600 on mobile); its stage
  uses native CSS sticky. No wheel interception, autoplay or ScrollTrigger pin.
- Local section progress is smoothed toward the current scroll position. It
  drives the opposing headline lines, the fixed sampled 3D rail and each card's
  transition into the final grid. Reverse scrolling reverses the same poses.
- Every image remains visible in the final grid: three columns on desktop, two
  on portrait screens, with the incomplete last row aligned to the first column.
  Every image uses an identical 3:2 frame with centered contain fitting and white
  backing, preserving complete artwork without distortion or clipping. Back-face
  UVs flip to keep text readable.
- Image clicks use raycasting and open the Angular native dialog with the actual
  project's landing and repository links. The bottom project buttons provide
  direct keyboard access. Canvas arrows select projects; Enter/Space open them.
- Reduced motion, WebGL failure or missing images show a natural-height static
  gallery. The native dialog supports Escape, focus containment and focus return.
- Rendering sleeps when progress settles, the document is hidden or the stage
  is outside the viewport. Destruction/fallback removes observers and listeners,
  cancels the animation frame and disposes geometries, textures and renderer.

The other portfolio sections, navbar and project data remain separate.
